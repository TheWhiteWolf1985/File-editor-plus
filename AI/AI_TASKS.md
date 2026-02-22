# AI_TASKS — Rimozione totale pannello “Backup su cloud” (quarantena in future_features) — develop

> Target: **rimuovere fisicamente dalla UI** ogni riferimento a “Backup su cloud” e **rimuovere/disconnettere** backend/API/config/test relativi a Google Drive/Cloud Backup.
> Regola: **non si perde nulla** → tutto ciò che viene rimosso dal percorso “attivo” va **spostato/copiato** sotto `future_features/cloud_backup_gdrive/`.
> Vincolo operativo: **ogni step deve terminare con `git commit` + `git push origin develop`**.

---

## Guardrail anti-bulldozer (da incollare a Codex prima di iniziare)

- **NON fare refactor.** NON rinominare file/cartelle fuori scope. NON cambiare formattazione globale.
- **Permesso:** modificare SOLO i file trovati nello STEP 1 (INVENTORY) + creare/spostare file in `future_features/cloud_backup_gdrive/**`.
- **Proibito:** toccare routing/architettura generale, dipendenze non correlate, build pipeline non correlata.
- **Massimo diff per commit:** ~150 righe. Se serve di più → spezzare in più step.
- **Dopo ogni step:** build/avvio minimo (frontend build + backend start) per verificare che non si rompa nulla.

---

## STEP 1 — Inventario completo e cartella quarantine

**Goal:** avere una mappa oggettiva di tutto ciò che riguarda “Backup su cloud / gdrive / oauth” e creare la struttura `future_features`.

**Tasks (eseguire in questo ordine):**

1. Creare cartella:
   - `future_features/cloud_backup_gdrive/`

2. Creare file:
   - `future_features/cloud_backup_gdrive/README.md` (2 sezioni: “Perché disabilitata”, “Cosa serve per riattivarla”)
   - `future_features/cloud_backup_gdrive/INVENTORY.md`

3. Popolare `INVENTORY.md` con i risultati dei comandi (incollare output):
   - `rg -n "Backup su cloud|cloud backup|gdrive|google drive|oauth/start|oauth/callback|device/start|hassio_ingress|GDRIVE_OAUTH|GOOGLE_OAUTH"`
   - `rg -n "/api/cloud/gdrive"`
   - `rg -n "gdrive_"`

4. NON cambiare ancora alcun comportamento.

**Commit + push:**

- Commit msg: `chore(future_features): add cloud_backup_gdrive inventory and quarantine scaffold`
- Comandi:
  - `git add future_features/cloud_backup_gdrive/README.md future_features/cloud_backup_gdrive/INVENTORY.md`
  - `git commit -m "chore(future_features): add cloud_backup_gdrive inventory and quarantine scaffold"`
  - `git push origin develop`

**Status:** DONE
**What changed:**
- Creata cartella `future_features/cloud_backup_gdrive/` con README di quarantena.
- Creato `INVENTORY.md` con output dei 3 comandi `rg` richiesti.
- Nessun comportamento applicativo modificato in questo step.
- Verifica eseguita: build frontend OK.
- Verifica backend start locale non eseguibile: `python3 -m uvicorn` non disponibile nell'host corrente.
**Files touched:**
- `future_features/cloud_backup_gdrive/README.md`
- `future_features/cloud_backup_gdrive/INVENTORY.md`
- `AI/AI_TASKS.md`
**Commands run:**
- `rg -n "Backup su cloud|cloud backup|gdrive|google drive|oauth/start|oauth/callback|device/start|hassio_ingress|GDRIVE_OAUTH|GOOGLE_OAUTH"`
- `rg -n "/api/cloud/gdrive"`
- `rg -n "gdrive_"`
- `cd file_editor_plus/frontend && npm run build`
- `cd file_editor_plus/backend && timeout 8s python3 -m uvicorn app:app --host 127.0.0.1 --port 18099` (failed: module `uvicorn` missing)

---

## STEP 2 — Rimozione UI: sparisce il pannello/modale “Backup su cloud”

**Goal:** la UI non deve più mostrare alcun pannello, tab, sezione o modal legato a “Backup su cloud”.

**Tasks:**

1. Identificare nel frontend (da INVENTORY) i file che:
   - renderizzano il pannello/modale “Backup su cloud”
   - gestiscono click “Connetti” e/o “Backup”
   - mostrano toast relativi a `gdrive_client_id`, oauth, drive

2. Per ciascun file _dedicato_ alla feature:
   - Spostare il file in `future_features/cloud_backup_gdrive/frontend/...` mantenendo struttura simile.
   - Rimuovere/aggiornare gli import nel percorso attivo.

3. Se la feature è “incastrata” in un file generale (es. `app-root.ts`):
   - Rimuovere SOLO il blocco di UI (import + render + handlers) relativo a cloud backup.
   - Copiare il blocco rimosso in `future_features/cloud_backup_gdrive/snippets/ui_backup_modal.md` (come riferimento).

4. Verifica:
   - `npm run build` (o comando build frontend del repo)
   - Avvio UI (se disponibile) e check: nessun errore in console/import.

**Commit + push:**

- Commit msg: `chore(ui): remove cloud backup panel from UI (moved to future_features)`
- Comandi:
  - `git add -A`
  - `git commit -m "chore(ui): remove cloud backup panel from UI (moved to future_features)"`
  - `git push origin develop`

**Status:** DONE
**What changed:**
- Rimosso dal frontend il bottone card `Backup su cloud` dalla sezione Backup.
- Rimossi da `app-root.ts` blocco modal Google Drive e tutti gli handler/state UI collegati.
- Salvato snapshot del blocco UI rimosso in `future_features/cloud_backup_gdrive/snippets/ui_backup_modal.md`.
- Build frontend eseguita con esito positivo.
- Backend start locale non eseguibile nell'host corrente (`uvicorn` non installato).
**Files touched:**
- `file_editor_plus/frontend/src/app-root.ts`
- `future_features/cloud_backup_gdrive/snippets/ui_backup_modal.md`
- `AI/AI_TASKS.md`
**Commands run:**
- `cd file_editor_plus/frontend && npm run build`
- `cd file_editor_plus/backend && timeout 8s python3 -m uvicorn app:app --host 127.0.0.1 --port 18099` (failed: module `uvicorn` missing)

---

## STEP 3 — Backend: scollegare e rimuovere endpoint /api/cloud/gdrive/\*

**Goal:** nessun endpoint gdrive/oAuth/device/status legato a cloud backup deve rimanere attivo nel backend.

**Tasks:**

1. Identificare (da INVENTORY) dove sono definiti:
   - `GET /api/cloud/gdrive/oauth/start`
   - `GET /api/cloud/gdrive/oauth/callback`
   - eventuali `device/start`, `status`, upload/backup endpoints

2. Se sono in file dedicati:
   - Spostare i file in `future_features/cloud_backup_gdrive/backend/...`
   - Rimuovere registrazione router/import dall’app principale.

3. Se sono in un file “core” (es. `backend/app.py`):
   - Rimuovere SOLO le route e funzioni correlate alla feature.
   - Copiare l’intero blocco rimosso in `future_features/cloud_backup_gdrive/backend/app_routes_snapshot.py`.

4. Verifica:
   - Avvio backend (`uvicorn ...`) e check: nessun crash.
   - Hit su endpoint principale non correlati (quelli che devono restare).
   - Facoltativo: verificare che `/api/cloud/gdrive/*` ora risponda 404 (non 500).

**Commit + push:**

- Commit msg: `chore(api): remove gdrive cloud-backup endpoints (moved to future_features)`
- Comandi:
  - `git add -A`
  - `git commit -m "chore(api): remove gdrive cloud-backup endpoints (moved to future_features)"`
  - `git push origin develop`

**Status:** DONE
**What changed:**
- Rimosse dal backend attivo tutte le route `/api/cloud/gdrive/*`.
- Archiviato snapshot del blocco route originale in `future_features/cloud_backup_gdrive/backend/app_routes_snapshot.py`.
- Verificato che nel file attivo non restino decorator `@app.*(\"/api/cloud/gdrive...\")`.
- Build frontend e compile backend completati.
**Files touched:**
- `file_editor_plus/backend/app.py`
- `future_features/cloud_backup_gdrive/backend/app_routes_snapshot.py`
- `AI/AI_TASKS.md`
**Commands run:**
- `cd file_editor_plus/frontend && npm run build`
- `python3 -m compileall file_editor_plus/backend/app.py`
- `rg -n \"@app\\.(get|post|put)\\(\\\"/api/cloud/gdrive\" file_editor_plus/backend/app.py`

---

## STEP 4 — Config/add-on: rimuovere opzioni, env template, docs di gdrive dal percorso attivo

**Goal:** nessun riferimento attivo a `gdrive_*`, `GDRIVE_OAUTH_*`, `GOOGLE_OAUTH_*` deve rimanere nella config “live” (se non usato da altre feature).

**Tasks:**

1. Cercare nel repo:
   - `rg -n "gdrive_|GDRIVE_OAUTH|GOOGLE_OAUTH"`

2. Per ogni file che è **solo** per cloud backup:
   - Spostare in `future_features/cloud_backup_gdrive/config/...` o `docs/...`

3. Se le chiavi sono in schema opzioni add-on:
   - Rimuovere dallo schema attivo.
   - Copiare schema precedente in `future_features/cloud_backup_gdrive/config/options_schema_snapshot.yaml`.

4. Verifica:
   - Build add-on / validazione config (se esiste comando)
   - Nessun warning/errore su opzioni mancanti.

**Commit + push:**

- Commit msg: `chore(config): remove cloud-backup gdrive options/docs from active addon (archived)`
- Comandi:
  - `git add -A`
  - `git commit -m "chore(config): remove cloud-backup gdrive options/docs from active addon (archived)"`
  - `git push origin develop`

**Status:** DONE
**What changed:**
- Rimosse le opzioni/schema `gdrive_*` da `file_editor_plus/config.yaml` (ora `options: {}` e `schema: {}`).
- Archiviato schema precedente in `future_features/cloud_backup_gdrive/config/options_schema_snapshot.yaml`.
- Rimossa la sezione cloud backup dalla documentazione attiva `file_editor_plus/README.md`.
- Salvato estratto doc rimosso in `future_features/cloud_backup_gdrive/docs/README_cloud_section.md`.
- Aggiornato `AI/AI_RUNBOOK.md` rimuovendo prerequisito operativo cloud backup.
**Files touched:**
- `file_editor_plus/config.yaml`
- `file_editor_plus/README.md`
- `AI/AI_RUNBOOK.md`
- `future_features/cloud_backup_gdrive/config/options_schema_snapshot.yaml`
- `future_features/cloud_backup_gdrive/docs/README_cloud_section.md`
- `AI/AI_TASKS.md`
**Commands run:**
- `rg -n "gdrive_|GDRIVE_OAUTH|GOOGLE_OAUTH" file_editor_plus/config.yaml file_editor_plus/README.md AI/AI_RUNBOOK.md`
- `cd file_editor_plus/frontend && npm run build`
- `python3 -m compileall file_editor_plus/backend/app.py`

---

## STEP 5 — Test/CI: rimuovere test gdrive dal percorso attivo e archiviare

**Goal:** la suite test/CI non deve più includere test gdrive; niente rotture CI.

**Tasks:**

1. Identificare file test (da INVENTORY) relativi a gdrive/oauth.
2. Spostarli in `future_features/cloud_backup_gdrive/tests/...`.
3. Se il runner test include pattern espliciti, aggiornare pattern per escludere `future_features/**`.
4. Verifica:
   - eseguire test suite (comando standard del repo)

**Commit + push:**

- Commit msg: `chore(test): archive gdrive oauth tests under future_features and keep CI green`
- Comandi:
  - `git add -A`
  - `git commit -m "chore(test): archive gdrive oauth tests under future_features and keep CI green"`
  - `git push origin develop`

---

## STEP 6 — Ripulitura dipendenze (SOLO se 100% inutilizzate)

**Goal:** rimuovere dipendenze introdotte esclusivamente per cloud backup, senza impattare altre feature.

**Tasks:**

1. Identificare dipendenze aggiunte per OAuth/Drive lato frontend/backend.
2. Confermare che non siano usate altrove:
   - `rg -n "<dependency_name>"`

3. Rimuoverle da `package.json` / requirements solo se non usate.
4. Verifica:
   - build frontend
   - avvio backend

**Commit + push:**

- Commit msg: `chore(deps): remove unused deps from archived cloud-backup feature`
- Comandi:
  - `git add -A`
  - `git commit -m "chore(deps): remove unused deps from archived cloud-backup feature"`
  - `git push origin develop`

---

## STEP 7 — Smoke finale + nota di deprecazione

**Goal:** confermare che la feature è completamente invisibile/inesistente nel prodotto e che nulla si è rotto.

**Tasks:**

1. Smoke UI:
   - aprire app → verificare assenza totale di “Backup su cloud”
   - nessuna chiamata di rete a `/api/cloud/gdrive/*`

2. Smoke backend:
   - start ok
   - endpoints principali ok

3. Aggiornare `README` o doc principale con 2 righe:
   - “Cloud backup (Google Drive) archiviato in future_features; non disponibile in release.”

**Commit + push:**

- Commit msg: `docs: mark cloud backup feature as archived (future_features)`
- Comandi:
  - `git add -A`
  - `git commit -m "docs: mark cloud backup feature as archived (future_features)"`
  - `git push origin develop`

---

## Checklist di accettazione (deve essere vera alla fine)

- UI: nessuna stringa “Backup su cloud” presente (`rg -n "Backup su cloud"` → 0 risultati nel percorso attivo).
- Backend: nessuna route `/api/cloud/gdrive/*` registrata (risponde 404).
- Nessun riferimento a `gdrive_*` in config attiva.
- CI/test/build passano.
- Tutto il codice rimosso è recuperabile in `future_features/cloud_backup_gdrive/**`.
