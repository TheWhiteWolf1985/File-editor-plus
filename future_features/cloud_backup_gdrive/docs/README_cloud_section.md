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
2. Copia la `Redirect URI da registrare` mostrata nella modale.
3. Registra la URI in Google Cloud Console (`Authorized redirect URIs`).
4. Si apre popup Google con account chooser.
3. Dopo il consenso, il callback salva i token e la UI passa a `Connesso`.
4. Se popup bloccato o OAuth non disponibile, viene usato fallback Device Flow.

### Dove prendere la redirect URI corretta

- La sorgente corretta e' la response di `GET /api/cloud/gdrive/oauth/start`.
- La UI la mostra nel box `Redirect URI da registrare`.
- Modalita' (`mode`) possibili:
  - `override` (usa `gdrive_redirect_override`)
  - `public_base_url` (usa `public_base_url`)
  - `ingress_port` (usa host senza token ingress + `addon_callback_port`)
  - `direct` (fallback host diretto)

### Troubleshooting rapido

- Popup non si apre: verifica blocco popup del browser e riprova.
- Errore redirect URI mismatch: imposta `gdrive_redirect_uri` coerente con URL Ingress dell'add-on.
- Stato non passa a `Connesso`: controlla log backend/supervisor e opzioni OAuth.

| Errore | Causa tipica | Azione |
|---|---|---|
| `400 redirect_uri_mismatch` | URI non identica a quella registrata su Google | Copia la URI mostrata in UI e registrala identica |
| `404 callback` | URI registrata ma callback non raggiunge l'add-on | Configura `public_base_url` o `gdrive_redirect_override` con endpoint raggiungibile |

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
