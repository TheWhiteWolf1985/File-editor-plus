# AI_INVENTORY — Componenti del repo

Perimetro compilabile a mano.
Non inserire elenchi auto-rilevati della repository.

## Cosa esiste (componenti)
- Home Assistant add-on: `file_editor_plus/config.yaml` (Ingress, permessi HA/Supervisor, map `/config:rw`).
- Backend API: `file_editor_plus/backend/app.py` (FastAPI) + s6 run: `file_editor_plus/rootfs/etc/services.d/web/run`.
- Frontend: Lit + TypeScript + Vite in `file_editor_plus/frontend/` (bundle `dist/`).
- Documentazione utente: Markdown in `file_editor_plus/docs/<lang>/<page>.md` servita da backend:
  - Viewer: `GET /docs`
  - Markdown: `GET /docs/{lang}/{page}.md` (legacy: `/docs/{page}.md` -> it)
- i18n UI: `file_editor_plus/frontend/src/i18n/index.ts` (persistenza `localStorage` key `locale`).

## Cosa NON assumere
- Non assumere auth applicativa oltre a Ingress (nel repo non e' definita in modo certo).
- Non assumere policy CSP/security headers: dipende da runtime Ingress e non e' deducibile solo dal repo.
- Non assumere comandi lint/typecheck/test ufficiali oltre a quelli esplicitati nei file del repo.

## Integrazioni consentite/vietate
- Consentite (presenti nel codice):
  - Supervisor/Core API (via `SUPERVISOR_TOKEN`) per states/websocket/actions allowlisted.
- Vietate:
  - risorse runtime esterne (CDN, fetch internet) (vincolo di progetto).

## Confini (in/out scope)
- <<OPTIONAL>>
