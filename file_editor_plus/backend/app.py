from __future__ import annotations

import difflib
import fnmatch
import io
import os
import shutil
import time
import logging
import uuid
import re
import socket
import platform
import hashlib
import mimetypes
from logging.handlers import RotatingFileHandler
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import json
import httpx
import websockets
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path("/config").resolve()
BACKUP_DIR = (BASE_DIR / ".fep-backups").resolve()
FRONTEND_DIR = Path("/app/frontend").resolve()
FEP_CONFIG_DIR = (BASE_DIR / ".fep-config").resolve()
BUFFER_DIR = (FEP_CONFIG_DIR / "session_buffers").resolve()
SNIPPET_DIR = FEP_CONFIG_DIR
SNIPPET_FILE = SNIPPET_DIR / "snippets.json"
USER_CONFIG_FILE = FEP_CONFIG_DIR / "user_config.json"
SESSION_FILE = FEP_CONFIG_DIR / "session.json"
LEGACY_SNIPPET_DIR = (BASE_DIR / ".fep-snippets").resolve()
LEGACY_USER_CONFIG_FILE = (Path(__file__).parent / "user_config.json").resolve()
MDI_META_FILE = (Path(__file__).parent / "mdi_meta.json").resolve()
SUPERVISOR_TOKEN = os.environ.get("SUPERVISOR_TOKEN")
ADDON_VERSION = os.environ.get("ADDON_VERSION") or os.environ.get("VERSION") or "unknown"
logger = logging.getLogger("file_editor_plus")
MAX_FORMAT_SIZE = 2 * 1024 * 1024  # 2MB
MAX_SEARCH_FILE_SIZE = 2 * 1024 * 1024  # 2MB per file
MAX_DIFF_SIZE = 2 * 1024 * 1024  # 2MB per text
MAX_DIFF_TOTAL = 4 * 1024 * 1024  # 4MB totale
SEARCH_MAX_FILES = 200
SEARCH_MAX_MATCHES_TOTAL = 5000
SEARCH_MAX_MATCHES_PER_FILE = 200
MDI_MAX_RESULTS = 50
SEARCH_SKIP_DIRS = {
    ".fep-backups",
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    ".pytest_cache",
    "dist",
    "build",
}
DEFAULT_USER_CONFIG = {
    "font_base_rem": 0.875,
    "theme_mode": "auto",
    "toolbar_visible": True,
    "show_indent_guides": False,
}
DEFAULT_SESSION_STATE = {"tabs": [], "active": None, "split": False}
MAX_BUFFER_BYTES = 256 * 1024  # 256KB
MAX_BUFFER_FILES = 10
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50MB
CONFLICT_MODES = {"fail", "overwrite", "autorename"}
HA_ACTIONS = {
    "reload_yaml": {"type": "service", "domain": "homeassistant", "service": "reload_all"},
    "restart_core": {"type": "service", "domain": "homeassistant", "service": "restart"},
    "restart_supervisor": {"type": "supervisor", "path": "/supervisor/restart"},
    "reboot_host": {"type": "supervisor", "path": "/host/reboot"},
    "shutdown_host": {"type": "supervisor", "path": "/host/shutdown"},
}

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


def next_available_name(path: Path) -> Path:
    parent = path.parent
    stem = path.stem
    suffix = path.suffix
    i = 1
    while True:
        candidate = parent / f"{stem} ({i}){suffix}"
        if not candidate.exists():
            return candidate
        i += 1


def _match_globs(rel_path: Path, globs: Optional[List[str]]) -> bool:
    if not globs:
        return False
    posix = rel_path.as_posix()
    return any(fnmatch.fnmatch(posix, g) for g in globs)


def _should_skip(rel_path: Path, exclude_globs: Optional[List[str]]) -> bool:
    if any(part in SEARCH_SKIP_DIRS for part in rel_path.parts):
        return True
    if exclude_globs and _match_globs(rel_path, exclude_globs):
        return True
    return False


def _is_binary_file(p: Path) -> bool:
    try:
        with open(p, "rb") as f:
            chunk = f.read(8192)
    except Exception:
        return True
    return b"\0" in chunk


def _iter_search_files(include_globs: Optional[List[str]], exclude_globs: Optional[List[str]], max_files: int):
    scanned = 0
    for root, dirs, files in os.walk(BASE_DIR):
        rel_root = Path(root).resolve().relative_to(BASE_DIR)

        # pruna le dir da saltare
        dirs[:] = [d for d in dirs if not _should_skip(rel_root / d, exclude_globs)]

        for fname in files:
            rel = rel_root / fname
            if _should_skip(rel, exclude_globs):
                continue
            if include_globs and not _match_globs(rel, include_globs):
                continue
            yield rel
            scanned += 1
            if scanned >= max_files:
                return


def _find_matches(text: str, query: str, case_sensitive: bool, limit: int):
    if not query:
        return []
    hay = text if case_sensitive else text.lower()
    needle = query if case_sensitive else query.lower()
    matches = []
    start = 0
    while True:
        idx = hay.find(needle, start)
        if idx == -1:
            break
        line = hay.count("\n", 0, idx) + 1
        last_nl = hay.rfind("\n", 0, idx)
        col = idx - (last_nl if last_nl != -1 else -1)
        next_nl = hay.find("\n", idx)
        if next_nl == -1:
            next_nl = len(text)
        line_text = text[(last_nl + 1 if last_nl != -1 else 0) : next_nl]
        matches.append(
            {
                "line": line,
                "column": col,
                "preview": line_text[:240],
                "match_len": len(query),
                "start": idx,
            }
        )
        if len(matches) >= limit:
            break
        start = idx + len(needle) if len(needle) > 0 else idx + 1
    return matches


def _replace_text(text: str, query: str, replace: str, case_sensitive: bool):
    if not query:
        return text, 0
    flags = 0 if case_sensitive else re.IGNORECASE
    pattern = re.escape(query)
    repl, count = re.subn(pattern, replace, text, flags=flags)
    return repl, count


MDI_ICON_INDEX: Optional[List[dict]] = None


def load_mdi_index() -> List[dict]:
    global MDI_ICON_INDEX
    if MDI_ICON_INDEX is not None:
        return MDI_ICON_INDEX
    if not MDI_META_FILE.exists():
        raise HTTPException(500, "File MDI mancante (mdi_meta.json)")
    try:
        with open(MDI_META_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.exception("mdi: errore lettura %s: %s", MDI_META_FILE, e)
        raise HTTPException(500, f"Errore lettura mdi_meta.json: {e}")
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict) and isinstance(data.get("icons"), list):
        items = data.get("icons")
    else:
        items = []
    index: List[dict] = []
    seen = set()
    for d in items:
        if not isinstance(d, dict):
            continue
        name = d.get("name")
        codepoint = d.get("codepoint")
        if not name:
            continue
        if isinstance(codepoint, int):
            codepoint = format(codepoint, "X")
        elif isinstance(codepoint, str):
            codepoint = codepoint.strip().replace("0x", "").replace("0X", "")
        else:
            codepoint = ""
        if not codepoint:
            continue
        if name in seen:
            continue
        seen.add(name)
        index.append({"name": name, "codepoint": codepoint})
    if not index:
        raise HTTPException(500, "Nessuna icona MDI trovata")
    index.sort(key=lambda item: item["name"])
    MDI_ICON_INDEX = index
    return index


def search_mdi(query: str, limit: int) -> List[dict]:
    index = load_mdi_index()
    q = (query or "").strip().lower()
    if not q:
        return index[:limit]
    results: List[dict] = []
    seen = set()
    for item in index:
        name = item["name"]
        name_lower = name.lower()
        if name_lower.startswith(q):
            results.append(item)
            seen.add(name)
            if len(results) >= limit:
                return results
    if len(results) < limit:
        for item in index:
            name = item["name"]
            if name in seen:
                continue
            if q in name.lower():
                results.append(item)
                seen.add(name)
                if len(results) >= limit:
                    break
    return results[:limit]


def ensure_config_store() -> None:
    FEP_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    BUFFER_DIR.mkdir(parents=True, exist_ok=True)
    if LEGACY_SNIPPET_DIR.exists() and not SNIPPET_DIR.exists():
        try:
            shutil.move(str(LEGACY_SNIPPET_DIR), str(SNIPPET_DIR))
        except Exception as e:
            logger.exception("config_store: errore migrazione snippet dir: %s", e)
    elif LEGACY_SNIPPET_DIR.exists() and SNIPPET_DIR.exists():
        legacy_file = LEGACY_SNIPPET_DIR / "snippets.json"
        if legacy_file.exists() and not SNIPPET_FILE.exists():
            try:
                shutil.copy2(legacy_file, SNIPPET_FILE)
            except Exception as e:
                logger.exception("config_store: errore copia snippet: %s", e)
    if not USER_CONFIG_FILE.exists() and LEGACY_USER_CONFIG_FILE.exists():
        try:
            shutil.copy2(LEGACY_USER_CONFIG_FILE, USER_CONFIG_FILE)
        except Exception as e:
            logger.exception("config_store: errore migrazione user_config: %s", e)


def ensure_user_config() -> None:
    ensure_config_store()
    if not USER_CONFIG_FILE.exists():
        try:
            atomic_write(USER_CONFIG_FILE, json.dumps(DEFAULT_USER_CONFIG, ensure_ascii=False, indent=2))
        except Exception as e:
            logger.exception("user_config: errore creazione %s: %s", USER_CONFIG_FILE, e)
            raise HTTPException(500, f"Errore creazione user_config: {e}")


def setup_file_logging() -> None:
    ensure_config_store()
    log_path = FEP_CONFIG_DIR / "fep_runtime.log"
    existing = [
        h for h in logger.handlers if isinstance(h, RotatingFileHandler) and getattr(h, "baseFilename", None) == str(log_path)
    ]
    if existing:
        return
    handler = RotatingFileHandler(log_path, maxBytes=2 * 1024 * 1024, backupCount=3, encoding="utf-8")
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(fmt)
    handler.setLevel(logging.INFO)
    logger.addHandler(handler)
    if logger.level == logging.NOTSET:
        logger.setLevel(logging.INFO)
    logger.propagate = False
    logger.info("fep runtime log initialized at %s", log_path)


setup_file_logging()


def load_user_config() -> dict:
    ensure_user_config()
    try:
        with open(USER_CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        data = DEFAULT_USER_CONFIG.copy()
    except Exception as e:
        logger.exception("user_config: errore lettura %s: %s", USER_CONFIG_FILE, e)
        raise HTTPException(500, f"Errore lettura user_config: {e}")
    if not isinstance(data, dict):
        data = DEFAULT_USER_CONFIG.copy()
    return normalize_user_config(data)


def save_user_config(data: dict) -> None:
    if not isinstance(data, dict):
        raise HTTPException(400, "Config must be an object")
    try:
        normalized = normalize_user_config(data)
        atomic_write(USER_CONFIG_FILE, json.dumps(normalized, ensure_ascii=False, indent=2))
    except Exception as e:
        logger.exception("user_config: errore salvataggio %s: %s", USER_CONFIG_FILE, e)
        raise HTTPException(500, f"Errore salvataggio user_config: {e}")


def normalize_user_config(data: dict) -> dict:
    out = DEFAULT_USER_CONFIG.copy()
    for key, value in data.items():
        if value is not None:
            out[key] = value
    return out


def normalize_session(data: dict) -> dict:
    tabs_raw = data.get("tabs") if isinstance(data, dict) else []
    tabs: List[dict] = []
    if isinstance(tabs_raw, list):
        for item in tabs_raw:
            if isinstance(item, str):
                tabs.append({"path": item, "dirty": False})
            elif isinstance(item, dict) and isinstance(item.get("path"), str):
                tab_entry = {
                    "path": item["path"],
                    "dirty": bool(item.get("dirty", False)),
                }
                if isinstance(item.get("buffer_id"), str):
                    tab_entry["buffer_id"] = item["buffer_id"]
                if isinstance(item.get("buffer_size"), int):
                    tab_entry["buffer_size"] = item["buffer_size"]
                if isinstance(item.get("last_edit_at"), str):
                    tab_entry["last_edit_at"] = item["last_edit_at"]
                view = item.get("view")
                if isinstance(view, dict):
                    st = view.get("scrollTop")
                    ss = view.get("selStart")
                    se = view.get("selEnd")
                    view_clean = {}
                    if isinstance(st, int):
                        view_clean["scrollTop"] = st
                    if isinstance(ss, int):
                        view_clean["selStart"] = ss
                    if isinstance(se, int):
                        view_clean["selEnd"] = se
                    if view_clean:
                        tab_entry["view"] = view_clean
                tabs.append(tab_entry)
    active = data.get("active") if isinstance(data, dict) else None
    active_clean = active if isinstance(active, str) else None
    split_raw = data.get("split") if isinstance(data, dict) else False
    split_clean = bool(split_raw) if isinstance(split_raw, bool) else False
    return {"tabs": tabs, "active": active_clean, "split": split_clean}


def ensure_snippet_store() -> None:
    ensure_config_store()
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


def compute_diff(base_text: str, modified_text: str):
    base_bytes = base_text.encode("utf-8")
    mod_bytes = modified_text.encode("utf-8")
    if len(base_bytes) > MAX_DIFF_SIZE or len(mod_bytes) > MAX_DIFF_SIZE:
        raise HTTPException(413, "Diff troppo grande (limite 2MB per testo).")
    if len(base_bytes) + len(mod_bytes) > MAX_DIFF_TOTAL:
        raise HTTPException(413, "Diff troppo grande (limite totale 4MB).")

    base_norm = base_text.replace("\r\n", "\n").replace("\r", "\n")
    mod_norm = modified_text.replace("\r\n", "\n").replace("\r", "\n")
    base_lines = base_norm.split("\n")
    mod_lines = mod_norm.split("\n")

    matcher = difflib.SequenceMatcher(a=base_lines, b=mod_lines)
    hunks = []
    summary = {"added": 0, "removed": 0, "changed": 0}

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        base_len = i2 - i1
        mod_len = j2 - j1
        if tag == "insert":
            summary["added"] += mod_len
        elif tag == "delete":
            summary["removed"] += base_len
        elif tag == "replace":
            summary["changed"] += max(base_len, mod_len)
        hunks.append(
            {
                "type": tag,
                "base_start": i1 + 1 if base_len > 0 else i1 + 1,
                "base_len": base_len,
                "mod_start": j1 + 1 if mod_len > 0 else j1 + 1,
                "mod_len": mod_len,
            }
        )

    return {"summary": summary, "hunks": hunks}


def _clamp(val: int, default: int, min_val: int, max_val: int) -> int:
    try:
        ival = int(val)
    except Exception:
        return default
    return max(min_val, min(max_val, ival))


def perform_search(payload: dict):
    query = str(payload.get("query") or "")
    if not query:
        raise HTTPException(400, "Query required")
    case_sensitive = bool(payload.get("case_sensitive"))
    include_globs = [g for g in payload.get("include_globs") or [] if g]
    exclude_globs = [g for g in payload.get("exclude_globs") or [] if g]

    max_files = _clamp(payload.get("max_files", SEARCH_MAX_FILES), SEARCH_MAX_FILES, 1, SEARCH_MAX_FILES)
    max_matches_total = _clamp(payload.get("max_matches_total", SEARCH_MAX_MATCHES_TOTAL), SEARCH_MAX_MATCHES_TOTAL, 1, 100000)
    max_matches_per_file = _clamp(payload.get("max_matches_per_file", SEARCH_MAX_MATCHES_PER_FILE), SEARCH_MAX_MATCHES_PER_FILE, 1, 10000)

    # esclusioni fisse
    default_exclude = [f"**/{d}/**" for d in SEARCH_SKIP_DIRS]
    exclude_globs = list(set(exclude_globs + default_exclude))

    files_scanned = 0
    files_with_matches = 0
    matches_total = 0
    truncated = False
    results = []

    for rel in _iter_search_files(include_globs, exclude_globs, max_files):
        files_scanned += 1
        try:
            target = safe_path(rel.as_posix())
        except HTTPException:
            continue
        try:
            st = target.stat()
        except Exception:
            continue

        if st.st_size > MAX_SEARCH_FILE_SIZE:
            continue
        if _is_binary_file(target):
            continue

        try:
            text = target.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = target.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        matches = _find_matches(text, query, case_sensitive, max_matches_per_file)
        if not matches:
            continue
        if len(matches) >= max_matches_per_file:
            truncated = True
        matches_total += len(matches)
        files_with_matches += 1
        results.append(
            {
                "path": rel.as_posix(),
                "mtime": st.st_mtime,
                "size": st.st_size,
                "matches": matches,
                "matches_count": len(matches),
            }
        )
        if matches_total >= max_matches_total:
            truncated = True
            break

    if files_scanned >= max_files:
        truncated = True

    return {
        "ok": True,
        "query": query,
        "case_sensitive": case_sensitive,
        "truncated": truncated,
        "summary": {"files_scanned": files_scanned, "files_with_matches": files_with_matches, "matches_total": matches_total},
        "results": results,
    }


def _normalize_files(payload_files, max_files: int):
    files = []
    for item in payload_files or []:
        path = str(item.get("path") or "").strip()
        if not path:
            continue
        mtime = item.get("mtime")
        files.append({"path": path, "mtime": mtime})
        if len(files) >= max_files:
            break
    if not files:
        raise HTTPException(400, "files required")
    return files


def _replace_on_files(payload: dict, apply: bool):
    query = str(payload.get("query") or "")
    if not query:
        raise HTTPException(400, "Query required")
    replace = str(payload.get("replace") or "")
    case_sensitive = bool(payload.get("case_sensitive"))
    scope = payload.get("scope") or "files"
    max_files = _clamp(payload.get("max_files", SEARCH_MAX_FILES), SEARCH_MAX_FILES, 1, SEARCH_MAX_FILES)
    if scope != "files":
        raise HTTPException(400, "scope must be 'files'")
    files = _normalize_files(payload.get("files"), max_files)

    per_file = []
    summary = {
        "files_considered": 0,
        "files_to_modify": 0,
        "replacements_total": 0,
        "stale_files": 0,
        "files_modified": 0,
    }

    for entry in files:
        summary["files_considered"] += 1
        rel_path = entry["path"]
        expected_mtime = entry.get("mtime")
        try:
            target = safe_path(rel_path)
        except HTTPException as e:
            per_file.append({"path": rel_path, "status": "error", "error": e.detail if hasattr(e, "detail") else str(e), "replacements": 0})
            continue
        if not target.exists() or not target.is_file():
            per_file.append({"path": rel_path, "status": "error", "error": "File not found", "replacements": 0})
            continue
        try:
            st = target.stat()
        except Exception as e:
            per_file.append({"path": rel_path, "status": "error", "error": str(e), "replacements": 0})
            continue

        if expected_mtime is not None and st.st_mtime != expected_mtime:
            summary["stale_files"] += 1
            per_file.append({"path": rel_path, "status": "stale", "replacements": 0, "mtime": st.st_mtime, "size": st.st_size})
            continue
        if st.st_size > MAX_SEARCH_FILE_SIZE or _is_binary_file(target):
            per_file.append({"path": rel_path, "status": "skipped", "replacements": 0, "mtime": st.st_mtime, "size": st.st_size})
            continue

        try:
            text = target.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = target.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            per_file.append({"path": rel_path, "status": "error", "error": str(e), "replacements": 0})
            continue

        new_text, replacements = _replace_text(text, query, replace, case_sensitive)
        status = "unchanged"
        backup_path = None
        if replacements > 0:
            summary["replacements_total"] += replacements
            summary["files_to_modify"] += 1
            if apply:
                try:
                    backup = make_backup(target)
                    backup_path = str(backup.relative_to(BASE_DIR)) if backup else None
                    atomic_write(target, new_text)
                    status = "modified"
                    summary["files_modified"] += 1
                except Exception as e:
                    per_file.append({"path": rel_path, "status": "error", "error": str(e), "replacements": replacements})
                    continue
            else:
                status = "ok"
        per_file.append(
            {
                "path": rel_path,
                "status": status,
                "replacements": replacements,
                "backup_path": backup_path,
                "mtime": st.st_mtime,
                "size": st.st_size,
            }
        )

    return {
        "ok": True,
        "summary": summary,
        "per_file": per_file,
    }


def _replace_single(payload: dict):
    query = str(payload.get("query") or "")
    if not query:
        raise HTTPException(400, "Query required")
    replace = str(payload.get("replace") or "")
    case_sensitive = bool(payload.get("case_sensitive"))
    path = str(payload.get("path") or "").strip()
    if not path:
        raise HTTPException(400, "path required")
    match_index = payload.get("match_index") or 0
    try:
        match_index = int(match_index)
    except Exception:
        match_index = 0
    try:
        target = safe_path(path)
    except HTTPException as e:
        raise e
    if not target.exists() or not target.is_file():
        raise HTTPException(404, "File not found")
    try:
        st = target.stat()
    except Exception as e:
        raise HTTPException(500, f"stat failed: {e}")
    expected_mtime = payload.get("mtime")
    if expected_mtime is not None and st.st_mtime != expected_mtime:
        return {"ok": False, "status": "stale", "mtime": st.st_mtime, "path": path}
    if st.st_size > MAX_SEARCH_FILE_SIZE or _is_binary_file(target):
        raise HTTPException(400, "File not eligible for replace")
    try:
        text = target.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = target.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(500, f"read failed: {e}")

    matches = _find_matches(text, query, case_sensitive, limit=SEARCH_MAX_MATCHES_TOTAL)
    if not matches or match_index < 0 or match_index >= len(matches):
        return {"ok": False, "status": "nomatch", "path": path, "replacements": 0}
    m = matches[match_index]
    start = m.get("start", 0)
    length = m.get("match_len", len(query))
    end = start + length
    new_text = text[:start] + replace + text[end:]
    try:
        backup = make_backup(target)
        atomic_write(target, new_text)
    except Exception as e:
        raise HTTPException(500, f"write failed: {e}")
    return {
        "ok": True,
        "status": "modified",
        "path": path,
        "replacements": 1,
        "backup_path": str(backup.relative_to(BASE_DIR)) if backup else None,
        "mtime": st.st_mtime,
        "size": len(new_text.encode("utf-8")),
    }


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/search")
async def search_endpoint(request: Request):
    payload = await request.json()
    return perform_search(payload)


@app.post("/api/search/replace/preview")
async def search_replace_preview(request: Request):
    payload = await request.json()
    return _replace_on_files(payload, apply=False)


@app.post("/api/search/replace/apply")
async def search_replace_apply(request: Request):
    payload = await request.json()
    return _replace_on_files(payload, apply=True)


@app.post("/api/search/replace/one")
async def search_replace_one(request: Request):
    payload = await request.json()
    return _replace_single(payload)


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


@app.post("/api/ha/action")
async def ha_action(request: Request):
    payload = await request.json()
    action = payload.get("action") if isinstance(payload, dict) else None
    if action not in HA_ACTIONS:
        raise HTTPException(400, "Invalid action")
    if not SUPERVISOR_TOKEN:
        logger.warning("ha_action: missing SUPERVISOR_TOKEN for action=%s", action)
        return JSONResponse(
            status_code=503,
            content={
                "ok": False,
                "action": action,
                "error": {
                    "message": "Supervisor environment not available",
                    "status": 503,
                    "details": "Missing supervisor token",
                },
            },
        )
    cfg = HA_ACTIONS[action]

    def clip_text(value: str, max_len: int = 2048) -> str:
        if len(value) <= max_len:
            return value
        return value[:max_len] + "...(truncated)"

    def is_service_unavailable(status_code: int, body: str) -> bool:
        text = (body or "").lower()
        if status_code == 404:
            return True
        return (
            "service not found" in text
            or "unknown service" in text
            or ("not found" in text and "service" in text)
        )

    def classify_request_error(err: Exception):
        msg = str(err).lower()
        if "name or service not known" in msg or "nodename nor servname provided" in msg:
            return 503, "Supervisor environment not available"
        if "connection refused" in msg or "connecterror" in msg:
            return 503, "Supervisor API not reachable"
        if "timed out" in msg or "timeout" in msg:
            return 503, "Home Assistant service timeout"
        return 502, "Error calling Home Assistant"

    async def post_core_service(domain: str, service: str):
        target = f"http://supervisor/core/api/services/{domain}/{service}"
        async with httpx.AsyncClient(base_url="http://supervisor/core/api", timeout=15) as client:
            res = await client.post(
                f"/services/{domain}/{service}",
                headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                json={},
            )
        return res, target, clip_text(res.text or "")

    try:
        if action == "reload_yaml":
            steps = []
            primary_domain, primary_service = "homeassistant", "reload_all"
            fallback_domain, fallback_service = "homeassistant", "reload_core_config"
            logger.info("ha_action reload_yaml received action=%s target_service=%s.%s", action, primary_domain, primary_service)
            try:
                primary_res, primary_target, primary_body = await post_core_service(primary_domain, primary_service)
            except httpx.RequestError as e:
                logger.warning("ha_action reload_yaml upstream request error target=%s error=%s", "http://supervisor/core/api/services/homeassistant/reload_all", str(e))
                err_status, err_message = classify_request_error(e)
                return JSONResponse(
                    status_code=err_status,
                    content={
                        "ok": False,
                        "action": action,
                        "error": {
                            "message": err_message,
                            "status": err_status,
                            "details": str(e),
                        },
                    },
                )

            logger.info(
                "ha_action reload_yaml upstream status=%s target=%s body=%s",
                primary_res.status_code,
                primary_target,
                primary_body,
            )

            if primary_res.status_code < 400:
                steps.append(
                    {
                        "name": f"{primary_domain}.{primary_service}",
                        "status": "ok",
                        "http_status": primary_res.status_code,
                    }
                )
                try:
                    primary_data = primary_res.json()
                except Exception:
                    primary_data = None
                return {
                    "ok": True,
                    "action": action,
                    "used": "reload_all",
                    "steps": steps,
                    "result": primary_data,
                }

            if primary_res.status_code in (401, 403):
                return JSONResponse(
                    status_code=403,
                    content={
                        "ok": False,
                        "action": action,
                        "error": {
                            "message": "Unauthorized to call Home Assistant",
                            "status": 403,
                            "details": primary_body,
                        },
                    },
                )

            if is_service_unavailable(primary_res.status_code, primary_body):
                steps.append(
                    {
                        "name": f"{primary_domain}.{primary_service}",
                        "status": "unavailable",
                        "http_status": primary_res.status_code,
                    }
                )
                logger.warning(
                    "ha_action reload_yaml fallback to %s.%s due to unavailable primary service",
                    fallback_domain,
                    fallback_service,
                )
                try:
                    fallback_res, fallback_target, fallback_body = await post_core_service(fallback_domain, fallback_service)
                except httpx.RequestError as e:
                    logger.warning("ha_action reload_yaml fallback request error target=%s error=%s", "http://supervisor/core/api/services/homeassistant/reload_core_config", str(e))
                    err_status, err_message = classify_request_error(e)
                    return JSONResponse(
                        status_code=err_status,
                        content={
                            "ok": False,
                            "action": action,
                            "error": {
                                "message": err_message,
                                "status": err_status,
                                "details": str(e),
                            },
                            "steps": steps,
                        },
                    )

                logger.info(
                    "ha_action reload_yaml fallback upstream status=%s target=%s body=%s",
                    fallback_res.status_code,
                    fallback_target,
                    fallback_body,
                )

                if fallback_res.status_code < 400:
                    steps.append(
                        {
                            "name": f"{fallback_domain}.{fallback_service}",
                            "status": "ok",
                            "http_status": fallback_res.status_code,
                        }
                    )
                    try:
                        fallback_data = fallback_res.json()
                    except Exception:
                        fallback_data = None
                    return {
                        "ok": True,
                        "action": action,
                        "used": "fallback",
                        "steps": steps,
                        "result": fallback_data,
                    }

                if fallback_res.status_code in (401, 403):
                    return JSONResponse(
                        status_code=403,
                        content={
                            "ok": False,
                            "action": action,
                            "error": {
                                "message": "Unauthorized to call Home Assistant",
                                "status": 403,
                                "details": fallback_body,
                            },
                            "steps": steps,
                        },
                    )

                steps.append(
                    {
                        "name": f"{fallback_domain}.{fallback_service}",
                        "status": "failed",
                        "http_status": fallback_res.status_code,
                    }
                )
                return JSONResponse(
                    status_code=fallback_res.status_code,
                    content={
                        "ok": False,
                        "action": action,
                        "error": {
                            "message": "Home Assistant returned an error",
                            "status": fallback_res.status_code,
                            "details": fallback_body,
                        },
                        "steps": steps,
                    },
                )

            return JSONResponse(
                status_code=primary_res.status_code,
                content={
                    "ok": False,
                    "action": action,
                    "error": {
                        "message": "Home Assistant returned an error",
                        "status": primary_res.status_code,
                        "details": primary_body,
                    },
                },
            )

        if cfg["type"] == "service":
            domain = cfg["domain"]
            service = cfg["service"]
            async with httpx.AsyncClient(base_url="http://supervisor/core/api", timeout=15) as client:
                res = await client.post(
                    f"/services/{domain}/{service}",
                    headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                    json={},
                )
        else:
            path = cfg["path"]
            async with httpx.AsyncClient(base_url="http://supervisor", timeout=15) as client:
                res = await client.post(
                    path,
                    headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"},
                )
        response_body = clip_text(res.text or "")
        if res.status_code in (401, 403):
            return JSONResponse(
                status_code=403,
                content={
                    "ok": False,
                    "action": action,
                    "error": {
                        "message": "Unauthorized to call Home Assistant",
                        "status": 403,
                        "details": response_body,
                    },
                },
            )
        if res.status_code >= 400:
            return JSONResponse(
                status_code=res.status_code,
                content={
                    "ok": False,
                    "action": action,
                    "error": {
                        "message": "Home Assistant returned an error",
                        "status": res.status_code,
                        "details": response_body,
                    },
                },
            )
        try:
            data = res.json()
        except Exception:
            data = None
        return {"ok": True, "action": action, "result": data}
    except HTTPException:
        raise
    except httpx.RequestError as e:
        err_status, err_message = classify_request_error(e)
        return JSONResponse(
            status_code=err_status,
            content={
                "ok": False,
                "action": action,
                "error": {
                    "message": err_message,
                    "status": err_status,
                    "details": str(e),
                },
            },
        )
    except Exception as e:
        logger.exception("ha_action: error on %s: %s", action, e)
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "action": action,
                "error": {
                    "message": "Error calling Home Assistant",
                    "status": 500,
                    "details": str(e),
                },
            },
        )


async def supervisor_get_json(path: str):
    if not SUPERVISOR_TOKEN:
        return None, "missing supervisor token"
    try:
        async with httpx.AsyncClient(base_url="http://supervisor", timeout=15) as client:
            res = await client.get(path, headers={"Authorization": f"Bearer {SUPERVISOR_TOKEN}"})
            res.raise_for_status()
            return res.json(), None
    except Exception as e:
        logger.warning("supervisor_get_json %s failed: %s", path, e)
        return None, str(e)


async def supervisor_get_text(path: str, accept: str = "text/plain"):
    if not SUPERVISOR_TOKEN:
        return None, "missing supervisor token"
    headers = {"Authorization": f"Bearer {SUPERVISOR_TOKEN}"}
    headers["X-Supervisor-Token"] = SUPERVISOR_TOKEN
    if accept:
        headers["Accept"] = accept
    try:
        async with httpx.AsyncClient(base_url="http://supervisor", timeout=30) as client:
            res = await client.get(path, headers=headers)
            if res.status_code in (401, 403):
                return None, f"HTTP {res.status_code} (unauthorized)"
            res.raise_for_status()
            return res.text, None
    except Exception as e:
        logger.warning("supervisor_get_text %s failed: %s", path, e)
        return None, str(e)


def mask_secrets(text: str) -> str:
    if not text:
        return text
    masked = text
    if SUPERVISOR_TOKEN:
        masked = masked.replace(SUPERVISOR_TOKEN, "***")
    masked = re.sub(r"Bearer\s+[A-Za-z0-9._\-]+", "Bearer ***", masked, flags=re.IGNORECASE)
    return masked


@app.post("/api/utils/debug-log")
async def generate_debug_log():
    ensure_config_store()
    setup_file_logging()
    timestamp = datetime.now()
    ts_short = timestamp.strftime("%Y-%m-%d %H:%M:%S")
    fname = timestamp.strftime("debug_%Y-%m-%d_%H-%M-%S.txt")
    target = safe_path(f".fep-config/{fname}")

    hostname = socket.gethostname()
    arch = platform.machine() or os.uname().machine
    lines = []
    lines.append(f"File Editor Plus debug log - {ts_short}")
    lines.append(f"Addon version: {ADDON_VERSION}")
    lines.append(f"Host: {hostname} | Arch: {arch}")
    lines.append("")

    sections = []

    def add_section(title: str, content: str):
        sections.append(f"== {title} ==")
        sections.append(content)
        sections.append("")

    def clean_err(val: Optional[str]) -> str:
        return mask_secrets(val) if val else ""

    headers = None
    if SUPERVISOR_TOKEN:
        headers = {"Authorization": f"Bearer {SUPERVISOR_TOKEN}", "X-Supervisor-Token": SUPERVISOR_TOKEN}

    async def fetch_json(client: httpx.AsyncClient, path: str):
        try:
            res = await client.get(path)
            status = res.status_code
            if status >= 400:
                return None, f"HTTP {status} {res.text}", status
            return res.json(), None, status
        except Exception as e:
            return None, str(e), None

    async def fetch_text(client: httpx.AsyncClient, path: str):
        try:
            res = await client.get(path, headers={"Accept": "text/plain"})
            status = res.status_code
            if status >= 400:
                return None, f"HTTP {status} {res.text}", status
            return res.text, None, status
        except Exception as e:
            return None, str(e), None

    sup_info = (None, "missing supervisor token", None)
    core_info = (None, "missing supervisor token", None)
    host_info = (None, "missing supervisor token", None)
    os_info = (None, "missing supervisor token", None)
    sup_logs = (None, "missing supervisor token", None)
    core_logs = (None, "missing supervisor token", None)

    if headers:
        async with httpx.AsyncClient(base_url="http://supervisor", timeout=30, headers=headers) as client:
            sup_info = await fetch_json(client, "/supervisor/info")
            core_info = await fetch_json(client, "/core/info")
            os_info = await fetch_json(client, "/os/info")
            host_info = await fetch_json(client, "/host/info")
            sup_logs = await fetch_text(client, "/supervisor/logs?lines=200")
            core_logs = await fetch_text(client, "/core/logs?lines=200")

    sup_info_data, sup_info_err, sup_info_status = sup_info
    core_info_data, core_info_err, core_info_status = core_info
    os_info_data, os_info_err, _ = os_info
    host_info_data, host_info_err, _ = host_info

    add_section("Home Assistant Core info", json.dumps(core_info_data, ensure_ascii=False, indent=2) if core_info_data else f"FAILED: {clean_err(core_info_err)}")
    add_section("Supervisor info", json.dumps(sup_info_data, ensure_ascii=False, indent=2) if sup_info_data else f"FAILED: {clean_err(sup_info_err)}")
    add_section("OS info", json.dumps(os_info_data, ensure_ascii=False, indent=2) if os_info_data else f"FAILED: {clean_err(os_info_err)}")
    add_section("Host info", json.dumps(host_info_data, ensure_ascii=False, indent=2) if host_info_data else f"FAILED: {clean_err(host_info_err)}")

    sup_logs_text, sup_logs_err, sup_logs_status = sup_logs
    if sup_logs_text:
        tail = "\n".join(sup_logs_text.splitlines()[-300:])
        add_section("Supervisor logs (last 300 lines)", mask_secrets(tail))
    else:
        if sup_logs_status == 403:
            msg = "FORBIDDEN 403 – allega manualmente i log Supervisor dalla UI"
        elif sup_info_status and sup_info_status < 400:
            msg = f"FAILED logs: HTTP {sup_logs_status or ''} {clean_err(sup_logs_err) or ''}".strip()
        else:
            msg = f"FAILED: {clean_err(sup_logs_err) or f'HTTP {sup_logs_status}'}"
        add_section("Supervisor logs", msg)

    core_logs_text, core_logs_err, core_logs_status = core_logs
    if core_logs_text:
        tail_core = "\n".join(core_logs_text.splitlines()[-300:])
        add_section("Core logs (last 300 lines)", mask_secrets(tail_core))
    else:
        if core_logs_status == 403:
            msg = "FORBIDDEN 403 – allega manualmente i log Supervisor dalla UI"
        else:
            msg = f"FAILED: {clean_err(core_logs_err) or f'HTTP {core_logs_status}'}"
        add_section("Core logs", msg)

    runtime_log = FEP_CONFIG_DIR / "fep_runtime.log"
    if runtime_log.exists():
        try:
            with open(runtime_log, "r", encoding="utf-8", errors="ignore") as f:
                lines_log = f.read().splitlines()
            tail_app = mask_secrets("\n".join(lines_log[-300:]))
            add_section("App logs (tail 300)", tail_app)
        except Exception as e:
            add_section("App logs", f"FAILED lettura fep_runtime.log: {e}")
    else:
        add_section("App logs", "MISSING: fep_runtime.log non trovato")

    content = "\n".join(lines + sections)
    try:
        atomic_write(target, content)
    except Exception as e:
        logger.exception("debug-log: error writing %s: %s", target, e)
        raise HTTPException(500, f"Errore salvataggio debug log: {e}")

    return {"ok": True, "filename": fname, "path": str(target)}
@app.post("/api/folder")
def create_folder(path: str):
    target = safe_path(path)
    if target.exists():
        raise HTTPException(400, "Path already exists")
    target.mkdir(parents=True, exist_ok=True)
    return {"ok": True, "path": target.resolve().relative_to(BASE_DIR).as_posix()}


@app.get("/api/backup")
def download_backup(background_tasks: BackgroundTasks):
    filename = datetime.now().strftime("config-backup-%Y%m%d-%H%M%S.zip")
    tmp = tempfile.NamedTemporaryFile(prefix="fep-backup-", suffix=".zip", delete=False)
    tmp_path = Path(tmp.name)
    tmp.close()
    try:
        with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(BASE_DIR):
                dirs[:] = [d for d in dirs if not Path(root, d).is_symlink()]
                for name in files:
                    full = Path(root) / name
                    if full.is_symlink():
                        continue
                    try:
                        rel = full.resolve().relative_to(BASE_DIR).as_posix()
                    except Exception:
                        continue
                    zf.write(full, rel)
    except Exception as e:
        logger.exception("backup: errore creazione zip: %s", e)
        raise HTTPException(500, f"Backup failed: {e}")
    background_tasks.add_task(lambda p=tmp_path: p.unlink(missing_ok=True))
    return FileResponse(tmp_path, media_type="application/zip", filename=filename, background=background_tasks)


@app.post("/api/fs/copy")
async def copy_path(request: Request):
    payload = await request.json()
    src = payload.get("src") if isinstance(payload, dict) else None
    dest_dir = payload.get("dest_dir") if isinstance(payload, dict) else None
    dest_name = payload.get("dest_name") if isinstance(payload, dict) else None
    if not src:
        raise HTTPException(400, "Source path required")
    src_path = safe_path(src)
    if not src_path.exists():
        raise HTTPException(404, "Source not found")
    dest_dir_path = safe_path(dest_dir or "")
    if not dest_dir_path.exists() or not dest_dir_path.is_dir():
        raise HTTPException(400, "Destination must be a directory")
    dest_name_clean = None
    if dest_name is not None:
        if not isinstance(dest_name, str):
            raise HTTPException(400, "Invalid destination name")
        dest_name_clean = dest_name.strip()
        if not dest_name_clean:
            raise HTTPException(400, "Invalid destination name")
        if Path(dest_name_clean).name != dest_name_clean:
            raise HTTPException(400, "Invalid destination name")
    dest_path = dest_dir_path / (dest_name_clean or src_path.name)
    if not _is_within_base(dest_path.resolve()):
        raise HTTPException(403, "Access denied")
    if dest_path.exists():
        if dest_name_clean:
            base_name = dest_path.name
            if base_name.startswith(".") and base_name.count(".") == 1:
                base = base_name
                ext = ""
            else:
                if "." in base_name:
                    base, ext = base_name.rsplit(".", 1)
                    ext = f".{ext}"
                else:
                    base, ext = base_name, ""
            found = False
            for idx in range(2, 1000):
                candidate = dest_path.with_name(f"{base}{idx}{ext}")
                if not candidate.exists():
                    dest_path = candidate
                    found = True
                    break
            if not found:
                raise HTTPException(409, "Destination exists")
        else:
            raise HTTPException(409, "Destination exists")
    try:
        if src_path.is_dir():
            try:
                dest_path.resolve().relative_to(src_path.resolve())
                raise HTTPException(400, "Cannot copy directory into itself")
            except ValueError:
                pass
            shutil.copytree(src_path, dest_path)
        elif src_path.is_file():
            shutil.copy2(src_path, dest_path)
        else:
            raise HTTPException(400, "Unsupported source type")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("fs_copy: error %s -> %s: %s", src_path, dest_path, e)
        raise HTTPException(500, f"Copy failed: {e}")
    return {"ok": True, "dest": dest_path.resolve().relative_to(BASE_DIR).as_posix()}


@app.post("/api/fs/delete")
async def delete_path(request: Request):
    payload = await request.json()
    path = payload.get("path") if isinstance(payload, dict) else None
    if not path:
        raise HTTPException(400, "Path required")
    target = safe_path(path)
    if target == BASE_DIR:
        raise HTTPException(400, "Cannot delete base directory")
    if not target.exists():
        raise HTTPException(404, "Path not found")
    try:
        if target.is_file():
            make_backup(target)
            target.unlink()
            return {"ok": True, "path": target.resolve().relative_to(BASE_DIR).as_posix(), "type": "file"}
        if target.is_dir():
            shutil.rmtree(target)
            return {"ok": True, "path": target.resolve().relative_to(BASE_DIR).as_posix(), "type": "dir"}
        raise HTTPException(400, "Unsupported path type")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("fs_delete: error %s: %s", target, e)
        raise HTTPException(500, f"Delete failed: {e}")


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

        writable = True
        if p.is_dir():
            try:
                writable = os.access(p, os.W_OK)
            except Exception:
                writable = False

        items.append(
            {
                "name": name,
                "path": rel,
                "type": "dir" if p.is_dir() else "file",
                "writable": writable if p.is_dir() else None,
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


@app.get("/api/file/raw")
def read_file_raw(path: str):
    # Support both relative and absolute "/config/..." paths for convenience
    if path.startswith("/config/"):
        path = path[len("/config/") :]
    f = safe_path(path)
    if not f.exists():
        raise HTTPException(404, "File not found")
    if not f.is_file():
        raise HTTPException(400, "Not a file")
    allowed_ext = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
    ext = f.suffix.lower()
    if ext not in allowed_ext:
        raise HTTPException(415, f"Unsupported media type: {ext or 'unknown'}")
    media_type, _ = mimetypes.guess_type(f.name)
    return FileResponse(
        str(f),
        media_type=media_type or "application/octet-stream",
        headers={"Cache-Control": "private, max-age=60"},
    )


@app.get("/api/fs/download")
def download_file(path: str):
    # Support absolute /config/... too
    if path.startswith("/config/"):
        path = path[len("/config/") :]
    f = safe_path(path)
    if not f.exists():
        raise HTTPException(404, "File not found")
    if not f.is_file():
        raise HTTPException(400, "Not a file")
    media_type, _ = mimetypes.guess_type(f.name)
    return FileResponse(
        str(f),
        media_type=media_type or "application/octet-stream",
        headers={"Cache-Control": "no-store"},
    )


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    target_dir: str = Form(...),
    mode: str = Form("fail"),
):
    if not file or not file.filename:
        raise HTTPException(415, "Invalid filename")
    original_name = file.filename
    if "/" in original_name or "\\" in original_name:
        raise HTTPException(415, "Invalid filename")
    mode = (mode or "fail").lower()
    if mode not in CONFLICT_MODES:
        mode = "fail"

    # Normalizza target_dir: accetta anche /config/...
    td = (target_dir or "").strip()
    if td.startswith("/config/"):
        td = td[len("/config/") :]
    elif td == "/config":
        td = ""

    target_dir_path = safe_path(td)

    if not target_dir_path.exists():
        raise HTTPException(404, "Target directory does not exist")
    if not target_dir_path.is_dir():
        raise HTTPException(400, "Target is not a directory")

    name = Path(original_name).name
    if not name:
        raise HTTPException(415, "Invalid filename")

    dest = (target_dir_path / name).resolve()
    if not _is_within_base(dest):
        raise HTTPException(403, "Access denied")

    if dest.exists():
        if dest.is_dir():
            raise HTTPException(409, "Destination already exists")
        if mode == "fail":
            raise HTTPException(409, "File already exists")
        if mode == "autorename":
            dest = next_available_name(dest)
        # overwrite handled later

    tmp_name = f".upload_tmp_{uuid.uuid4().hex}"
    tmp_path = dest.with_name(tmp_name)

    total = 0
    try:
        with open(tmp_path, "wb") as f:
            while True:
                chunk = await file.read(1024 * 64)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, "File too large (max 50MB)")
                f.write(chunk)
            f.flush()
            os.fsync(f.fileno())
        if mode == "overwrite" and dest.exists():
            if dest.is_file():
                dest.unlink()
            else:
                raise HTTPException(409, "Destination already exists")
        os.replace(tmp_path, dest)
    except HTTPException:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        raise
    except Exception as e:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
        logger.exception("upload_file: error writing %s: %s", dest, e)
        raise HTTPException(500, f"Upload failed: {e}")
    finally:
        await file.close()

    return {
        "ok": True,
        "path": dest.as_posix(),
        "size_bytes": total,
    }


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


@app.post("/api/fs/move")
async def move_path(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON")
    src_raw = (payload.get("src") or "").strip()
    dst_dir_raw_raw = payload.get("dst_dir")
    if dst_dir_raw_raw is None:
        dst_dir_raw = None
    else:
        dst_dir_raw = str(dst_dir_raw_raw)
    dst_dir_raw = dst_dir_raw.strip() if dst_dir_raw is not None else None
    mode = (payload.get("mode") or "fail").lower() if isinstance(payload, dict) else "fail"
    if mode not in CONFLICT_MODES:
        mode = "fail"

    if not src_raw:
        raise HTTPException(400, "src is required")
    if dst_dir_raw is None:
        raise HTTPException(400, "dst_dir is required")

    if src_raw.startswith("/config/"):
        src_raw = src_raw[len("/config/") :]
    if src_raw == "/config":
        src_raw = ""
    if dst_dir_raw in ("/config", "/config/", "/", ".", ""):
        dst_dir_raw = ""
    if dst_dir_raw.startswith("/config/"):
        dst_dir_raw = dst_dir_raw[len("/config/") :]
    if dst_dir_raw == "/config":
        dst_dir_raw = ""

    src = safe_path(src_raw)
    dst_dir = safe_path(dst_dir_raw)

    if not src.exists():
        raise HTTPException(404, "Source not found")
    if not dst_dir.exists():
        raise HTTPException(404, "Destination directory not found")
    if not dst_dir.is_dir():
        raise HTTPException(400, "Destination directory invalid")

    # Prevent moving dir into itself or subdir
    if src.is_dir():
        try:
            dst_rel = dst_dir.resolve().relative_to(src.resolve())
            # if succeeds, dst is inside src (or same)
            raise HTTPException(400, "Cannot move a directory into itself")
        except ValueError:
            pass
        if dst_dir.resolve() == src.resolve():
            raise HTTPException(400, "Cannot move a directory into itself")

    dst = (dst_dir / src.name).resolve()
    if not _is_within_base(dst):
        raise HTTPException(403, "Access denied")
    if dst.exists():
        if mode == "fail":
            raise HTTPException(409, "Destination already exists")
        if mode == "autorename":
            dst = next_available_name(dst)
        elif mode == "overwrite":
            if dst.is_file():
                dst.unlink()
            elif dst.is_dir():
                shutil.rmtree(dst)
            else:
                raise HTTPException(400, "Unsupported destination type")

    try:
        os.replace(src, dst)
    except Exception as e:
        logger.exception("move_path: error moving %s to %s: %s", src, dst, e)
        raise HTTPException(500, f"Move failed: {e}")

    return {"ok": True, "src": src.resolve().relative_to(BASE_DIR).as_posix(), "dst": dst.resolve().relative_to(BASE_DIR).as_posix()}


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


@app.get("/api/mdi/search")
def mdi_search(query: str = "", limit: int = MDI_MAX_RESULTS):
    limit = _clamp(limit, MDI_MAX_RESULTS, 1, 200)
    results = search_mdi(query, limit)
    return {"ok": True, "items": results}


@app.get("/api/user-config")
def get_user_config():
    return {"ok": True, "config": load_user_config()}


@app.put("/api/user-config")
async def update_user_config(request: Request):
    payload = await request.json()
    config = payload.get("config") if isinstance(payload, dict) else None
    if config is None and isinstance(payload, dict):
        config = payload
    if not isinstance(config, dict):
        raise HTTPException(400, "Config must be an object")
    save_user_config(config)
    return {"ok": True, "config": load_user_config()}


def load_session_state() -> dict:
    ensure_config_store()
    target = safe_path(".fep-config/session.json")
    if not target.exists():
        return DEFAULT_SESSION_STATE.copy()
    try:
        with open(target, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except Exception as e:
        logger.warning("session: errore lettura %s: %s", target, e)
        try:
            broken = target.with_name(f"session.broken_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            shutil.move(str(target), broken)
        except Exception as move_err:
            logger.warning("session: impossibile rinominare session corrotta: %s", move_err)
        state = DEFAULT_SESSION_STATE.copy()
        state["corrupted"] = True
        return state
    if not isinstance(raw, dict):
        state = DEFAULT_SESSION_STATE.copy()
        state["corrupted"] = True
        return state
    normalized = normalize_session(raw)
    if "corrupted" not in normalized:
        normalized["corrupted"] = False
    return normalized


def save_session_state(data: dict) -> None:
    ensure_config_store()
    target = safe_path(".fep-config/session.json")
    normalized = normalize_session(data)
    try:
        atomic_write(target, json.dumps(normalized, ensure_ascii=False, indent=2))
        # cleanup buffer files not referenced
        try:
            keep_ids = {t.get("buffer_id") for t in normalized.get("tabs", []) if isinstance(t, dict) and t.get("buffer_id")}
            for f in BUFFER_DIR.glob("*.txt"):
                buf_id = f.stem
                if buf_id not in keep_ids:
                    f.unlink(missing_ok=True)
        except Exception as gc_err:
            logger.warning("session: buffer gc skipped: %s", gc_err)
    except Exception as e:
        logger.exception("session: errore salvataggio %s: %s", target, e)
        raise HTTPException(500, f"Errore salvataggio sessione: {e}")


@app.get("/api/session")
def get_session():
    return load_session_state()


@app.put("/api/session")
async def put_session(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "Body JSON richiesto")
    if not isinstance(payload, dict):
        raise HTTPException(400, "Session deve essere un oggetto")

    def normalize_view(raw: Any):
        if isinstance(raw, dict):
            return {
                "scrollTop": int(raw.get("scrollTop") or 0),
                "selStart": int(raw.get("selStart") or 0),
                "selEnd": int(raw.get("selEnd") or 0),
            }
        return {"scrollTop": 0, "selStart": 0, "selEnd": 0}

    tabs = payload.get("tabs")
    if tabs is not None:
        if not isinstance(tabs, list):
            raise HTTPException(400, "tabs deve essere una lista")
        for idx, item in enumerate(tabs):
            if isinstance(item, str):
                tabs[idx] = {"path": item, "dirty": False, "view": {"scrollTop": 0, "selStart": 0, "selEnd": 0}}
                continue
            if not isinstance(item, dict) or not isinstance(item.get("path"), str):
                raise HTTPException(400, "Ogni tab deve essere string o object {path,dirty}")
            if "dirty" in item and not isinstance(item.get("dirty"), bool):
                raise HTTPException(400, "dirty deve essere boolean")
            item["view"] = normalize_view(item.get("view"))
    active = payload.get("active")
    if active is not None and not isinstance(active, str):
        raise HTTPException(400, "active deve essere string o null")
    if "split" in payload and not isinstance(payload.get("split"), bool):
        raise HTTPException(400, "split deve essere boolean")
    save_session_state(payload)
    return {"ok": True}


@app.put("/api/session/buffer")
async def put_session_buffer(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "Body JSON richiesto")
    if not isinstance(payload, dict):
        raise HTTPException(400, "Body deve essere un oggetto")
    path = payload.get("path")
    content = payload.get("content", "")
    if not isinstance(path, str):
        raise HTTPException(400, "path richiesto (string)")
    if not isinstance(content, str):
        raise HTTPException(400, "content deve essere string")
    encoded = content.encode("utf-8")
    if len(encoded) > MAX_BUFFER_BYTES:
        return {"ok": False, "skipped": True, "reason": "too_large", "max": MAX_BUFFER_BYTES}
    buffer_id = hashlib.sha1(path.encode("utf-8")).hexdigest()
    target = BUFFER_DIR / f"{buffer_id}.txt"
    try:
        atomic_write(target, content)
    except Exception as e:
        logger.exception("session buffer: errore salvataggio %s: %s", target, e)
        raise HTTPException(500, f"Errore salvataggio buffer: {e}")
    return {"ok": True, "buffer_id": buffer_id, "size": len(encoded)}


@app.get("/api/session/buffer/{buffer_id}")
def get_session_buffer(buffer_id: str):
    if not re.fullmatch(r"[a-fA-F0-9]{40}", buffer_id or ""):
        raise HTTPException(400, "buffer_id non valido")
    target = BUFFER_DIR / f"{buffer_id}.txt"
    if not target.exists():
        raise HTTPException(404, "Buffer not found")
    try:
        content = target.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(500, f"Errore lettura buffer: {e}")
    return {"ok": True, "content": content}


@app.post("/api/session/reset")
def reset_session():
    ensure_config_store()
    # elimina session.json
    try:
        session_path = safe_path(".fep-config/session.json")
        session_path.unlink(missing_ok=True)
    except Exception as e:
        logger.warning("session reset: errore rimozione session.json: %s", e)
    # elimina buffer files
    try:
        for f in BUFFER_DIR.glob("*.txt"):
            try:
                f.unlink(missing_ok=True)
            except Exception:
                continue
    except Exception as e:
        logger.warning("session reset: errore pulizia buffer: %s", e)
    return {"ok": True}


@app.post("/api/format/yaml")
async def format_yaml(body: dict):
    text = body.get("text") if isinstance(body, dict) else None
    if text is None:
        raise HTTPException(400, "Field 'text' richiesto")
    formatted = format_yaml_text(str(text))
    return {"ok": True, "formatted": formatted}


@app.post("/api/diff")
async def diff_endpoint(body: dict):
    if not isinstance(body, dict):
        raise HTTPException(400, "Invalid JSON body")
    base_text = body.get("base_text")
    modified_text = body.get("modified_text")
    if base_text is None or modified_text is None:
        raise HTTPException(400, "Fields 'base_text' and 'modified_text' richiesti")
    try:
        diff = compute_diff(str(base_text), str(modified_text))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(422, detail={"message": str(e)})
    return {"ok": True, **diff}


# ---- Frontend (Ingress friendly): serve static + SPA fallback
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


@app.get("/")
def index():
    idx = FRONTEND_DIR / "index.html"
    if not idx.exists():
        return JSONResponse({"error": "frontend not built"}, status_code=500)
    return FileResponse(str(idx))


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    # lascia passare API e assets
    if full_path.startswith("api/") or full_path.startswith("assets/") or full_path.startswith("frontend/"):
        raise HTTPException(404)
    idx = FRONTEND_DIR / "index.html"
    if not idx.exists():
        raise HTTPException(500, "frontend not built")
    return FileResponse(str(idx))
