# Changelog

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
