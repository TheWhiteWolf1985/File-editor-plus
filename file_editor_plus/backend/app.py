from __future__ import annotations

import io
import os
import shutil
import time
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import json
import httpx
import websockets
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path("/config").resolve()
BACKUP_DIR = (BASE_DIR / ".fep-backups").resolve()
FRONTEND_DIR = Path("/app/frontend").resolve()
SNIPPET_DIR = (BASE_DIR / ".fep-snippets").resolve()
SNIPPET_FILE = SNIPPET_DIR / "snippets.json"
SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN")
logger = logging.getLogger("file_editor_plus")
MAX_FORMAT_SIZE = 2 * 1024 * 1024  # 2MB

# roba che di solito non vuoi toccare/vedere nell’editor
DEFAULT_IGNORE = {
    ".storage",
    ".cloud",
    ".git",
    ".fep-backups",
    "__pycache__",
}

app = FastAPI(title="File Editor Plus")


def _is_within_base(p: Path) -> bool:
    try:
        p.resolve().relative_to(BASE_DIR)
        return True
    except Exception:
        return False


def safe_path(rel: str) -> Path:
    """
    Converte un path relativo (tipo 'automations.yaml' o 'subdir/file.yaml')
    in path assoluto dentro /config, bloccando traversal e assoluti.
    """
    if rel is None:
        rel = ""
    rel = rel.strip().replace("\\", "/")

    if "\x00" in rel:
        raise HTTPException(400, "Invalid path")

    # niente assoluti
    if rel.startswith("/") or rel.startswith("~"):
        raise HTTPException(400, "Path must be relative to /config")

    # normalizza
    rel_path = Path(rel)

    # blocca traversal tipo ../
    if any(part == ".." for part in rel_path.parts):
        raise HTTPException(400, "Path traversal is not allowed")

    target = (BASE_DIR / rel_path).resolve()

    if not _is_within_base(target):
        raise HTTPException(403, "Access denied")

    return target


def make_backup(target: Path) -> Optional[Path]:
    if not target.exists() or not target.is_file():
        return None

    rel = target.resolve().relative_to(BASE_DIR)
    day = datetime.now().strftime("%Y%m%d")
    stamp = datetime.now().strftime("%H%M%S")
    dest = (BACKUP_DIR / day / rel).resolve()

    if not _is_within_base(dest) and BACKUP_DIR not in dest.parents:
        # paranoia extra: backup deve stare sotto /config/.fep-backups
        raise HTTPException(500, "Backup path invalid")

    dest.parent.mkdir(parents=True, exist_ok=True)
    # es: file.yaml -> file.yaml.235959.bak
    bak = dest.with_name(dest.name + f".{stamp}.bak")
    shutil.copy2(target, bak)
    return bak


def atomic_write(target: Path, data: str) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)

    tmp = target.with_name(f".{target.name}.tmp.{os.getpid()}.{int(time.time())}")
    with open(tmp, "w", encoding="utf-8", newline="\n") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())

    os.replace(tmp, target)  # atomic sulla stessa FS


def ensure_snippet_store() -> None:
    SNIPPET_DIR.mkdir(parents=True, exist_ok=True)
    if not SNIPPET_FILE.exists():
        default_snippets = [
          {
            "id": str(uuid.uuid4()),
            "name": "Light toggle",
            "description": "Esempio di automazione per accendere/spegnere una luce al passaggio.",
            "content": "alias: Toggle light\ntrigger:\n  - platform: state\n    entity_id: binary_sensor.motion\naction:\n  - service: light.toggle\n    target:\n      entity_id: light.living_room"
          },
          {
            "id": str(uuid.uuid4()),
            "name": "Presence alert",
            "description": "Invia notifica quando un device torna online nella rete di casa.",
            "content": "alias: Presence alert\ntrigger:\n  - platform: state\n    entity_id: device_tracker.phone\n    to: 'home'\naction:\n  - service: notify.mobile_app_phone\n    data:\n      message: \"Bentornato a casa!\""
          },
          {
            "id": str(uuid.uuid4()),
            "name": "Backup reminder",
            "description": "Promemoria settimanale per eseguire il backup della configurazione.",
            "content": "alias: Backup reminder\ntrigger:\n  - platform: time\n    at: '20:00:00'\n  - platform: time\n    at: '08:00:00'\naction:\n  - service: notify.persistent_notification\n    data:\n      message: \"Ricordati il backup della config!\""
          },
        ]
        atomic_write(SNIPPET_FILE, json.dumps(default_snippets, ensure_ascii=False, indent=2))


def load_snippets() -> List[dict]:
    ensure_snippet_store()
    try:
        with open(SNIPPET_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        data = []
    except Exception as e:
        logger.exception("snippets: errore lettura %s: %s", SNIPPET_FILE, e)
        raise HTTPException(500, f"Errore lettura snippets: {e}")
    if not isinstance(data, list):
        data = []
    return data


def save_snippets(items: List[dict]) -> None:
    try:
        atomic_write(SNIPPET_FILE, json.dumps(items, ensure_ascii=False, indent=2))
    except Exception as e:
        logger.exception("snippets: errore salvataggio %s: %s", SNIPPET_FILE, e)
        raise HTTPException(500, f"Errore salvataggio snippets: {e}")


def format_yaml_text(text: str) -> str:
    if len(text.encode("utf-8")) > MAX_FORMAT_SIZE:
        raise HTTPException(413, "YAML troppo grande per essere formattato (limite 2MB).")
    try:
        from ruamel.yaml import YAML  # lazy import
    except ImportError:
        raise HTTPException(500, "ruamel.yaml non disponibile")

    yaml = YAML(typ="rt")
    yaml.preserve_quotes = True
    yaml.width = 4096
    yaml.indent(mapping=2, sequence=4, offset=2)
    buf = io.StringIO()

    had_trailing_nl = text.endswith("\n")
    try:
        data = yaml.load(text)
    except Exception as e:
        line = getattr(getattr(e, "problem_mark", None), "line", None)
        col = getattr(getattr(e, "problem_mark", None), "column", None)
        raise HTTPException(
            status_code=422,
            detail={
                "message": str(e),
                "line": (line + 1) if line is not None else None,
                "column": (col + 1) if col is not None else None,
            },
        )
    yaml.dump(data, buf)
    formatted = buf.getvalue()
    if had_trailing_nl and not formatted.endswith("\n"):
        formatted += "\n"
    if not had_trailing_nl:
        formatted = formatted.rstrip("\n")
    return formatted


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/ha/states")
async def ha_states():
    if not SUPERVISOR_TOKEN:
        logger.error("ha_states: missing SUPERVISOR_TOKEN env, cannot call HA API")
        raise HTTPException(500, "Missing supervisor token")
    try:
        token_preview = SUPERVISOR_TOKEN[:8] + "..." if SUPERVISOR_TOKEN else ""
        logger.info("ha_states: calling supervisor/core/api/states token_present=%s token_prefix=%s", bool(SUPERVISOR_TOKEN), token_preview)
        async with httpx.AsyncClient(base_url="http://supervisor/core/api", timeout=15) as client:
            res = await client.get("/states", headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"})
            if res.status_code in (401, 403):
                logger.warning("ha_states denied by HA: status=%s body=%s", res.status_code, res.text)
                raise HTTPException(403, "Unauthorized to read HA states (check homeassistant_api permission)")
            res.raise_for_status()
            logger.info("ha_states: fetched %s states", len(res.json() or []))
            return res.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("ha_states: error fetching states: %s", e)
        raise HTTPException(500, f"Error fetching states: {e}")


@app.websocket("/api/ha/ws")
async def ha_ws(ws: WebSocket):
    await ws.accept()
    if not SUPERVISOR_TOKEN:
        logger.error("ha_ws: missing SUPERVISOR_TOKEN, closing client")
        await ws.close(code=1011)
        return
    try:
        token_preview = SUPERVISOR_TOKEN[:8] + "..." if SUPERVISOR_TOKEN else ""
        logger.info("ha_ws: connecting to supervisor/core/websocket token_prefix=%s", token_preview)
        async with websockets.connect("ws://supervisor/core/websocket") as upstream:
            first = await upstream.recv()
            try:
                first_payload = json.loads(first)
            except Exception:
                first_payload = {"type": "unknown", "raw": first}

            if first_payload.get("type") != "auth_required":
                logger.warning("ha_ws: unexpected first message from HA: %s", first)
                await ws.send_json({"type": "error", "message": "Unexpected handshake from HA"})
                await ws.close()
                return

            await upstream.send(json.dumps({"type": "auth", "access_token": SUPERVISOR_TOKEN}))
            auth_resp = await upstream.recv()
            try:
                auth_payload = json.loads(auth_resp)
            except Exception:
                auth_payload = {"type": "unknown", "raw": auth_resp}

            if auth_payload.get("type") != "auth_ok":
                logger.warning("ha_ws: auth failed to HA, response=%s", auth_resp)
                await ws.send_json({"type": "error", "message": "Auth to HA failed"})
                await ws.close()
                return
            await upstream.send(json.dumps({"id": 1, "type": "subscribe_events", "event_type": "state_changed"}))
            logger.info("ha_ws: subscribed to state_changed")

            async def client_to_upstream():
                try:
                    async for msg in ws.iter_text():
                        await upstream.send(msg)
                except WebSocketDisconnect:
                    return

            async def upstream_to_client():
                try:
                    async for msg in upstream:
                        await ws.send_text(msg)
                except Exception:
                    return

            import asyncio

            await asyncio.gather(client_to_upstream(), upstream_to_client())
    except Exception as e:
        logger.exception("ha_ws: error in proxy: %s", e)
        await ws.close(code=1011)
@app.post("/api/folder")
def create_folder(path: str):
    target = safe_path(path)
    if target.exists():
        raise HTTPException(400, "Path already exists")
    target.mkdir(parents=True, exist_ok=True)
    return {"ok": True, "path": target.resolve().relative_to(BASE_DIR).as_posix()}


@app.get("/api/tree")
def tree(path: str = ""):
    folder = safe_path(path)

    if not folder.exists():
        raise HTTPException(404, "Path not found")
    if not folder.is_dir():
        raise HTTPException(400, "Path is not a directory")

    items = []
    for p in folder.iterdir():
        name = p.name
        if name in DEFAULT_IGNORE:
            continue

        try:
            rel = p.resolve().relative_to(BASE_DIR).as_posix()
        except Exception:
            continue

        items.append(
            {
                "name": name,
                "path": rel,
                "type": "dir" if p.is_dir() else "file",
            }
        )

    items.sort(key=lambda x: (x["type"] != "dir", x["name"].lower()))
    return {"base": "", "path": safe_path(path).resolve().relative_to(BASE_DIR).as_posix() if path else "", "items": items}


@app.get("/api/file")
def read_file(path: str):
    f = safe_path(path)

    if not f.exists():
        raise HTTPException(404, "File not found")
    if not f.is_file():
        raise HTTPException(400, "Not a file")

    try:
        content = f.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(500, f"Read failed: {e}")

    return {"path": f.resolve().relative_to(BASE_DIR).as_posix(), "content": content}


@app.put("/api/file")
async def write_file(request: Request, path: str, create_only: bool = False):
    f = safe_path(path)

    # accetta JSON {"content": "..."} oppure text/plain
    content_type = request.headers.get("content-type", "")
    body = await request.body()

    text: Optional[str] = None
    if "application/json" in content_type:
        try:
            payload = await request.json()
            text = payload.get("content", "")
        except Exception:
            raise HTTPException(400, "Invalid JSON body")
    else:
        text = body.decode("utf-8", errors="replace")

    if text is None:
        text = ""

    if create_only and f.exists():
        raise HTTPException(400, "File already exists")

    # backup prima di scrivere (solo se esiste)
    bak = make_backup(f)
    try:
        atomic_write(f, text)
    except Exception as e:
        raise HTTPException(500, f"Write failed: {e}")

    return {"ok": True, "path": f.resolve().relative_to(BASE_DIR).as_posix(), "backup": str(bak.relative_to(BASE_DIR)) if bak else None}


@app.get("/api/snippets")
def get_snippets():
    return {"items": load_snippets()}


@app.post("/api/snippets")
async def create_snippet(request: Request):
    payload = await request.json()
    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip()
    content = payload.get("content") or ""
    if not name:
        raise HTTPException(400, "Name required")
    if len(name) > 120:
        raise HTTPException(400, "Name too long")
    if len(description) > 400:
        raise HTTPException(400, "Description too long")
    items = load_snippets()
    new = {"id": str(uuid.uuid4()), "name": name, "description": description, "content": content}
    items.append(new)
    save_snippets(items)
    return {"item": new}


@app.put("/api/snippets/{snippet_id}")
async def update_snippet(snippet_id: str, request: Request):
    payload = await request.json()
    name = payload.get("name")
    description = payload.get("description")
    content = payload.get("content")

    items = load_snippets()
    found = False
    for idx, s in enumerate(items):
        if s.get("id") == snippet_id:
            found = True
            if name is not None:
                if not str(name).strip():
                    raise HTTPException(400, "Name required")
                if len(str(name)) > 120:
                    raise HTTPException(400, "Name too long")
                s["name"] = str(name).strip()
            if description is not None:
                if len(str(description)) > 400:
                    raise HTTPException(400, "Description too long")
                s["description"] = str(description).strip()
            if content is not None:
                s["content"] = content
            items[idx] = s
            break
    if not found:
        raise HTTPException(404, "Snippet not found")
    save_snippets(items)
    return {"item": s}


@app.delete("/api/snippets/{snippet_id}")
def delete_snippet(snippet_id: str):
    items = load_snippets()
    next_items = [s for s in items if s.get("id") != snippet_id]
    if len(next_items) == len(items):
        raise HTTPException(404, "Snippet not found")
    save_snippets(next_items)
    return {"ok": True}


@app.post("/api/format/yaml")
async def format_yaml(body: dict):
    text = body.get("text") if isinstance(body, dict) else None
    if text is None:
        raise HTTPException(400, "Field 'text' richiesto")
    formatted = format_yaml_text(str(text))
    return {"ok": True, "formatted": formatted}


# ---- Frontend (Ingress friendly): serve static + SPA fallback
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")


@app.get("/")
def index():
    idx = FRONTEND_DIR / "index.html"
    if not idx.exists():
        return JSONResponse({"error": "frontend not built"}, status_code=500)
    return FileResponse(str(idx))


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    # lascia passare API e assets
    if full_path.startswith("api/") or full_path.startswith("assets/"):
        raise HTTPException(404)
    idx = FRONTEND_DIR / "index.html"
    if not idx.exists():
        raise HTTPException(500, "frontend not built")
    return FileResponse(str(idx))
