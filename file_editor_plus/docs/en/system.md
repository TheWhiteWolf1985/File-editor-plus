# System

⚠️ These actions can affect Home Assistant availability. Use them carefully.

## Reload YAML
- Tries to reload supported YAML configuration.
- Depending on HA version/environment, different reload strategies may be used.
- If reload is not enough, a Core restart may still be needed.

## Restart Core
- Restarts Home Assistant Core.
- Temporary disconnection is expected during restart.

## Restart Supervisor
- Restarts Supervisor (add-on management).
- A short disconnection is normal here too.

## Reboot Host
- Reboots the host/operating system.
- Affects all running services.

## Shutdown Host
- Shuts down the host/operating system.
- Use only if you know how to power it back on.

## Prerequisites
- The add-on must run with Supervisor context.
- If token/permissions are missing, the UI shows a clear error.
