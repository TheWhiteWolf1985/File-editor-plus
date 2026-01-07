# AI / agents.md — Regole operative per Codex

## Regola zero: niente magia

- Se manca un file o un dato, NON inventare: cercalo nel repo.
- Se qualcosa è ambiguo, proponi 2-3 ipotesi e scegli la più conservativa.

## Priorità dei documenti

1. Questo file: AI/agents.md (workflow + regole)
2. AI/knowledge.yaml (memoria estesa e stato del progetto)
3. README / AI_PROJECT.md / docs del repo
4. Codice sorgente

## Workflow obbligatorio (sempre)

1. Leggi AI/knowledge.yaml prima di proporre modifiche.
2. Descrivi il piano in 5-10 righe (massimo) e indica i file toccati.
3. Applica patch piccole e isolate (una feature/bugfix per patch).
4. Dopo ogni patch:
   - aggiorna AI/knowledge.yaml (sezione "log" + eventuali campi impattati)
   - lascia note su cosa è cambiato e perché
   - aggiorna all'interno del file config.yaml e app-root.ts la proprietà/costante "Version"/"appVersion" incrementando l'ultimo numero a destra (Es. 0.0.x) aumentando sempre di 1 a ogni ricostruzione dell'app
   - ricostruisci l'app e riavviala così che sia visibile con un semplice Hard Reset su chrome (ctrl+shift+R)
5. Mai cambiare stile, naming o architettura “per gusto personale” senza motivo.

## Sicurezza & affidabilità

- Non abilitare network access.
- Non eseguire comandi distruttivi (rm, wipe, format, ecc.).
- Non eseguire revert/rollback (git checkout/reset/revert o simili) senza approvazione esplicita dell’utente.
- Preferisci comandi read-only (ls, cat, rg, git status) e chiedi approvazione per tutto il resto.
- Non scrivere fuori dal workspace.

## Output richiesto

- Patch con percorsi file chiari.
- Sempre includere "come verificare" (test/commandi) quando ha senso.

## Memoria estesa

- AI/knowledge.yaml è la _sola_ memoria persistente: aggiornala con disciplina.
- Non mettere segreti in knowledge.yaml.
