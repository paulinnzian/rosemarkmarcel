# Plan de lancement : le site de Marcel

Date : 2026-10-31. On annonce le nouveau site de Marcel à son public et aux marques. Ce n'est pas un produit : pas de liste d'attente, pas de Product Hunt ni de Hacker News, pas de fiche App Store ou Google Play (voir « Sans objet » en bas). Le domaine n'est pas encore choisi : `{{domaine}}` partout ci-dessous.

## 1. Avant la mise en ligne (bloquant)

Le travail de /replica-deploy. Comptes et clés créés **par vous ou par Marcel** (`backend.md`, « Passer en production ») :

- [ ] domaine, Vercel, projet Supabase (Europe), `pnpm exec supabase db push`, seed chargé une fois ;
- [ ] SMTP Resend sur le domaine (sinon le code de connexion de Marcel risque de ne pas arriver) ;
- [ ] variables Vercel, dont `CRON_SECRET` (vérification quotidienne des liens) ;
- [ ] compte de Marcel : `pnpm admin:add <son e-mail> owner`, puis **une connexion réelle sur son téléphone** (cas F04-M1) ;
- [ ] pg_cron : purge des statistiques à 13 mois (la page Confidentialité l'annonce comme « prévue ») ;
- [ ] relecture juridique de `/confidentialite`.

Validé par Marcel, dans l'admin, sur son téléphone :

- [ ] compteurs d'abonnés à jour (`/admin/reseaux`) : la date « mis à jour le … » apparaît ;
- [ ] phrase sur les frais gardée, modifiée ou masquée (`/admin/dons`) ;
- [ ] dons : lien de paiement réel collé et testé avec un petit montant (cas F03-M1), ou dons laissés fermés pour le lancement ;
- [ ] message WhatsApp prérempli et numéro (`/admin/contact`) ;
- [ ] une sauvegarde téléchargée et gardée (`/admin`, « Télécharger une sauvegarde »).

Pas fait, à décider : le passage VoiceOver sur iPhone (`fixes.md` #7) et le cas F01-M1 (lien ouvert depuis le navigateur intégré d'Instagram et de TikTok, là où arrive la plupart du public).

## 2. Pré-lancement : un cercle de 5 à 10 personnes (remplace la liste d'attente)

Deux à trois jours avant l'annonce, Marcel envoie le lien par WhatsApp à 5 à 10 proches ou fans fidèles, sur des téléphones variés (Android d'entrée de gamme compris). Il leur demande d'ouvrir le site depuis Instagram et TikTok, de toucher « Discuter sur WhatsApp », et de dire ce qui ne marche pas.

- Coller d'abord le lien dans une conversation avec soi-même : l'aperçu (photo, titre) doit apparaître. WhatsApp garde le premier aperçu en cache, il faut donc le voir juste **avant** tout partage public.
- Leurs retours, **avec leur accord**, vont dans `replica/reviews.csv` (source `entretien`, lien vers la note datée). Jamais sur le site comme témoignages.

## 3. Le jour de l'annonce

Là où est son public, d'après les compteurs du site : TikTok (393 400), Facebook (340 000), Instagram (55 600), YouTube. Le bon endroit, c'est ses propres canaux, pas des communautés extérieures.

1. Remplacer le lien de la bio Instagram et TikTok par `https://{{domaine}}`.
2. Publier l'annonce sur chaque réseau, avec une story « lien » sur Instagram et le lien en commentaire épinglé sur TikTok et Facebook.
3. Message sur sa chaîne WhatsApp et son statut WhatsApp.
4. Le soir même : regarder `/admin/statistiques` (vues, clics par réseau, conversations WhatsApp) et la carte « Liens du site » du tableau de bord.

Brouillons, **à réécrire par Marcel dans sa voix**. Ils ne promettent rien que le site ne fasse pas :

> Mon site fait peau neuve ✦ Tout Le Repos au même endroit : mes réseaux, mes vidéos, et un bouton pour m'écrire directement sur WhatsApp. Lien en bio. Un peu de rire, beaucoup de Repos.

> Les marques, les projets, les idées : tout passe maintenant par mon site, un bouton et on discute sur WhatsApp. 👉 {{domaine}}

Si les dons sont ouverts le jour J, une phrase en plus : « Et pour ceux qui demandaient comment me soutenir : c'est sur le site, au montant que vous voulez. » Ne pas l'écrire si les dons sont fermés.

## 4. Les marques

La section Contact est faite pour elles (F02). Marcel envoie le lien du site, par message direct, aux marques avec qui il a déjà travaillé ou discuté. Un seul message, sans relance automatique :

> Bonjour [prénom], mon nouveau site est en ligne : {{domaine}}. Tout y est, mes réseaux et un bouton pour m'écrire sur WhatsApp pour un prochain projet. À bientôt !

Je ne connais pas ces marques : la liste est à faire par Marcel.

## 5. Mesurer (statistiques et erreurs)

- **Statistiques** : déjà en place, sans cookie (`/admin/statistiques`). La première semaine sert de point de départ : on note les chiffres sans se fixer d'objectif avant d'avoir des données réelles. On regarde J+1, J+7 et J+30 : vues, clics par réseau, conversations WhatsApp, clics sur « soutenir ».
- **Liens** : vérifiés chaque jour ; un lien cassé apparaît sur le tableau de bord.
- **Erreurs** : pas d'outil de suivi branché. Les erreurs serveur sont visibles dans les journaux Vercel (Runtime Logs). Un outil comme Sentry demanderait un compte créé par vous et une mise à jour de la page Confidentialité ; non fait.

## 6. Les 10 premières personnes à qui parler

5 fans, 5 marques, choisis par Marcel, par message ou appel, dans les deux semaines après l'annonce. Les questions (`fixes.md`) :

1. Qu'est-ce qui l'agace aujourd'hui pour mettre son site à jour ? (pour Marcel lui-même, après une semaine d'usage de l'admin)
2. Les marques l'ont-elles contacté par le site ? Par quel bouton ?
3. Des fans ont-ils demandé comment le soutenir, et avec quel moyen de paiement ?

Ce qui revient au moins trois fois devient une ligne de `features.csv`, et peut-être une FAQ (`landing.md`).

## Sans objet, et pourquoi

| élément de la skill | raison |
| --- | --- |
| Grille tarifaire, produits Stripe | rien à vendre (`pricing.md`) |
| Fiche App Store / Google Play, `listing.json`, `listing.py` | c'est un site, pas une app : pas de store, pas de revue Apple 4.1. L'équivalent est l'aperçu de partage (titre, description, image), vérifié par le test F01-E6 |
| Liste d'attente ou bêta | remplacée par le cercle de 5 à 10 personnes (§ 2) |
| Product Hunt, Hacker News, communautés des utilisateurs mécontents de l'original | l'original est le site de Marcel ; son public est sur ses propres réseaux |
| Preuve sociale | seulement les compteurs communiqués par Marcel ; aucun avis, aucune note, aucun logo |
