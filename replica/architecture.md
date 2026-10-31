# Architecture : site de Rosemark Marcel (reconstruction de sa vitrine « Le Repos ») + admin

Lit : `replica/recon.md`, `replica/features.csv` (cas B confirmé).
Date : 2026-10-31

Décisions du 2026-10-31 :
- **Backend + tableau de bord admin**, sur **Next.js + Supabase** (remplace le « pas de base de données » initial).
- L'admin modifie : **lien de paiement et dons**, **réseaux et compteurs**, **textes et photo**, **contact**, et affiche des **statistiques** de clics.
- **Dons = un lien de paiement collé dans l'admin.** Aucun prestataire intégré (Jèko retiré, pas de Stripe). Lien vide ou dons désactivés = modale « Les dons arrivent bientôt ».
- **Bouton de soutien épinglé** en bas de l'écran pendant le défilement, sur toutes les pages publiques.

## Stack

| couche | choix | pourquoi |
| --- | --- | --- |
| web + admin + backend | Next.js (App Router, version stable courante) + TypeScript strict, un seul dépôt | site public, `/admin` et routes serveur au même endroit, un seul déploiement |
| style | Tailwind CSS, tokens issus de /replica-design | une seule feuille ; l'admin réutilise les mêmes tokens |
| polices | `next/font/google` | auto-hébergées au build, pas de décalage de mise en page |
| base de données | Postgres sur Supabase | managé, gratuit au départ, RLS natif, tableau SQL pour dépanner |
| accès aux données | `@supabase/ssr` + requêtes typées (types générés par `supabase gen types`) | pas d'ORM : 6 tables, des requêtes simples |
| validation | Zod (formulaires admin, jsonb des sections, route d'événements) | la même règle côté client et serveur |
| auth | Supabase Auth, **lien magique / code par e-mail**, sans mot de passe | Marcel se connecte depuis son téléphone ; liste blanche `admin_users` |
| fichiers | Supabase Storage, bucket `public-media` (lecture publique, écriture admins) | photo détourée et futures images ; `next/image` sert du WebP/AVIF |
| paiements | **aucun prestataire intégré** | le bouton ouvre le lien de paiement collé dans l'admin |
| e-mail | SMTP Resend branché sur Supabase Auth | le SMTP par défaut de Supabase est limité à quelques e-mails par heure |
| tâches | pg_cron (purge des statistiques > 13 mois) | dans la base, pas de serveur de tâches |
| statistiques | table `click_events` + `navigator.sendBeacon` | sans cookie ni IP, donc pas de bannière ; lisibles dans l'admin |
| tests | Vitest (validation, formatage, RLS via client anon/admin) + Playwright (F01–F04, mobile) | prépare /replica-test |
| hébergement | Vercel + domaine personnalisé ; Supabase région la plus proche (eu-west / Francfort ou Londres) | pas de région Afrique de l'Ouest chez Supabase ; l'Europe est la plus proche d'Abidjan |

Un seul projet, une seule base. Pas de CMS tiers : l'admin est un petit nombre de formulaires sur 5 tables.

## Schéma

Tables : 6 (`admin_users`, `site_content`, `donation_settings`, `social_links`, `contact_channels`, `click_events`) + 1 vue (`click_daily`) + 1 bucket (`public-media`). Accès : **Row Level Security** sur toutes les tables. Voir `replica/schema.sql` (première migration).

| table | rôle | accès |
| --- | --- | --- |
| `admin_users` | liste blanche des comptes admin (`owner` = Marcel, `editor` = gestionnaire invité) | lecture : soi-même ou admin ; écriture : owner seulement |
| `site_content` (1 ligne) | nom, accroche, photo (chemin + dimensions + alt), textes des sections en `jsonb` validé par Zod | lecture publique ; mise à jour admin |
| `donation_settings` (1 ligne) | `enabled`, `payment_url` (https), libellés des boutons, textes, textes de la modale | lecture publique ; mise à jour admin ; `enabled` impossible sans lien |
| `social_links` | réseau, pseudo, URL, `followers` (null = sans compteur), date de mise à jour, ordre, visibilité | lecture publique des visibles ; écriture admin |
| `contact_channels` | WhatsApp / téléphone (E.164 vérifié) / e-mail, message pré-rempli (WhatsApp seulement), ordre, visibilité | lecture publique des visibles ; écriture admin |
| `click_events` | vues et clics : type, cible, page, pays, appareil, heure | écriture serveur seulement (clé service) ; lecture admin |

`src/content.ts` reste dans le dépôt comme **valeurs initiales** : il génère `seed.sql` (contenus actuels de Marcel) et sert de repli si la base ne répond pas au build.

## Comment le site reste rapide malgré la base

La page publique est **statique avec revalidation à la demande** : elle est générée une fois, servie depuis le CDN, et régénérée seulement quand un admin enregistre (`revalidateTag("contenu")` dans chaque action d'enregistrement). Aucun appel à Supabase pendant la visite, sauf l'envoi d'événements en arrière-plan. Lighthouse mobile ≥ 90 reste atteignable.

## Routes

### Public

| méthode chemin | fait | qui | entrée | sortie | parcours |
| --- | --- | --- | --- | --- | --- |
| GET `/` | page complète S00–S06 + M01 + bouton épinglé, lue en base, mise en cache (tag `contenu`) | tous | — | HTML statique | F01 F02 F03 |
| POST `/api/evenements` | enregistre une vue ou un clic | tous, limité en débit | `{ kind, target?, path }` (Zod) | `204` ; `400` ; `429` | statistiques |
| GET 404 | page d'erreur avec bouton épinglé et lien vers l'accueil | tous | — | HTML statique | — |
| GET `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | référencement et aperçu WhatsApp (`/admin` en `noindex`, exclu du sitemap) | tous | — | générés | — |

### Admin (protégé par le middleware + vérification `is_admin` dans chaque action)

| méthode chemin | fait | qui | entrée | sortie | parcours |
| --- | --- | --- | --- | --- | --- |
| GET `/admin/connexion` | demande d'un lien magique / code par e-mail | tous | e-mail | e-mail envoyé (message identique que l'adresse soit admin ou non) | F04 |
| GET `/admin/auth/callback` | échange le code contre une session, refuse si non admin | lien de l'e-mail | `code` | redirection `/admin` ou `/admin/connexion?refus` | F04 |
| GET `/admin` | tableau de bord : vues et clics 7 / 30 jours, état des dons, dernières modifications, raccourcis | admin | — | page | F04 |
| GET + action `/admin/dons` | coller / retirer le lien de paiement, activer / désactiver les dons, libellés et textes, bouton « tester le lien » | admin | formulaire Zod | enregistrement + revalidation | F04 |
| GET + actions `/admin/reseaux` | ajouter, modifier, masquer, réordonner les réseaux ; saisir les compteurs (date mise à jour auto) | admin | formulaire Zod | idem | F04 |
| GET + action `/admin/contenus` | textes du héros, à propos, univers, communauté, contact, bandeau ✦, pied de page | admin | formulaire Zod | idem | F04 |
| GET + action `/admin/photo` | envoyer la photo détourée (PNG/WebP, ≤ 5 Mo), texte alternatif, aperçu | admin | fichier | envoi au bucket, dimensions lues, revalidation | F04 |
| GET + actions `/admin/contact` | numéro WhatsApp, téléphone, e-mail, message pré-rempli, bouton « tester sur WhatsApp » | admin | formulaire Zod | idem | F04 |
| GET `/admin/statistiques` | vues et clics par jour, par type (réseau, WhatsApp, appel, don), par réseau, par appareil, par pays | admin | période | page (vue `click_daily`) | F04 |
| GET + actions `/admin/acces` | inviter / retirer un gestionnaire (`editor`) | owner | e-mail | ligne `admin_users` | F04 |
| action `deconnexion` | ferme la session | admin | — | redirection | F04 |

Nouveau parcours :

```
F04 Marcel met à jour son site depuis son téléphone
    /admin/connexion -> e-mail -> lien magique -> /admin -> /admin/dons -> colle le lien -> Enregistrer
    -> la page publique est régénérée (quelques secondes) -> le bouton épinglé ouvre le lien
    clics sur le chemin heureux : 5 (dont 1 dans l'e-mail)
    cas limites : e-mail non admin ; lien magique expiré ou ouvert dans un autre navigateur ; lien de paiement en http ;
                  photo trop lourde ou sans transparence ; deux admins qui enregistrent en même temps
```

Webhooks : aucun. Tâches : pg_cron quotidien (purge `click_events` > 13 mois). Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement), `NEXT_PUBLIC_SITE_URL`.

## Bouton de soutien épinglé

- Dans le layout du site public (groupe de routes `(site)`), donc sur toutes les pages publiques ; pas dans l'admin.
- `position: fixed` en bas à droite, décalé de `env(safe-area-inset-bottom)` / `env(safe-area-inset-right)` ; z-index au-dessus du contenu, sous la modale ; toujours visible pendant le défilement.
- Le `body` réserve un espace en bas : le pied de page et le bouton WhatsApp restent visibles et cliquables.
- Comportement unique via `SupportButton` : dons activés et lien présent → ouvre le lien (nouvel onglet) ; sinon → modale M01. Chaque clic envoie un événement `donation` (cible `floating`, `hero` ou `section`).
- Cible tactile ≥ 44 × 44 px, nom accessible, focus visible, contraste AA, caché à l'impression.

## Ce qui peut mordre

- **Fuite de la clé service** : `SUPABASE_SERVICE_ROLE_KEY` contourne RLS. Elle ne sert qu'à `/api/evenements`, dans un module `server-only` ; jamais `NEXT_PUBLIC_`.
- **RLS mal écrite = site modifiable par n'importe qui** : tests automatiques avec le client anonyme (doit lire, ne doit rien écrire) et avec un compte non admin (doit être refusé). Activer RLS dans la même migration que chaque table.
- **Liste blanche** : l'inscription libre est désactivée dans Supabase Auth ; un e-mail inconnu reçoit le même message qu'un admin (pas de fuite de la liste), puis est refusé au retour.
- **Lien magique ouvert dans un autre navigateur** (Gmail sur téléphone ouvre souvent son navigateur intégré) : proposer aussi le **code à 6 chiffres** à taper.
- **E-mails d'auth** : SMTP par défaut limité ; brancher Resend (domaine du site, SPF/DKIM) avant de donner l'accès à Marcel.
- **Supabase gratuit mis en pause après 7 jours sans activité** : la page publique reste servie depuis le cache, mais l'admin et les statistiques tombent. Les événements de visite suffisent à garder le projet actif ; sinon passer au plan Pro.
- **Revalidation oubliée** : une action d'enregistrement qui ne revalide pas laisse l'ancien contenu en ligne. Une seule fonction `saveAndPublish()` fait l'écriture + `revalidateTag`.
- **Statistiques gonflées** : filtrer les robots (user-agent), limiter `/api/evenements` par IP sans la stocker, ignorer les visites de l'admin connecté.
- **Données personnelles** (loi ivoirienne 2013-450, ARTCI) : ni IP, ni cookie, ni identifiant ; seulement pays et type d'appareil, purgés après 13 mois. Les e-mails des admins sont les seules données personnelles.
- **Photo** : refuser au-delà de 5 Mo, accepter PNG/WebP avec transparence ; lire les dimensions à l'envoi (pas de décalage de mise en page). La photo fournie fait 1024 × 1535 px, PNG transparent, 2,3 Mo : suffisant pour le héros (≈ 400 px de large à densité 2 sur mobile).
- **Lien de paiement externe** : le site ne sait pas si un don a abouti ; seul le clic est compté. Bouton « tester le lien » dans l'admin.
- **Deux admins en même temps** : le dernier enregistrement gagne ; acceptable avec 1 à 2 admins, `updated_at` affiché pour repérer un conflit.
- **Performance** : photo LCP en `priority` ; bandeau en CSS pur ; JS client limité à la modale et au beacon ; l'admin est dans un autre groupe de routes et n'alourdit pas la page publique.

## Ordre de construction

1. **Tranche verticale** : projet Supabase + migration `schema.sql` + `seed.sql` depuis `content.ts` ; page `/` qui lit `site_content` + `social_links` (S01, S04, mise en cache) ; `/admin/connexion` + `/admin/reseaux` (modifier un compteur) ; revalidation. Prouve : connexion → enregistrement → page publique à jour, sur un vrai téléphone.
2. **Site public complet (must)** : S00, S02, S03, S05, S06 + M01, `SupportButton` + bouton épinglé, 404, pied de page, états (aucun compteur, réseau masqué, contact sans WhatsApp, dons désactivés), accessibilité, Lighthouse ≥ 90.
3. **Admin complet (must)** : `/admin` tableau de bord, `/admin/dons`, `/admin/contenus`, `/admin/photo`, `/admin/contact`, tests RLS, SMTP Resend, code à 6 chiffres.
4. **Statistiques (must)** : `/api/evenements` + beacon, filtre robots, `/admin/statistiques`, purge pg_cron.
5. **Should-haves** : `/admin/acces` (gestionnaire invité), bandeau ✦, étiquette inclinée, animations légères, Open Graph + aperçu WhatsApp, domaine personnalisé.
6. **Could-haves** : brouillon / aperçu avant publication, historique des modifications, données structurées `Person`, synchro automatique des compteurs par API officielles.
7. **Corrections de /replica-entrepreneur**, s'il est lancé.
