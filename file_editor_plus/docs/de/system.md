# Sistema

⚠️ Queste azioni possono impattare Home Assistant. Usale con attenzione.

## Reload YAML
- Prova a ricaricare configurazioni YAML supportate.
- In base alla versione/ambiente HA, può usare strategie diverse di reload.
- Se il reload non basta, potrebbe servire un riavvio del Core.

## Restart Core
- Riavvia Home Assistant Core.
- Durante il riavvio puoi perdere la connessione temporaneamente.

## Restart Supervisor
- Riavvia il Supervisor (gestione add-on).
- Anche qui è normale vedere una breve disconnessione.

## Reboot Host
- Riavvia l'host/sistema operativo.
- Impatta tutti i servizi in esecuzione.

## Shutdown Host
- Spegne l'host/sistema operativo.
- Da usare solo se sai come riaccendere il sistema.

## Prerequisiti
- L'add-on deve avere accesso al contesto Supervisor.
- Se mancano token/permessi, vedrai un errore esplicito in UI.
