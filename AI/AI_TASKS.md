# AI_TASKS — Fix residui post-migrazione (Home Assistant Add-on)

Data: 2026-02-17
Contesto: **progetto add-on Home Assistant** (attenzione a Ingress, path `/config`, containerizzazione e permessi).
Obiettivo: chiudere i **4 punti residui** emersi dagli audit e ripartire con lavoro “pulito”.

## Regole operative

- Status ammessi: `TODO` → `DOING` → `DONE`.
- Ogni step deve essere **ripetibile** (comandi + acceptance criteria).
- Non introdurre nuove dipendenze/tooling “a caso”. Se serve una scelta di progetto, scriverla in `AI/DECISIONS.md`.
- Dopo ogni step: eseguire la smoke checklist dell’add-on (se esiste) o `AI/CHECKLISTS/SMOKE.md`.

---

## STEP 001 — Frontend: `npm run -s typecheck` deve essere GREEN

- Status: DONE
- Problema:
  - Typecheck TS fallisce (esempi audit: `Duplicate identifier 'treeDirty'`, `ImportMeta.env` non tipizzato, `implicit any`).

- Scope:
  - `file_editor_plus/frontend/`

- Changes (minimali):
  1. Eliminare il duplicato `treeDirty` (una sola dichiarazione, stessa semantica).
  2. Sistemare typing Vite per `import.meta.env`:
     - aggiungere/aggiornare un file declaration (tipicamente `src/vite-env.d.ts` o `vite-env.d.ts` in root FE) con:
       - `/// <reference types="vite/client" />`

     - oppure adeguare l’uso se il progetto non è Vite (prima verificare).

  3. Sistemare i punti con `implicit any` / overload su entities/tree/search con tipizzazioni esplicite **locali**.

- What changed:
  - Rimosso `declare treeDirty` duplicato in `file_editor_plus/frontend/src/app-root.ts`.
  - Aggiunto `file_editor_plus/frontend/src/vite-env.d.ts` per tipizzare `import.meta.env` (Vite).
  - Tipizzazioni locali per chiudere errori strict TS in:
    - `file_editor_plus/frontend/src/features/entities/entities.ts`
    - `file_editor_plus/frontend/src/features/search/search.ts`
    - `file_editor_plus/frontend/src/features/tree/tree.ts`

- Commands:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - (optional) `cd file_editor_plus/frontend && npm run -s build`

- Acceptance criteria:
  - `npm run -s typecheck` ritorna exit code 0.
  - Nessun nuovo warning/errore TS introdotto.
  - La build FE continua a funzionare.

- Commit message:
  - `fix(frontend): make typescript typecheck pass`

---

## STEP 002 — Backend: standardizzare i test via Docker (comando canonico per add-on)

- Status: TODO
- Problema:
  - Nel workspace python host manca `pip` → test BE non eseguibili “nativamente”.
  - Essendo un add-on HA, la via sana è: **test via container** (ripetibile, indipendente dall’host).

- Scope:
  - `AI/AI_RUNBOOK.md`
  - `file_editor_plus/backend/` (solo per capire runner e requirements)

- Changes:
  1. Verificare il runner test backend reale:
     - se esistono test `unittest` → usare `python -m unittest -q`
     - se è configurato `pytest` → usare `pytest -q`

  2. Stabilire **un comando ufficiale** di test BE via Docker e scriverlo nel runbook.
     - Comando base (da audit) — adattare solo se il repo richiede altro:
       - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`

  3. Nota add-on:
     - Non cambiare ingress/paths `/config`.
     - Non toccare l’immagine dell’add-on in questa fase: qui si standardizza solo il _modo_ di eseguire test.

- Commands:
  - `cd file_editor_plus/backend && ls -la`
  - `cd file_editor_plus/backend && (test -f requirements.txt && sed -n '1,160p' requirements.txt || true)`
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`

- Acceptance criteria:
  - Esiste **un solo** comando canonico documentato in `AI/AI_RUNBOOK.md` per eseguire i test backend.
  - Il comando funziona da repo root senza dipendenze sul python host.

- Commit message:
  - `chore(runbook): standardize backend tests via docker`

---

## STEP 003 — Rimuovere BOM UTF-8 dai file `AI/*.md` e `AI/*.yaml`

- Status: TODO
- Problema:
  - BOM (`EF BB BF`) diffuso nei file `AI/` → rischio tooling fragile (specie YAML).

- Scope:
  - `AI/**/*.md`
  - `AI/**/*.yaml`

- Changes:
  - Strip BOM su tutti i file target.
  - NON toccare i contenuti oltre al BOM (diff minimo).

- Commands:
  - Scan/strip BOM (Python):

```bash
python - <<'PY'
from pathlib import Path
root = Path('AI')
paths = [p for p in root.rglob('*') if p.is_file() and p.suffix in {'.md', '.yaml', '.yml'}]
changed = 0
for p in sorted(paths):
    b = p.read_bytes()
    if b.startswith(b'ï»¿'):
        p.write_bytes(b[3:])
        print('stripped BOM:', p)
        changed += 1
print('done; files changed:', changed)
PY
```

- Verifica (nessun BOM residuo):

```bash
python - <<'PY'
from pathlib import Path
root = Path('AI')
paths = [p for p in root.rglob('*') if p.is_file() and p.suffix in {'.md', '.yaml', '.yml'}]
left = []
for p in paths:
    b = p.read_bytes()
    if b.startswith(b'ï»¿'):
        left.append(str(p))
print('BOM remaining:', len(left))
for x in sorted(left):
    print(' -', x)
PY
```

- Acceptance criteria:
  - Nessun file `AI/*.md` o `AI/*.yaml` inizia con BOM.
  - Diff pulito (solo rimozione BOM).

- Commit message:
  - `chore(ai): remove utf-8 bom from md/yaml`

---

## STEP 004 — Knowledge: rimuovere TODO stale su `owner/created_at` (coerenza interna)

- Status: TODO
- Problema:
  - `AI/METADATA.yaml` ha `owner` e `created_at` compilati, ma `AI/KNOWLEDGE.yaml` (changes_log) li segnala ancora come mancanti/non determinabili.
  - Risultato: audit interno incoerente.

- Scope:
  - `AI/KNOWLEDGE.yaml`
  - (verifica) `AI/METADATA.yaml`

- Changes:
  1. Aprire `AI/KNOWLEDGE.yaml` e trovare la voce `changes_log` relativa alla migrazione (es. `migration_from_AI_old`).
  2. Aggiornare `todos_remaining`:
     - rimuovere riferimenti a `owner/created_at` come mancanti.
     - lasciare solo TODO reali (es. `repo_url` se effettivamente desiderato).

  3. Se si fa una scelta (es. “non compiliamo repo_url”), annotarla in `AI/DECISIONS.md`.

- Commands:
  - `rg -n "migration_from_AI_old|todos_remaining|owner|created_at" AI/KNOWLEDGE.yaml AI/METADATA.yaml -S`
  - (optional) validazione YAML se disponibile nel repo/tooling.

- Acceptance criteria:
  - `AI/KNOWLEDGE.yaml` non contiene TODO che contraddicono `AI/METADATA.yaml`.
  - Il `changes_log` riflette la realtà: niente “fantasmi”.

- Commit message:
  - `chore(ai): reconcile knowledge todos with metadata`

---

## Post-run (sempre)

- `git status --porcelain`
- Eseguire smoke dell’add-on (Ingress + operazioni file su `/config`) o `AI/CHECKLISTS/SMOKE.md`.
- Aggiornare gli status a `DONE` quando i comandi passano.
