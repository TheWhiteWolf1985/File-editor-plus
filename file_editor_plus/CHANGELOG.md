# Changelog

## 0.2.25

- 🖼️ Image preview: aggiunta modale riutilizzabile con anteprima immagine e metadati base; la voce di context menu “Anteprima immagine” ora apre la modale (step 3/4).

## 0.2.24

- 🖼️ Context menu: aggiunta voce “Anteprima immagine” per i file immagine; salva la richiesta di preview e mostra un toast placeholder (modal arriverà in step successivi).

## 0.2.23

- 🖼️ Add: endpoint backend /api/file/raw per servire file immagine (png/jpg/jpeg/webp/gif/svg) da /config con header cache controllato.

## 0.2.22

- 🔄 Fix Undo: l’indent/outdent con Tab/Shift+Tab è registrato nello stack Undo nativo, quindi Ctrl+Z/Undo annullano l’azione in un solo passo.
