# Changelog

## 0.1.111

- Fix: regex autocomplete entità (match su domain.entity_id) dopo refactor.

## 0.1.110

- Refactor: logica Entities/MDI suggestions estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.109

- Refactor: logica Settings/Theme/Font estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.108

- Refactor: logica Backup/System estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.107

- Refactor: logica Snippets estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.106

- Refactor: logica Search & Replace estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.105

- Refactor: logica Tree/Explorer estratta in modulo dedicato (nessun cambio funzionale).

## 0.1.104

- Refactor: helper overlay/gutter estratti in modulo dedicato (nessun cambio funzionale).

## 0.1.103

- Refactor: servizi API estratti in modulo dedicato (nessun cambio funzionale).

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
