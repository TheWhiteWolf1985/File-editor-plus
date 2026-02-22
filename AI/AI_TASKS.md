# AI_TASKS — Fix OAuth Redirect URI con Home Assistant Ingress (1.0.0)

> Problema: con Home Assistant **Ingress** l’URL contiene un prefisso **dinamico** (`/api/hassio_ingress/<token>/...`).
> Google OAuth richiede che `redirect_uri` sia **identica** a una URI autorizzata in Google Cloud Console (niente wildcard sul token).
> Risultato attuale: rimbalzo **400 (redirect_uri_mismatch)** ↔ **404 (callback fuori routing add-on)**.

---

## STEP 001 — Stabilire la regola d’oro della redirect URI

- Status: DONE
- Goal: Definire _una_ redirect URI stabile e registrabile, che arrivi sempre al backend.
- Decisione (target):
  - Se UI gira via **Ingress** → **NON** usare mai la redirect con token ingress.
  - Usare invece una redirect **stabile “fuori ingress”** (es. porta esposta dell’add-on) oppure un URL pubblico (reverse proxy/Nabu Casa).

- Output atteso:
  - Un’unica `redirect_uri` consigliata + documentata.

- Acceptance criteria:
  - La redirect URI non contiene mai `/api/hassio_ingress/<token>/`.

- Commit message:
  - `first commit`

- What changed:
  - Formalizzata regola redirect URI stabile con ADR dedicata.
  - Bloccato l’uso della redirect tokenizzata Ingress come regola di progetto.
  - Chiarito obiettivo operativo: URI registrabile e sempre raggiungibile dal backend.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/DECISIONS.md`
  - `AI/KNOWLEDGE.yaml`

- Commands run:
  - `cd file_editor_plus/frontend && npm run build`
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`

---

## STEP 002 — Aggiungere configurazione esplicita per redirect base (pubblica) + porta addon

- Status: DONE
- Goal: Rendere controllabile (e stabile) la base URL usata per il callback.
- Changes:
  - Aggiungere (o validare) config/env:
    - `public_base_url` (es. `https://mio-dominio.duckdns.org` o `https://homeassistant.local`)
    - `addon_callback_port` (default `8099` se usate quella)
    - `gdrive_redirect_override` (opzionale: redirect_uri completa, se l’utente vuole hardcodarla)

- Acceptance criteria:
  - Backend riesce a scegliere una redirect URI stabile senza indovinare dall’Ingress path.

- Commit message:
  - `feat(config): add public_base_url and stable oauth redirect options`

- What changed:
  - Estese opzioni add-on con `public_base_url`, `addon_callback_port` e `gdrive_redirect_override`.
  - Esteso resolver backend OAuth per leggere i nuovi parametri da options con fallback env.
  - Aggiunti metadati `*_source` e valore porta callback normalizzato (`1..65535`) nel resolver.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/config.yaml`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 003 — Backend: riscrivere la logica di calcolo redirect_uri (Ingress-safe)

- Status: DONE
- Goal: Eliminare la generazione di redirect “ingress-aware” con token.
- Changes (algoritmo consigliato, in ordine di priorità):
  1. Se `gdrive_redirect_override` è settata → usa quella.
  2. Se `public_base_url` è settata → `redirect_uri = public_base_url + /api/cloud/gdrive/oauth/callback`
  3. Altrimenti, se request arriva da Ingress (header `x-ingress-path` / `x-forwarded-prefix` presente):
     - calcola `host` (senza porta) da `x-forwarded-host`/`host`
     - usa `https://<host>:<addon_callback_port>/api/cloud/gdrive/oauth/callback`
     - **mai** includere ingress_path.

  4. Se non Ingress:
     - usa `proto://host/api/cloud/gdrive/oauth/callback` (come fallback).

- Acceptance criteria:
  - In presenza di Ingress, la redirect URI non contiene token ingress e punta a endpoint stabile.

- Commit message:
  - `fix(gdrive): make oauth redirect_uri stable under ingress`

- Notes:
  - Se usate PKCE, non cambia nulla qui: PKCE resta identico.

- What changed:
  - Implementato resolver stabile `override -> public_base_url -> ingress_port -> direct`.
  - In modalità ingress, il callback usa `host` senza porta + `addon_callback_port` e non include mai `x-ingress-path`.
  - `oauth/start` ora usa il resolver stabile per comporre la redirect URI.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 004 — Backend: rendere il callback raggiungibile (porta 8099 / routing)

- Status: DONE
- Goal: Far sì che Google possa chiamare davvero la callback stabile.
- Changes:
  - Verificare `config.yaml` addon:
    - `ingress_port: 8099` esiste già → ok.
    - In `ports:` valutare di esporre `8099/tcp` (anche solo come configurabile) invece di `null`.

  - Se non volete esporre sempre:
    - documentare che l’utente deve mappare la porta o usare reverse proxy/Nabu Casa.

- Acceptance criteria:
  - Da rete “esterna” (o dal browser) la callback URL risponde (non 404).

- Commit message:
  - `docs(addon): clarify port/public url requirements for oauth callback`

- What changed:
  - Documentati requisiti di raggiungibilità callback OAuth in presenza di Ingress.
  - Esplicitate le opzioni `public_base_url`, `gdrive_redirect_override` e fallback `addon_callback_port`.
  - Chiarita la causa tipica del `404` callback quando la URI non è esternamente raggiungibile.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/README.md`

- Commands run:
  - `cd file_editor_plus/frontend && npm run build`
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`

---

## STEP 005 — Backend: debug ergonomico (senza leak)

- Status: DONE
- Goal: Rendere immediato capire _quale_ redirect URI stiamo usando e _perché_, senza loggare segreti.
- Changes:
  - In `/api/cloud/gdrive/oauth/start` includere (già presente o da aggiungere):
    - `redirect_uri` usata
    - `mode` (es. `override|public_base_url|ingress_port|direct`)

  - Loggare solo:
    - `mode` + `redirect_uri` (ok)
    - **mai** token, code, client_secret.

- Acceptance criteria:
  - Guardando UI/log capisci subito se sei in `ingress_port` e quale URI registrare su Google.

- Commit message:
  - `chore(gdrive): add safe diagnostics for oauth redirect selection`

- What changed:
  - L’endpoint `/api/cloud/gdrive/oauth/start` ora restituisce sempre `redirect_uri` e `mode`.
  - Aggiunto log backend safe con `mode` e `redirect_uri` (senza token/code/secret).
  - Diagnostica pronta per capire subito quale URI registrare in Google Cloud.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 006 — Frontend: mostra “Redirect URI da registrare” + warning Ingress

- Status: DONE
- Goal: Ridurre supporto/issue: l’utente deve copiare-incollare la redirect corretta.
- Changes:
  - Quando clicchi Connetti e ricevi `/oauth/start`:
    - mostra `redirect_uri` in UI (copiable)
    - se `mode == ingress_port` (o detect ingress in browser path): mostra warning:
      - “Stai usando Ingress: la redirect deve essere esterna/stabile (porta/reverse proxy).”

- Acceptance criteria:
  - Un utente capisce cosa registrare in Google senza impazzire tra 400 e 404.

- Commit message:
  - `feat(ui): display oauth redirect uri and ingress warning`

- What changed:
  - La modale Google Drive mostra la `redirect_uri` restituita da `/oauth/start` in forma copiabile.
  - Aggiunto warning contestuale quando la strategia è `ingress_port` (o quando la UI gira sotto path ingress).
  - Preservata UX esistente del pulsante `Connetti` con apertura popup OAuth.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/frontend/src/app-root.ts`

- Commands run:
  - `cd file_editor_plus/frontend && npm run build`
  - `docker run --rm -v "$PWD/file_editor_plus/backend:/app" -w /app python:3.12-alpine sh -lc "python -m pip install -r requirements.txt >/dev/null && python -m unittest -q"`

---

## STEP 007 — Hardening: state/redirect binding e protezioni anti-mismatch

- Status: DONE
- Goal: Evitare che un redirect diverso venga usato nel token exchange.
- Changes:
  - Continuare a salvare `redirect_uri` nello state store al momento di `/oauth/start`.
  - Nel callback, usare **solo** quella salvata (mai ricalcolarla).
  - Se per qualunque motivo manca nello store → errore chiaro + hint.

- Acceptance criteria:
  - Nessun “mismatch interno” start/callback; errori chiari.

- Commit message:
  - `fix(gdrive): bind redirect_uri to state for consistent token exchange`

- What changed:
  - Il callback OAuth usa ora esclusivamente `redirect_uri` salvata nello state di `/oauth/start`.
  - Rimossi fallback di ricalcolo redirect nel token exchange.
  - Se `redirect_uri` manca nello state, il backend risponde con errore chiaro e azione suggerita.

- Files touched:
  - `AI/AI_TASKS.md`
  - `AI/KNOWLEDGE.yaml`
  - `file_editor_plus/backend/app.py`

- Commands run:
  - `python3 -m compileall file_editor_plus/backend/app.py`
  - `cd file_editor_plus/frontend && npm run build`

---

## STEP 008 — Smoke test (matrix) per chiudere il bug 400/404

- Status: TODO
- Goal: Riprodurre e verificare fix su tutti i contesti reali.
- Test matrix:
  1. **Ingress ON**, `public_base_url` settata (consigliato) → login OK.
  2. **Ingress ON**, `public_base_url` NON settata, porta 8099 esposta → login OK.
  3. **Ingress OFF** (accesso diretto addon) → login OK.
  4. Redirect non registrata in Google → **solo 400**, con messaggio che indica quale registrare.

- Acceptance criteria:
  - Nessun 404 callback in scenari supportati.
  - 400 solo quando l’utente non ha registrato la redirect suggerita.

- Commit message:
  - `test(smoke): verify oauth redirect stability with ingress and non-ingress`

---

## STEP 009 — Documentazione finale (per evitare future issue)

- Status: TODO
- Goal: Mettere nero su bianco il requisito “callback raggiungibile e registrata”.
- Changes:
  - Documentare:
    - dove prendere la `redirect_uri` (UI)
    - come registrarla in Google Cloud
    - cosa fare se usi Ingress (public_base_url o porta esposta)
    - troubleshooting 400 vs 404 (tabellina)

- Acceptance criteria:
  - Una persona nuova riesce a configurare senza aprire issue.

- Commit message:
  - `docs(gdrive): explain ingress-safe oauth redirect configuration`

---

## NOTE operative (per non impazzire)

- **400** = Google non riconosce la redirect (registrare esattamente quella mostrata dalla UI).
- **404** = la redirect è registrata ma non arriva al container (porta/reverse proxy/routing errato).
- Ingress tokenizzato **non è registrabile** → non va mai usato come redirect_uri.
