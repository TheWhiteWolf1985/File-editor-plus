# SMOKE.md

Checklist smoke post-change:
- Data: 2026-02-21

- [ ] Workspace apre senza errori bloccanti. (N/A: non eseguita verifica UI manuale in questo giro)
- [x] File toccati salvati con encoding coerente (utf-8).
- [x] Nessun segreto reale presente nei file modificati.
- [x] Comando dev principale eseguibile o marcato N/A. (vedi `AI/AI_RUNBOOK.md`)
- [x] Build principale eseguita. (FE: `cd file_editor_plus/frontend && npm ci && npm run build`)
- [x] Test rapidi principali eseguiti. (BE: unittest via Docker; vedi `AI/AI_RUNBOOK.md`)
- [x] Log base senza errori inattesi al boot. (Add-on rebuild+restart; `docker logs --tail 80 addon_local_file_editor_plus`)
- [ ] Flusso critico 1 verificato manualmente. (N/A: richiede UI in Ingress)
- [ ] Flusso critico 2 verificato manualmente. (N/A: richiede UI in Ingress)
- [x] Aggiornati `AI_TASKS.md` e `KNOWLEDGE.yaml`.
