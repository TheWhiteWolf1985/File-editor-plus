# AI_TASKS — Reset operativo e ripartenza

Data reset: 2026-02-17
Repo target: `ha-file-editor-plus`

## Regole operative (mini)

- Status ammessi: `TODO` → `DOING` → `DONE`.
- Uno step = modifiche minime + verifiche + aggiornamento `AI/KNOWLEDGE.yaml` (e `AI/DECISIONS.md` se c’e una scelta non ovvia).
- Niente refactor “tanto per”, niente dipendenze nuove senza richiesta esplicita.
- Dopo ogni step: eseguire la checklist `AI/CHECKLISTS/SMOKE.md` (o motivare `N/A`).

## Nota su questo file

Questo `AI_TASKS.md` **sostituisce** il backlog “migrato da AI_old” che conteneva placeholder non eseguibili. L’obiettivo qui è avere step **eseguibili end-to-end** per ripartire senza attriti.

---

### STEP 001 — Chiudere bump AI kit (worktree pulito + metadata compilata)

- Status: DONE
- Goal: Chiudere definitivamente la migrazione `AI_old → AI` e togliere i blocker P0.
- Scope:
  - `AI/` (tutti i file)
  - Root repo (solo per pulizia worktree)

- Changes:
  - Eseguire `git status`/diff e identificare modifiche **fuori** `AI/`.
  - Se le modifiche fuori `AI/` non sono parte del bump: **revert**.
  - Se sono volute: **isolarle in un commit separato** (messaggio coerente), poi continuare.
  - Compilare `AI/METADATA.yaml`:
    - `owner`
    - `created_at` (ISO-8601)

  - Verificare che in `AI/` non restino placeholder bloccanti non intenzionali.
  - What changed:
    - `AI/METADATA.yaml` compilato (`owner`, `created_at`).
    - Rimossi placeholder bloccanti dai doc operativi (`AI_PROJECT`, `AI_RUNBOOK`, `DECISIONS`).
    - Aggiunto shim `AI/Knowledge.yaml` per compatibilita' (canonical: `AI/KNOWLEDGE.yaml`).
    - Build frontend eseguita con successo.

- Commands:
  - `git status --porcelain`
  - `git diff --name-only`
  - `rg -n "<{2}REQUIRED>{2}" AI -S --glob '!AI/AI_TASKS.md' --glob '!AI/README.md' --glob '!AI/EXAMPLES/**'`

- Acceptance criteria:
  - Worktree pulito **oppure** modifiche non-AI isolate e motivate in commit separato.
  - `AI/METADATA.yaml` senza placeholder.
  - Nessun placeholder bloccante residuo in `AI/` (salvo template/esempi intenzionali).

- Commit message:
  - "chore(ai): finalize kit migration and metadata"

- Blockers/Notes:
  - Se serve split commit: prima commit non-AI (se voluto), poi questo.

---

### STEP 002 — Definire comandi ufficiali (dev/build/lint/test) e aggiornare RUNBOOK

- Status: DONE
- Goal: Rendere ripetibile la verifica (dev, build, lint/typecheck, test) senza “magia”.
- Scope:
  - `AI/AI_RUNBOOK.md`
  - `file_editor_plus/frontend/package.json`
  - `file_editor_plus/backend/` (config test/lint se esiste)

- Changes:
  - Frontend:
    - Identificare gli script reali in `package.json` (`build`, `lint`, `typecheck`, `test` se presenti).
    - Se mancano `lint`/`typecheck` ma esiste tooling già configurato, aggiungere **solo** script (senza introdurre tool nuovi).

  - Backend:
    - Identificare runner test reale (es. `pytest`, `unittest`, altro) dai file di progetto (`pyproject.toml`, `requirements.txt`, `pytest.ini`, `tox.ini`, ecc.).
    - Definire un comando “test backend” ufficiale.

  - Documentare tutto in `AI/AI_RUNBOOK.md` come comandi canonici.
  - What changed:
    - Aggiunti script FE `dev` e `typecheck` in `file_editor_plus/frontend/package.json`.
    - Aggiornato `AI/AI_RUNBOOK.md` con comandi canonici per dev/build/typecheck/test (con prerequisito `pip` per backend).
    - Validato build FE; typecheck FE esegue ma segnala errori TS esistenti nel codice.

- Commands:
  - `cd file_editor_plus/frontend && node -p "JSON.stringify(require('./package.json').scripts, null, 2)"`
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s build`
  - `cd file_editor_plus/backend && ls -la`
  - `cd file_editor_plus/backend && (test -f pyproject.toml && sed -n '1,200p' pyproject.toml || true)`
  - `cd file_editor_plus/backend && (test -f requirements.txt && sed -n '1,120p' requirements.txt || true)`
  - `cd file_editor_plus/backend && (python -m pytest -q || pytest -q)`

- Acceptance criteria:
  - `AI/AI_RUNBOOK.md` contiene:
    - comando dev locale (se esiste) o motivazione `N/A`
    - comando build FE
    - comando lint/typecheck FE (o motivazione `N/A`)
    - comando test BE (unico, ufficiale)

  - I comandi documentati risultano eseguibili (o `N/A` motivato) e ripetibili.

- Commit message:
  - "chore(ai): document canonical dev/build/test commands"

- Blockers/Notes:
  - Vietato “aggiungere ruff/flake8/eslint” a caso: prima verificare cosa c’è già.

---

### STEP 003 — Hardening interoperabilità: rimuovere BOM dagli JSON schema

- Status: DONE
- Goal: Evitare che tool esterni falliscano su `AI/SCHEMAS/*.json`.
- Scope:
  - `AI/SCHEMAS/*.json`

- Changes:
  - Rimuovere BOM UTF-8 da tutti i JSON schema.
  - Verificare parsing JSON dopo modifica.
  - What changed:
    - Rimossi BOM UTF-8 da `AI/SCHEMAS/knowledge.schema.json` e `AI/SCHEMAS/tasks.schema.json`.
    - Verificato parsing JSON via Node; build frontend OK.

- Commands:
  - `python - <<'PY'
from pathlib import Path
paths = sorted(Path('AI/SCHEMAS').glob('*.json'))
for p in paths:
b = p.read_bytes()
if b.startswith(b'\xef\xbb\xbf'):
    p.write_bytes(b[3:])
    print('stripped BOM:', p)
else:
    print('ok:', p)
PY`
  - `node -e "const fs=require('fs'); for (const f of fs.readdirSync('AI/SCHEMAS')) { if(!f.endsWith('.json')) continue; JSON.parse(fs.readFileSync('AI/SCHEMAS/'+f,'utf8')); } console.log('schemas: parse ok')"`

- Acceptance criteria:
  - Nessun file in `AI/SCHEMAS` ha BOM.
  - Parsing OK via Node (o strumento equivalente) su tutti gli schema.

- Commit message:
  - "chore(ai): remove BOM from schema json"

- Blockers/Notes:
  - Se `AI/SCHEMAS` non esiste nel target, marcare `N/A` e registrare in `AI/KNOWLEDGE.yaml`.

---

### STEP 004 — Consolidare “source of truth” (chiudere conflitti legacy su doc)

- Status: DONE
- Goal: Eliminare ambiguità “completed vs todo” tra fonti legacy.
- Scope:
  - `AI/KNOWLEDGE.yaml`
  - `AI/DECISIONS.md`
  - (eventuali doc di progetto: README/docs)

- Changes:
  - Consolidare nello `changes_log` di `AI/KNOWLEDGE.yaml` cosa è:
    - già fatto (documentazione/setup)
    - ancora aperto (backlog reale)

  - Se serve, aggiungere una nota in `AI/DECISIONS.md` su quale fonte è considerata vera (spoiler: `AI/KNOWLEDGE.yaml`).
  - What changed:
    - Aggiunta nota "source of truth" in `AI/DECISIONS.md` (stato progetto in `AI/KNOWLEDGE.yaml`).
    - Registrata risoluzione conflitto doc in `AI/KNOWLEDGE.yaml` (docs presenti nel repo => considerato DONE).

- Commands:
  - `rg -n "documentation" AI/KNOWLEDGE.yaml AI/DECISIONS.md -S`

- Acceptance criteria:
  - `AI/KNOWLEDGE.yaml` contiene una voce chiara che risolve il conflitto di stato.
  - Nessuna ambiguità residua su “docs done” vs “docs todo”.

- Commit message:
  - "chore(ai): reconcile legacy documentation status"

- Blockers/Notes:
  - Questo step non cambia prodotto: cambia solo la memoria/audit.

---

## Backlog prodotto (ripartenza)

### STEP 005 — Fix TS config naming (tsconfg.json vs tsconfig.json)

- Status: DONE
- Goal: Eliminare rischio toolchain TS che ignora config non standard.
- Scope:
  - `file_editor_plus/frontend/` (config TS, Vite/tsc)

- Changes:
  - Cercare riferimenti a `tsconfg.json` / `tsconfig.json`.
  - Se presente naming errato, riallineare (rename o riferimenti) in modo compatibile.
  - What changed:
    - Verificato che `tsconfig.json` esiste e `tsconfg.json` non e' presente: nessuna modifica necessaria.
    - Build frontend OK.

- Commands:
  - `rg -n "tsconfg\\.json|tsconfig\\.json" file_editor_plus/frontend -S`
  - `cd file_editor_plus/frontend && npm ci && npm run -s build`

- Acceptance criteria:
  - La build FE usa la config TS prevista (niente fallback inatteso).
  - Nessun warning/error nuovo relativo a TS config.

- Commit message:
  - "fix(frontend): align tsconfig naming"

- Blockers/Notes:
  - Tenere la modifica minimal: niente ristrutturazioni.

---

### STEP 006 — Quality gate: lint/typecheck FE+BE (integrazione reale)

- Status: DONE
- Goal: Standardizzare controlli ripetibili (evitare regressioni silenziose).
- Scope:
  - Frontend: `file_editor_plus/frontend/package.json`
  - Backend: config/tooling esistente (senza introdurre tool nuovi)
  - (optional) `.github/workflows/` se già presente

- Changes:
  - FE: garantire script `lint` e `typecheck` se supportati dallo stack già presente.
  - BE: definire almeno un controllo statico **già previsto** (es. format/lint/typecheck se esiste).
  - Documentare i comandi in `AI/AI_RUNBOOK.md` (linkare a STEP 002 se già fatto).
  - What changed:
    - Confermato che FE ha `typecheck` (ma attualmente fallisce per errori TS esistenti) e non ha lint configurato (N/A).
    - Confermato che BE non ha pytest/lint configurati in questo ambiente (pytest non presente; pip non disponibile).
    - Build frontend rimane il gate principale.

- Commands:
  - `cd file_editor_plus/frontend && node -p "JSON.stringify(require('./package.json').scripts, null, 2)"`
  - `cd file_editor_plus/frontend && (npm run -s lint || true)`
  - `cd file_editor_plus/frontend && (npm run -s typecheck || true)`
  - `cd file_editor_plus/backend && (python -m pytest -q || true)`

- Acceptance criteria:
  - Esiste un set di comandi “canonici” e documentati per:
    - FE build + FE lint/typecheck (o `N/A` motivato)
    - BE test + eventuale lint/typecheck se già previsto

- Commit message:
  - "chore(qg): wire up lint and typecheck commands"

- Blockers/Notes:
  - Se `|| true` è usato solo per esplorazione, rimuoverlo quando i comandi diventano ufficiali.

---

### STEP 007 — Test: safe_path/make_backup/atomic_write

- Status: TODO
- Goal: Aumentare copertura regressioni su operazioni file critiche sotto `/config`.
- Scope:
  - `file_editor_plus/backend/app.py`
  - `file_editor_plus/backend/test_*.py`

- Changes:
  - Aggiungere test mirati:
    - traversal (`../`)
    - null byte
    - path assoluti
    - backup path
    - errori IO simulati (quando possibile)

- Commands:
  - `cd file_editor_plus/backend && (python -m pytest -q || pytest -q)`

- Acceptance criteria:
  - Nuovi test presenti e passanti.
  - Nessuna regressione sulla sicurezza (safe_path resta restrittivo).

- Commit message:
  - "test(backend): cover safe_path and atomic write"

- Blockers/Notes:
  - Se serve test fixture per `/config`, documentare chiaramente.

---

### STEP 008 — Stabilizzare failing test traversal (suite backend tutta verde)

- Status: TODO
- Goal: Portare la suite backend a 100% verde senza ridurre hardening.
- Scope:
  - `file_editor_plus/backend/test_search_replace.py`
  - `file_editor_plus/backend/app.py` (solo se necessario)

- Changes:
  - Allineare aspettative test ↔ comportamento API.
  - Garantire che traversal venga bloccato in modo consistente.

- Commands:
  - `cd file_editor_plus/backend && (python -m pytest -q || pytest -q)`

- Acceptance criteria:
  - Test backend passano 100%.

- Commit message:
  - "fix(backend): align traversal test expectations"

- Blockers/Notes:
  - Qualsiasi cambio semantico va documentato in `AI/DECISIONS.md`.

---

### STEP 009 — Retention/cleanup backup (/config/.fep-backups)

- Status: TODO
- Goal: Evitare crescita incontrollata dei backup.
- Scope:
  - `file_editor_plus/backend/app.py` (backup)
  - UI/setting (solo se già esistente)
  - Documentazione policy

- Changes:
  - Definire policy retention (es. max N per file, max size totale, pruning manuale/automatico).
  - Implementare pruning se richiesto dallo scope reale (altrimenti solo doc + issue).

- Commands:
  - <<OPTIONAL>>

- Acceptance criteria:
  - Policy retention documentata.
  - Se implementata: pruning verificabile e testabile.

- Commit message:
  - "feat(backup): document and enforce retention policy"

- Blockers/Notes:
  - Se non implementabile senza cambiare UX, proporre alternativa minimale.

---

### STEP 010 — UX: messaggi errore coerenti per operazioni file

- Status: TODO
- Goal: Zero “successo finto”, errori sempre visibili e utili.
- Scope:
  - Frontend: upload/move/copy/delete/save

- Changes:
  - Uniformare toast/error handling.
  - Mappare errori API a messaggi user-friendly.

- Commands:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s build`

- Acceptance criteria:
  - Errori API mostrano messaggi chiari.
  - Nessun caso in cui UI segnala successo quando API fallisce.

- Commit message:
  - "fix(ui): standardize file operation error messages"

- Blockers/Notes:
  - Preferire modifiche locali: niente redesign.

---

### STEP 011 — Hardening log: rimuovere token_prefix dai log

- Status: TODO
- Goal: Ridurre rischio leakage credenziali nei log.
- Scope:
  - `file_editor_plus/backend/app.py` (logging)

- Changes:
  - Rimuovere/mascherare `token_prefix` e riferimenti a token nei log info/warn/error.

- Commands:
  - `rg -n "token_prefix|token" file_editor_plus/backend -S`
  - `cd file_editor_plus/backend && (python -m pytest -q || pytest -q)`

- Acceptance criteria:
  - Log non contengono token o prefissi token.

- Commit message:
  - "fix(logging): redact token data from logs"

- Blockers/Notes:
  - Attenzione ai log in ingress/proxy.

---

### STEP 012 — Security headers minimi (defense-in-depth)

- Status: TODO
- Goal: Hardening HTTP base senza rompere Ingress/assets.
- Scope:
  - `file_editor_plus/backend/app.py` (middleware/headers)

- Changes:
  - Aggiungere header minimi compatibili:
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: no-referrer` (o policy compatibile)
    - CSP base se non rompe assets (altrimenti documentare limitazioni)

- Commands:
  - `curl -I http://localhost:PORT/ || true`
  - `curl -I http://localhost:PORT/api/health || true`

- Acceptance criteria:
  - Header presenti su root e su API (dove applicabile).
  - Nessun blocco di assets/JS/CSS (verifica manuale minima).

- Commit message:
  - "fix(security): add baseline http security headers"

- Blockers/Notes:
  - Porta/endpoint reali vanno presi dal runbook.

---

### STEP 013 — Chiusura: audit finale + checklist release

- Status: TODO
- Goal: Chiudere il ciclo con repo pulita, conoscenza aggiornata e verifiche tracciate.
- Scope:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `AI/DECISIONS.md`
  - `AI/CHECKLISTS/SMOKE.md`
  - `AI/CHECKLISTS/RELEASE.md`

- Changes:
  - Aggiornare tutti gli status a `DONE`.
  - Aggiornare `AI/KNOWLEDGE.yaml` (entities/relations/changes_log).
  - Registrare decisioni/trade-off in `AI/DECISIONS.md`.
  - Compilare le checklist smoke e release (o motivare `N/A`).

- Commands:
  - `git status --porcelain`
  - `rg -n "Status: TODO|Status: DOING" AI/AI_TASKS.md -S`

- Acceptance criteria:
  - Nessuno step resta `TODO/DOING`.
  - Checklists compilate.
  - Worktree pulito.

- Commit message:
  - "chore(ai): finalize audit and close tasks"

- Blockers/Notes:
  - Se alcuni step sono `N/A`, devono essere motivati in `AI/KNOWLEDGE.yaml`.
