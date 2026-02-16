# System

⚠️ Diese Aktionen können die Verfügbarkeit von Home Assistant beeinflussen. Bitte vorsichtig verwenden.

## Reload YAML
- Versucht, unterstützte YAML-Konfiguration neu zu laden.
- Je nach HA-Version/Umgebung werden unterschiedliche Reload-Strategien genutzt.
- Wenn Reload nicht ausreicht, kann ein Core-Neustart weiterhin nötig sein.

## Restart Core
- Startet Home Assistant Core neu.
- Eine kurze Unterbrechung der Verbindung ist normal.

## Restart Supervisor
- Startet Supervisor neu (Add-on-Verwaltung).
- Auch hier ist eine kurze Unterbrechung normal.

## Reboot Host
- Startet den Host / das Betriebssystem neu.
- Betrifft alle laufenden Dienste.

## Shutdown Host
- Fährt den Host / das Betriebssystem herunter.
- Nur verwenden, wenn du weißt, wie das System wieder gestartet wird.

## Voraussetzungen
- Das Add-on muss im Supervisor-Kontext laufen.
- Wenn Token/Berechtigungen fehlen, zeigt die UI eine klare Fehlermeldung.
