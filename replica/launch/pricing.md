# Tarifs : sans objet

Date : 2026-10-31. On lance le site de Marcel auprès de son public, pas une offre (choix fait pour /replica-launch). Il n'y a rien à vendre : pas d'abonnement, pas de formule, pas de produit Stripe à créer.

## Ce qui en tient lieu : les dons

- Montant libre, payé sur le service de Marcel (Wave, Orange Money…) par le lien collé dans `/admin/dons`. Le site ne touche pas l'argent et ne prend rien dessus.
- La section Soutenir le dit : « Le site ne prend rien sur votre don : seuls les frais de votre service de paiement s'appliquent. » **À valider par Marcel** avant l'annonce (`fixes.md` #6). Il peut la modifier ou la masquer dans `/admin/dons`.
- Tant qu'aucun lien n'est collé, les dons restent fermés et les boutons affichent « Les dons arrivent bientôt ». C'est un état normal pour le lancement.

## Ce que disaient les avis sur le prix, et pourquoi ça compte quand même

Proxy de catégorie (outils de lien en bio, pas le site de Marcel ; `fixes.md`) : prix trop élevés et en hausse (35 avis), prélèvements sans prévenir ou résiliation difficile (16), fonctions utiles réservées à l'offre payante (16), commissions sur les revenus (13), sur 2 sources. Pour Marcel, la réponse est déjà dans l'architecture : le site est à lui, sans abonnement à un outil ni commission.

Coûts réels pour Marcel, à confirmer à l'inscription (les prix changent, à relire le jour où il crée les comptes) : hébergement Hostinger (l'hébergement d'applications Node.js demande un plan payant Business ou Cloud), base Supabase, envoi d'e-mails Resend et nom de domaine. Les offres gratuites de Supabase et Resend suffisent probablement au trafic d'un site vitrine. Le plan gratuit de Supabase met le projet en pause après 7 jours sans activité (`backend.md`, étape 9). Je n'ai relevé aucun prix ici : aucune page de tarifs n'a été lue pendant cette session.

## Si `vitrine-createur` devient une offre pour d'autres créateurs

Relancer /replica-launch avec ce choix. Il faudra alors : relever les tarifs publics de 2 ou 3 outils (URL + date), choisir le modèle (sans abonnement piège : `fixes.md`, angle A), les produits Stripe (créés par vous), et une marque propre (/replica-brand).
