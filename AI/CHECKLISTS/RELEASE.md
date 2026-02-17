# RELEASE.md

Checklist pre-release:
- [ ] Scope di release confermato con PRD e tasks.
- [ ] Tutti gli step in `AI_TASKS.md` sono `DONE`.
- [ ] Build di release completata con esito positivo.
- [ ] Lint/format completati senza errori bloccanti.
- [ ] Test unitari verdi.
- [ ] Test integrazione/e2e verdi (o motivati N/A).
- [ ] Migrazioni DB validate (up/down) o N/A.
- [ ] Compatibilita backward verificata.
- [ ] Logging/observability verificati su scenari principali.
- [ ] Security check base completato (secret, input validation, policy).
- [ ] Documentazione aggiornata (`RUNBOOK`, `DECISIONS`, `KNOWLEDGE`).
- [ ] Piano rollback definito e testato almeno a tavolino.
- [ ] Versione/tag e note rilascio preparate.
- [ ] Audit finale pronto (no diff, comandi, file, rischi).
