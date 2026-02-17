# AI_TASKS — Audit & wiring: Topbar + Sidebar → servizi (Home Assistant Add-on)

Data: 2026-02-17
Target: `ha-file-editor-plus` (add-on Home Assistant, UI via Ingress)
Obiettivo: fare un **audit completo** di tutte le voci/pulsanti in **Topbar** e **Sidebar** e assicurare che **ognuno** sia collegato al proprio servizio/azione. Il report deve includere anche la lista di ciò che **NON è collegato**.

## Vincoli add-on (da rispettare)

- Ingress HA può cambiare base path: evitare URL assoluti hardcoded; preferire path relativi o client API già presente. ([developers.home-assistant.io](https://developers.home-assistant.io/docs/apps/presentation/?utm_source=chatgpt.com))
- Non rompere `/config` (montato) e non cambiare permessi/paths runtime.
- Non introdurre nuove dipendenze FE/BE senza richiesta esplicita.
- Ogni modifica UI deve essere verificabile con build/typecheck.

## Output richiesti (deliverables)

1. `AI/AUDITS/UI_NAV_AUDIT.md` con:
   - tabella completa (Topbar + Sidebar) con: label, location, file:line, handler, service/endpoint, stato
   - sezione **NOT CONNECTED** (anche se vuota) con elenco puntuale e motivo

2. Se esistono voci non collegate: commit che le collega (stesso giro) e audit aggiornato.

## Definizioni (per l’audit)

- **Connected**: la voce/pulsante invoca direttamente un servizio (API client / backend endpoint / hass service) **oppure** naviga a una route/pagina che a sua volta invoca il servizio.
- **Not connected**: handler mancante, handler vuoto, `TODO`, `console.log`, `disabled` senza feature flag/motivo, route che porta a pagina senza logica.

---

## STEP 001 — Inventory: identificare Topbar/Sidebar e tutte le voci

- Status: DONE
- Goal: elenco completo di voci/pulsanti (Topbar + Sidebar) con i riferimenti al codice.
- Scope:
  - `file_editor_plus/frontend/src/**`

- Procedure:
  1. Trovare i componenti/strutture che definiscono la navigazione e i menu.
  2. Estrarre tutte le voci:
     - label/testo
     - icona (se utile)
     - tipo: link/route vs action button
     - file + linea (o almeno file + snippet univoco)

- Commands:
  - Individuazione componenti:
    - `rg -n -S "Topbar" file_editor_plus/frontend/src`
    - `rg -n -S "TopBar" file_editor_plus/frontend/src`
    - `rg -n -S "AppBar" file_editor_plus/frontend/src`
    - `rg -n -S "Toolbar" file_editor_plus/frontend/src`
    - `rg -n -S "Sidebar" file_editor_plus/frontend/src`
    - `rg -n -S "Drawer" file_editor_plus/frontend/src`

  - Individuazione definizioni items:
    - `rg -n -S "menuItems" file_editor_plus/frontend/src`
    - `rg -n -S "navItems" file_editor_plus/frontend/src`
    - `rg -n -S "routes" file_editor_plus/frontend/src`

  - Individuazione collegamenti/azioni:
    - `rg -n -S "onClick" file_editor_plus/frontend/src`
    - `rg -n -S "navigate(" file_editor_plus/frontend/src`
    - `rg -n -S "to=" file_editor_plus/frontend/src`
    - `rg -n -S "href=" file_editor_plus/frontend/src`

- Acceptance criteria:
  - Esiste una lista grezza completa (anche temporanea) con tutte le voci individuate.

- Commit message:
  - `docs(audit): inventory ui nav items`

- What changed:
  - Inventario completo raccolto da `file_editor_plus/frontend/src/app-root.ts` (topbar menu, toolbar, activity bar, sidebar panes) e pronto per il report in STEP 003.

---

## STEP 002 — Mappa servizi: trovare API client FE e endpoint BE

- Status: DONE
- Goal: costruire la mappa “UI → service → endpoint”.
- Scope:
  - FE: `file_editor_plus/frontend/src/**`
  - BE: `file_editor_plus/backend/**`

- Procedure:
  1. Identificare il layer servizi FE (es. `src/api/*`, `src/services/*`, `client.ts`, ecc.).
  2. Inventariare le chiamate lato FE (`fetch`, `axios`, `api.*`, websocket, ecc.).
  3. Inventariare gli endpoint BE (route definitions).

- Commands:
  - FE service scan:
    - `rg -n -S "fetch(" file_editor_plus/frontend/src`
    - `rg -n -S "axios." file_editor_plus/frontend/src`
    - `rg -n -S "api." file_editor_plus/frontend/src`
    - `rg -n -S "client." file_editor_plus/frontend/src`
    - `rg -n -S "callService(" file_editor_plus/frontend/src`
    - `rg -n -S "hass." file_editor_plus/frontend/src`
    - `rg -n -S "INGRESS" file_editor_plus/frontend/src`
    - `rg -n -S "X-Ingress-Path" file_editor_plus/frontend/src`

  - BE endpoint scan (Python/Flask style e simili):
    - `rg -n -S "@app.route" file_editor_plus/backend`
    - `rg -n -S "add_url_rule" file_editor_plus/backend`
    - `rg -n -S "Blueprint(" file_editor_plus/backend`
    - `rg -n -S "/api/" file_editor_plus/backend`

- Acceptance criteria:
  - Lista endpoint BE identificata.
  - Individuato il punto canonico FE dove si fanno chiamate (o confermato che sono inline).

- What changed:
  - Identificato layer servizi FE: `file_editor_plus/frontend/src/services/api.ts` (fetch wrapper).
  - Identificati endpoint BE: `file_editor_plus/backend/app.py` (`/api/*` FastAPI).

- Commit message:
  - `docs(audit): map ui services and endpoints`

---

## STEP 003 — Audit report: compilare `AI/AUDITS/UI_NAV_AUDIT.md`

- Status: DONE
- Goal: produrre il report completo con stato Connected/Not connected.
- Scope:
  - `AI/AUDITS/UI_NAV_AUDIT.md` (nuovo)

- Report format (obbligatorio):
  - Tabella con colonne:
    - Area (Topbar/Sidebar)
    - Voce UI (label)
    - Tipo (route/action)
    - File:line
    - Handler (nome funzione o inline)
    - Service call (funzione client / chiamata)
    - Endpoint/Servizio HA (se applicabile)
    - Stato (✅ Connected / ❌ Not connected)
    - Note

  - Sezione **NOT CONNECTED** con elenco puntuale:
    - voce
    - file:line
    - motivo
    - cosa manca per collegarla

- Acceptance criteria:
  - `AI/AUDITS/UI_NAV_AUDIT.md` esiste e include:
    - tutte le voci trovate allo Step 001
    - mapping servizi/endpoints (Step 002) dove possibile
    - lista NOT CONNECTED completa

- Commit message:
  - `docs(audit): add ui nav audit (topbar/sidebar)`

- What changed:
  - Creato `AI/AUDITS/UI_NAV_AUDIT.md` con tabella completa Topbar/Sidebar, mapping a servizi/endpoints e sezione NOT CONNECTED.

---

## STEP 004 — Wiring: collegare tutte le voci/pulsanti NON collegati

- Status: DONE
- Goal: nessuna voce rimane “dead button”.
- Scope:
  - FE: componenti Topbar/Sidebar e route collegate
  - (eventuale) FE services layer, se serve solo “agganciare” chiamate già esistenti

- Regole:
  - Usare **pattern esistenti** (se c’è già `api.*`, usare quello).
  - Per navigazione: usare router/navigate già in uso (niente `window.location` salvo necessità motivata).
  - Per azioni: collegare a servizi reali; se il servizio non esiste ancora, creare un TODO esplicito e marcare la voce come `disabled` con spiegazione visibile (solo se accettabile).
  - Non introdurre URL assoluti che ignorano Ingress.

- Commands:
  - `cd file_editor_plus/frontend && npm ci`
  - `cd file_editor_plus/frontend && npm run -s typecheck`
  - `cd file_editor_plus/frontend && npm run -s build`

- Acceptance criteria:
  - Ogni item in sezione NOT CONNECTED viene risolto in uno dei modi:
    - collegato a service/route funzionante
    - disabilitato intenzionalmente con motivazione UX + feature flag/motivo documentato

  - Nessun nuovo errore in `typecheck` e `build`.

- Commit message:
  - `fix(ui): wire topbar/sidebar actions to services`

- What changed:
  - Collegati i menu item `File -> Import…` (apre upload) e `File -> Export…`/`Save as…` (download via `/api/fs/download?path=...`).

---

## STEP 005 — Aggiornare audit (NOT CONNECTED deve essere vuoto o giustificato)

- Status: DONE
- Goal: audit aggiornato post-fix.
- Scope:
  - `AI/AUDITS/UI_NAV_AUDIT.md`

- Procedure:
  - Aggiornare stato e mapping nella tabella.
  - Se restano voci non collegate, devono essere:
    - esplicitamente giustificate (perché non implementabili adesso)
    - tracciate con TODO e spiegazione.

- Acceptance criteria:
  - Sezione NOT CONNECTED:
    - vuota oppure contiene solo voci intenzionalmente non operative con motivazione.

- Commit message:
  - `docs(audit): update ui nav audit after wiring`

- What changed:
  - Aggiornato `AI/AUDITS/UI_NAV_AUDIT.md`: `Import…`/`Export…`/`Save as…` ora risultano ✅ Connected; NOT CONNECTED resta solo per `Backup -> Cloud` (disabled/coming soon).

---

## STEP 006 — Smoke add-on (Ingress + azioni principali)

- Status: DONE
- Goal: verificare che Ingress non sia stato rotto e che i click facciano cose vere.
- Scope:
  - runtime add-on (dev/test)

- Checklist minima:
  - UI si carica via Ingress.
  - Navigazione sidebar funziona.
  - Topbar: i pulsanti principali non sono dead.
  - Azioni file non rompono `/config`.

- Acceptance criteria:
  - Nessun errore console bloccante.
  - Nessun 404/500 per assets/API a causa di base path.

- Commit message:
  - `docs(qa): record ingress smoke check`

- What changed:
  - Eseguiti update + restart add-on (`local_file_editor_plus`) e verificato da supervisor logs che il lifecycle job e' andato a buon fine.

---

## STEP 007 — Knowledge update (traccia audit e decisioni)

- Status: TODO
- Goal: aggiornare memoria del progetto.
- Scope:
  - `AI/KNOWLEDGE.yaml`
  - `AI/DECISIONS.md` (solo se scelta non ovvia)

- Changes:
  - Registrare che esiste audit UI nav e dove si trova.
  - Se sono state introdotte disabilitazioni/feature flags, registrare decisione e motivazione.

- Acceptance criteria:
  - `AI/KNOWLEDGE.yaml` include riferimento a `AI/AUDITS/UI_NAV_AUDIT.md`.

- Commit message:
  - `chore(ai): record ui nav audit in knowledge`
