# Changelog

## 0.2.28

- 🛠️ Fix: Utility buttons “Genera debug log” e “Reset session” ora chiamano le azioni corrette e rinfrescano il tree.

## 0.2.29

- 📤 Add: endpoint backend /api/upload (multipart) per caricare file sotto /config.

## 0.2.30

- 📤 Add: UI upload nel tab Explorer con modale (file picker + scelta cartella) e refresh tree automatico.

## 0.2.31

- 🪢 Add: drag & drop nel tree (solo UI) con calcolo sorgente/target e toast placeholder per move.

## 0.2.32

- 📂 Add: spostamento reale file/cartelle via drag&drop con endpoint /api/fs/move e refresh tree.

## 0.2.33

- 🛡️ Improve: hardening upload/move (messaggi conflitto/size, filename invalido, refresh coerente, warning tab spostati).

## 0.2.34

- ⚠️ Add: modale di conferma per spostamento via drag&drop prima di eseguire il move.

## 0.2.35

- 📤 Add: upload multi-file con progress seriale e refresh tree unico.

## 0.2.36

- 📝 Add: gestione conflitti upload/move con modale (rinomina/sovrascrivi/annulla) e retry automatico.

## 0.2.37

- 🔒 Add: rilevamento cartelle readonly — upload disabilitato e drop impedito con warning, flag writable nel tree.

## 0.2.38

- 🐛 Fix: aggiunta dipendenza python-multipart per gestire le form upload (addon ora avvia correttamente l’API upload/move).

## 0.2.39

- 🔧 Fix: build frontend — rimosse dichiarazioni duplicate di state (conflictDialogOpen/conflictData/treeDirty).

## 0.2.40

- 🛠️ Fix: build frontend (handler drag&drop referenziati) — binding corretto ai metodi di classe.

## 0.2.41

- 🧩 Fix: build frontend (typing) — performMove tipizzato, tab lastEditAt camelCase opzionale.

## 0.2.42

- 🛠️ Fix: build frontend (ref safety) — guard `ref` assignments per evitare TS2322 su elementi null/undefined.

## 0.2.43

- 🌐 Fix: asset path ingress — serve la UI da /app/frontend, mount static /frontend + assets, base Vite relativa (no più richieste a /frontend_latest).

## 0.2.44

- 🖱️ Fix: drag&drop file explorer — draggable abilitato, payload dataTransfer JSON, dropEffect move, blocchi rimossi e drop su root/cartelle funzionante.

## 0.2.45

- 🧹 Fix: DnD dragleave handler undefined (console spam) — tutte le chiamate usano metodi di classe e payload JSON move.

## 0.2.27

- 🧹 Chore: rimosso il label TreeTargetLabel dal file explorer (cleanup UI).

## 0.2.26

- 🖼️ Improve: polish anteprima immagini (limite 20MB, chiusura su backdrop/ESC, placeholder pulito, cleanup stato).

## 0.2.25

- 🖼️ Image preview: aggiunta modale riutilizzabile con anteprima immagine e metadati base; la voce di context menu “Anteprima immagine” ora apre la modale (step 3/4).

## 0.2.24

- 🖼️ Context menu: aggiunta voce “Anteprima immagine” per i file immagine; salva la richiesta di preview e mostra un toast placeholder (modal arriverà in step successivi).

## 0.2.23

- 🖼️ Add: endpoint backend /api/file/raw per servire file immagine (png/jpg/jpeg/webp/gif/svg) da /config con header cache controllato.

## 0.2.22

- 🔄 Fix Undo: l’indent/outdent con Tab/Shift+Tab è registrato nello stack Undo nativo, quindi Ctrl+Z/Undo annullano l’azione in un solo passo.
