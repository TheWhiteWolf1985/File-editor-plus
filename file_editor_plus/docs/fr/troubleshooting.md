# Troubleshooting

Utilisez cette page comme checklist rapide quand quelque chose ne fonctionne pas.

## Je ne vois pas les icônes
- Rechargez la page une fois.
- Vérifiez que la build frontend est à jour.
- En Ingress, essayez de fermer et rouvrir l'onglet.

## Le texte semble disparaître dans les gros fichiers
- Vérifiez que vous êtes sur la dernière version de l'add-on.
- Essayez de changer d'onglet puis revenir au fichier.
- Si le problème continue, récupérez les logs et signalez le fichier concerné.

## Reload YAML démarre mais rien ne change
- Vérifiez que le fichier modifié est bien reloadable.
- Vérifiez la syntaxe YAML.
- Si nécessaire, utilisez Restart Core.

## Où voir les logs
- Logs add-on :
```bash
docker exec hassio_cli ha apps logs local_file_editor_plus --follow
```
- Logs Supervisor :
```bash
docker exec hassio_cli ha supervisor logs -n 220
```

## Que joindre dans un signalement
- Version de l'add-on
- Étapes exactes effectuées
- Message d'erreur UI
- Extrait de logs pertinent (sans données sensibles)
