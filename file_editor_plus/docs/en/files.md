# Files and folders

This page covers the basic file/folder operations.

## Create files or folders
- From the **File** menu you can start creating:
  - a new file
  - a new folder
- Explorer also provides quick actions.

## Upload and download
- Upload is available in the Explorer UI.
- For export/backup, use the dedicated actions where available.

## Automatic backups
- Some operations (for example replace) can create copies of edited files in `/config/.fep-backups/`.
- Retention: for each file, the latest N backups are kept (default 50).
- You can change N by setting the `FEP_BACKUP_KEEP_LAST` environment variable (0 disables pruning).

## Practical naming tips
- Use clear names (`automation_lights.yaml`, `script_backup.yaml`).
- Avoid unusual characters unless necessary.

## Limits and caution
- Paths are relative to `/config`.
- Destructive operations (move/delete) ask for confirmation where supported.
- If you move files used by Home Assistant, verify references afterwards.
