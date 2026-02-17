# File e cartelle

Qui trovi le operazioni base su file/cartelle.

## Creare file o cartelle
- Dal menu **File** puoi avviare la creazione di:
  - nuovo file
  - nuova cartella
- In Explorer trovi anche azioni rapide dedicate.

## Upload e download
- L'upload è disponibile nell'interfaccia Explorer.
- Per esportazioni/backup, usa le azioni dedicate dove disponibili.

## Backup automatici
- Alcune operazioni (es. replace) possono creare copie dei file modificati in `/config/.fep-backups/`.
- Retention: per ogni file vengono mantenuti gli ultimi N backup (default 50).
- Puoi cambiare N impostando la variabile ambiente `FEP_BACKUP_KEEP_LAST` (0 disabilita il pruning).

## Consigli pratici sui nomi
- Usa nomi chiari e prevedibili (`automation_luci.yaml`, `script_backup.yaml`).
- Evita spazi strani o caratteri non necessari.

## Limiti e attenzione
- I path sono relativi a `/config`.
- Operazioni distruttive (sposta/elimina) chiedono conferma in UI quando previsto.
- Se sposti file usati da Home Assistant, verifica poi che i riferimenti siano ancora corretti.
