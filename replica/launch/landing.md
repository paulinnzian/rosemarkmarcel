# Page d'accueil : le lancement du site de Marcel

Date : 2026-10-31. Choix fait pour /replica-launch : on lance **le site de Marcel auprès de son public**, pas un produit à vendre. La « landing page » de la skill est donc la page d'accueil déjà construite (`src/app/(site)/page.tsx`). Rien de nouveau à construire. Ce fichier fait correspondre chaque section demandée par la skill à ce qui existe, et dit ce qui reste à faire avant l'annonce.

## Section par section

| section de la skill | sur le site de Marcel | état |
| --- | --- | --- |
| Accroche : ce qu'on fait, pour qui, un bouton | S01 accueil : « Un peu de rire. Beaucoup de Repos. », présentation en une phrase, bouton « Entrez dans l'univers », vraie photo de Marcel | en place |
| Le problème | sans objet : un site personnel ne vend pas une solution. Le visiteur vient voir Marcel, le suivre, l'écrire ou le soutenir (`recon.md`, F01 à F03) | — |
| Comment ça marche, en trois étapes | les trois parcours de la page : suivre sur un réseau (S04), contacter (S05), soutenir (S06) | en place |
| Les points forts, liés aux corrections de `fixes.md` | côté visiteur : la phrase sur les frais (#6, section Soutenir), la page Confidentialité (#4, pied de page), l'aperçu de partage WhatsApp. Côté Marcel (admin) : liens vérifiés (#1), aide à la connexion (#2), statistiques datées (#3), sauvegarde (#5) | en place, #6 à valider par Marcel |
| Tarifs | sans objet (`pricing.md`) | — |
| Questions fréquentes | pas de FAQ sur l'original, et pas de vraies questions recueillies. À ajouter seulement si les fans ou les marques posent les mêmes questions après le lancement (voir `launch-plan.md`, « Les 10 premières personnes ») | non fait, volontairement |
| Dernier appel à l'action | bouton de soutien épinglé + section Contact en bas de page | en place |

## Preuve sociale : ce qui est affiché, et d'où ça vient

- Les compteurs d'abonnés (Facebook 340 000, Instagram 55 600, TikTok 393 400 dans les valeurs initiales) sont des chiffres **communiqués par Marcel**, et le site le dit. Aucun avis, aucune note, aucun logo de presse ou de marque n'est affiché, et il ne faut pas en ajouter sans accord écrit.
- **Avant l'annonce** : Marcel met à jour les compteurs dans `/admin/reseaux`. Les valeurs initiales n'ont pas de date de mise à jour, donc la mention « mis à jour le … » n'apparaît qu'après cet enregistrement.
- Les avis lus pendant /replica-entrepreneur portent sur d'autres outils. Ils ne vont jamais sur le site.

## Vérifications faites (2026-10-31, build de production local)

| contrôle | résultat |
| --- | --- |
| Contraste, `contrast.py` de /replica-design | 25 paires de tokens, 0 échec AA ; couples ajoutés par les corrections : phrase des frais 6,52:1, conseils de connexion 14,79:1, page Confidentialité 15,89:1, aperçu de partage 10,36:1 (blanc) et 4,78:1 (orange, grand texte) |
| Lighthouse mobile 12.8.2, 3 mesures | performance 96-97, accessibilité 100, bonnes pratiques 100, SEO 100 ; LCP 2,6-2,8 s, CLS 0 |
| Aperçu de partage | image 1200×630, titre « Rosemark Marcel — Le Repos », description, test F01-E6 |
| Parcours | e2e 25/25 sur 3 passages |

À refaire sur le vrai domaine après /replica-deploy : Lighthouse, et l'aperçu en collant le lien dans une conversation WhatsApp avec soi-même. WhatsApp garde l'aperçu en cache, donc faire ce test **avant** l'annonce publique.

## Le nom de l'original

La règle de la skill (« le nom de l'original reste hors de l'app ») vise un concurrent. Ici l'original **est** le site de Marcel, refait pour lui avec son accord : son nom est la marque. La règle qui reste : ne nommer aucun outil de lien en bio (Linktree, Stan, Beacons, Milkshake) sur le site ni dans les annonces (`fixes.md`, « L'angle »).
