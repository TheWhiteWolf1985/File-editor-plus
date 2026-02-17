# AI_PROJECT — ha-file-editor-plus

## Scope
- Obiettivo principale: fornire un add-on Home Assistant per editare file sotto `/config` via Ingress, con backend FastAPI e frontend Lit.
- Ambito incluso:
  - UI editor + explorer per file/cartelle di `/config`.
  - API backend per lettura/scrittura file con guardrail path, backup e write atomiche.
  - Integrazione Home Assistant via Supervisor (states + websocket + azioni allowlisted).
  - Documentazione utente in Markdown servita localmente (no risorse esterne runtime).

Esempio:
- Obiettivo principale: "Ridurre errori operativi nella gestione task AI."

## Non-goals
- Fuori scope:
  - Modificare percorsi fuori da `/config`.
  - Dipendere da CDN o fetch runtime verso internet.
  - Implementare auth applicativa separata da Home Assistant Ingress (se richiesta, va specificata).

Esempio:
- Fuori scope: "Migrazione completa stack o redesign UI globale."

## Vincoli
- Modifiche minime necessarie.
- Nessuna nuova dipendenza senza richiesta esplicita.
- Nessun segreto reale nei file del repository.
- Vincoli progetto specifici:
  - Add-on con privilegi elevati (`hassio_role: admin`) e accesso Supervisor: evitare superfici d'attacco inutili.
  - Ingress/base path: URL devono essere costruiti in modo relativo e robusto (no path assoluti fragili).
  - Documentazione: Markdown per lingua in `file_editor_plus/docs/<lang>/<page>.md`.

## DoD
- Requisiti soddisfatti con evidenza verificabile.
- Documenti AI aggiornati (`AI_TASKS`, `KNOWLEDGE`, `DECISIONS` quando serve).
- Audit finale prodotto senza diff.

## Quality gates
- Build:
  - Frontend: `cd file_editor_plus/frontend && npm ci && npm run build`.
- Lint/Format: <<OPTIONAL>> (non documentati nel repo in modo certo).
- Unit test:
  - Backend: test files presenti in `file_editor_plus/backend/test_*.py` (runner esatto: N/A, da definire in STEP 002).
- Integration/E2E: <<OPTIONAL>>

## Sicurezza e Privacy
- Dati sensibili coinvolti:
  - Contenuti dei file sotto `/config` (configurazione Home Assistant).
  - Token Supervisor (`SUPERVISOR_TOKEN`) usato per chiamare API core/supervisor.
- Gestione secret:
  - Non loggare token/secret.
  - Non persistere token nel frontend.
  - In caso di errori, ritornare messaggi user-friendly senza leak (dettagli tecnici solo in log, senza segreti).
- Regole data handling: <<OPTIONAL>>

## Logging e Observability
- Logging standard: log backend FastAPI/uvicorn (nessun token in log).
- Metriche minime: <<OPTIONAL>>
- Alerting/tracing: <<OPTIONAL>>
