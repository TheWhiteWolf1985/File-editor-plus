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
- Snippets e impostazioni UI: `/config/.fep-config/`

## Cloud Backup su Google Drive (OAuth)

La connessione Google Drive usa OAuth Authorization Code (popup Google ufficiale "Scegli account").

### Configurazione opzioni add-on

Nel `config.yaml` dell'add-on sono disponibili queste opzioni:
- `gdrive_client_id` (opzionale)
- `gdrive_client_secret` (opzionale)
- `gdrive_redirect_uri` (opzionale)

Se `gdrive_client_id` non e' impostato nelle opzioni, il backend prova fallback da variabili ambiente:
- `GDRIVE_OAUTH_CLIENT_ID_DEFAULT` / `DEFAULT_GDRIVE_OAUTH_CLIENT_ID`
- `GDRIVE_OAUTH_CLIENT_SECRET_DEFAULT` / `DEFAULT_GDRIVE_OAUTH_CLIENT_SECRET`

### Flow di connessione

1. Apri `Backup -> Cloud` e clicca `Connetti`.
2. Si apre popup Google con account chooser.
3. Dopo il consenso, il callback salva i token e la UI passa a `Connesso`.
4. Se popup bloccato o OAuth non disponibile, viene usato fallback Device Flow.

### Troubleshooting rapido

- Popup non si apre: verifica blocco popup del browser e riprova.
- Errore redirect URI mismatch: imposta `gdrive_redirect_uri` coerente con URL Ingress dell'add-on.
- Stato non passa a `Connesso`: controlla log backend/supervisor e opzioni OAuth.

### Redirect OAuth e Ingress (callback raggiungibile)

Per Home Assistant Ingress, non usare callback con token ingress dinamico.
Usa una redirect URI stabile e raggiungibile:

- Opzione 1 (consigliata): imposta `public_base_url` nelle opzioni add-on e registra su Google:
  - `<public_base_url>/api/cloud/gdrive/oauth/callback`
- Opzione 2: usa `gdrive_redirect_override` con URI completa.
- Opzione 3: fallback host+porta add-on:
  - `https://<host>:<addon_callback_port>/api/cloud/gdrive/oauth/callback` (default porta `8099`)

Nota:
- Se la callback non è raggiungibile dall'esterno, Google completerà il login ma il callback può finire in `404`.

## Supporto

Apri un issue sul repo con:

- versione add-on
- descrizione passo-passo
- eventuali log
