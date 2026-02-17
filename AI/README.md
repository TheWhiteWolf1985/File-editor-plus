# AI Kit Repository

Questo repository contiene una cartella `AI/` pronta da copiare in qualunque progetto.
Flusso ufficiale: si copia `AI/` dentro la repo target e si compila/modifica tutto direttamente li'.

## Cos'e' questo repo
- Kit operativo per guidare esecuzione AI con regole chiare e auditabile.
- Non include logiche applicative specifiche di stack.
- Evita assunzioni implicite con documenti source-of-truth.

## Come iniziare in un nuovo progetto
1. Copia la cartella `AI/` nel root del progetto target.
2. Compila i file base:
   - `AI/AI_PROJECT.md`
   - `AI/AI_PRD.md`
   - `AI/AI_RUNBOOK.md`
   - `AI/AI_CONVENTIONS.md`
   - `AI/AI_INVENTORY.md`
   - `AI/METADATA.yaml`
3. Scrivi o aggiorna `AI/AI_TASKS.md` con step verificabili.
4. Esegui Codex con prompt unico orientato ad `AI/AI_TASKS.md`.
5. Aggiorna `AI/KNOWLEDGE.yaml` e chiudi con audit finale.

## Ordine Source of Truth
In caso di conflitto, usa questo ordine:
1. `AI/AI_PROJECT.md`
2. `AI/AI_PRD.md`
3. `AI/AI_CONVENTIONS.md`
4. `AI/AI_RUNBOOK.md`
5. `AI/AI_INVENTORY.md`
6. `AI/AI_TASKS.md`
7. `AI/KNOWLEDGE.yaml` e `AI/DECISIONS.md`

## Come scrivere uno step in AI_TASKS
```md
### STEP 001 - <<REQUIRED>>
- Status: TODO
- Goal: <<REQUIRED>>
- Scope: <<REQUIRED>>
- Changes:
  - <<REQUIRED>>
- Commands:
  - <<OPTIONAL>>
- Acceptance criteria:
  - <<REQUIRED>>
- Commit message:
  - "<<REQUIRED>>"
- Blockers/Notes:
  - <<OPTIONAL>>
```

Regole:
- `Status` ammessi: `TODO`, `DOING`, `DONE`.
- Ogni step deve essere verificabile.
- Se la commit message e' definita nello step, va usata identica.

## Quando aggiornare KNOWLEDGE e DECISIONS
Aggiorna `AI/KNOWLEDGE.yaml`:
- dopo ogni step completato,
- quando cambiano entita' o relazioni importanti,
- quando emergono rischi tecnici da tracciare.

Aggiorna `AI/DECISIONS.md`:
- quando prendi una decisione non ovvia,
- quando c'e' trade-off tecnico con impatto su manutenzione/rischio.

## Prompt unico per esecuzione AI_TASKS
```text
Sei Codex con accesso lettura/scrittura alla repo e shell.
Leggi prima AI/AI_PROJECT.md e AI/KNOWLEDGE.yaml.
Esegui tutti gli step in AI/AI_TASKS.md in ordine.
Per ogni step: aggiorna Status, applica modifiche minime necessarie, esegui i comandi indicati se presenti,
aggiorna AI/KNOWLEDGE.yaml (entita, relazioni, changes_log) e AI/DECISIONS.md quando serve.
Alla fine produci audit finale senza diff con stato, checklist step, file modificati, comandi eseguiti, rischi residui e commit creati.
```

## Audit finale richiesto
Formato senza diff:
- Stato finale (`COMPLETATO` o `PRONTO PER CHIUSURA`)
- Checklist step con esito
- File modificati (solo percorsi)
- Comandi eseguiti
- Commit creati (hash breve + messaggio)
- Rischi residui e verifiche manuali

## Anti-pattern da evitare
- Invenzioni su API/schema/flow non documentati.
- Step senza acceptance criteria misurabili.
- Modifiche ampie non richieste.
- Mancato aggiornamento di `AI/KNOWLEDGE.yaml` e audit.
- Inserimento di segreti reali.

## Struttura AI/ (solo contenuti reali)

### File principali
- `AI/README.md`
- `AI/METADATA.yaml`
- `AI/AI_PROJECT.md`
- `AI/AI_PRD.md`
- `AI/AI_TASKS.md`
- `AI/AI_RUNBOOK.md`
- `AI/AI_CONVENTIONS.md`
- `AI/AI_INVENTORY.md`
- `AI/DECISIONS.md`
- `AI/KNOWLEDGE.yaml`

### Cartelle operative
- `AI/CHECKLISTS/SMOKE.md`
- `AI/CHECKLISTS/RELEASE.md`
- `AI/SCHEMAS/knowledge.schema.json`
- `AI/SCHEMAS/tasks.schema.json`
- `AI/EXAMPLES/EXAMPLE_PRD_from_workflow.md`
- `AI/EXAMPLES/EXAMPLE_AI_TASKS.md`

## Versioning kit
- Versione in `AI/METADATA.yaml` (`ai_kit_version`).
- Ogni cambio strutturale va tracciato in `AI/KNOWLEDGE.yaml` e, se decisionale, in `AI/DECISIONS.md`.
