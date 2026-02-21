# Issue 17 — Rollup optional deps missing on arm64/musl

Data: 2026-02-21
Branch: `develop`

## Sintesi
Su `aarch64` con base `Alpine/musl` la build frontend fallisce con:
- `Cannot find module @rollup/rollup-linux-arm64-musl`

L'errore e' emesso da Rollup (`rollup/dist/native.js`) e cita un bug npm legato alle optional dependencies.

## Ambiente di riproduzione (locale via Docker)
- Host: `linux/amd64`
- Docker Engine: 29.1.3 (Server `linux/amd64`)
- Target: `linux/arm64` (qemu)

Per abilitare l'esecuzione di container `arm64` su host `amd64`:
```sh
docker run --privileged --rm tonistiigi/binfmt --install arm64
```

Verifica che l'emulazione sia attiva:
```sh
docker run --rm --platform linux/arm64 alpine:3.20 uname -m
# atteso: aarch64
```

## Comando di riproduzione
Eseguito dentro container `node:20-alpine` (musl) in `linux/arm64` montando il frontend:
```sh
docker run --rm --platform linux/arm64 \
  -v "$PWD/file_editor_plus/frontend:/fe" -w /fe \
  node:20-alpine sh -lc "npm ci && npm run -s build"
```

Output sintetico (estratto):
```text
/fe/node_modules/rollup/dist/native.js:83
Error: Cannot find module @rollup/rollup-linux-arm64-musl. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828).
...
code: 'MODULE_NOT_FOUND'
```

## Ipotesi root cause
- Su arm64/musl, l'optional dep platform-specific `@rollup/rollup-linux-arm64-musl` non viene installata correttamente durante `npm ci`, causando crash in fase di `rollup/dist/native.js`.
- Fix suggerito dalla community: forzare include optional deps (`npm ci --include=optional`) e/o hardening con `.npmrc` (`include=optional`).

## Fix plan (vedi AI_TASKS)
- Patch minima: aggiornare stage FE del Dockerfile per usare `npm ci --include=optional`.
- Hardening: `file_editor_plus/frontend/.npmrc` con `include=optional`.
