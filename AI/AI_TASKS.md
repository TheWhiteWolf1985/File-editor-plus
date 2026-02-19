# AI_TASKS — Fix menu items: Save As + Backup Cloud (Google Drive)

Data: 2026-02-19
Repo: `ha-file-editor-plus`
Contesto: **Home Assistant add-on** (Ingress, `/config` montato, runtime in container).
Obiettivo: sistemare 2 voci menu:

- **File → Save as…** deve creare un nuovo file con nome scelto dall’utente (non download).
- **Backup → Cloud** deve fare backup ZIP di **tutta** `/config` su **Google Drive** con autenticazione (Device Flow) + backup manuale + schedulazione.

## Vincoli add-on (non negoziabili)

- Non usare URL assoluti che bypassano Ingress.
- Non cambiare semantica/permessi di `/config`.
- Preferire pattern e moduli già esistenti (API client FE, safe_path/atomic_write BE).
- Niente dipendenze nuove senza motivazione scritta in `AI/DECISIONS.md`.

## Deliverables

1. Save As funzionante end-to-end (FE+BE) con UX definita.
2. Google Drive backup:
   - Device Authorization Flow
   - backup manuale
   - backup schedulato
   - retention configurabile SOLO per backup automatici
   - upload in cartella Drive fissa: `File Editor Plus Backups`

3. Aggiornare audit `AI/AUDITS/UI_NAV_AUDIT.md` per riflettere i fix.

---

## SPEC Save As (vincolante)

- UI: dialog con **scelta cartella + nome file**.
- Dopo successo: **switch automatico** al nuovo file.
- Se destinazione esiste: prompt con testo EXACT:
  - `File già esistente, vuoi sovrascrivere`?
  - Bottoni:
    - **Sì** → sovrascrivi
    - **No** → salva con suffix automatico (es. `nome (1).ext`, `nome (2).ext`…)
    - **Cancel** → annulla operazione

- Contenuto salvato: **contenuto attuale dell’editor** (anche se non ancora salvato su disco).

## SPEC Backup Cloud (Google Drive) (vincolante)

- Auth: **Device Authorization Flow**.
- Scope: `drive.file`.
- Oggetto backup: ZIP di **tutta** `/config`.
- Destinazione Drive: cartella fissa creata/riusata: `File Editor Plus Backups`.
- Modalità:
  - Manuale (click)
  - Automatica (schedulazione)

- Retention:
  - Configurabile dall’utente nella schedulazione
  - Applicata SOLO ai backup automatici (manuali non vengono prune-ati)

---

## STEP 001 — Discovery: capire come FE salva file e come BE espone file ops

- Status: DONE
- Goal: evitare di reinventare API: riusare i pattern esistenti.
- Commands:
  - FE: trovare menu + handlers Save/Save As/Export:
    - `rg -n -S "Save as|Save As|Export|Download" file_editor_plus/frontend/src`
    - `rg -n -S "onSave|saveAs|export" file_editor_plus/frontend/src`

  - FE: trovare layer API client:
    - `rg -n -S "src/api|src/services|api.ts|client.ts" file_editor_plus/frontend/src`
    - `rg -n -S "fetch\(|axios\(|axios\." file_editor_plus/frontend/src`

  - BE: trovare endpoint file ops:
    - `rg -n -S "@app.route" file_editor_plus/backend`
    - `rg -n -S "/api" file_editor_plus/backend`
    - `rg -n -S "write|save|download|upload|copy|move" file_editor_plus/backend`

  - BE: trovare safe_path/atomic_write/backup helpers:
    - `rg -n -S "def safe_path|def atomic_write|def make_backup" file_editor_plus/backend`

- Acceptance criteria:
  - Identificati:
    - funzione FE usata da Save
    - comportamento attuale di Save As (download)
    - endpoint BE usati per write/save/download
    - helper BE per scrittura sicura

- What changed:
  - Identificato FE service layer: `file_editor_plus/frontend/src/services/api.ts` (`apiSaveFile`, `apiCreateFile` con `create_only=1`).
  - Confermato comportamento attuale Save as/Export: download via `triggerPathDownload()` -> `/api/fs/download?path=...` (`file_editor_plus/frontend/src/app-root.ts`).
  - Identificati endpoint BE rilevanti: `PUT /api/file` (supporta `create_only`), `GET /api/fs/download` e helper `safe_path/make_backup/atomic_write` in `file_editor_plus/backend/app.py`.

- Files touched:
  - `AI/AI_TASKS.md`

- Commands run:
  - `rg -n -S "Save as|Save As|Export|Download" file_editor_plus/frontend/src`
  - `rg -n -S "onSave|saveAs|export" file_editor_plus/frontend/src`
  - `rg -n -S "src/api|src/services|api.ts|client.ts" file_editor_plus/frontend/src`
  - `rg -n -S "fetch\\(|axios\\(|axios\\." file_editor_plus/frontend/src`
  - `rg -n -S "\\\"/api" file_editor_plus/backend`
  - `rg -n -S "write|save|download|upload|copy|move" file_editor_plus/backend`
  - `rg -n -S "def safe_path|def atomic_write|def make_backup" file_editor_plus/backend`

---

## STEP 002 — Save As: UI dialog (folder picker + filename) + logica conflitto

- Status: DONE
- Goal: sostituire il comportamento “download” con “salva nuovo file”.
- Changes:
  1. Modificare handler menu **Save as…** per aprire dialog.
  2. Dialog:
     - folder picker (riusare tree/file browser esistente se presente)
     - input nome file (precompilato con nome corrente)
     - conferma / cancel

  3. Alla conferma:
     - costruire `destPath = selectedFolder + "/" + fileName`
     - chiamare API write con `overwrite=false`
     - se API risponde conflitto/esiste:
       - mostrare prompt con testo EXACT
       - Sì: ripetere write con `overwrite=true`
       - No: calcolare suffix e ritentare con `overwrite=false` finché non esiste
       - Cancel: abort

  4. Dopo successo:
     - aggiornare stato editor per puntare al nuovo path
     - ricaricare metadata se serve (dirty flag, titolo tab, ecc.)

- Commands:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - `cd file_editor_plus/frontend && npm run -s build`

- Acceptance criteria:
  - Save As crea un nuovo file nel path scelto.
  - File originale resta invariato.
  - L’editor fa switch al nuovo file.
  - Prompt conflitto:
    - Sì sovrascrive
    - No salva con suffix
    - Cancel annulla senza modifiche

  - Nessun download parte da Save As.

- Commit message:
  - `fix(ui): implement real save-as (folder + filename)`

- What changed:
  - `File -> Save as…` ora apre un dialog con cartella + nome file e salva il contenuto corrente su un nuovo path.
  - Gestione conflitto: prompt con 3 scelte (Sì overwrite / No suffix automatico / Cancel).
  - Dopo successo: switch automatico al nuovo file (nuova tab + open file).

- Files touched:
  - `file_editor_plus/frontend/src/app-root.ts`
  - `AI/AI_TASKS.md`

- Commands run:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - `cd file_editor_plus/frontend && npm run -s build`

---

## STEP 003 — Save As: backend support (se manca) per write con overwrite controllato

- Status: DONE
- Goal: garantire una primitive BE per “write file atomico” con:
  - safe_path
  - overwrite controllato
  - risposta chiara su conflitto

- Changes:
  - Se esiste già un endpoint write/save usabile: riusarlo.
  - Se NON esiste:
    - aggiungere endpoint (es. `POST /api/fs/write`) con body:
      - `path` (dest)
      - `content`
      - `overwrite` (bool)

    - comportamento:
      - se file esiste e `overwrite=false` → 409
      - scrittura via `atomic_write`
      - (opzionale) backup solo quando si sovrascrive

- Commands:
  - `cd file_editor_plus/backend && (python -m pytest -q || true)`

- Acceptance criteria:
  - FE può distinguere conflitto esistente (409) vs altri errori.
  - Scrittura resta atomica e vincolata a `/config`.

- Commit message:
  - `fix(backend): support save-as via atomic write with overwrite control`

- What changed:
  - Backend: `PUT /api/file?create_only=1` ora ritorna `409` quando il file esiste (conflitto distinguibile dal FE).

- Files touched:
  - `file_editor_plus/backend/app.py`
  - `AI/AI_TASKS.md`

- Commands run:
  - `cd file_editor_plus/backend && (python -m pytest -q || true)` (nota: `python` non presente nell'ambiente host; comando ha fallback `|| true`)

---

## STEP 004 — Cloud Backup: decisione su Application Credentials (HA) e fallback add-on options

- Status: DONE
- Goal: rispettare la preferenza “Application Credentials”, ma senza inventarsi magia.
- Procedure:
  1. Verificare se nel repo esiste già una **integrazione HA** (custom_component) collegata all’add-on.
     - se sì: valutare uso di `application_credentials`.

  2. Se NO (caso probabile): implementare fallback pragmatico via **add-on options**:
     - `gdrive_client_id` (obbligatorio)
     - (eventuale) `gdrive_client_secret` (di norma non serve per device flow)
     - spiegare nel runbook che Google richiede OAuth Client ID.

  3. Registrare la decisione in `AI/DECISIONS.md`.

- Commands:
  - `ls -la`
  - `find . -maxdepth 3 -type d -name "custom_components" -o -name "homeassistant"`
  - `rg -n -S "application_credentials" .`
  - `rg -n -S "options" file_editor_plus -S`
  - `rg -n -S "config.yaml|schema.yaml|options.yaml" .`

- Acceptance criteria:
  - Decisione scritta e implementabile.
  - Esiste un posto chiaro dove l’utente inserisce `gdrive_client_id`.

- Commit message:
  - `chore(cloud): decide oauth credential source (ha vs addon options)`

- What changed:
  - Decisione: nessuna integrazione HA presente -> credenziali via add-on options (vedi `ADR 006`).
  - Implementato placeholder opzione `gdrive_client_id` in `file_editor_plus/config.yaml` (options+schema).

- Files touched:
  - `file_editor_plus/config.yaml`
  - `AI/DECISIONS.md`
  - `AI/AI_TASKS.md`

- Commands run:
  - `ls -la`
  - `find . -maxdepth 3 -type d -name "custom_components" -o -name "homeassistant"`
  - `rg -n -S "application_credentials" .`
  - `rg -n -S "options" file_editor_plus -S`
  - `rg -n -S "config.yaml|schema.yaml|options.yaml" .`

---

## STEP 005 — Cloud Backup: backend Google Drive (Device Flow + upload zip)

- Status: DONE
- Goal: BE espone API per auth/status/backup/schedule e carica ZIP su Drive.
- Storage (proposta standard):
  - tokens + config in `/data/gdrive/` (es. `tokens.json`, `config.json`)

- Endpoints (minimo):
  - `GET  /api/cloud/gdrive/status`
  - `POST /api/cloud/gdrive/device/start`
  - `POST /api/cloud/gdrive/device/cancel` (opzionale)
  - `POST /api/cloud/gdrive/disconnect`
  - `POST /api/cloud/gdrive/backup` (manual)
  - `GET  /api/cloud/gdrive/schedule`
  - `PUT  /api/cloud/gdrive/schedule`

- Implementazione (senza nuove dipendenze se possibile):
  - HTTP via libreria già presente (preferire `requests` se già in requirements; altrimenti `urllib.request`).
  - Device Flow:
    - POST device code endpoint Google
    - polling token endpoint Google (rispettare interval)
    - salvare refresh token

  - Drive:
    - creare/riusare folder `File Editor Plus Backups` (salvare folder_id)
    - creare ZIP di `/config` con `zipfile`
    - upload multipart a Drive API

  - Retention SOLO automatici:
    - taggare i backup automatici nel filename (es. `config-auto-YYYY...zip`)
    - list + delete oltre retention

- Commands:
  - `cd file_editor_plus/backend && (test -f requirements.txt && sed -n '1,200p' requirements.txt || true)`
  - `cd file_editor_plus/backend && (python -m pytest -q || true)`

- Acceptance criteria:
  - Status endpoint indica `connected: true/false`.
  - Device flow start restituisce `user_code` + `verification_url`.
  - Dopo auth, `connected=true` e backup manuale carica ZIP su Drive nella cartella fissa.
  - Nessun token finisce in log.

- Commit message:
  - `feat(cloud): google drive device auth and zip backup upload`

- What changed:
  - Backend: aggiunti endpoint Google Drive (Device Flow + backup manuale ZIP) sotto `/api/cloud/gdrive/*`.
  - Token/metadata persistiti sotto `/data/gdrive/` (tokens + folder id).

- Files touched:
  - `file_editor_plus/backend/app.py`
  - `AI/AI_TASKS.md`

- Commands run:
  - `cd file_editor_plus/backend && (test -f requirements.txt && sed -n '1,200p' requirements.txt || true)`
  - `cd file_editor_plus/backend && (python -m pytest -q || true)` (nota: `python` non presente nell'ambiente host; comando ha fallback `|| true`)
  - `cd file_editor_plus/frontend && npm ci && npm run -s build`

---

## STEP 006 — Cloud Backup: schedulazione + retention (solo auto)

- Status: TODO
- Goal: backup automatico configurabile.
- Scheduling UX richiesto:
  - Toggle enable
  - Orario (HH:MM)
  - Retention count (solo per auto)

- Implementazione:
  - Salvare schedule config lato BE.
  - Avviare un worker leggero (thread/loop) che calcola `next_run` e lancia backup.
  - Timezone: usare timezone di sistema container.
  - Dopo ogni backup automatico: applicare retention (delete dei più vecchi oltre N).

- Acceptance criteria:
  - `PUT schedule` persiste config.
  - `GET schedule` ritorna config + `next_run` calcolato.
  - Backup automatico crea file `config-auto-*.zip` e applica retention.

- Commit message:
  - `feat(cloud): scheduled drive backups with retention for auto only`

---

## STEP 007 — Cloud Backup: UI (connect, manual backup, schedule settings)

- Status: TODO
- Goal: rendere operativa la voce menu `Backup → Cloud`.
- UI richieste:
  - Schermata/modale "Google Drive Backup":
    - Stato connessione (connesso / non connesso)
    - Bottone "Connetti" → avvia device flow
    - Mostra `verification_url` + `user_code` + copy
    - Stato progress (polling) fino a connesso
    - Bottone "Backup ora" (manual)
    - Sezione schedulazione (enable, orario, retention)
    - Bottone "Disconnetti"

- Note:
  - Rispettare Ingress (niente URL assoluti).
  - Gestire errori con toast chiari.

- Commands:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - `cd file_editor_plus/frontend && npm run -s build`

- Acceptance criteria:
  - Backup → Cloud non è più disabilitato.
  - Il flusso device funziona end-to-end.
  - Backup manuale parte e mostra esito.
  - Schedule si salva e mostra next run.

- Commit message:
  - `feat(ui): google drive backup screen (device auth + schedule)`

---

## STEP 008 — Smoke add-on (Ingress + Save As + Cloud)

- Status: TODO
- Goal: verificare che tutto funzioni nel contesto HA.
- Checklist minima:
  - UI via Ingress carica senza 404 assets.
  - Save As:
    - crea file in cartella scelta
    - conflitto gestito con prompt
    - switch al nuovo file

  - Cloud:
    - connect device flow
    - backup manuale carica ZIP
    - schedule salvabile

- Acceptance criteria:
  - Nessun errore console bloccante.
  - Nessun 500 su endpoint nuovi.

- Commit message:
  - N/A (solo verifica; eventuali fix in commit dedicato)

---

## STEP 009 — Aggiornare audit e knowledge

- Status: TODO
- Goal: chiudere il cerchio.
- Changes:
  - Aggiornare `AI/AUDITS/UI_NAV_AUDIT.md`:
    - Save As non più download
    - Backup Cloud non più NOT CONNECTED

  - Aggiornare `AI/KNOWLEDGE.yaml` con riferimento a cloud backup + dove sono le impostazioni.
  - Se c’è una decisione su credenziali, assicurarsi che sia in `AI/DECISIONS.md`.

- Acceptance criteria:
  - Audit aggiornato.
  - Knowledge aggiornata.

- Commit message:
  - `docs(audit): update nav audit for save-as and cloud backup`
