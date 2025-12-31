from __future__ import annotations

import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path("/config").resolve()
BACKUP_DIR = (BASE_DIR / ".fep-backups").resolve()
FRONTEND_DIR = Path("/app/frontend").resolve()

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


@app.get("/api/health")
def health():
    return {"ok": True}


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
async def write_file(request: Request, path: str):
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

    # backup prima di scrivere
    bak = make_backup(f)
    try:
        atomic_write(f, text)
    except Exception as e:
        raise HTTPException(500, f"Write failed: {e}")

    return {"ok": True, "path": f.resolve().relative_to(BASE_DIR).as_posix(), "backup": str(bak.relative_to(BASE_DIR)) if bak else None}


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
