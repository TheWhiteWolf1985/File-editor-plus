# AI_TASKS - Fix build aarch64/Alpine (musl) Rollup optional deps + hardening

## Context

- Issue: build/update fail su aarch64 (Alpine/musl) con errore Rollup: `Cannot find module @rollup/rollup-linux-arm64-musl`.
- Target branch: `develop`
- Repo: `File-editor-plus`

## Goal

Far passare la build su aarch64/Alpine (musl) eliminando l’errore Rollup, con una fix minimale + hardening per evitare regressioni. Preparare rilascio **v1.0.0** con smoke + checklist release.

## Non-goals

- Refactor del frontend o cambio toolchain.
- Modifiche non correlate al problema Rollup (cleanup separati).

## Guardrails

- Fix “chirurgico” prima, fallback solo se serve.
- Commit atomici e messaggi in stile Conventional Commits.
- Verifica obbligatoria su build **arm64** (non solo x86_64).

---

## STEP 001 - Allineamento branch e cattura contesto riproduzione

- Status: DONE
- Goal: Lavorare su base pulita e raccogliere evidenze riproducibili.
- Scope:
  - `develop`
  - (Se presente) `AI/CONTEXT/issue_17_rollup_musl.md` (nuovo) oppure `docs/issue_17_rollup_musl.md`

- Changes:
  - Aggiornare `develop` e verificare working tree pulito.
  - Eseguire build che riproduca l’errore su arm64/musl (builder HA / CI / docker multi-arch).
  - Salvare: comando, ambiente/architettura, estratto log con errore Rollup, link run CI (se disponibile).

- Commands:
  - `git fetch --all`
  - `git checkout develop`
  - `git pull`
  - `git status`
  - `<<REQUIRED_RUNBOOK_ADDON_OR_CI_BUILD_FOR_ARM64>>`

- Acceptance criteria:
  - Branch `develop` aggiornata e clean.
  - Documento contesto creato con: comando + log + architettura (arm64) + base image rilevante.

- Commit message:
  - `chore(ai): capture issue 17 rollup musl build context`

- What changed:
  - Aggiornata `develop` e catturato contesto di riproduzione in `AI/CONTEXT/issue_17_rollup_musl.md`.
  - Riprodotto l'errore su `linux/arm64` (Alpine/musl) con `node:20-alpine`: `Cannot find module @rollup/rollup-linux-arm64-musl`.
  - Nota: in ambiente locale e' stato necessario abilitare qemu/binfmt per eseguire container arm64 su host amd64.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CONTEXT/issue_17_rollup_musl.md`

- Commands run:
  - `git fetch --all`
  - `git checkout develop`
  - `git pull`
  - `git status`
  - `docker run --privileged --rm tonistiigi/binfmt --install arm64`
  - `docker run --rm --platform linux/arm64 alpine:3.20 uname -m`
  - `docker run --rm --platform linux/arm64 -v "$PWD/file_editor_plus/frontend:/fe" -w /fe node:20-alpine sh -lc "npm ci && npm run -s build"`

---

## STEP 002 - Patch 1 (fix minimo): includere optional deps nello stage FE

- Status: DONE
- Goal: Forzare installazione delle optional deps necessarie a Rollup su `linux-arm64-musl`.
- Scope:
  - `file_editor_plus/Dockerfile`

- Changes:
  - Nello stage frontend (es. `FROM node:20-alpine AS fe`) cambiare **solo**:
    - `RUN npm ci`
    - → `RUN npm ci --include=optional`

  - Nessun’altra modifica nello step.

- Commands:
  - `git diff`

- Acceptance criteria:
  - Diff minimale: 1 riga modificata nel Dockerfile.

- Commit message:
  - `fix(docker): include optional deps in FE build (rollup musl arm64)`

- What changed:
  - Aggiornato lo stage frontend (fe) del Dockerfile: `npm ci --include=optional` per forzare install di optional deps (incluse quelle platform-specific di Rollup su musl/arm64).

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/Dockerfile`

- Commands run:
  - `git diff`

---

## STEP 003 - Verifica Patch 1 su arm64/musl

- Status: DONE
- Goal: Confermare che la build arm64 non fallisce più sull’errore Rollup.
- Scope:
  - Build add-on / CI / docker build arm64

- Changes:
  - Eseguire build **arm64** reale.
  - Aggiornare il documento contesto con esito e log.

- Commands:
  - `<<REQUIRED_RUNBOOK_ADDON_OR_CI_BUILD_FOR_ARM64>>`

- Acceptance criteria:
  - Build completata senza errore `@rollup/rollup-linux-arm64-musl`.
  - Evidenza salvata (log + riferimento run).

- Commit message:
  - `chore(ci): verify fix on arm64 musl`

- What changed:
  - Eseguita build arm64 (musl) dopo Patch 1: **la build fallisce ancora** con `Cannot find module @rollup/rollup-linux-arm64-musl`.
  - Aggiornato `AI/CONTEXT/issue_17_rollup_musl.md` con evidenza di fallimento post-patch.
  - Next: applicare hardening `.npmrc` (STEP 004) e rivalidare; se persiste, usare fallback base image (STEP 007).

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CONTEXT/issue_17_rollup_musl.md`

- Commands run:
  - `docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus`

---

## STEP 004 - Patch 2 (hardening): `.npmrc` nel frontend per includere optional deps

- Status: DONE
- Goal: Evitare regressioni future se qualcuno rimuove il flag `--include=optional`.
- Scope:
  - `file_editor_plus/frontend/.npmrc`

- Changes:
  - Se non esiste, creare `file_editor_plus/frontend/.npmrc` con contenuto:
    - `include=optional`

  - Se esiste già `.npmrc`, aggiungere la riga in modo non distruttivo (minima modifica).

- Commands:
  - `git diff`

- Acceptance criteria:
  - `.npmrc` presente e contiene `include=optional`.

- Commit message:
  - `chore(frontend): harden npm optional deps install via npmrc`

- What changed:
  - Creato `file_editor_plus/frontend/.npmrc` con `include=optional` per rendere esplicita l'installazione delle optional deps in ambienti musl/arm64.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/frontend/.npmrc`

- Commands run:
  - `git diff`

---

## STEP 005 - Verifica hardening su arm64/musl

- Status: DONE
- Goal: Assicurarsi che l’hardening non introduca regressioni e la build resti verde.
- Scope:
  - Build add-on / CI / docker build arm64

- Changes:
  - Ripetere build arm64.
  - Annotare esito nel documento contesto.

- Commands:
  - `<<REQUIRED_RUNBOOK_ADDON_OR_CI_BUILD_FOR_ARM64>>`

- Acceptance criteria:
  - Build OK su arm64/musl.
  - Nessuna regressione evidente nell’addon (install/avvio almeno smoke).

- Commit message:
  - `chore(ci): verify npmrc hardening on arm64 musl`

- What changed:
  - Eseguita build arm64/musl dopo l'hardening `.npmrc`: **la build fallisce ancora** con missing `@rollup/rollup-linux-arm64-musl`.
  - Evidenza aggiunta al contesto `AI/CONTEXT/issue_17_rollup_musl.md`.
  - Next: applicare fallback stage FE su Debian slim (STEP 007) e registrare decisione (STEP 008).

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CONTEXT/issue_17_rollup_musl.md`

- Commands run:
  - `docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus`

---

## STEP 006 - (Backlog separato) Warning Dockerfile su `BUILD_FROM`

- Status: DONE
- Goal: Tracciare e (se deciso) sistemare warning non bloccante: `InvalidDefaultArgInFrom`.
- Scope:
  - `file_editor_plus/Dockerfile`

- Changes:
  - **NON** fare in stessa PR/commit del fix Rollup.
  - Aprire task/issue interna o sezione note in contesto con proposta di fix (ARG default valido / validazione).

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - Warning tracciato con proposta e motivazione “separato per ridurre rischio”.

- Commit message:
  - `docs: track BUILD_FROM warning backlog`

- What changed:
  - Tracciato il warning `InvalidDefaultArgInFrom` (ARG `BUILD_FROM` senza default) nel contesto `AI/CONTEXT/issue_17_rollup_musl.md` con proposta di fix separata.
  - Nessuna modifica applicata al Dockerfile in questo step (backlog separato, non bloccante).

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CONTEXT/issue_17_rollup_musl.md`

- Commands run:
  - `<<OPTIONAL>>` (N/A)

---

## STEP 007 - Fallback (solo se necessario): cambiare base image dello stage FE a Debian slim

- Status: DONE
- Goal: Bypass musl nello stage FE se Patch 1/2 non risolvono.
- Scope:
  - `file_editor_plus/Dockerfile`

- Changes:
  - Nello stage FE cambiare:
    - `FROM node:20-alpine AS fe`
    - → `FROM node:20-bookworm-slim AS fe`

  - Tenere il resto invariato; aggiungere tool OS solo se strettamente richiesto (documentare).

- Commands:
  - `git diff`

- Acceptance criteria:
  - Diff confinato allo stage FE.
  - Motivazione fallback registrata in decision log (Step 008).

- Commit message:
  - `fix(docker): use debian slim for FE build stage to avoid musl rollup issues`

- What changed:
  - Applicato fallback nello stage FE: base image `node:20-bookworm-slim` (glibc) invece di `node:20-alpine` (musl).
  - Workaround aggiuntivo necessario: rimozione `package-lock.json` e uso di `npm install --include=optional` (con lockfile presente `npm ci`/`npm install` continuavano a saltare i pacchetti nativi di Rollup su arm64).
  - Verificato che `docker build --platform linux/arm64 --target fe ...` completa `vite build` con esito OK.

- Files touched:
  - `AI/AI_TASKS.md`
  - `file_editor_plus/Dockerfile`
  - `AI/CONTEXT/issue_17_rollup_musl.md`

- Commands run:
  - `git diff`
  - `docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus`

---

## STEP 008 - Decision log (solo se si usa il fallback)

- Status: DONE
- Goal: Rendere auditabile la scelta del fallback.
- Scope:
  - (Se presente) `AI/DECISIONS.md` altrimenti `docs/DECISIONS.md`

- Changes:
  - Registrare:
    - Decisione
    - Motivazione
    - Alternative provate (Patch 1/2)
    - Impatti (peso immagine / tempi build)
    - Link a build/log

- Commands:
  - `<<OPTIONAL>>`

- Acceptance criteria:
  - Decisione tracciata con data e riferimenti.

- Commit message:
  - `docs(decisions): record rationale for FE base image fallback`

- What changed:
  - Aggiunta ADR 007 in `AI/DECISIONS.md` per tracciare la scelta: fallback musl -> glibc nello stage FE e workaround `rm package-lock.json && npm install --include=optional`.
  - Collegata l'evidenza a `AI/CONTEXT/issue_17_rollup_musl.md`.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/DECISIONS.md`

- Commands run:
  - N/A

---

## STEP 009 - Smoke checklist post-fix

- Status: DONE
- Goal: Verificare i flussi minimi dell’addon dopo la fix.
- Scope:
  - `SMOKE.md` (se presente) o `AI/CHECKLISTS/SMOKE.md`

- Changes:
  - Eseguire smoke (install/avvio + 1–2 funzioni principali).
  - Compilare checklist con esiti e N/A motivati.

- Commands:
  - `<<REQUIRED_RUNBOOK_SMOKE_COMMANDS>>`

- Acceptance criteria:
  - Smoke completato con evidenza.

- Commit message:
  - `chore(qa): complete smoke checks for rollup musl fix`

- What changed:
  - Eseguito build frontend (`npm ci && npm run build`) e test backend (`unittest` via Docker).
  - Eseguito rebuild + restart dell'add-on `local_file_editor_plus` e verificato boot in log (uvicorn up).
  - Compilata la checklist in `AI/CHECKLISTS/SMOKE.md` con N/A motivati per test manuali UI.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CHECKLISTS/SMOKE.md`

- Commands run:
  - `cd file_editor_plus/frontend && npm ci && npm run build`
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`
  - `docker exec hassio_cli ha apps rebuild local_file_editor_plus`
  - `docker exec hassio_cli ha apps restart local_file_editor_plus`
  - `docker logs --tail 80 addon_local_file_editor_plus`

---

## STEP 010 - Release v1.0.0

- Status: DONE
- Goal: Preparare e rilasciare 1.0.0 includendo la fix.
- Scope:
  - `RELEASE.md` (se presente) o `AI/CHECKLISTS/RELEASE.md`
  - Versioning (file progetto) `<<REQUIRED_VERSION_FILES>>`

- Changes:
  - Aggiornare versione a `1.0.0` dove previsto.
  - Compilare checklist release.
  - Verificare build su `x86_64` e `aarch64` (se pipeline disponibile).

- Commands:
  - `<<REQUIRED_RUNBOOK_RELEASE_COMMANDS>>`

- Acceptance criteria:
  - Release checklist completata.
  - Evidenza build OK su architetture supportate (almeno arm64).
  - Tag/release creati secondo convenzioni progetto.

- Commit message:
  - `chore(release): prepare 1.0.0 with arm64 musl build fix`

- What changed:
  - Confermata versione add-on `1.0.0` in `file_editor_plus/config.yaml` e aggiornata la release note in `file_editor_plus/CHANGELOG.md` includendo la fix arm64 Rollup.
  - Completata la checklist `AI/CHECKLISTS/RELEASE.md` con evidenze di build/test.
  - Verificata build FE su amd64 e arm64 (docker stage FE) e typecheck FE.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/CHECKLISTS/RELEASE.md`
  - `file_editor_plus/CHANGELOG.md`

- Commands run:
  - `cd file_editor_plus/frontend && npm ci && npm run -s typecheck && npm run build`
  - `docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus`
  - `docker pull --platform linux/amd64 node:20-bookworm-slim`
  - `docker build --no-cache --pull --platform linux/amd64 --target fe -f file_editor_plus/Dockerfile file_editor_plus`
  - `git tag -a v1.0.0 -m \"v1.0.0\"`
