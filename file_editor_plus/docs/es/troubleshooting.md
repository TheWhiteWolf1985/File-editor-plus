# Troubleshooting

Usa esta página como checklist rápida cuando algo no funciona.

## No veo iconos
- Recarga la página una vez.
- Verifica que la build frontend esté actualizada.
- En Ingress, prueba cerrar y volver a abrir la pestaña.

## El texto parece desaparecer en archivos largos
- Verifica que estés en la última versión del add-on.
- Cambia de pestaña y vuelve al archivo.
- Si continúa, recoge logs y reporta el archivo afectado.

## Reload YAML inicia pero no cambia nada
- Revisa si el archivo editado es realmente reloadable.
- Valida la sintaxis YAML.
- Si hace falta, ejecuta Restart Core.

## Dónde ver logs
- Logs del add-on:
```bash
docker exec hassio_cli ha apps logs local_file_editor_plus --follow
```
- Logs de Supervisor:
```bash
docker exec hassio_cli ha supervisor logs -n 220
```

## Qué incluir en un reporte
- Versión del add-on
- Pasos exactos realizados
- Mensaje de error en UI
- Extracto de logs relevante (sin datos sensibles)
