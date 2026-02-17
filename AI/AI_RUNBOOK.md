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
- Dev locale: N/A (nel repo non e' documentato un comando ufficiale unico per un dev server FE/BE).

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
- <<OPTIONAL>>

## Test (unit/integration/e2e)
- Backend unit tests:
  - Test files esistenti: `file_editor_plus/backend/test_diff.py`, `file_editor_plus/backend/test_format_yaml.py`, `file_editor_plus/backend/test_search_replace.py`.
  - Comando runner ufficiale: N/A (da definire; vedi STEP 002 in `AI/AI_TASKS.md`).
- Frontend build e' un gate minimo (Vite/TS).

## Migrations/DB/Docker
- <<OPTIONAL>>

## Quality gates (prima dei commit)
- Gate minimi:
  - Frontend build OK.
  - Backend unit tests OK.
  - Nessun log con segreti/token.
  - Verifica Ingress sotto path prefix.
