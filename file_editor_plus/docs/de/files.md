# Dateien und Ordner

Diese Seite beschreibt die grundlegenden Datei-/Ordner-Operationen.

## Dateien oder Ordner erstellen
- Im Menü **File** kannst du erstellen:
  - eine neue Datei
  - einen neuen Ordner
- Der Explorer bietet ebenfalls Schnellaktionen.

## Upload und download
- Upload ist in der Explorer-Oberfläche verfügbar.
- Für Export/Backup nutze die vorgesehenen Aktionen, wenn vorhanden.

## Automatische Backups
- Manche Aktionen (zum Beispiel replace) können Kopien bearbeiteter Dateien in `/config/.fep-backups/` anlegen.
- Retention: pro Datei werden die letzten N Backups behalten (Standard: 50).
- Du kannst N über die Umgebungsvariable `FEP_BACKUP_KEEP_LAST` ändern (0 deaktiviert das Aufräumen).

## Praktische Namensregeln
- Verwende klare Namen (`automation_lights.yaml`, `script_backup.yaml`).
- Vermeide ungewöhnliche Zeichen, wenn sie nicht nötig sind.

## Grenzen und Vorsicht
- Pfade sind relativ zu `/config`.
- Destruktive Aktionen (move/delete) fragen nach Bestätigung, wenn vorgesehen.
- Wenn du von Home Assistant verwendete Dateien verschiebst, prüfe danach die Referenzen.
