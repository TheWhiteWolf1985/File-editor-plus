# AI_TASKS — Google Drive OAuth (Authorization Code) Flow (1.0.0)

> Feature: sostituire il **Device Flow** (codice manuale) con il flow **Google OAuth2 Authorization Code** (pagina “Scegli account”),
> mantenendo il Device Flow come fallback opzionale.

---

## STEP 001 — Allineamento contesto e mappa del codice

- Status: DONE
- Goal: Trovare esattamente dove oggi vive il Device Flow e come viene salvato lo stato “connesso”.
- Scope:
  - Backend: `<<REQUIRED: path server api routes/services for gdrive>>`
  - Frontend: `<<REQUIRED: path UI page/button connect>>`
  - Config: `<<REQUIRED: path config schema / env / secrets>>`

- Changes:
  - Individuare endpoint attuali: `/api/cloud/gdrive/device/start`, callback/status attuali, storage token.
  - Identificare dove vengono letti `gdrive_client_id` (e secret, se esiste).
  - Annotare dove vive l’handler “Connetti” nel frontend e l’aggiornamento stato via `/status`.

- Commands:
  - `rg "gdrive" -n`
  - `rg "/api/cloud/gdrive" -n`
  - `rg "device/start" -n`
  - `rg "status" -n`

- Acceptance criteria:
  - Lista file/entrypoint coinvolti + diagramma mentale (anche in note) del flusso attuale.

- Commit message:
  - `chore(gdrive): map current device flow implementation`

- Blockers/Notes:
  - Nessun refactor: solo mappatura.

- What changed:
  - Mappato il flow attuale Device Flow frontend/backend con file e funzioni coinvolte.
  - Verificata la persistenza token e stato transiente (`/data/gdrive/*` + `_gdrive_device_state`).
  - Tracciati endpoint API effettivamente wired nella UI.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CONTEXT/gdrive_oauth_flow_map.md`

- Commands run:
  - `rg "gdrive" -n file_editor_plus`
  - `rg "/api/cloud/gdrive" -n file_editor_plus`
  - `rg "device/start" -n file_editor_plus`
  - `rg "status" -n file_editor_plus/backend/app.py`

---

## STEP 002 — Definire configurazione OAuth e fallback client_id

- Status: DONE
- Goal: Implementare la logica “user client_id se presente, altrimenti fallback app client_id”.
- Scope:
  - Config: `<<REQUIRED: config model/schema file>>`
  - Runtime env/secrets: `<<REQUIRED: where secrets/env are read>>`

- Changes:
  - Aggiungere/validare queste chiavi:
    - `gdrive_client_id` (opzionale lato user)
    - `gdrive_client_secret` (solo backend; opzionale se usate PKCE-only, ma in genere serve)
    - `gdrive_redirect_uri` (calcolata o configurabile; deve puntare al callback)
    - `gdrive_oauth_client_id_default` + `gdrive_oauth_client_secret_default` (fallback via env/secrets)

  - Implementare resolver:
    - `effectiveClientId = user.gdrive_client_id ?? env.DEFAULT_GDRIVE_CLIENT_ID`
    - `effectiveClientSecret = user.gdrive_client_secret ?? env.DEFAULT_GDRIVE_CLIENT_SECRET`

- Commands:
  - `rg "gdrive_client_id" -n`
  - `rg "secrets" -n`

- Acceptance criteria:
  - Backend può sempre ottenere un `client_id` valido (user o fallback), senza esporre segreti al frontend.

- Commit message:
  - `feat(gdrive): add oauth config resolver with fallback client id`

- Blockers/Notes:
  - Non committare segreti reali. Solo chiavi/placeholder e lettura da env/secrets.

- What changed:
  - Esteso backend con resolver OAuth (`_resolve_gdrive_oauth_config`) che usa prima opzioni utente e poi fallback env.
  - Aggiunte variabili env fallback per `client_id` e `client_secret` (`GDRIVE_OAUTH_*`/`DEFAULT_GDRIVE_OAUTH_*`).
  - Aggiornato `status`/`device_start`/token refresh path per usare il `client_id` effettivo risolto.
  - Esteso schema add-on con `gdrive_client_secret` e `gdrive_redirect_uri` (opzionali).

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/backend/app.py`
  - `file_editor_plus/config.yaml`

- Commands run:
  - `rg "gdrive_client_id" -n file_editor_plus`
  - `rg "secrets|GDRIVE_OAUTH_CLIENT" -n file_editor_plus/backend/app.py file_editor_plus/config.yaml`
  - `python3 -m compileall file_editor_plus/backend/app.py`

---

## STEP 003 — Implementare endpoint OAuth start (generate auth_url + state + PKCE)

- Status: DONE
- Goal: Creare `GET /api/cloud/gdrive/oauth/start` che ritorna l’URL di autorizzazione Google e prepara state/PKCE server-side.
- Scope:
  - Backend route/controller: `<<REQUIRED: path>>`
  - Storage temporaneo state (session/in-memory/db): `<<REQUIRED: path>>`

- Changes:
  - Implementare:
    - Generazione `state` random (>= 128-bit) e salvataggio (con TTL).
    - (Consigliato) PKCE:
      - `code_verifier` random
      - `code_challenge = BASE64URL(SHA256(code_verifier))`
      - Salva `code_verifier` associato a `state` (TTL).

    - Costruzione auth URL con:
      - `client_id`, `redirect_uri`, `response_type=code`
      - `scope` (minimo: `https://www.googleapis.com/auth/drive.file` o quello richiesto dal PRD)
      - `access_type=offline` + `prompt=consent` (se serve refresh token)
      - `state`
      - `code_challenge` + `code_challenge_method=S256` (se PKCE)

  - Response JSON:
    - `{ "auth_url": "..." }`

- Commands:
  - `<<OPTIONAL: run unit tests or server start>>`

- Acceptance criteria:
  - Chiamando `/oauth/start` ottieni un `auth_url` valido e un `state` memorizzato (non in log).

- Commit message:
  - `feat(api): add gdrive oauth start endpoint`

- Blockers/Notes:
  - Non loggare auth_url completa se contiene param sensibili (state ok, ma evita noise).

- What changed:
  - Aggiunto endpoint `GET /api/cloud/gdrive/oauth/start` con validazione `effective client_id`.
  - Implementata generazione `state` robusto + PKCE (`code_verifier`/`code_challenge`).
  - Aggiunto store in-memory con TTL per `state` e cleanup scadenze.
  - `redirect_uri` risolto da opzioni add-on o fallback derivato da `request.base_url`.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`

---

## STEP 004 — Implementare callback OAuth (code -> tokens) + state validation

- Status: DONE
- Goal: Creare `GET /api/cloud/gdrive/oauth/callback` che valida `state`, scambia `code` per token e salva token.
- Scope:
  - Backend route/controller: `<<REQUIRED: path>>`
  - Token storage: `<<REQUIRED: where tokens are persisted>>`

- Changes:
  - Validazione:
    - `state` presente e match con state salvato (anti-CSRF).
    - `code` presente.
    - TTL non scaduto.

  - Token exchange:
    - POST a `https://oauth2.googleapis.com/token`
    - Parametri: `client_id`, `client_secret` (server-only), `code`, `grant_type=authorization_code`, `redirect_uri`
    - Se PKCE: include `code_verifier`

  - Persistenza:
    - Salva `access_token`, `refresh_token` (se presente), `expiry`, `scope`, `token_type`
    - Associazione a user/instance come da modello esistente

  - Response:
    - Se via popup: HTML minimale che mostra “Connesso, puoi chiudere questa finestra” e tenta `window.close()`
    - Oppure redirect a pagina interna di successo (se esiste)

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - Dopo login Google, il callback salva token e lo stato `/status` diventa “connesso”.

- Commit message:
  - `feat(api): handle gdrive oauth callback and token storage`

- Blockers/Notes:
  - Mai loggare token/refresh_token/secret.
  - Pulire state/PKCE storage dopo successo o errore.

- What changed:
  - Implementato endpoint `GET /api/cloud/gdrive/oauth/callback` con validazione `state` (single-use + TTL).
  - Aggiunto token exchange verso Google con `authorization_code` + `code_verifier` (PKCE).
  - Persistenza token aggiornata con merge sicuro su storage esistente (`/data/gdrive/tokens.json`).
  - Callback ora risponde con HTML di successo/errore pensato per popup OAuth (`window.close()` best-effort).

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`

---

## STEP 005 — Aggiornare endpoint /status (o logica stato) per supportare OAuth

- Status: DONE
- Goal: Ri-usare il polling esistente e farlo riflettere lo stato reale dei token OAuth.
- Scope:
  - Backend status endpoint: `<<REQUIRED: path>>`

- Changes:
  - Considerare “connesso” se:
    - token esiste e non scaduto, oppure
    - refresh token presente (con possibilità di refresh) e access token refreshabile

  - (Se già esiste refresh logic) confermare che funzioni anche per OAuth tokens.

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - UI passa a “Connesso” senza nuovi endpoint frontend oltre a `/oauth/start`.

- Commit message:
  - `fix(status): reflect oauth token connection state`

- Blockers/Notes:
  - Nessuna regressione sul flow precedente.

- What changed:
  - Aggiornata la logica `connected` lato backend per coprire sia refresh token sia access token valido non scaduto.
  - Mantenuto invariato l’endpoint `/api/cloud/gdrive/status` e il contratto usato dal polling frontend.
  - Eliminato il falso negativo sullo stato connesso nei casi OAuth senza refresh token immediato.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`

---

## STEP 006 — Frontend: pulsante Connetti apre Google OAuth (popup)

- Status: DONE
- Goal: Il click su “Connetti” deve aprire la pagina ufficiale Google “Scegli account”.
- Scope:
  - Frontend connect action: `<<REQUIRED: path>>`

- Changes:
  - Sostituire chiamata a `/device/start` con:
    1. fetch `GET /api/cloud/gdrive/oauth/start`
    2. `window.open(auth_url, "gdrive_oauth", "width=520,height=720,...")`

  - Gestire popup bloccato:
    - se `window.open` ritorna `null`, mostra messaggio “abilita popup” e (opzionale) fallback Device Flow

  - Lasciare invariato polling `/status`.

- Commands:
  - `<<OPTIONAL: frontend dev build>>`

- Acceptance criteria:
  - Click -> popup Google -> selezione account -> callback -> UI “Connesso”.

- Commit message:
  - `feat(ui): switch gdrive connect to oauth authorization code flow`

- Blockers/Notes:
  - Il frontend non deve mai vedere secret o token.

- What changed:
  - Aggiunto client API `apiGdriveOauthStart()` e nuova action UI `startGdriveOAuthFlow()`.
  - Il pulsante `Connetti` ora usa OAuth start (`/api/cloud/gdrive/oauth/start`) e apre popup Google ufficiale.
  - Gestito caso popup bloccato con messaggio errore esplicito.
  - Estratto polling status in helper riusabile, mantenendo invariato `/api/cloud/gdrive/status`.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/frontend/src/app-root.ts`
  - `file_editor_plus/frontend/src/services/api.ts`

- Commands run:
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 007 — (Opzionale) Tenere Device Flow come fallback secondario

- Status: DONE
- Goal: Mantenere compatibilità per ambienti dove popup/redirect sono problematici.
- Scope:
  - Backend: device endpoints esistenti
  - UI: fallback path

- Changes:
  - Mantieni `/device/start` e relativo flusso.
  - UI usa Device Flow solo se:
    - popup bloccato, oppure
    - server non ha `effectiveClientId` disponibile (fallback non configurato)

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - OAuth è default; Device Flow ancora funzionante quando necessario.

- Commit message:
  - `feat(gdrive): keep device flow as fallback`

- Blockers/Notes:
  - Se non richiesto, si può anche rimuovere: decidere in `AI/DECISIONS.md`.

- What changed:
  - Mantenuto Device Flow come fallback secondario dietro al nuovo OAuth popup.
  - Fallback automatico attivato su popup bloccato o su errore OAuth legato a `client_id`.
  - UI `Connetti` resa sempre cliccabile (disabilitata solo durante loading) per consentire fallback runtime.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/frontend/src/app-root.ts`

- Commands run:
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 008 — Hardening sicurezza (state, headers, logging, secrets)

- Status: TODO
- Goal: Chiudere le falle classiche OAuth prima che qualcuno ci faccia a pezzi su GitHub 😄
- Scope:
  - Backend middleware/utilities: `<<REQUIRED>>`

- Changes:
  - `state`:
    - random strong + TTL + single-use

  - Cookie/session (se usata):
    - `HttpOnly`, `SameSite=Lax` (o Strict se compatibile), `Secure` se https

  - Logging:
    - redaction token/secret
    - no querystring dumping del callback

  - CORS/redirect:
    - redirect_uri deve essere esattamente quello atteso (no open redirect)

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - Nessun token/secret appare nei log; callback respinge state invalidi.

- Commit message:
  - `chore(security): harden gdrive oauth flow`

- Blockers/Notes:
  - Se usi PKCE, il rischio cala ancora.

---

## STEP 009 — Test + Smoke (minimi ma reali)

- Status: TODO
- Goal: Aggiungere verifiche ripetibili.
- Scope:
  - Test backend: `<<REQUIRED: test folder>>`
  - Smoke: `AI/SMOKE.md` (aggiornare)

- Changes:
  - Unit/integration:
    - `/oauth/start` ritorna auth_url e salva state
    - `/oauth/callback` rifiuta state invalido
    - `/status` riflette token presence

  - Smoke manuale:
    - “Connetti” apre Google
    - login ok
    - UI diventa “Connesso”

- Commands:
  - `<<REQUIRED: commands to run tests>>`

- Acceptance criteria:
  - Test passano + smoke checklist eseguita e annotata.

- Commit message:
  - `test(gdrive): add oauth start/callback coverage`

- Blockers/Notes:
  - Evitare test che richiedono Google reale (mock token endpoint).

---

## STEP 010 — Documentazione e audit finale

- Status: TODO
- Goal: Chiudere feature con documenti coerenti e pronto per release 1.0.0.
- Scope:
  - `README` / docs addon: `<<REQUIRED>>`
  - `AI/KNOWLEDGE.yaml`, `AI/DECISIONS.md`, `AI/RELEASE.md`, `AI/AI_TASKS.md`

- Changes:
  - Documentare:
    - come configurare client_id/secret user
    - come configurare fallback via env/secrets
    - troubleshooting (popup bloccato, redirect mismatch)

  - Aggiornare `AI/KNOWLEDGE.yaml` con:
    - endpoints nuovi
    - config keys
    - decisione su PKCE e fallback device flow

  - Aggiornare status di tutti gli step a DONE.

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - Docs aggiornate, audit chiuso, nessun secret nel repo.

- Commit message:
  - `docs(gdrive): document oauth connect flow and configuration`

- Blockers/Notes:
  - Release notes in `AI/RELEASE.md` se previste.

---
