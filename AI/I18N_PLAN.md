# I18N Plan

## Scope
Definire una convenzione unica per chiavi i18n e struttura dei file locale.

## Percorso locale
- `file_editor_plus/frontend/src/i18n/*.json`

## Convenzione chiavi
Usare dot-notation semantica, breve e stabile.

Esempi:
- `btn.save`
- `menu.file`
- `settings.localization.title`
- `status.version`

Regole naming:
- lowercase + segmenti separati da `.`
- usare nomi funzione/UI (non frasi intere)
- evitare duplicati semantici

## Sezioni standard JSON
Ogni file locale deve contenere queste sezioni top-level:
- `meta`
- `btn`
- `menu`
- `settings`
- `status`
- `tree`
- `modal`
- `toast`
- `errors`
- `labels`
- `tabs`
- `actions`

## Regole operative
- Non introdurre nuove stringhe hardcoded nei componenti UI.
- Fallback runtime: se la key manca, mostrare la key stessa (`key -> key`).
- Interpolazione variabili con placeholder `{name}` (es. `toast.saved`: `"File {name} salvato"`).
- Le chiavi devono restare stabili nel tempo per minimizzare regressioni nei file locale.

## Versioning `meta.version`
- Incrementare `meta.version` quando cambia il contratto del dizionario locale:
  - aggiunta/rimozione/rinomina di sezioni top-level;
  - rinomina massiva di key;
  - cambi strutturali che impattano il lookup (es. spostamento key tra namespace).
- Non incrementare `meta.version` per sole correzioni di testo/typo o traduzioni equivalenti senza cambi di struttura.

## Esempio struttura minima
```json
{
  "meta": {},
  "btn": {},
  "menu": {},
  "settings": {},
  "status": {},
  "tree": {},
  "modal": {},
  "toast": {},
  "errors": {},
  "labels": {},
  "tabs": {},
  "actions": {}
}
```
