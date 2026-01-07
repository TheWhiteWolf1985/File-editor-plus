# File Editor Plus

Add-on per Home Assistant per editare i file sotto `/config` via ingress.
Questa build e pensata per beta tester.

## Funzioni principali

- Explorer file e cartelle di `/config`
- Editor con evidenziazione YAML e numeri di riga
- Auto-indent e comando "Indent file..." (formatter YAML via backend)
- Entita Home Assistant in tempo reale (menu Entity)
- Snippets: crea/modifica/cancella/inserisci
- Search & Replace multi-file (MVP)
- Split view + Compare (beta)
- Settings: tema, auto-indent, dimensione font
- Autocomplete MDI: suggerimenti icone con nome (mdi:)

## Installazione (custom repo)

1. Home Assistant -> Add-on Store -> menu (⋮) -> Repositories
2. Aggiungi l'URL del repo GitHub
3. Installa l'add-on "File Editor Plus"
4. Avvia e apri tramite Ingress

## Utilizzo rapido

- Apri un file dall'Explorer e salva con "Save".
- Per formattare tutto il file: "Indent file...".
- Snippets: usa "Add snippet" e il pulsante di inserimento.
- Settings -> Aspetto: regola il font e premi Apply.

## Dati e persistenza

- File utente: `/config`
- Backup automatici: `/config/.fep-backups`
- Snippets: `/config/.fep-snippets/snippets.json`
- Impostazioni UI: `backend/user_config.json` (contenitore add-on)

## Supporto

Apri un issue sul repo con:

- versione add-on
- descrizione passo-passo
- eventuali log
