# System

⚠️ Estas acciones pueden afectar la disponibilidad de Home Assistant. Úsalas con cuidado.

## Reload YAML
- Intenta recargar la configuración YAML compatible.
- Según la versión/entorno de HA, puede usar estrategias de recarga distintas.
- Si la recarga no es suficiente, puede seguir siendo necesario reiniciar Core.

## Restart Core
- Reinicia Home Assistant Core.
- Es normal una desconexión temporal durante el reinicio.

## Restart Supervisor
- Reinicia Supervisor (gestión de add-ons).
- También aquí es normal una desconexión breve.

## Reboot Host
- Reinicia el host/sistema operativo.
- Afecta a todos los servicios en ejecución.

## Shutdown Host
- Apaga el host/sistema operativo.
- Úsalo solo si sabes cómo volver a encender el sistema.

## Requisitos previos
- El add-on debe ejecutarse con contexto Supervisor.
- Si faltan token/permisos, la UI muestra un error claro.
