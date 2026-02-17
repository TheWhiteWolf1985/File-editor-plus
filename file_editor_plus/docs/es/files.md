# Archivos y carpetas

Esta página cubre las operaciones básicas de archivos y carpetas.

## Crear archivos o carpetas
- Desde el menú **File** puedes crear:
  - un archivo nuevo
  - una carpeta nueva
- Explorer también ofrece acciones rápidas.

## Upload y download
- El upload está disponible en la interfaz Explorer.
- Para exportación/backup, usa las acciones dedicadas cuando existan.

## Backups automáticos
- Algunas operaciones (por ejemplo replace) pueden crear copias de los archivos editados en `/config/.fep-backups/`.
- Retención: para cada archivo se conservan los últimos N backups (por defecto 50).
- Puedes cambiar N con la variable de entorno `FEP_BACKUP_KEEP_LAST` (0 desactiva la limpieza).

## Consejos para nombres
- Usa nombres claros (`automation_lights.yaml`, `script_backup.yaml`).
- Evita caracteres extraños si no son necesarios.

## Límites y precaución
- Las rutas son relativas a `/config`.
- Operaciones destructivas (move/delete) piden confirmación cuando corresponde.
- Si mueves archivos usados por Home Assistant, revisa luego las referencias.
