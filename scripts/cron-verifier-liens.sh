#!/bin/sh
# Vérification quotidienne des liens du site, lancée par hPanel > Avancé > Cron Jobs (Hostinger refuse les
# guillemets et les redirections dans le champ de commande, d'où ce script).
#   Commande : /bin/sh <chemin du site>/scripts/cron-verifier-liens.sh
#   Réglages : $HOME/.vitrine-cron (chmod 600), deux lignes :
#     SITE_URL=https://<domaine>
#     CRON_SECRET=<même valeur que la variable d'environnement de l'application>
set -eu
. "$HOME/.vitrine-cron"
curl -fsS --max-time 100 -H "Authorization: Bearer $CRON_SECRET" "$SITE_URL/api/liens/verifier" > /dev/null
