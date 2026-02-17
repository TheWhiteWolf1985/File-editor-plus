# DECISIONS (mini-ADR) — Migrazione da AI_old

Nota: le fonti legacy non riportano sempre date esplicite per le decisioni; quando non deducibile con certezza, usare `Date: N/A (...)`.

Source of truth:
- Lo stato corrente del progetto (cosa e' fatto vs aperto) e' tracciato in `AI/KNOWLEDGE.yaml`.
- I file in `AI_old/` restano archivio (possono contenere stato storico o non allineato).

## ADR 001 — Runtime senza risorse esterne (no CDN / no fetch internet)
- Date: N/A (non tracciata nelle fonti legacy)
- Context:
  - Add-on Home Assistant usato via Ingress in ambienti dove l'accesso internet non e' garantito o desiderato.
  - Vincolo legacy esplicito.
- Decision:
  - Nessuna dipendenza runtime da CDN o fetch verso internet; tutte le risorse devono essere bundle-ate o servite dal backend.
- Alternatives:
  - Usare CDN per font/icon/markdown renderer (scartato per vincolo).
- Consequences:
  - Build/bundle piu' grande ma comportamento deterministico offline.
  - Docs e asset devono vivere nel container (copy in Dockerfile).
- Evidence:
  - `AI_old/AI_PROJECT.md` "No CDN in runtime / No runtime fetch to external internet resources."

## ADR 002 — Documentazione servita dal backend (routes /docs) e apertura in nuova tab
- Date: N/A (non tracciata nelle fonti legacy)
- Context:
  - Ingress path prefix e routing SPA possono essere fragili; serve un viewer stabile e compatibile Ingress.
- Decision:
  - Usare route backend per docs (`/docs` e markdown sotto `/docs/...`) e aprire da topbar `Aiuto -> Documentazione` in `_blank` con `noopener,noreferrer`.
- Alternatives:
  - SPA routing client-side (scartato per fragilita' Ingress).
- Consequences:
  - Backend deve servire i file Markdown e il viewer.
  - Link docs devono preservare parametri lingua/pagina.
- Evidence:
  - `AI_old/Knowledge.yaml` epic `documentation_base` decision "use backend-served docs routes (/docs ...)" e help link `_blank`.
  - `AI_old/AI_PROJECT.md` vincolo aiuto->documentazione `_blank` + noopener/noreferrer.

## ADR 003 — Ingress-friendly paths: Vite base relativa e API base da location
- Date: N/A (non tracciata nelle fonti legacy)
- Context:
  - Add-on gira sotto path prefix Ingress (`/api/hassio_ingress/...`), quindi path assoluti si rompono.
- Decision:
  - Configurare build e runtime per path relativi (Vite `base: "./"`) e calcolo API base da URL corrente.
- Alternatives:
  - Hardcodare base path.
- Consequences:
  - Minor complessita' nel bootstrap ma evita clash e 404 sotto Ingress.
- Evidence:
  - `AI_old/application_audit/FILE_EDITOR_PLUS_AUDIT.md` (Ingress + Vite base "./" + apiBase da `window.location.href`).

## ADR 004 — Security headers minimi, CSP deferita
- Date: 2026-02-17
- Context:
  - L'add-on gira via Home Assistant Ingress; alcune policy (es. CSP restrittiva, X-Frame-Options) possono rompere embedding/assets se non validate in ambiente reale.
- Decision:
  - Applicare solo header minimi e "safe" (`X-Content-Type-Options`, `Referrer-Policy`) via middleware.
  - Non impostare CSP in questo step (da validare con test manuale dedicato in Ingress).
- Alternatives:
  - Impostare CSP permissiva subito (rischio di regressioni non visibili senza test Ingress).
- Consequences:
  - Miglioramento hardening senza impatti UX.
  - CSP resta un follow-up da verificare in HA Ingress.

## ADR 005 — Test backend via Docker (pip non disponibile nel workspace)
- Date: 2026-02-17
- Context:
  - Nel workspace corrente `python3` non include `pip`, quindi non e' possibile installare `requirements.txt` ed eseguire unit test direttamente.
- Decision:
  - Eseguire i test backend in un container Python (`python:3.12-alpine`) montando `file_editor_plus/backend`.
- Alternatives:
  - Installare pip a livello OS (non desiderato in questo contesto).
- Consequences:
  - Test ripetibili senza modificare l'ambiente host.
