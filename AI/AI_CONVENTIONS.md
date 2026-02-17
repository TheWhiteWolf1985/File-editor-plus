# AI_CONVENTIONS

## Commit style
- Formato consigliato: Conventional Commits.
- Commit atomici e con scope chiaro.
- Commit solo dopo verifiche previste dallo step.

Esempio:
- `fix(api): handle null response in sync job`

## Release / Version bump
- In ambiente Home Assistant dev Docker, la rebuild puo' non risultare visibile se non cambia la versione add-on.
- Prima di un ciclo rebuild/restart, aggiornare:
  - `file_editor_plus/config.yaml` (`version: "x.y.z"`)
  - `file_editor_plus/CHANGELOG.md` (entry versione)

## Branch naming (optional)
- Pattern: `type/short-topic`.
- Valore atteso: <<OPTIONAL>>

## Naming code
- Naming coerente con standard del progetto target.
- Evitare abbreviazioni opache.
- Evitare rinomine massive non richieste.

## Test conventions
- Ogni modifica deve avere verifica associata.
- Preferire test mirati al comportamento toccato.
- Tracciare i comandi eseguiti in `AI_TASKS` e `KNOWLEDGE`.

## Guardrails
- No nuove dipendenze senza richiesta.
- No refactor non richiesto.
- No feature reintrodotte se rimosse dal progetto.
- No segreti reali.

## Bump Legacy -> New AI Kit (regole)
- Non modificare o cancellare contenuti in `AI_old/`.
- Non inserire fatti non verificati: se non certo usare i placeholder previsti dal kit (vedi `AI/README.md`).
