# AI SMOKE — Google Drive OAuth

Data: 2026-02-22

## Ambito
- Feature: Google Drive connect via OAuth Authorization Code
- Verifica minima: backend tests + build frontend + checklist manuale UI

## Automated checks (eseguiti)
- Backend unit tests:
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`
  - Esito: `PASS` (25 test)
- Frontend build:
  - `cd file_editor_plus/frontend && npm run build`
  - Esito: `PASS`

## Manual smoke checklist (OAuth)
- [ ] Da modal Google Drive, click `Connetti` apre popup Google ufficiale.
- [ ] Login account Google completato con consenso Drive.
- [ ] Alla chiusura popup, stato UI passa a `Connesso` entro pochi secondi.
- [ ] In caso popup bloccato, fallback Device Flow disponibile.

Note:
- Checklist manuale non eseguibile in ambiente headless CI; da validare su istanza HA con Ingress attivo.
