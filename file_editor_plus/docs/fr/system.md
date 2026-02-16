# System

⚠️ Ces actions peuvent impacter la disponibilité de Home Assistant. Utilisez-les avec prudence.

## Reload YAML
- Essaie de recharger la configuration YAML prise en charge.
- Selon la version/l'environnement HA, des stratégies de reload différentes peuvent être utilisées.
- Si le reload ne suffit pas, un redémarrage Core peut rester nécessaire.

## Restart Core
- Redémarre Home Assistant Core.
- Une déconnexion temporaire est normale pendant le redémarrage.

## Restart Supervisor
- Redémarre Supervisor (gestion des add-ons).
- Une courte déconnexion est normale ici aussi.

## Reboot Host
- Redémarre l'hôte / système d'exploitation.
- Impacte tous les services en cours.

## Shutdown Host
- Éteint l'hôte / système d'exploitation.
- À utiliser seulement si vous savez comment rallumer le système.

## Prérequis
- L'add-on doit s'exécuter avec le contexte Supervisor.
- Si token/permissions manquent, l'UI affiche une erreur claire.
