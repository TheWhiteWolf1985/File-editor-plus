# AI_TASKS - ADR007 Improvements (lockfile clarity, exit criteria, npm flags)

## Goal

Applicare 3 miglioramenti alla decisione ADR 007:

1. chiarire esplicitamente che la rimozione di `package-lock.json` avviene **solo nello stage di build** e non nel repo;
2. aggiungere **exit criteria** per rimuovere il workaround e tornare a una build deterministica;
3. aggiungere mitigazioni minime nello stage FE: flag `npm install` per ridurre rumore e annotare versione Node/npm per riproducibilità.

## Scope

- `AI/DECISIONS.md` (ADR 007)
- `file_editor_plus/Dockerfile` (solo stage FE)
- (Se presente) `AI/CONTEXT/issue_17_rollup_musl.md` (integrazione minima: versione Node/npm)

## Non-goals

- Tornare a musl/Alpine o cambiare toolchain FE.
- Rigenerare `package-lock.json` in questa patch.

---

### STEP 001 - Aggiornare ADR 007: lockfile solo in build stage + exit criteria

- Status: TODO
- Goal: Rendere la decisione auditabile e limitare ambiguità sul lockfile e sul workaround.
- Scope:
  - `AI/DECISIONS.md`

- Changes:
  - In ADR 007 aggiungere una sezione (o 2 bullet) che specifichi chiaramente:
    - **Lockfile policy:** la rimozione di `package-lock.json` avviene **solo nello stage FE del container** (es. `RUN rm -f package-lock.json`), **non** viene rimossa dal repository e non va committata.

  - Aggiungere una sezione **Exit criteria** con criteri verificabili per rimuovere il workaround e tornare a `npm ci` deterministico, ad esempio:
    - Quando `npm ci --include=optional` su arm64/musl passa con lockfile aggiornato/rigenerato in modo controllato; oppure
    - Quando una versione specifica di Node/npm (documentata) non presenta più il problema optional-deps+lockfile su arm64/musl.

  - (Opzionale ma consigliato) Annotare che il workaround è confinato allo stage FE e non impatta runtime dell’addon.

- Commands:
  - `git diff`

- Acceptance criteria:
  - ADR 007 contiene:
    - frase esplicita “lockfile rimosso solo in build stage, non dal repo”
    - sezione Exit criteria con 2 condizioni verificabili

  - Nessuna modifica tecnica oltre `AI/DECISIONS.md` in questo step.

- Commit message:
  - `docs(decisions): clarify lockfile handling and add exit criteria for ADR 007`

---

### STEP 002 - Dockerfile stage FE: aggiungere flag npm e tracciare versione Node/npm

- Status: TODO
- Goal: Ridurre non-determinismo “pratico” e rumore (audit/fund) e aumentare riproducibilità (versioni).
- Scope:
  - `file_editor_plus/Dockerfile`
  - `AI/CONTEXT/issue_17_rollup_musl.md` (se esiste)

- Changes:
  - Nello stage FE (glibc) aggiornare il comando di installazione per includere flag stabilizzanti:
    - da: `npm install --include=optional`
    - a: `npm install --include=optional --no-audit --no-fund`

  - (Se utile e minimale) aggiungere subito prima o dopo una riga che stampi versioni in log build:
    - `RUN node -v && npm -v`
    - **Nota:** questa riga è solo diagnostica, non modifica output runtime.

  - Aggiornare il contesto `AI/CONTEXT/issue_17_rollup_musl.md` con:
    - output `node -v` e `npm -v` usati nella build di riferimento.

- Commands:
  - `git diff`

- Acceptance criteria:
  - Dockerfile: nello stage FE l’install usa `--no-audit --no-fund`.
  - Dockerfile: presente logging `node -v` e `npm -v` (se aggiunto) senza altre modifiche laterali.
  - Contesto aggiornato con versioni Node/npm.

- Commit message:
  - `chore(build): add npm install flags and log node/npm versions in FE stage`

---

### STEP 003 - Verifica rapida e aggiornamento audit

- Status: TODO
- Goal: Confermare che i cambiamenti non rompono la build e aggiornare evidenze.
- Scope:
  - Build arm64 (add-on builder/CI) + eventuale amd64

- Changes:
  - Eseguire build arm64 come da runbook/procedura progetto.
  - Verificare che:
    - build FE passa
    - i log includono `node -v` e `npm -v` (se aggiunti)

  - Aggiornare audit/contesto con esito.

- Commands:
  - `<<REQUIRED_RUNBOOK_ADDON_OR_CI_BUILD_FOR_ARM64>>`

- Acceptance criteria:
  - Build arm64 OK.
  - Evidenze aggiornate nel contesto (o audit equivalente).

- Commit message:
  - `chore(ci): verify ADR007 mitigations on arm64 build`
