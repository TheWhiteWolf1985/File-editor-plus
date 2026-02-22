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

## Matrix redirect stability (Ingress vs non-Ingress)

- Scenario 1: Ingress ON + `public_base_url` configurata
  - Verifica automatica: PASS (unit test redirect mode `public_base_url`)
  - Verifica manuale callback reale: PENDING
- Scenario 2: Ingress ON + `public_base_url` assente + `addon_callback_port` (default 8099)
  - Verifica automatica: PASS (unit test redirect mode `ingress_port`)
  - Verifica manuale callback reale: PENDING
- Scenario 3: Ingress OFF / accesso diretto host
  - Verifica automatica: PASS (fallback `direct` via resolver + build backend)
  - Verifica manuale callback reale: PENDING
- Scenario 4: Redirect non registrata su Google
  - Verifica attesa: errore 400 `redirect_uri_mismatch` con URI suggerita dalla UI.
  - Verifica manuale: PENDING
