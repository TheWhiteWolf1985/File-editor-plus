# Google Drive Flow Map (Current State)

## Frontend entrypoints
- UI modal: `file_editor_plus/frontend/src/app-root.ts` (`showGdriveModal`)
- Connect button handler: `startGdriveDeviceFlow()` in `file_editor_plus/frontend/src/app-root.ts`
- API client methods: `file_editor_plus/frontend/src/services/api.ts`

## Current connect flow (Device Flow)
1. User clicks `Connetti` in Google Drive modal.
2. Frontend calls `POST /api/cloud/gdrive/device/start`.
3. Backend endpoint `gdrive_device_start()` validates `gdrive_client_id` from add-on options (`/data/options.json`).
4. Backend calls Google Device Code endpoint and returns `{ ok, user_code, verification_url, expires_at, interval }`.
5. Frontend stores device state in `gdriveStatus.device_flow` and starts polling `GET /api/cloud/gdrive/status` every 2 seconds.
6. Backend thread `_device_flow_poll_loop` polls Google token endpoint until success/error/expired.
7. On success backend persists tokens in `/data/gdrive/tokens.json` and updates in-memory state to `connected`.
8. Frontend polling sees `connected=true`, stops timer, reloads status/schedule.

## Persistence / state
- Tokens file: `/data/gdrive/tokens.json`
- Config file: `/data/gdrive/config.json`
- Schedule file: `/data/gdrive/schedule.json`
- In-memory transient state:
  - `_gdrive_device_state`
  - `_gdrive_device_stop`
  - `_gdrive_lock`

## Config inputs currently used
- Add-on options (`file_editor_plus/config.yaml`):
  - `gdrive_client_id`
- No client secret currently read for device flow.

## Endpoints currently wired
- `GET /api/cloud/gdrive/status`
- `POST /api/cloud/gdrive/device/start`
- `POST /api/cloud/gdrive/device/cancel`
- `POST /api/cloud/gdrive/disconnect`
- `POST /api/cloud/gdrive/backup`
- `GET /api/cloud/gdrive/schedule`
- `PUT /api/cloud/gdrive/schedule`
