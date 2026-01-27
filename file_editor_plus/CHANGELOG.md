# Changelog

## 0.2.22

- 🔄 Fix Undo: l’indent/outdent con Tab/Shift+Tab è registrato nello stack Undo nativo, quindi Ctrl+Z/Undo annullano l’azione in un solo passo.

## 0.2.23

- 🖼️ Add: endpoint backend /api/file/raw per servire file immagine (png/jpg/jpeg/webp/gif/svg) da /config con header cache controllato.

## 0.2.24

- 🖼️ Context menu: aggiunta voce “Anteprima immagine” per i file immagine; salva la richiesta di preview e mostra un toast placeholder (modal arriverà in step successivi).

## 0.2.21

- ⌨️ Undo Tab: l’indent/outdent con Tab/Shift+Tab ora è undoable (Ctrl+Z) grazie a edit undo-friendly sulla textarea.
- 🗂️ Session restore completo: tab/attivo/split persistiti, flag dirty e buffer non salvati (con limiti) ripristinati con avvisi e reset sicuro della sessione.
- 📍 Stato editor per tab: caret/selection e scroll vengono salvati e ripristinati all’apertura del tab.
- ♻️ Reset session: comando in Utility per cancellare session.json e buffer, con fallback automatico se il file sessione è corrotto.
- Issue [#11](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/11) Testing
- Issue [#12](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/12) Testing
- Issue [#13](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/13) Testing
- Issue [#14](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/14) Testing
