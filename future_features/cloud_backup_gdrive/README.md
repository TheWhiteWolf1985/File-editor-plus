# Cloud Backup Google Drive (quarantena)

## Perché disabilitata
La feature "Backup su cloud" è stata rimossa dal percorso attivo per evitare problemi di release e stabilità su OAuth/Ingress.
Il codice viene mantenuto in `future_features/cloud_backup_gdrive/` per poter essere riattivato in modo controllato.

## Cosa serve per riattivarla
- Ripristinare UI e API solo dopo validazione completa del flow OAuth in Ingress.
- Riallineare config/add-on options e documentazione utente.
- Ripristinare test dedicati e smoke end-to-end prima del rilascio.
