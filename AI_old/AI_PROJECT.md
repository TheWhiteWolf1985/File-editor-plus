# AI Project Guide

## Stack
- Frontend: Lit + TypeScript + Vite
- Backend: Python + FastAPI (served by uvicorn in add-on container)
- Packaging: Home Assistant add-on (`file_editor_plus/config.yaml`)

## Build Commands
- Frontend package manager detection:
  - `pnpm-lock.yaml` -> `pnpm`
  - `yarn.lock` -> `yarn`
  - otherwise -> `npm`
- Frontend build:
  - `cd file_editor_plus/frontend`
  - install deps if needed (`pnpm i` / `yarn` / `npm ci`)
  - build (`pnpm run build` / `yarn build` / `npm run build`)

## Add-on Lifecycle Commands
- Update: `docker exec hassio_cli ha apps update local_file_editor_plus`
- Rebuild: `docker exec hassio_cli ha apps rebuild local_file_editor_plus`
- Restart: `docker exec hassio_cli ha apps restart local_file_editor_plus`
- Supervisor logs: `docker exec hassio_cli ha supervisor logs -n 220`

## Constraints
- No CDN in runtime.
- No runtime fetch to external internet resources.
- Documentation files are Markdown.
- Top Bar `Aiuto -> Documentazione` must open in `_blank` with `noopener,noreferrer`.
