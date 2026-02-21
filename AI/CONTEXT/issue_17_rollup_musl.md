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

## Verifica Patch 1 (stato attuale)
Dopo aver applicato `npm ci --include=optional` nello stage FE del Dockerfile, la build `arm64/musl` risulta **ancora** fallire con lo stesso errore.

Comando usato (build solo stage FE):
```sh
docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus
```

Estratto log:
```text
> build
> vite build

Error: Cannot find module @rollup/rollup-linux-arm64-musl.
...
The command '/bin/sh -c npm run build' returned a non-zero code: 1
```

## Verifica hardening `.npmrc` (stato attuale)
Anche dopo l'aggiunta di `file_editor_plus/frontend/.npmrc` con `include=optional`, la build arm64/musl continua a fallire con lo stesso errore.

Comando usato:
```sh
docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus
```

## Workaround efficace (trovato)
Il workaround che rende la build arm64 verde e' evitare `npm ci` con il lockfile (che triggera il bug sulle optional deps) e usare invece `npm install` **dopo** aver rimosso `package-lock.json` nello stage FE.

Evidenza (build stage FE arm64 OK):
```sh
docker build --platform linux/arm64 --target fe -f file_editor_plus/Dockerfile file_editor_plus
# esito: SUCCESS (vite build completa)
```

## Backlog (separato): warning Dockerfile `BUILD_FROM`
Durante i rebuild in Supervisor puo' comparire un warning tipo:\n
- `InvalidDefaultArgInFrom: Default value for ARG ${BUILD_FROM} results in empty or invalid base image name`\n

Cause: il Dockerfile usa `ARG BUILD_FROM` + `FROM ${BUILD_FROM}` senza un default. In Home Assistant Builder `BUILD_FROM` viene iniettato, ma i linter vedono un arg vuoto.\n

Proposta (da valutare in task separato): impostare un default non vuoto, es:\n
- `ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest` (solo default, poi override in build HA)\n
oppure costruire un default in base ad arch via `build.yaml` (se la pipeline lo supporta).\n
