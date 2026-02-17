# AI_PRD — File Editor Plus (Home Assistant add-on)

## Overview
- Problema: serve un editor avanzato per gestire file YAML e testo sotto `/config` direttamente da Home Assistant via Ingress.
- Obiettivo: fornire un'esperienza editor (tab, explorer, search, snippets, compare) con API backend sicure (safe_path, backup, write atomica) e integrazione Supervisor dove necessario.
- KPI/Success criteria: <<OPTIONAL>>

Esempio:
- Obiettivo: "Uniformare processo di delivery AI-driven con audit ripetibile."

## Personas
- Persona primaria: utente Home Assistant (beta tester/power user) che modifica configurazioni YAML sotto `/config`.
- Persona secondaria: <<OPTIONAL>>

## UX/Frontend
- Flusso utente: apri file dall'Explorer -> modifica in editor -> salva/formatta -> (opzionale) usa search/snippets/compare.
- Stati principali (loading/empty/error/success): loading tree/file, empty editor (nessun file aperto), error toast, success toast/status.

## Backend/Domain
- Componenti dominio coinvolti:
  - Filesystem `/config` (lettura/scrittura/backup).
  - Supervisor/Core API per entita' e azioni allowlisted.
- Regole dominio:
  - Path sempre relativo a `/config`, blocco traversal e assoluti.
  - Write file con backup e sostituzione atomica.

## API contracts
- Endpoint/azioni coinvolte: `file_editor_plus/backend/app.py` (FS, session, user-config, HA proxy, docs viewer).
- Request/Response attese: <<OPTIONAL>> (vedi inventario API in `AI/AI_INVENTORY.md`).
- Error handling API:
  - evitare `500` generici per casi attesi (permessi/ambiente supervisor non disponibile) quando possibile.

## Data model
- Entita principali: file sotto `/config`, sessione UI e impostazioni UI sotto `/config/.fep-config`.
- Tabelle/collezioni: N/A (filesystem-based).
- Migrazioni: <<OPTIONAL>>

## Error handling
- Errori attesi: YAML invalido, permessi HA/Supervisor insufficienti, rete/timeout verso supervisor/core, conflitti upload/move.
- Strategie fallback/retry: fallback robusti lato viewer docs e lato action reload (vedi knowledge).

## Observability
- Log richiesti: <<OPTIONAL>>
- Metriche/eventi: <<OPTIONAL>>

## Performance/Security
- Vincoli performance: file grandi e UI scroll/overlay devono restare stabili in Ingress.
- Vincoli sicurezza:
  - Least privilege (rischio alto se ruolo admin non necessario).
  - Hardening HTTP (CSP/security headers) non definibile con certezza solo dal repo runtime (da verificare in HA).

## Test plan
- Unit: backend test files presenti (`file_editor_plus/backend/test_*.py`).
- Integration/E2E: <<OPTIONAL>>
- Smoke manuale:
  - load Ingress sotto path prefix
  - CRUD file e verifica backup
  - entities websocket
  - docs multilingua
  - comandi Sistema (reload/restart) con esiti reali

## Rollout
- Strategia rilascio: <<OPTIONAL>>
- Piano rollback: <<OPTIONAL>>
