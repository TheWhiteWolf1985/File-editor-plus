# EXAMPLE_PRD_from_workflow

Scopo: mostrare come mappare un documento operativo generico in `AI_PRD`.

## Documento operativo di partenza (estratto semplificato)
- Trigger: quando arriva una richiesta valida, avviare un processo di verifica.
- Validazione: controllare presenza campi obbligatori e formato.
- Output: generare esito con stato `OK` o `ERROR`.
- Monitoraggio: registrare evento di successo/errore.

## Mapping in sezioni PRD

### Overview
- Problema: gestione richiesta non uniforme.
- Obiettivo: standardizzare il flusso di verifica e risposta.

### Personas
- Operatore che invia richiesta.
- Team tecnico che monitora errori.

### Backend/Domain
- Regola dominio: una richiesta incompleta non entra nel processo.

### API contracts
- Input: payload con campi obbligatori.
- Output: stato e messaggio sintetico.

### Error handling
- Errore validazione: risposta controllata e log tecnico.

### Observability
- Evento `request_processed` con esito e timestamp.

### Test plan
- Caso valido: stato `OK`.
- Caso invalido: stato `ERROR` con motivazione.

Nota: questo esempio e' intenzionalmente stack-agnostic.
