# Changelog

## 0.2.10

- ✨ Indent guides segmentate: guida attiva solo sul blocco (livello con start/end), niente highlight full-height; overlay senza righe vuote.

## 0.2.9

- 🪢 Fix overlay: impostato `.code` a `white-space: normal` per eliminare righe vuote dal template e riallineare gutter/textarea con le indent guides per-riga.

## 0.2.8

- 🧭 Indent guides per-riga (solo sull’area indent, niente “pagina a righe”) con skip righe vuote/commenti e guida attiva invariata.

## 0.2.7

- 🪢 Fix overlay: rimosso whitespace extra nell’overlay .code per riallineare testo/gutter/textarea con indent guides attivi.

## 0.2.6

- 📏 Indent guides opzionali (View → Indent guides) con guida attiva evidenziata; preferenza salvata in user_config.

## 0.2.5

- 🛠️ Toolbar: nuova barra strumenti persistente (toggle da View → Menù strumenti) con save/undo/redo/search/replace/indent/split/compare; bottoni nella crumbs nascosti quando attiva.

## 0.2.4

- Risolta Issue GitHub ref. [#7](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/7)
- Risolta Issue GitHub ref. [#8](https://github.com/TheWhiteWolf1985/File-editor-plus/issues/8)
- 🎨 Syntax: colore delle chiavi (.token-key) ora theme-aware (dark invariato, light rgb(28 47 193)).

## 0.2.3

- 🎨 Editor: caret e selezione ora usano variabili tema (dark/light) per rendere leggibile l’overlay in light theme.

## 0.2.2

- ⌨️ Editor: Tab/Shift+Tab ora indenta/outdenta le selezioni senza cancellare testo; mantiene la selezione e sincronizza l’overlay.
