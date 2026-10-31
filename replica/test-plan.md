# Plan de test : site de Rosemark Marcel

Build : commit de ce plan (voir `git log replica/test-plan.md`)  Date : 2026-10-31  Env : local, build de production (port 3100), Supabase local, Mailpit, base remise à zéro par `e2e/global-setup.ts`

Lancer : `pnpm test:unit` (Vitest), `pnpm exec supabase test db` (pgTAP), `pnpm test:e2e` (Playwright ; Supabase local démarré).
Chaque spec Playwright échoue aussi sur toute erreur console, exception ou réponse 5xx (`e2e/support/test.ts`).

## Résultat du 2026-10-31

| suite | cas | passés | échoués |
| --- | --- | --- | --- |
| Playwright (`e2e/`), 3 passages consécutifs | 25 | 25 × 3 | 0 |
| Vitest (`src/**/*.test.ts`) | 48 | 48 | 0 |
| pgTAP (`supabase/tests/database/rls.test.sql`) | 29 | 29 | 0 |
| Lighthouse mobile (local, 3 mesures) | 4 catégories | perf 96-97, a11y 100, bonnes pratiques 100, SEO 100 | — |

Mis à jour après les corrections de /replica-entrepreneur. Des passages ratés en cours de route ne comptent pas : la machine swappait (18 Go sur 19, charge 30-40), toutes les erreurs étaient des délais de mise en place ; les trois passages ci-dessus ont été faits après un redémarrage, charge 2-4.

Bugs trouvés : 5 (S2 : 1, S3 : 2, S4 : 2) ; 4 corrigés, BUG-005 (S4, Next) ouvert. Détail dans `replica/bugs.md`.

## Cas

| case | parcours | type | étapes | attendu | auto | résultat |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | visiteur suit un réseau | heureux | `/` à 390 px, « Entrez dans l’univers », carte Facebook | ancre #communaute, carte https en nouvel onglet, axe sans violation, pas de débordement | e2e | ok |
| F01-E1 | | toutes les cartes | lire chaque carte réseau | https + `target=_blank` partout | e2e | ok |
| F01-E2 | | réseau sans compteur | carte YouTube | texte de remplacement « Mes vidéos » dans le nom accessible | e2e | ok |
| F01-E3 | | largeur bureau | `/` à 1440 px | pas de débordement, axe sans violation | e2e | ok |
| F01-E4 | | clavier | première tabulation | « Aller au contenu » reçoit le focus | e2e | ok |
| F01-N1 | | page inconnue | `/cette-page-n-existe-pas` | statut 404, titre « Cette page s’est mise au repos. », bouton de soutien, axe | e2e | ok |
| F01-E5 | | confidentialité, frais | section Soutenir, puis lien « Confidentialité » du pied de page | phrase « Le site ne prend rien sur votre don » ; page `/confidentialite` (pas de cookie, champs comptés), pas de débordement, axe | e2e | ok |
| F01-E6 | | partage du lien | balises de `/`, puis l'image `og:image` | og:title, og:description, og:image 1200 px de large, carte `summary_large_image`, image PNG servie | e2e | ok |
| F01-M1 | | navigateur intégré Instagram / TikTok | ouvrir le site depuis l’app, toucher une carte | le lien s’ouvre | manuel | à faire sur un vrai téléphone |
| F02-H1 | marque contacte | heureux | lien WhatsApp | `https://wa.me/2250706400690?text=` + message encodé exact | e2e | ok |
| F02-H2 | | appel | lien du numéro | `tel:+2250706400690`, nom accessible avec le numéro | e2e | ok |
| F02-E1 | | message avec `&` et `?` | changer le message dans l’admin | message intact après encodage (F04-H4) | e2e | ok |
| F02-M1 | | app WhatsApp installée | toucher le lien sur un téléphone | conversation ouverte avec le message prérempli | manuel | à faire sur un vrai téléphone |
| F03-H1 | fan veut donner (fermé) | heureux | bouton épinglé | modale « bientôt », focus sur Fermer, Échap ferme, focus rendu, axe | e2e | ok |
| F03-H2 | fan donne (ouvert) | heureux | lien collé + dons ouverts | le bouton épinglé ouvre le lien de paiement (F04-H1) | e2e | ok |
| F03-M1 | | paiement réel | payer avec le vrai lien Wave / Orange Money | paiement abouti chez le service | manuel | à faire avec le lien réel de Marcel |
| F04-N1 | admin | sans session | ouvrir 7 écrans admin | redirection vers `/admin/connexion` | e2e | ok |
| F04-N2 | | adresse inconnue / compte hors liste | demander un code, puis le saisir | même message pour les deux, aucun e-mail pour l’inconnue, refus après le code | e2e | ok |
| F04-E6 | | code pas reçu | demander un code, attendre une vraie minute, renvoyer | conseils (indésirables, « Promotions »), « Renvoyer le code » inactif avec compte à rebours, actif après 60 s, nouveau code envoyé, le plus récent connecte | e2e (61 s d'attente réelle : avec l'horloge factice, Next n'applique plus la réponse de l'action) | ok |
| F04-H0 | | connexion | code à 6 chiffres lu dans Mailpit | tableau de bord | e2e (global-setup) | ok |
| F04-E1 | | chaque écran | 8 écrans à 390 px | titre, pas de débordement, axe sans violation | e2e | ok |
| F04-H1 | | dons | lien http, ouverture sans lien, lien https + ouverture, puis retour | erreurs sous les champs, saisie conservée, bouton public = lien, lien vérifié après l'enregistrement (« injoignable » sur le tableau de bord : un nom en `.test` ne se résout jamais), retour à la modale | e2e | ok |
| F04-H2 | | textes | champ vide, couleur sur une ligne absente, accents + émoji | erreurs lisibles ; texte publié tel quel sur `/` ; restauration | e2e | ok |
| F04-H3 | | photo | 120 px, faux PNG, PNG détouré, PNG sans transparence, retour à l’origine | refus clairs ; photo servie par next/image ; avertissement transparence ; aucun fichier orphelin | e2e | ok |
| F04-H4 | | contact | numéro « 07 06 », message WhatsApp avec `&` | refus ; message public mis à jour | e2e | ok |
| F04-H8 | | ajouter un contact | e-mail « marcel@ », puis adresse en majuscules | erreur « Adresse e-mail invalide. » ; ajout, adresse en minuscules, formulaire d'ajout retiré, lien `mailto:` public | e2e | ok |
| F04-H5 | | réseaux | ajout sans réseau, ajout Snapchat, monter, masquer | erreur ; carte publique ; ordre public ; carte retirée | e2e | ok |
| F04-H6 | | statistiques | base vide, puis vrai navigateur sans session + appels API | « Pas encore de données » ; vue et clic comptés ; robot, admin connecté, origine étrangère, type inconnu écartés ; chiffres et « Comptage depuis le … » dans l’écran | e2e | ok |
| F04-H9 | | sauvegarde, liens | télécharger la sauvegarde ; l'appeler sans session ; tâche quotidienne sans, avec un mauvais, avec le bon secret ; « Vérifier maintenant » | fichier `sauvegarde-site-AAAA-MM-JJ.json` sans comptes ni statistiques ; 307 vers la connexion ; 401, 401, 200 ; « Dernière vérification » affichée | e2e | ok |
| F04-H7 | | accès | ajout gestionnaire, doublon, connexion du gestionnaire, retrait | gestionnaire sans accès à « Accès » mais aux dons ; retrait → redirigé vers la connexion | e2e | ok |
| F04-E2 | | double clic sur Enregistrer | | bouton inactif pendant l’envoi | revue de code (`SubmitRow`) | ok |
| F04-E3 | | deux admins en même temps | | le dernier enregistrement gagne ; date visible dans « Dernières modifications » | manuel | accepté (architecture.md) |
| F04-E4 | | envoi avant chargement du JavaScript | | boutons inactifs jusqu’à l’hydratation (`useHydrated`) | revue de code | ok |
| F04-M1 | | e-mail réel | recevoir le code sur un vrai téléphone via le SMTP de production | e-mail en boîte de réception, pas en spam | manuel | à faire en production |
| RLS-1 à 29 | base | accès | anonyme, connecté non admin, admin | lecture publique seule, écritures refusées, statistiques, fichiers et vérification des liens réservés aux admins | pgTAP | ok |
| M-VO | admin | lecteur d'écran | VoiceOver sur iPhone : connexion, dons, réseaux, onglets du bas et menu « Plus » | chaque contrôle annoncé avec son nom et son état | manuel | à faire sur un vrai iPhone (fixes.md #7) |

## Tests unitaires (Vitest)

- `src/lib/admin/image-info.test.ts` (7) : PNG avec ou sans transparence (bloc tRNS), JPEG, WebP VP8X et VP8L, faux fichier.
- `src/lib/admin/stats.test.ts` (4) : jours en UTC (fin de mois, 29 février), totaux, jours vides, données hors période.
- `src/lib/links/check.test.ts` (29) : adresses publiques ou refusées (privé, boucle locale, 169.254, IPv6 locale, IPv4 dans IPv6), classement des réponses (404, réseaux à page de connexion, 401 / 403 / 429 / 999, 5xx, panne réseau), redirections (3 au plus, chacune revérifiée), http et port refusés, HEAD refusé puis GET.
- `src/lib/admin/form-values.test.ts` (8) : lecture des champs (lignes, paragraphes, titres, champs vides) et règles du contenu (couleur du titre, 4 lignes, https, dons sans lien).
