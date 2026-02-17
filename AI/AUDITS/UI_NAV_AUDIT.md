# UI Nav Audit — Topbar + Sidebar (Ingress)

Obiettivo: mappare **tutte** le voci/pulsanti in **Topbar** e **Sidebar** e verificare se sono **collegate** (UI -> handler -> service/API/endpoint) oppure no.

Source (UI):
- `file_editor_plus/frontend/src/app-root.ts`
- `file_editor_plus/frontend/src/features/system/system.ts`
- `file_editor_plus/frontend/src/services/api.ts`

Source (API backend):
- `file_editor_plus/backend/app.py`

Legenda stato:
- ✅ Connected: la voce invoca handler utile e/o chiamata API reale, oppure naviga a docs/viewer.
- ❌ Not connected: handler mancante/stub/TODO oppure voce disabilitata senza wiring reale.

## Tabella completa

| Area | Voce UI | Tipo | File:line | Handler | Service call | Endpoint/HA | Stato | Note |
|---|---|---|---|---|---|---|---|---|
| Topbar > File | New file | action | `file_editor_plus/frontend/src/app-root.ts:1894` | `handleMenuAction("file","New file")` | (state) `newItemKind="file"` -> create | `/api/file (PUT create_only=1)` | ✅ | Creazione effettiva avviene in flow "new item" |
| Topbar > File | New folder | action | `file_editor_plus/frontend/src/app-root.ts:1898` | `handleMenuAction("file","New folder")` | (state) `newItemKind="folder"` -> create | `/api/folder (POST)` | ✅ |  |
| Topbar > File | Save | action | `file_editor_plus/frontend/src/app-root.ts:1901` | `save()` | `apiSaveFile()` | `/api/file (PUT)` | ✅ |  |
| Topbar > File | Save as… | action | `file_editor_plus/frontend/src/app-root.ts:1903` | `triggerPathDownload(activePath)` | link download | `/api/fs/download (GET)` | ✅ | Download del file attivo |
| Topbar > File | Settings | route/modal | `file_editor_plus/frontend/src/app-root.ts:1906` | `openSettingsModal()` | `apiPutUserConfig()` (on apply) | `/api/user-config (PUT)` | ✅ | Impostazioni UI |
| Topbar > File | Import… | action | `file_editor_plus/frontend/src/app-root.ts:2684` | `openUploadModal()` | `apiUpload()` (nel modal) | `/api/upload (POST)` | ✅ | Apre modal upload |
| Topbar > File | Export… | action | `file_editor_plus/frontend/src/app-root.ts:2685` | `triggerPathDownload(activePath)` | link download | `/api/fs/download (GET)` | ✅ | Download del file attivo |
| Topbar > Edit | Undo | action | `file_editor_plus/frontend/src/app-root.ts:1910` | `handleUndoRedo("undo")` | N/A | N/A | ✅ | Gestione editor |
| Topbar > Edit | Redo | action | `file_editor_plus/frontend/src/app-root.ts:1912` | `handleUndoRedo("redo")` | N/A | N/A | ✅ |  |
| Topbar > Edit | Cut | action | `file_editor_plus/frontend/src/app-root.ts:1914` | `handleCopyCut("cut")` | N/A | N/A | ✅ | Clipboard |
| Topbar > Edit | Copy | action | `file_editor_plus/frontend/src/app-root.ts:1916` | `handleCopyCut("copy")` | N/A | N/A | ✅ | Clipboard |
| Topbar > Edit | Paste | action | `file_editor_plus/frontend/src/app-root.ts:1918` | `handlePaste()` | N/A | N/A | ✅ | Clipboard |
| Topbar > View | Menù strumenti | action | `file_editor_plus/frontend/src/app-root.ts:1951` | `handleMenuAction("view","Menù strumenti")` | `persistUserConfig()` | `/api/user-config (PUT)` | ✅ | Toggle toolbar |
| Topbar > View | Indent guides | action | `file_editor_plus/frontend/src/app-root.ts:1955` | `handleMenuAction("view","Indent guides")` | `persistUserConfig()` | `/api/user-config (PUT)` | ✅ | Toggle guide |
| Topbar > View | Reload tree | action | `file_editor_plus/frontend/src/app-root.ts:1922` | `reloadTree()` | `apiGetTree()` | `/api/tree (GET)` | ✅ |  |
| Topbar > View | Split view | action | `file_editor_plus/frontend/src/app-root.ts:1924` | toggle `splitViewEnabled` | `apiPutSession()` | `/api/session (PUT)` | ✅ | Persist session |
| Topbar > View | Compare… | action | `file_editor_plus/frontend/src/app-root.ts:1935` | toggle compare + `scheduleDiff()` | `apiPostDiff()` | `/api/diff (POST)` | ✅ | Richiede split view |
| Topbar > Help | Docs | route | `file_editor_plus/frontend/src/app-root.ts:1963` | `openDocumentation()` | `window.open("./docs/?page=index&lang=..")` | backend `/docs` | ✅ | Apre in `_blank` |
| Topbar > Help | About | modal | `file_editor_plus/frontend/src/app-root.ts:1961` | `openAboutModal()` | N/A | N/A | ✅ | Modal locale |
| Toolbar | Save | action | `file_editor_plus/frontend/src/app-root.ts:2708` | `save()` | `apiSaveFile()` | `/api/file (PUT)` | ✅ |  |
| Toolbar | Save all | action | `file_editor_plus/frontend/src/app-root.ts:2712` | `save()` | `apiSaveFile()` | `/api/file (PUT)` | ✅ | Semantica "save all" non analizzata qui (chiama `save()`) |
| Toolbar | Undo/Redo | action | `file_editor_plus/frontend/src/app-root.ts:2716` | `handleUndoRedo()` | N/A | N/A | ✅ |  |
| Toolbar | Search/Replace | action | `file_editor_plus/frontend/src/app-root.ts:2722` | `openSearchTab()` | N/A | N/A | ✅ | Porta al pane search |
| Toolbar | Indent | action | `file_editor_plus/frontend/src/app-root.ts:2728` | `indentFile()` | `apiFormatYaml()` | `/api/format/yaml (POST)` | ✅ |  |
| Toolbar | Split/Compare | action | `file_editor_plus/frontend/src/app-root.ts:2738` | `handleMenuAction("view",...)` | vedi View | vedi View | ✅ |  |
| Sidebar (Activity bar) | Explorer/Search/Entity/Snippet/Backup/Utility/System | route | `file_editor_plus/frontend/src/app-root.ts:2757` | `setActivity()` | N/A | N/A | ✅ | Cambia pane sidebar |
| Sidebar header | Close sidebar | action | `file_editor_plus/frontend/src/app-root.ts:2802` | set `sidebarOpen=false` | N/A | N/A | ✅ | Solo narrow layout |
| Sidebar > Explorer header | New File | action | `file_editor_plus/frontend/src/app-root.ts:2366` | set `newItemKind="file"` | create flow | `/api/file (PUT create_only=1)` | ✅ |  |
| Sidebar > Explorer header | New Folder | action | `file_editor_plus/frontend/src/app-root.ts:2375` | set `newItemKind="folder"` | create flow | `/api/folder (POST)` | ✅ |  |
| Sidebar > Explorer header | Upload | action | `file_editor_plus/frontend/src/app-root.ts:2384` | `openUploadModal()` | `apiUpload()` | `/api/upload (POST)` | ✅ |  |
| Sidebar > Search | Find | action | `file_editor_plus/frontend/src/app-root.ts:2440` | `performSearch()` | `apiSearch()` | `/api/search (POST)` | ✅ |  |
| Sidebar > Search | Replace all | action | `file_editor_plus/frontend/src/app-root.ts:2441` | `replaceAll()` | `apiSearchReplace*()` | `/api/search/replace/*` | ✅ | preview + apply |
| Sidebar > Entities | WS states | route | `file_editor_plus/frontend/src/ha-client.ts:42` | `HAClient.connect()` | WebSocket | `/api/ha/ws` | ✅ | Proxy backend |
| Sidebar > Entities | Insert entity id | action | `file_editor_plus/frontend/src/features/entities/entities.ts:268` | `insertEntityId()` | N/A | N/A | ✅ | Scrive nel testo |
| Sidebar > Snippets | Add / Modify / Delete | action | `file_editor_plus/frontend/src/app-root.ts:2504` | `openSnippetModal()` + CRUD | `apiCreate/Update/DeleteSnippet()` | `/api/snippets*` | ✅ |  |
| Sidebar > Backup | Local download | action | `file_editor_plus/frontend/src/app-root.ts:2462` | `runBackup("download")` | link download | `/api/backup (GET)` | ✅ | Download via `<a>` |
| Sidebar > Backup | Save as… | action | `file_editor_plus/frontend/src/app-root.ts:2474` | `runBackup("saveas")` | `apiGetBackup()` | `/api/backup (GET)` | ✅ | File System Access API se disponibile |
| Sidebar > Backup | Cloud | action | `file_editor_plus/frontend/src/app-root.ts:2486` | disabled | N/A | N/A | ❌ | Coming soon (disabilitato) |
| Sidebar > Utility | Generate debug log | action | `file_editor_plus/frontend/src/app-root.ts:2554` | `generateDebugLog()` | `apiGenerateDebugLog()` | `/api/utils/debug-log (POST)` | ✅ |  |
| Sidebar > Utility | Reset session | action | `file_editor_plus/frontend/src/app-root.ts:2565` | `apiResetSession()` | `apiResetSession()` | `/api/session/reset (POST)` | ✅ |  |
| Sidebar > System | Reload YAML / Restart / Reboot / Shutdown | action | `file_editor_plus/frontend/src/app-root.ts:2576` | `runSystemAction()` | `apiPostHaAction()` | `/api/ha/action (POST)` | ✅ | Backend inoltra a HA |

## NOT CONNECTED

1. Backup -> **Cloud**
   - `file_editor_plus/frontend/src/app-root.ts:2486`
   - Stato: disabilitato (coming soon)
   - Gap: OK se intenzionale; mantenere spiegazione in UI.
