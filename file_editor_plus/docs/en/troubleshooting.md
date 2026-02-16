# Troubleshooting

Use this page as a quick checklist when something is not working.

## I cannot see icons
- Reload the page once.
- Check that frontend build is up to date.
- In Ingress, try closing and reopening the tab.

## Text seems to disappear on long files
- Verify you are on the latest add-on version.
- Try switching tabs and returning to the file.
- If it still happens, collect logs and report the affected file.

## Reload YAML starts but nothing changes
- Check whether the edited file is reloadable.
- Validate YAML syntax.
- If needed, run Restart Core.

## Where to check logs
- Add-on logs:
```bash
docker exec hassio_cli ha apps logs local_file_editor_plus --follow
```
- Supervisor logs:
```bash
docker exec hassio_cli ha supervisor logs -n 220
```

## What to include in a bug report
- Add-on version
- Exact steps performed
- UI error message
- Relevant log excerpt (without sensitive data)
