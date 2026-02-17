# AI_RUNBOOK

Runbook operativo (solo comandi verificabili nel repo o in AI_old).

Vincoli:
- Niente CDN o fetch runtime esterni.
- Ingress-friendly: usare path relativi (Vite `base: "./"` e `apiBase` da `window.location.href`).

## Setup/Install
- Installazione add-on (custom repo): vedi `file_editor_plus/README.md`.
- Requisiti runtime:
  - Add-on Home Assistant con Ingress abilitato.
  - Mount `/config:rw` e contesto Supervisor per API HA (token gestito dal Supervisor).

## Dev
- Dev locale:
  - Frontend (Vite):
    - `cd file_editor_plus/frontend && npm ci && npm run dev`
  - Backend (Uvicorn):
    - Prerequisito: ambiente Python con `pip` disponibile e dipendenze installabili.
    - `cd file_editor_plus/backend && python3 -m pip install -r requirements.txt && python3 -m uvicorn app:app --host 0.0.0.0 --port 8099`

## Build
- Frontend build (certi dal repo):
  - `cd file_editor_plus/frontend`
  - `npm ci`
  - `npm run build`
- Add-on lifecycle (certi da AI_old):
  - `docker exec hassio_cli ha apps update local_file_editor_plus`
  - `docker exec hassio_cli ha apps rebuild local_file_editor_plus`
  - `docker exec hassio_cli ha apps restart local_file_editor_plus`

## Lint/Format/Typecheck
- Frontend:
  - Typecheck: `cd file_editor_plus/frontend && npm run -s typecheck` (nota: al momento puo' fallire per errori TS gia' presenti)
  - Lint: N/A (nessun tooling lint configurato nel repo)
- Backend:
  - Lint/typecheck: N/A (nessun tooling esplicito nel repo)

## Test (unit/integration/e2e)
- Backend unit tests:
  - Test files esistenti: `file_editor_plus/backend/test_diff.py`, `file_editor_plus/backend/test_format_yaml.py`, `file_editor_plus/backend/test_search_replace.py`.
  - Comando runner ufficiale (Docker, indipendente dal python host):
    - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`
  - (Opzionale) Runner locale:
    - Prerequisito: ambiente Python con `pip` disponibile e dipendenze installabili.
    - `cd file_editor_plus/backend && python3 -m pip install -r requirements.txt && python3 -m unittest -q`
- Frontend build e' un gate minimo (Vite/TS).

## Migrations/DB/Docker
- <<OPTIONAL>>

## Quality gates (prima dei commit)
- Gate minimi:
  - Frontend build OK.
  - Backend unit tests OK.
  - Nessun log con segreti/token.
  - Verifica Ingress sotto path prefix.
