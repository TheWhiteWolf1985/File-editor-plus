# AI_STEPS — Fix UX Google Drive (Home Assistant Add-on)

Data: 2026-02-19
Target: `ha-file-editor-plus`

Obiettivo: sistemare **solo** le modifiche richieste lato **Backup → Cloud (Google Drive)**:

1. Spiegazione chiara su dove trovare `gdrive_client_id`.
2. Se `gdrive_client_id` manca: click su **Connetti** deve mostrare **toast** con istruzioni (niente silenzio).
3. Modale più grande e meglio organizzata.
4. Schedulazione con opzioni: **oraria / giornaliera / settimanale / mensile**.

Vincoli add-on:

- Niente URL assoluti (rispettare Ingress).
- Niente nuove dipendenze senza motivazione.

---

## STEP 001 — Documentazione: spiegare `gdrive_client_id` (dove ottenerlo)

- Status: TODO
- Scopo: evitare che l’utente debba “indovinare” cosa incollare nella configurazione add-on.
- Cosa fare:
  - Individuare dove vive la doc dell’add-on (README / DOCS / docs/).
  - Aggiungere sezione: **“Google Drive: come ottenere gdrive_client_id”** con passi ad alto livello:
    - creare progetto Google Cloud
    - abilitare Google Drive API
    - creare credenziali OAuth Client ID per app installata
    - copiare il Client ID e incollarlo nelle opzioni add-on
    - salvare e **riavviare** l’add-on

  - Se lo schema opzioni dell’add-on supporta descrizioni/help text, aggiungere un breve hint vicino al campo.

- Comandi utili:
  - `rg -n -S "gdrive_client_id" .`
  - `rg -n -S "DOCS|README|Documentation" .`

- Done quando:
  - Esiste un punto “ovvio” (Documentation tab) che spiega cosa sia `gdrive_client_id` e dove trovarlo.

---

## STEP 002 — UX: toast su Connetti quando manca `gdrive_client_id`

- Status: TODO
- Scopo: nessun click “muto”.
- Cosa fare:
  - Nel component della modale Cloud:
    - se `configured === false` (o manca `gdrive_client_id`), al click su **Connetti** mostrare toast con testo chiaro:
      - “Manca gdrive_client_id nelle opzioni add-on. Vai in Configurazione add-on, incolla il Client ID, salva e riavvia l’add-on.”

    - (opzionale) disabilitare anche il bottone Connetti, ma lasciare comunque una CTA/tooltip (il toast deve comunque esistere se cliccabile).

  - Verificare che gli errori di rete/endpoint mostrino toast (no `catch` silenziosi).

- Comandi utili:
  - `rg -n -S "toast|Snackbar|Notification" file_editor_plus/frontend/src`
  - `rg -n -S "device/start|gdrive" file_editor_plus/frontend/src`

- Done quando:
  - Con `gdrive_client_id` mancante: il toast compare sempre e l’utente capisce cosa fare.

---

## STEP 003 — UI: modale Cloud più grande e meglio impaginata

- Status: TODO
- Scopo: rendere leggibile e “non claustrofobica” la modale.
- Cosa fare:
  - Aumentare max-width su desktop e rendere responsive.
  - Separare in sezioni chiare (cards/fieldset):
    - Stato
    - Connessione
    - Backup manuale
    - Schedulazione

  - Aggiungere un box “Come ottenere gdrive_client_id” che rimanda alla doc (STEP 001).

- Done quando:
  - La modale non taglia contenuti e i blocchi sono leggibili senza scroll inutili.

---

## STEP 004 — Scheduling: oraria/giornaliera/settimanale/mensile (FE + BE)

- Status: TODO
- Scopo: schedulazione completa e configurabile.

### FE

- Aggiungere dropdown modalità: **Oraria / Giornaliera / Settimanale / Mensile**.
- Campi dinamici:
  - Oraria: intervallo N ore (1..24)
  - Giornaliera: HH:MM
  - Settimanale: giorno settimana + HH:MM
  - Mensile: giorno del mese (1..28) + HH:MM

- Retention (solo auto): numero backup da mantenere.

### BE

- Estendere il payload schedule per supportare:
  - `mode: hourly|daily|weekly|monthly`
  - `hour_interval` (hourly)
  - `at_time` (daily/weekly/monthly)
  - `weekday` (weekly)
  - `monthday` (monthly, 1..28)
  - `retention_count`

- Calcolare e restituire `next_run`.

- Applicare retention **solo** ai backup automatici.

- Comandi utili:
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - `cd file_editor_plus/frontend && npm run -s build`
  - `rg -n -S "schedule|next_run" file_editor_plus/backend file_editor_plus/frontend/src`

- Done quando:
  - UI salva la schedule in tutte le modalità.
  - `GET schedule` ritorna config + `next_run`.
  - Retention si applica solo agli auto-backup.

---

## STEP 005 — Smoke test (Ingress + UX)

- Status: TODO
- Scopo: validare comportamento reale in HA.
- Checklist:
  - Ingress OK (niente 404 assets, niente URL assoluti).
  - `gdrive_client_id` mancante → toast su Connetti + istruzioni.
  - `gdrive_client_id` presente → Connetti avvia device flow (codice + link visibili).
  - Schedule: tutte le modalità selezionabili e persistenti.

- Done quando:
  - Nessun errore console bloccante e UX coerente.
