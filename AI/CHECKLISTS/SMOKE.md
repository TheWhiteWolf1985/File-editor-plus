# SMOKE.md

Checklist smoke post-change:
- [ ] Workspace apre senza errori bloccanti. (N/A: non eseguita verifica UI manuale in questo giro)
- [x] File toccati salvati con encoding coerente (utf-8).
- [x] Nessun segreto reale presente nei file modificati.
- [x] Comando dev principale eseguibile o marcato N/A. (vedi `AI/AI_RUNBOOK.md`)
- [x] Build principale eseguibile o marcata N/A. (FE: `npm ci && npm run -s build`)
- [x] Test rapidi principali eseguibili o marcati N/A. (BE: unittest via Docker; vedi `AI/AI_RUNBOOK.md`)
- [ ] Log base senza errori inattesi al boot. (N/A: non avviato add-on in questo giro)
- [ ] Flusso critico 1 verificato manualmente. (N/A)
- [ ] Flusso critico 2 verificato manualmente. (N/A)
- [x] Aggiornati `AI_TASKS.md` e `KNOWLEDGE.yaml`.
