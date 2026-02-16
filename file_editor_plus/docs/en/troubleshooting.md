# Troubleshooting

Quando qualcosa non va, usa questa pagina come checklist rapida.

## Non vedo le icone
- Ricarica la pagina una volta.
- Controlla che la build frontend sia aggiornata.
- Se sei in Ingress, prova a chiudere e riaprire la tab.

## Il testo sembra sparire su file lunghi
- Verifica di avere l'ultima versione dell'add-on.
- Prova a cambiare tab e tornare al file.
- Se succede ancora, raccogli log e segnala il file coinvolto.

## Reload YAML parte ma non cambia nulla
- Controlla se il file modificato è davvero ricaricabile con reload.
- Verifica eventuali errori YAML.
- Se serve, usa Restart Core.

## Dove guardare i log
- Log add-on:
```bash
docker exec hassio_cli ha apps logs local_file_editor_plus --follow
```
- Log Supervisor:
```bash
docker exec hassio_cli ha supervisor logs -n 220
```

## Cosa allegare quando segnali un problema
- Versione add-on
- Azione fatta (passi esatti)
- Messaggio errore visto in UI
- Estratto log (senza dati sensibili)
