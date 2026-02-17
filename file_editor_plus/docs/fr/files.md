# Fichiers et dossiers

Cette page couvre les opérations de base sur les fichiers et dossiers.

## Créer des fichiers ou dossiers
- Depuis le menu **File**, vous pouvez créer :
  - un nouveau fichier
  - un nouveau dossier
- L'Explorer propose aussi des actions rapides.

## Upload et download
- L'upload est disponible dans l'interface Explorer.
- Pour l'export/sauvegarde, utilisez les actions dédiées lorsqu'elles existent.

## Sauvegardes automatiques
- Certaines opérations (par exemple replace) peuvent créer des copies des fichiers modifiés dans `/config/.fep-backups/`.
- Rétention : pour chaque fichier, les N dernières sauvegardes sont conservées (par défaut 50).
- Vous pouvez changer N via la variable d'environnement `FEP_BACKUP_KEEP_LAST` (0 désactive le nettoyage).

## Conseils de nommage
- Utilisez des noms clairs (`automation_lights.yaml`, `script_backup.yaml`).
- Évitez les caractères inhabituels si ce n'est pas nécessaire.

## Limites et prudence
- Les chemins sont relatifs à `/config`.
- Les opérations destructrices (move/delete) demandent une confirmation si prévue.
- Si vous déplacez des fichiers utilisés par Home Assistant, vérifiez les références ensuite.
