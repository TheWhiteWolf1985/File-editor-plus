# Changelog

## 0.1.100
- Overlay code: rimosso spazio "fantasma" tra indentazione e token per riallineare le colonne.

## 0.1.99
- Revert: overlay non viene più nascosto durante la selezione (fix da rivedere).

## 0.1.98
- Overlay editor nascosto durante la selezione per evitare doppia evidenziazione.

## 0.1.97
- Overlay codice: spazi preservati e selezione disabilitata per evitare doppia evidenziazione e disallineamenti.

## 0.1.96
- Icona Backup spostata subito sotto Snippet nella activity bar.

## 0.1.95
- Menu Backup in sidebar con download zip /config e salvataggio via file picker.

## 0.1.94
- Incolla nel tree: nome automatico con suffisso `_copy` (file e cartelle).

## 0.1.93
- Menu contestuale nel tree (copia/incolla/elimina) con conferma eliminazione.

## 0.1.92
- Disabilitato spellcheck nella textarea dell'editor.
- Migrazione config in `/config/.fep-config` (snippets + user_config) con import automatico dai percorsi legacy.
- Persistenza tema UI (theme_mode) in user_config.
- Pannello System con azioni di reload/restart e endpoint backend dedicato.
