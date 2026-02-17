# AI_TASKS — Backlog migrato da AI_old

Fonte primaria backlog: `AI_old/knowledge.yaml` (sezione `work_tracking.backlog` e `follow_ups`).
Fonte raccomandazioni: `AI_old/application_audit/FILE_EDITOR_PLUS_AUDIT.md`.

Regola: nessuna invenzione su comandi/commit message non presenti nelle fonti. Se non certo: `<<REQUIRED>>`.

## Schema fisso step (kit)

### STEP 001 - Verificare naming TypeScript config (tsconfg.json vs tsconfig.json)
- Status: TODO
- Goal: Eliminare rischio toolchain TS che ignora config non standard.
- Scope:
  - `file_editor_plus/frontend/` (config TS)
- Changes:
  - Individuare se esiste `tsconfg.json` nel repo e se e' referenziato da Vite/tsc.
  - Se necessario, rinominare a `tsconfig.json` o aggiornare riferimenti in modo compatibile.
- Commands:
  - `rg -n "tsconfg\\.json|tsconfig\\.json" file_editor_plus/frontend -S`
  - `cd file_editor_plus/frontend && npm ci && npm run build`
- Acceptance criteria:
  - Build frontend usa la configurazione TS prevista (nessun fallback inatteso).
  - Nessun warning/error nuovo relativo a TS config.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-003.

### STEP 002 - Aggiungere test per safe_path/make_backup/atomic_write
- Status: TODO
- Goal: Aumentare copertura regressioni sulle operazioni file critiche sotto `/config`.
- Scope:
  - `file_editor_plus/backend/app.py`
  - `file_editor_plus/backend/test_*.py`
- Changes:
  - Aggiungere test mirati: traversal, null byte, path assoluti, backup path, errori IO simulati.
- Commands:
  - <<REQUIRED>>
- Acceptance criteria:
  - Test suite backend include casi di traversal + backup + atomic write.
  - I test passano in CI/locale (runner ufficiale definito).
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-004.

### STEP 003 - Integrare lint/typecheck per frontend e backend (definire comandi ufficiali)
- Status: TODO
- Goal: Standardizzare quality gate ripetibili (no regressioni silenziose).
- Scope:
  - `file_editor_plus/frontend/package.json`
  - `file_editor_plus/backend/` (tooling)
  - `.github/workflows/` (se esiste pipeline PR) (optional)
- Changes:
  - Definire comandi ufficiali per lint/typecheck (frontend e backend) senza introdurre tooling non richiesto.
  - Documentare nel runbook.
- Commands:
  - <<REQUIRED>>
- Acceptance criteria:
  - Esistono script ufficiali (package.json/Makefile/workflow) e sono documentati.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-005 + audit tecnico (mancanza comandi ufficiali).

### STEP 004 - Documentare setup dev e uso add-on (Ingress, mount /config)
- Status: DONE
- Goal: Rendere replicabile onboarding e troubleshooting.
- Scope:
  - Documentazione (README/docs)
- Changes:
  - (Gia' fatto nel legacy secondo epic "documentation_base" e "documentation_i18n".)
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - Docs utente presenti e servite localmente (no CDN runtime).
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-006 (legacy marked todo) + `AI_old/Knowledge.yaml` epics documentation_* marked completed (potenziale conflitto di stato).

### STEP 005 - Valutare retention/cleanup backup (/config/.fep-backups)
- Status: TODO
- Goal: Prevenire crescita incontrollata backup in ambienti HA reali.
- Scope:
  - `file_editor_plus/backend/app.py` (backup)
  - Documentazione (policy retention)
- Changes:
  - Definire strategia retention (es. max N per file / max size / pruning manuale).
  - Implementare (se richiesto) endpoint/tooling e UI/setting.
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - Esiste policy retention documentata; se implementata, pruning verificabile.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-007.

### STEP 006 - Migliorare messaggi errore UI operazioni file (UX)
- Status: TODO
- Goal: Rendere l'app usabile senza "stato mock" o errori silenziosi.
- Scope:
  - Frontend: operazioni file (upload/move/copy/delete/save)
- Changes:
  - Uniformare toast/error handling per errori API e edge case.
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - Errori API mostrano messaggi chiari; nessun successo falso.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/knowledge.yaml` TODO-008.

### STEP 007 - Hardening log: rimuovere token_prefix dai log
- Status: TODO
- Goal: Ridurre rischio leakage credenziali nei log del container.
- Scope:
  - `file_editor_plus/backend/app.py` (logging HA proxy)
- Changes:
  - Rimuovere/mascherare `token_prefix` e qualsiasi riferimento a token nei log info/warn.
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - Log non contengono token o prefissi token.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/application_audit/FILE_EDITOR_PLUS_AUDIT.md` (rischio medium).

### STEP 008 - Aggiungere header di sicurezza minimi (defense-in-depth)
- Status: TODO
- Goal: Hardening HTTP base lato backend (senza rompere Ingress).
- Scope:
  - `file_editor_plus/backend/app.py` (middleware/headers)
- Changes:
  - Aggiungere header minimi suggeriti dall'audit (X-Content-Type-Options, Referrer-Policy, CSP base) se compatibili.
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - `curl -I` su root e API mostra headers attesi (senza leak e senza bloccare assets).
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/application_audit/FILE_EDITOR_PLUS_AUDIT.md` quick wins.

### STEP 009 - Stabilizzare test backend: allineare failing test traversal
- Status: TODO
- Goal: Suite backend tutta verde.
- Scope:
  - `file_editor_plus/backend/test_search_replace.py`
  - `file_editor_plus/backend/app.py` (solo se necessario per semantica errori)
- Changes:
  - Allineare aspettativa test con comportamento API o viceversa, senza regredire sicurezza safe_path.
- Commands:
  - <<REQUIRED>>
- Acceptance criteria:
  - Test backend passano 100%.
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - Fonte: `AI_old/application_audit/FILE_EDITOR_PLUS_AUDIT.md` (1 failing test).
