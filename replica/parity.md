# Parité : site de Rosemark Marcel

Date : 2026-10-31, mis à jour après /replica-build (favicon, bouton WhatsApp, cadre photo, barre d'onglets admin). Clone : build de production local. Original : captures de `replica/screens/` (aucune nouvelle visite de son site).
Outils : `parity.py` et `imgdiff.py` de /replica-diff, sans modification.

Historique : premier passage 91,7 (fonctionnel 99,0, mise en page 62,7) ; après les corrections 92,7 (100,0 et 63,6).

## Verdict : meilleur que l'original (better than the original)

Mise à jour du 2026-10-31, après les corrections de /replica-entrepreneur : 6 des 7 corrections sont faites (vérification des liens, aide quand le code n'arrive pas, statistiques datées, page Confidentialité, sauvegarde, phrase sur les frais), plus l'ajout d'un moyen de contact et l'aperçu de partage. Reste le passage VoiceOver sur un vrai iPhone. Parité fonctionnelle 100, 31 indispensables sur 31 ; Lighthouse mobile 96-97 / 100 / 100 / 100. Le détail ci-dessous date du passage précédent (verdict « livrable »).

### Passage précédent : livrable (shippable)

- Toutes les fonctionnalités indispensables de l'original sont faites : 31 sur 31.
- Score fonctionnel : 100,0 (80 demandé).
- Aucun bug S1 ou S2 ouvert (`replica/bugs.md` : 4 trouvés, 4 corrigés).
- Pas encore « meilleur que l'original » au sens du pack : /replica-entrepreneur n'a pas tourné. Le clone a déjà ce que l'original n'a pas (admin complet, statistiques, dons activables), mais ce n'est pas encore une liste de corrections pensée pour les visiteurs.
- Avant la mise en ligne, hors parité : SMTP de production, purge pg_cron, politique de confidentialité, vérifications manuelles sur un vrai téléphone (`replica/test-plan.md`, cas M). C'est le travail de /replica-deploy.

| mesure | score |
| --- | --- |
| **Global** | **92,7 / 100** |
| Fonctionnel (pondéré must 3, should 2, could 1) | 100,0 (35 lignes comptées) |
| Mise en page (19 paires de captures) | 63,6 |

## Fonctionnel

Plus aucun manque. Le dernier (**[should] favicon**) est fait : `src/app/icon.svg` + `apple-icon.png`.

Reclassé pendant ce diff : « Mention de la source des chiffres » passe de `partial` à `yes`. L'original affiche « Chiffres communiqués par … · Synchronisation automatique non activée. » Le clone affiche « Chiffres communiqués par Marcel · mis à jour le … » : même information pour le visiteur (chiffres saisis à la main), texte modifiable dans l'admin. Le `partial` venait de la future variante « synchro auto », qui relève d'une autre ligne, absente de l'original. Avant ce reclassement : 97,5 et 30 must-haves sur 31.

Hors score : 32 lignes que l'original n'a pas (admin, statistiques, dons activables, etc.). Liste complète dans la sortie de `parity.py`.

## Mise en page

Méthode : une capture pleine page par largeur, découpée **section par section** (une seule route : les « écrans » S00 à S06 sont des sections). Comparer la page entière d'un bloc pénalise tout ce qui suit le premier décalage : à 390 px le clone est 100 px plus long, et le score pleine page tombe à 33,1 (45,0 à 1440). Bornes des sections : lues dans le DOM du clone, et repérées dans la capture de l'original par ses bandes de fond (script dans le scratchpad de la session, pas de requête vers l'original).

| section | 390 px | 1440 px | ce qui diffère vraiment |
| --- | --- | --- | --- |
| S00 en-tête | 51,7 | 84,8 | rien de structurel ; police |
| S01 accueil | 44,8 | 64,4 | **corrigé** : cadre photo recadré (3/4 mobile, 4/5 bureau) ; hauteur 827 px contre 824 en bureau (977 avant), 959 contre 901 en mobile (1016 avant) ; reste le paragraphe sur 3 lignes en mobile (police) |
| bandeau | 43,7 | 52,2 | mobile : l'original tient sur **une ligne coupée au bord**, le clone passe à la ligne (3 lignes, 120 px au lieu de 65) |
| S02 à propos | 65,6 | 77,4 | police |
| S04 communauté | 66,7 | 78,5 | police |
| S03 univers | 45,0 | 68,9 | carte « Ça, c'est Le Repos » un peu plus haute ; police |
| S06 soutenir | 70,8 | 83,3 | police |
| S05 contact | 37,1 | 65,2 | **corrigé** : bouton WhatsApp pleine largeur sous 1024 px, comme l'original ; reste le paragraphe sur une ligne en bureau (police) |
| pied | 68,1 | 81,0 | police |
| modale dons (390, même défilement) | 63,4 | — | bouton « Fermer » orange pleine largeur dans le clone, bleu compact dans l'original ; titre sur deux lignes |

Lecture honnête du 63,6 : la structure (blocs, ordre, hiérarchie) est la même partout, vérifiée à l'œil sur les images côte à côte. Le score est tiré vers le bas par la police : Inter Tight dans le clone (choix de /replica-design), une sans-serif de type Arial dans les captures de l'original. D'autres lignes coupent donc à d'autres endroits, et la carte des contours change de case. Les vrais écarts de structure sont les quatre en gras ou chiffrés ci-dessus.

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
| bandeau mobile | une ligne coupée au bord | phrases complètes sur 3 lignes | garder par défaut (tout est lisible, sans animation) ; spec /replica-design corrigée en « écart assumé » ; à revoir si Marcel préfère une ligne |

## Les cinq points du premier passage

1. **Favicon** : fait (`icon.svg` + `apple-icon.png`).
2. **Bouton WhatsApp pleine largeur sur mobile** : fait.
3. **Bandeau mobile** : retour à la ligne gardé par défaut, spec corrigée (« écart assumé ») ; à repasser sur une ligne si Marcel préfère l'original.
4. **Cadre photo de l'accueil** : fait (hauteur de l'accueil quasi égale à l'original en bureau).
5. **Barre d'onglets en bas de l'admin sur mobile** : faite (Accueil, Dons, Réseaux, Textes, Plus ; barre latérale 240 px sur ordinateur), test F04-E5.

Le score de mise en page restant (63,6) vient de la police ; ne pas le chasser (la police est un choix de /replica-design).
Ensuite : /replica-entrepreneur pour passer de « livrable » à « meilleur que l'original », puis /replica-deploy.
