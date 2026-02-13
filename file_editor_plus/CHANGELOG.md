# Changelog

## 0.2.77

- Chore release: bump versione add-on e ricostruzione completa (build frontend + update/restart addon).

## 0.2.76

- Chore release: bump versione add-on e ciclo di ricostruzione (build frontend + update/restart addon).

## 0.2.75

- Editor layout isolation (Step 3.2): `textarea` e `basePre` portati in layer assoluto (`position:absolute; inset:0`) dentro `codeWrap`.
- Overlay syntax `.code` consolidato con `inset:0` e layering esplicito (`z-index`), così i layer editor non contribuiscono al flow verticale.
- Obiettivo: evitare compressione/collasso della tab-bar con contenuti lunghi mantenendo focus/selection/copy-paste invariati.

## 0.2.74

- Layout fix minimo anti-collasso tabs (Strategia A): aggiunto `min-height: 0` ai container di shrink (`.main`, `.editor-layout`, `.editorWrap`, `.codeWrap`, `textarea`) per prevenire crescita verticale della colonna editor con contenuti lunghi.

## 0.2.73

- Tabs robustness (IDE-like):
  - tab-bar con altezza/flex fissi e scroll orizzontale stabile (`flex-wrap: nowrap`, `overflow-x: auto`, `height/flex: 36px`)
  - tab singolo a quota fissa (`height: 32px`, `flex: 0 0 auto`) senza shift verticale active/non-active
  - titolo tab single-line con ellipsis e `max-width: 220px`
  - aggiunto tooltip (`title`) con nome completo file sul tab/title
  - fix layout con `min-height: 0` su contenitori chiave per evitare salti in colonna

## 0.2.72

- Tabs/editor rows allineati per eliminare oscillazioni verticali:
  - `grid-template-rows` editor impostato a `36px 1fr`
  - tabs con `align-items: center`
  - rimossi offset verticali divergenti tra `.tab` e `.tab.active` (`margin-top`/`padding-top`)
  - altezza tab resa coerente (`min-height: 32px`)

## 0.2.71

- Fix CSS vars in Shadow DOM: token Figma (es. `--space-md`, `--space-sm`, radius/shadow/accent vars) spostati da `:root` a `:host` in `figma-editor-styles.ts`.
- Risolto warning DevTools su variabili non definite nel pannello stili dello shadow root.

## 0.2.70

- Status bar: impostati `min-height: 30px` e `font-size: 14px`.
- Status bar: ridotto padding verticale interno (`.status-item`) e line-height controllata per evitare clipping nella parte inferiore.

## 0.2.69

- Status bar UI: aumentata altezza del 50% (`min-height: 36px`) e aumentato il font interno a `16px` per migliorare leggibilità.

## 0.2.68

- Status bar version fix: rimosso hardcode e lettura versione da build-time (`VITE_APP_VERSION`) con fallback visibile (`v?.?.?`).
- i18n scaffolding: aggiunti file locali `it/en/de/fr/es` in `frontend/src/i18n/` e indice metadati lingue supportate.
- Settings -> Localizzazione: nuova griglia tile selezionabili (badge lingua + nome + stato selected).
- Settings modal: dimensione minima impostata (`min-width: 500px; min-height: 350px`) con scroll interno.

## 0.2.67

- Tree icon colors: risolto override cascade di `currentColor` con classi stabili su `<app-icon>` (`tree-icon--folder/file/chevron`) e regole CSS univoche nel tree.
- Selected state tree: colore applicato al solo label testo (`.tree-label`) evitando tint globale sul container icona+testo.

## 0.2.66

- Tree icons: fix definitivo colori via `currentColor` + CSS specifico sulle classi reali (`.file-tree-item .file-icon`, `.folder-icon`, `.chevron`) con palette Figma (file blue `#3b82f6`, folder orange `#f97316`, chevron teal).
- Rimosso selector non allineato (`.file-doc-icon`) che non colpiva le icone tree renderizzate.

## 0.2.65

- Chore release: bump versione add-on e ricostruzione completa in ambiente Home Assistant dev Docker.

## 0.2.64

- Chore release: bump versione add-on e rebuild/restart.

## 0.2.63

- UI icons: `app-icon` ora applica sizing robusto su host (`--app-icon-size` su `:host`, `svg` al 100%) per evitare collasso 0x0 in Home Assistant Ingress.
- Frontend entrypoint: aggiunto import side-effect `./components/app-icon` in `src/main.ts` per garantire registrazione componente in build.

## 0.2.62

- UI tab (#15): schema colori coerente con la toolbar (tab inattive più scure, attive più chiare/evidenziate) in entrambi i temi.
- Replace singolo: pulsante inline chiama l’API dedicata e aggiorna subito il file aperto (se non dirty), con messaggi chiari su stale/nomatch.
