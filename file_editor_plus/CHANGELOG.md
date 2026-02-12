# Changelog

## 0.2.64

- Chore release: bump versione add-on e rebuild/restart.

## 0.2.63

- UI icons: `app-icon` ora applica sizing robusto su host (`--app-icon-size` su `:host`, `svg` al 100%) per evitare collasso 0x0 in Home Assistant Ingress.
- Frontend entrypoint: aggiunto import side-effect `./components/app-icon` in `src/main.ts` per garantire registrazione componente in build.

## 0.2.62

- UI tab (#15): schema colori coerente con la toolbar (tab inattive più scure, attive più chiare/evidenziate) in entrambi i temi.
- Replace singolo: pulsante inline chiama l’API dedicata e aggiorna subito il file aperto (se non dirty), con messaggi chiari su stale/nomatch.
