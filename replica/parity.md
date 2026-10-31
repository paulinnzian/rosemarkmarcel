# Parité : site de Rosemark Marcel

Date : 2026-10-31. Clone : build de production local (commit 785cb93 + reclassement de la ligne « source des chiffres »). Original : captures de `replica/screens/` (aucune nouvelle visite de son site).
Outils : `parity.py` et `imgdiff.py` de /replica-diff, sans modification.

## Verdict : livrable (shippable)

- Toutes les fonctionnalités indispensables de l'original sont faites : 31 sur 31.
- Score fonctionnel : 99,0 (80 demandé).
- Aucun bug S1 ou S2 ouvert (`replica/bugs.md` : 4 trouvés, 4 corrigés).
- Pas encore « meilleur que l'original » au sens du pack : /replica-entrepreneur n'a pas tourné. Le clone a déjà ce que l'original n'a pas (admin complet, statistiques, dons activables), mais ce n'est pas encore une liste de corrections pensée pour les visiteurs.
- Avant la mise en ligne, hors parité : SMTP de production, purge pg_cron, politique de confidentialité, vérifications manuelles sur un vrai téléphone (`replica/test-plan.md`, cas M). C'est le travail de /replica-deploy.

| mesure | score |
| --- | --- |
| **Global** | **91,7 / 100** |
| Fonctionnel (pondéré must 3, should 2, could 1) | 99,0 (35 lignes comptées) |
| Mise en page (19 paires de captures) | 62,7 |

## Fonctionnel

Seul manque : **[should] SEO, favicon**. Titre et description sont en place ; l'icône est encore celle de Next.

Reclassé pendant ce diff : « Mention de la source des chiffres » passe de `partial` à `yes`. L'original affiche « Chiffres communiqués par … · Synchronisation automatique non activée. » Le clone affiche « Chiffres communiqués par Marcel · mis à jour le … » : même information pour le visiteur (chiffres saisis à la main), texte modifiable dans l'admin. Le `partial` venait de la future variante « synchro auto », qui relève d'une autre ligne, absente de l'original. Avant ce reclassement : 97,5 et 30 must-haves sur 31.

Hors score : 32 lignes que l'original n'a pas (admin, statistiques, dons activables, etc.). Liste complète dans la sortie de `parity.py`.

## Mise en page

Méthode : une capture pleine page par largeur, découpée **section par section** (une seule route : les « écrans » S00 à S06 sont des sections). Comparer la page entière d'un bloc pénalise tout ce qui suit le premier décalage : à 390 px le clone est 100 px plus long, et le score pleine page tombe à 33,1 (45,0 à 1440). Bornes des sections : lues dans le DOM du clone, et repérées dans la capture de l'original par ses bandes de fond (script dans le scratchpad de la session, pas de requête vers l'original).

| section | 390 px | 1440 px | ce qui diffère vraiment |
| --- | --- | --- | --- |
| S00 en-tête | 51,7 | 84,8 | rien de structurel ; police |
| S01 accueil | 45,4 | 54,2 | cadre photo plus grand dans le clone (+13 % de hauteur en mobile, +18 % en bureau) ; paragraphe sur 3 lignes au lieu de 2 en mobile |
| bandeau | 43,7 | 52,2 | mobile : l'original tient sur **une ligne coupée au bord**, le clone passe à la ligne (3 lignes, 120 px au lieu de 65) |
| S02 à propos | 65,6 | 77,4 | police |
| S04 communauté | 66,7 | 78,5 | police |
| S03 univers | 45,0 | 68,9 | carte « Ça, c'est Le Repos » un peu plus haute ; police |
| S06 soutenir | 70,8 | 83,3 | police |
| S05 contact | 34,9 | 56,5 | mobile : bouton WhatsApp **pleine largeur** dans l'original, à la largeur du texte dans le clone ; bureau : paragraphe sur une ligne |
| pied | 68,1 | 81,0 | police |
| modale dons (390, même défilement) | 63,4 | — | bouton « Fermer » orange pleine largeur dans le clone, bleu compact dans l'original ; titre sur deux lignes |

Lecture honnête du 62,7 : la structure (blocs, ordre, hiérarchie) est la même partout, vérifiée à l'œil sur les images côte à côte. Le score est tiré vers le bas par la police : Inter Tight dans le clone (choix de /replica-design), une sans-serif de type Arial dans les captures de l'original. D'autres lignes coupent donc à d'autres endroits, et la carte des contours change de case. Les vrais écarts de structure sont les quatre en gras ou chiffrés ci-dessus.

Images : `replica/diffs/sections/<section>-<largeur>-{orig,clone,diff}.png`, rapports JSON `replica/diffs/<section>-<largeur>.json`, pleine page `replica/diffs/home-390.png`, `home-1440.png`, `modal-dons-390.png`.

## Comportement

| parcours | l'original fait | le clone fait | décision |
| --- | --- | --- | --- |
| F01 suivre un réseau | héros → communauté → carte : 2 clics, nouvel onglet | identique ; « (nouvel onglet) » annoncé aux lecteurs d'écran ; date de mise à jour des compteurs | garder |
| F02 contacter | WhatsApp prérempli ou `tel:` : 2 clics | identique ; message et numéro modifiables dans l'admin, sans développeur | garder |
| F03 faire un don | modale « Les dons arrivent bientôt », le parcours n'aboutit pas | même modale tant que les dons sont fermés ; une fois le lien collé dans l'admin, **chaque bouton de soutien ouvre directement le paiement (1 clic)** | garder (gain) |
| erreurs | aucune saisie côté visiteur | aucune saisie côté visiteur ; 404 avec en-tête et bouton de soutien | garder |
| mémoire entre visites | rien | rien (aucun cookie côté visiteur) | garder |
| e-mails | aucun | aucun pour le visiteur ; code de connexion pour l'admin seulement | garder |
| mise à jour du contenu | inconnue côté visiteur (pas d'admin visible) | admin sur téléphone, publication immédiate | garder (gain) |
| bandeau mobile | une ligne coupée au bord | phrases complètes sur 3 lignes | **à trancher** : la spec /replica-design dit « passent à la ligne, comme l'original », ce que la capture contredit. Garder le retour à la ligne (tout est lisible, sans animation) ou repasser à une ligne |

## Les cinq prochaines choses à faire

1. **Favicon** : la seule fonctionnalité manquante (should). Une icône à partir de l'identité (bleu, ✦ orange) en `app/icon.svg` + `apple-icon.png`.
2. **Bouton WhatsApp pleine largeur sur mobile** (S05), comme l'original : cible plus grande pour le pouce, écart structurel le plus net.
3. **Bandeau mobile** : trancher entre une ligne (fidèle à l'original) et le retour à la ligne actuel, puis corriger la spec ou le composant pour qu'ils disent la même chose.
4. **Cadre photo de l'accueil** : ramener sa hauteur vers celle de l'original (−13 % mobile, −18 % bureau) pour que la section suivante arrive plus tôt.
5. **Barre d'onglets en bas de l'admin sur mobile** (spec AdminShell), le dernier écart du build côté admin.

Ensuite : /replica-build pour ces points, puis /replica-entrepreneur pour passer de « livrable » à « meilleur que l'original ».
