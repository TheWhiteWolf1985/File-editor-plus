# Changelog

## 0.1.102

- Refactor: stili estratti in modulo dedicato (nessun cambio funzionale).

## 0.1.101

- Refactor: tipi e costanti estratti in moduli dedicati (nessun cambio funzionale).

## 0.1.100

- Overlay code: rimosso spazio "fantasma" tra indentazione e token per riallineare le colonne.
- Menu Backup in sidebar con download zip /config e salvataggio via file picker.
- Incolla nel tree: nome automatico con suffisso `_copy` (file e cartelle).
- Menu contestuale nel tree (copia/incolla/elimina) con conferma eliminazione.

## 0.1.92

- Disabilitato spellcheck nella textarea dell'editor.
- Migrazione config in `/config/.fep-config` (snippets + user_config) con import automatico dai percorsi legacy.
- Persistenza tema UI (theme_mode) in user_config.
- Pannello System con azioni di reload/restart e endpoint backend dedicato.
