# DECISIONS (mini-ADR)

Source of truth:
- `AI/KNOWLEDGE.yaml`

## ADR 001 — Runtime senza risorse esterne (no CDN / no fetch internet)
- Date: N/A
- Context:
  - Add-on Home Assistant usato via Ingress in ambienti dove l'accesso internet non e' garantito o desiderato.
- Decision:
  - Nessuna dipendenza runtime da CDN o fetch verso internet; tutte le risorse devono essere bundle-ate o servite dal backend.
- Alternatives:
  - Usare CDN per font/icon/markdown renderer.
- Consequences:
  - Build/bundle piu' grande ma comportamento deterministico offline.
  - Docs e asset devono vivere nel container (copy in Dockerfile).

## ADR 002 — Documentazione servita dal backend (routes /docs) e apertura in nuova tab
- Date: N/A
- Context:
  - Ingress path prefix e routing SPA possono essere fragili; serve un viewer stabile e compatibile Ingress.
- Decision:
  - Usare route backend per docs (`/docs` e markdown sotto `/docs/...`) e aprire da topbar `Aiuto -> Documentazione` in `_blank` con `noopener,noreferrer`.
- Alternatives:
  - SPA routing client-side.
- Consequences:
  - Backend deve servire i file Markdown e il viewer.
  - Link docs devono preservare parametri lingua/pagina.

## ADR 003 — Ingress-friendly paths: Vite base relativa e API base da location
- Date: N/A
- Context:
  - Add-on gira sotto path prefix Ingress, quindi path assoluti si rompono.
- Decision:
  - Configurare build e runtime per path relativi (Vite `base: "./"`) e calcolo API base da URL corrente.
- Alternatives:
  - Hardcodare base path.
- Consequences:
  - Minor complessita' nel bootstrap ma evita clash e 404 sotto Ingress.

## ADR 004 — Security headers minimi, CSP deferita
- Date: 2026-02-17
- Context:
  - L'add-on gira via Home Assistant Ingress; alcune policy (es. CSP restrittiva, X-Frame-Options) possono rompere embedding/assets se non validate in ambiente reale.
- Decision:
  - Applicare solo header minimi e "safe" (`X-Content-Type-Options`, `Referrer-Policy`) via middleware.
  - Non impostare CSP in questo step (da validare con test manuale dedicato in Ingress).
- Alternatives:
  - Impostare CSP permissiva subito.
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
  - Installare pip a livello OS.
- Consequences:
  - Test ripetibili senza modificare l'ambiente host.

## ADR 006 — Credenziali Google Drive via add-on options (no Application Credentials)
- Date: 2026-02-19
- Context:
  - Nel repository non esiste una integrazione Home Assistant (`custom_components/`) collegata all'add-on.
  - La feature Cloud Backup richiede un `client_id` OAuth per Device Authorization Flow.
- Decision:
  - Usare **add-on options** per configurare `gdrive_client_id` (in `file_editor_plus/config.yaml`), senza dipendere da `application_credentials`.
- Alternatives:
  - Implementare un custom component HA e usare `application_credentials`.
- Consequences:
  - Setup piu' manuale per l'utente (inserimento client id nelle opzioni add-on).
  - Nessuna dipendenza da componenti HA esterni; implementazione confinata all'add-on.

## ADR 007 — Build frontend arm64: fallback musl -> glibc per Rollup native deps
- Date: 2026-02-21
- Context:
  - La build del frontend su `linux/arm64` con base `node:*-alpine` (musl) fallisce con Rollup:
    - `Cannot find module @rollup/rollup-linux-arm64-musl`
  - Patch 1/2 (forzare optional deps via `npm ci --include=optional` e `.npmrc include=optional`) non risolvono quando e' presente `package-lock.json`.
- Decision:
  - Usare `node:20-bookworm-slim` (glibc) nello stage FE del Dockerfile e installare deps con:
    - rimozione `package-lock.json`
    - `npm install --include=optional`
  - Evidenze e comandi in `AI/CONTEXT/issue_17_rollup_musl.md`.
- Alternatives:
  - Restare su Alpine/musl e risolvere il bug npm/lockfile su optional deps (non deterministico in questo contesto).
  - Introdurre pnpm/yarn o cambiare toolchain FE (fuori scope).
- Consequences:
  - Build arm64 stabile nello stage FE (vite build OK).
  - Trade-off: stage FE leggermente piu' pesante e install meno deterministico rispetto a `npm ci` (workaround limitato allo stage di build).
