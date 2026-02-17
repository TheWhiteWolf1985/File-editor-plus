# RELEASE.md

Checklist pre-release:
- [ ] Scope di release confermato con PRD e tasks. (N/A: non e' un rilascio formale, solo chiusura tasks)
- [x] Tutti gli step in `AI_TASKS.md` sono `DONE`.
- [x] Build di release completata con esito positivo. (FE build OK)
- [ ] Lint/format completati senza errori bloccanti. (N/A: lint non configurato; typecheck FE non ancora green)
- [x] Test unitari verdi. (BE unittest via Docker)
- [ ] Test integrazione/e2e verdi (o motivati N/A). (N/A)
- [ ] Migrazioni DB validate (up/down) o N/A. (N/A: no DB)
- [ ] Compatibilita backward verificata. (N/A: non eseguita verifica manuale Ingress)
- [ ] Logging/observability verificati su scenari principali. (N/A)
- [x] Security check base completato (secret, input validation, policy). (minimo: no token in log + security headers baseline)
- [x] Documentazione aggiornata (`RUNBOOK`, `DECISIONS`, `KNOWLEDGE`).
- [ ] Piano rollback definito e testato almeno a tavolino. (N/A)
- [ ] Versione/tag e note rilascio preparate. (N/A)
- [x] Audit finale pronto (no diff, comandi, file, rischi).
