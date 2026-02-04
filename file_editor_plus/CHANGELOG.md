# Changelog (major features)

## 🐛 Bug fixes

- Undo/Ctrl+Z ora annulla correttamente indent/outdent fatti con Tab/Shift+Tab (un solo step).
- Fix build/packaging e runtime: dipendenza `python-multipart` + fix build frontend + fix path asset Ingress (niente più richieste rotte tipo `/frontend_latest`).
- Fix Drag&Drop: eventi/handlers corretti, niente spam in console, drop verso root gestito correttamente (no più 400 / “src and dst_dir required”).
- Fix sessione tab: `/api/session` non fallisce più quando `view` manca o è invalida (default oggetto, stop ai 400).
- Fix tab Utility: “Genera debug log” e “Reset session” ora chiamano le azioni giuste + refresh tree coerente.

## 🚀 Enhancements

- Upload file in `/config`: endpoint backend + UI con modale, scelta cartella, e refresh automatico del tree.
- Upload avanzato: multi-file con progress (seriale) e refresh tree unico + gestione conflitti (rinomina/sovrascrivi/annulla) con retry.
- Drag&Drop nel file explorer: spostamento file/cartelle con endpoint `/api/fs/move` + modale di conferma prima di eseguire il move.
- Read-only awareness: rilevamento cartelle non scrivibili, upload disabilitato e drop impedito con warning (flag writable nel tree).
- Anteprima immagini: endpoint download con Content-Type corretto + overlay preview frontend (top-level JS) + UX (ESC/backdrop, limite 20MB, cleanup).
- Maintenance: sanitizzazione step 1 (build green + cleanup).

## 🧪 Dev / API

- Add: endpoint `/api/search/replace/one` per sostituire una singola occorrenza (backend). UI inline per replace singolo in corso.
- Fix: pulsante Replace singolo ora chiama correttamente l’API (ok lowercase, toast con dettaglio errore).
- Fix: Replace singolo aggiorna il file aperto (se non dirty) senza dover riaprire il tab; avviso se ci sono modifiche non salvate.
- Fix: collegato handler `replaceOne` nel frontend search (pulsante singolo ora funziona).

## 🧰 Maintenance

- Hardening generale upload/move: validazioni filename/size, messaggi conflitto più chiari, refresh più coerente, warning su tab coinvolti dallo spostamento.
- Cleanup UI Explorer: rimosso `TreeTargetLabel` (pulizia/semplificazione DOM e logica).
- Maintenance: sanitizzazione step 1 (build green + cleanup).

## 📚 Documentation

- (Nessuna voce doc esplicita nel file sorgente: aggiungere qui solo se vengono aggiornati README/guide.)
