# Troubleshooting

Nutze diese Seite als schnelle Checkliste, wenn etwas nicht funktioniert.

## Ich sehe keine Icons
- Lade die Seite einmal neu.
- Prüfe, ob der Frontend-Build aktuell ist.
- In Ingress: Tab schließen und erneut öffnen.

## Text scheint bei langen Dateien zu verschwinden
- Prüfe, ob du die neueste Add-on-Version nutzt.
- Wechsle den Tab und gehe zurück zur Datei.
- Wenn es bleibt, sammle Logs und melde die betroffene Datei.

## Reload YAML startet, aber nichts ändert sich
- Prüfe, ob die bearbeitete Datei wirklich reloadable ist.
- Prüfe die YAML-Syntax.
- Falls nötig, nutze Restart Core.

## Wo Logs prüfen
- Add-on Logs:
```bash
docker exec hassio_cli ha apps logs local_file_editor_plus --follow
```
- Supervisor Logs:
```bash
docker exec hassio_cli ha supervisor logs -n 220
```

## Was in einen Bug-Report gehört
- Add-on-Version
- Exakte Schritte
- UI-Fehlermeldung
- Relevanter Log-Auszug (ohne sensible Daten)
