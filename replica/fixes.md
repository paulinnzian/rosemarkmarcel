# Ce qui ne va pas ailleurs, et ce qu'on corrige

Date : 2026-10-31. Données : `replica/reviews.csv` (texte exact, un lien par ligne), classement : `replica/feedback.md` (`reviews.py` avec les thèmes de `replica/themes.json`).

## D'abord : l'échantillon, honnêtement

**L'original (le site de Rosemark Marcel) n'a aucun avis public trouvable.** C'est un site vitrine personnel : pas de fiche App Store ou Google Play, pas de page G2, Capterra ou Trustpilot, pas de tableau de demandes, pas de changelog. Recherche Hacker News (API Algolia, sans tolérance aux fautes) sur « Rosemark Marcel » : 0 résultat. Les vrais retours sur le site viendront de Marcel et de son public (voir « Ce qu'il faut demander à Marcel » en bas).

**Ce qui suit est donc un proxy de catégorie** : ce que les créateurs reprochent aux outils de page « lien en bio », que ce site remplace pour Marcel. Ce sont des avis sur Linktree, Stan, Milkshake et Beacons, pas sur l'original.

| source | ce qui a été lu | lignes |
| --- | --- | --- |
| App Store, flux RSS officiel des avis (us + fr, les plus récents) | Linktree, Stan, Milkshake, Beacons : 2 pages en us, 1 en fr (la 2e page fr est vide) | 413 (dont 6 doublons retirés par l'outil) |
| Hacker News, API Algolia | commentaires contenant « linktree », ou « link in bio » avec un mot d'outil (page, app, platform, paid, free, alternative, creator…) ; 193 trouvés, 166 gardés | 166 |
| **total** | 2 types de sources, 4 produits | **579 après dédoublonnage** |

Non atteint : la consigne demande au moins trois sources. Reddit demande une application OAuth à créer par vous (je ne crée pas de compte) ; G2, Capterra et Trustpilot se lisent page par page dans un navigateur, pas fait ici. Les avis App Store n'ont pas de lien individuel : le lien de chaque ligne est la page du flux qui la contient. Les avis 5 étoiles sont nombreux (Milkshake 94, Stan 76) et ne disent presque rien ; les thèmes viennent surtout des 1 à 3 étoiles, lus à la main.

## 1. Ce qu'ils détestent

Classés par le score de `reviews.py` (avis faibles et récents pèsent plus). « mince » = moins de 3 avis ou une seule source.

1. **L'éditeur plante ou ne répond pas.** 45 avis, 2 sources.
   « It just crashes when you try to add a link. Thats the whole point of the app is to add links » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
2. **Impossible de se connecter ou de créer son compte, le code n'arrive pas.** 36 avis, 2 sources.
   « Can’t even make a new account because I’m not being sent a verification code at all. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
   « chargement infini, aucun réception de mail. » (Beacons, 1★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=6444589346/sortBy=mostRecent/json
3. **Trop cher, et de plus en plus.** 35 avis, 2 sources.
   « Linktree a multiplié son prix par 4 en un an, passant de 30€/an à 120€/an. » (Linktree, 1★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
4. **Prélevé sans prévenir, résiliation difficile.** 16 avis, 2 sources.
   « They charge without notifications, renew without authorizations and never refund. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
5. **Pression permanente pour passer à l'offre payante.** 16 avis, 2 sources.
   « The constant popups on the app to upgrade to the pro version feel extremely predatory. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
6. **L'outil prend sa part sur les revenus du créateur.** 13 avis, 2 sources.
   « they take cuts from your affiliate links or they make you upgrade to pro for a monthly fee » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
   « The platforms that are supposed to empower them are taking a cut of their earnings. » (Hacker News) https://news.ycombinator.com/item?id=45433537
7. **Statistiques fausses, figées ou à zéro.** 12 avis, 2 sources.
   « Les stats (ou « insight ») ne sont jamais mises à jour sur la version mobile pendant des jours » (Linktree, 1★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
   « I have noticed as I login every day the analytics are always different some saying more. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
8. **Comptes bannis, contenus retirés.** 10 avis, 2 sources.
   « Will moderate post saying they’re “Illegal” or “regulated” this includes backpacks. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
9. **Conditions d'utilisation, IA, droits sur le contenu.** 7 avis, 2 sources.
   « They updated their terms of service so they get to do whatever they want with your content » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
   « Linktree never needed AI in the first place. » (Hacker News) https://news.ycombinator.com/item?id=47482970
10. **La page ou les liens ne marchent pas pour les visiteurs.** 6 avis, 2 sources.
    « Nothing more frustrating than a customer clicking the link in your bio and your storefront doesn’t load and gives an error message. » (Beacons, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=6444589346/sortBy=mostRecent/json
    « someone commented on one of my videos that my link for instagram wasn’t working » (Milkshake, 1★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=1452719910/sortBy=mostRecent/json
11. **Enfermé dans l'outil, ou l'outil ferme.** 5 avis, 2 sources.
    « I’m trying to get out of it but it wants » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
    « after Linktree folded the app » (Hacker News) https://news.ycombinator.com/item?id=49513879
12. **Pas en français** (mince : 7 avis, une seule source).
    « Mettez nous vite l’appli en français c’est une vraie galère !!!!!! » (Linktree, 2★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
13. **Inutilisable au lecteur d'écran** (mince : 5 avis, une seule source).
    « I open it and my screen reader isnt able to read anything on it. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json

## 2. Ce qui manque

1. **Personnalisation** : 44 mentions, 2 sources, mais note moyenne 4,1 : surtout des compliments ; peu d'attente précise.
2. **Rester simple, ne pas tout tourner vers la vente** : 7 avis, 2 sources.
   « WAY TO FOCUSED on monetizing on products and links. » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=2/id=1593515263/sortBy=mostRecent/json
   « I just wanted to replacement for a link tree, but this one has way more options than what I need. » (Beacons, 3★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=6444589346/sortBy=mostRecent/json
3. **Être prévenu** (messages, ventes) : 7 avis, 2 sources ; peu utile ici (Marcel est prévenu par WhatsApp et par son service de paiement).
4. **Recevoir l'argent directement** (mince : 6 commentaires, Hacker News seulement).
   « I want to give you money, pls put Venmo, Zelle, Cash App, Patreon, etc handles in your linktree thx » https://news.ycombinator.com/item?id=46455345
5. **Domaine à son nom** (mince : 4 avis).

## 3. Ce que personne ne résout

1. **Le créateur qui veut une présence, pas une boutique.** Les outils poussent la vente, les commissions et les offres payantes. Preuves : thèmes 5, 6 et « rester simple » ; « for someone who is not interested in monetizing my online presence » (Linktree, 1★) https://itunes.apple.com/us/rss/customerreviews/page=1/id=1593515263/sortBy=mostRecent/json
2. **Le créateur francophone, hors Europe et États-Unis** (mince). Interfaces en anglais, inscription bloquée : « Impossible de se connecter avec un numéro français » (Stan, 2★) https://itunes.apple.com/fr/rss/customerreviews/page=1/id=6478343472/sortBy=mostRecent/json
   Aucun avis lu ne parle de mobile money (Wave, Orange Money) : je ne l'affirme pas comme une demande.
3. **Le créateur aveugle ou malvoyant** (mince, une source) : thème 13.

## Ce que le clone règle déjà (ne pas le refaire)

| thème | pourquoi c'est déjà réglé | où |
| --- | --- | --- |
| 3, 4, 5 prix, prélèvements, offre payante | le site appartient à Marcel : pas d'abonnement à un outil, pas d'offre « pro », rien à résilier | architecture |
| 6 commissions | les dons ouvrent directement le lien Wave / Orange Money collé par Marcel ; le site ne touche pas l'argent | `/admin/dons` |
| 8, 9, 11 bannissement, conditions, enfermement | son domaine, son code, sa base ; aucun tiers ne peut retirer la page ni réutiliser ses photos | architecture |
| 12 français | tout le site et l'admin sont en français | — |
| 1 éditeur instable (en partie) | 20 parcours testés à chaque changement ; la saisie n'est plus perdue sur erreur (BUG-003) | `e2e/` |

## Le plan : 7 corrections

Choisies par preuve × coût. Chacune ajoutée à `features.csv` (`original` = no).

| # | quoi | taille | skill | preuve |
| --- | --- | --- | --- | --- |
| 1 | **Vérifier les liens** : à l'enregistrement et chaque jour, tester le lien de paiement, les liens réseaux et WhatsApp ; afficher « lien cassé » sur le tableau de bord. Les réseaux qui bloquent les robots (Instagram, TikTok) sont marqués « non vérifiable », pas « cassé » | M | /replica-backend | thème 10 (6 avis, 2 sources) ; un lien de paiement cassé = un don perdu sans que Marcel le sache |
| 2 | **Code qui n'arrive pas** : à l'étape du code, dire où regarder (spams, promotions), le délai, et permettre de renvoyer après 60 s ; en production, SMTP Resend sur le domaine du site (déjà prévu) | S | /replica-backend | thème 2 (36 avis, 2 sources) |
| 3 | **Statistiques qu'on croit** : afficher depuis quand on compte, la dernière visite enregistrée, et ce qui n'est pas compté (robots, Marcel connecté) ; « 0 » seulement quand c'est vraiment 0 | S | /replica-build | thème 7 (12 avis, 2 sources) |
| 4 | **Page confidentialité courte et vraie** : pas de cookie côté visiteur, pas de publicité, aucune donnée revendue ni donnée à une IA, sous-traitants nommés (Supabase, Hostinger, Resend). Elle est de toute façon due avant la mise en ligne | S | /replica-build (+ relecture juridique) | thèmes 8 et 9 (17 avis, 2 sources) |
| 5 | **Sauvegarde téléchargeable** dans l'admin : textes, réseaux, contacts, réglages des dons en un fichier, plus la photo ; Marcel peut partir quand il veut | S | /replica-backend | thème 11 (5 avis, 2 sources) |
| 6 | **Dire où va l'argent** dans la section « Soutenir » : « Le site ne prend rien sur votre don ; seuls les frais de votre service de paiement s'appliquent. » Texte modifiable dans l'admin, à valider par Marcel | S | /replica-build | thème 6 (13 avis, 2 sources) |
| 7 | **Passage VoiceOver** sur l'admin, à la main, sur un iPhone (axe passe déjà sans violation) | S | /replica-test | thème 13 (mince : 5 avis, une source) |

### Où en est le plan (2026-10-31)

| # | état | où |
| --- | --- | --- |
| 1 | fait ; WhatsApp non testé : `wa.me` répond 200 pour n'importe quel numéro, le format du numéro est déjà validé à l'enregistrement | `src/lib/links/`, tableau de bord, `scripts/cron-verifier-liens.sh` |
| 2 | fait (côté site) ; reste le SMTP Resend de production, qui demande le compte de Marcel | `/admin/connexion` |
| 3 | fait | `/admin/statistiques` |
| 4 | fait ; relecture juridique recommandée | `/confidentialite` |
| 5 | fait ; pas de restauration en un clic (le fichier se relit, ou se recharge en SQL) | `/admin/sauvegarde` |
| 6 | fait ; phrase à valider par Marcel, modifiable ou masquable dans `/admin/dons` | section Soutenir |
| 7 | **pas fait** : demande un vrai iPhone entre les mains de quelqu'un | — |

Hors de ce plan : rien sur le prix ou la facturation (il n'y a rien à vendre) ; rien pour « être prévenu » (WhatsApp et le service de paiement le font).

## L'angle

Trois options, chacune tirée d'un thème du proxy. Pour le site de Marcel lui-même, l'angle sert surtout la page « confidentialité » et la phrase sous les dons ; il servira vraiment si `vitrine-createur` devient un modèle pour d'autres créateurs.

**A. Pas d'abonnement, pas de commission (recommandée)**
Pour les créateurs qui en ont assez de payer un outil de liens de plus en plus cher qui se sert sur leurs revenus, la vitrine est à leur nom : aucun abonnement à résilier, les dons vont directement sur leur Wave ou Orange Money.
Preuves : prix (35 avis), prélèvements (16), offre payante (16), commissions (13), sur 2 sources.

**B. Une présence, pas une boutique**
Pour les créateurs qui veulent qu'on les trouve, les suive et les contacte, sans transformer leur page en magasin, la vitrine montre qui ils sont, leurs réseaux et un bouton pour les écrire, rien de plus.
Preuves : « rester simple » (7 avis, 2 sources) + offre payante (16). Plus faible en volume.

**C. À vous, pour de bon**
Pour les créateurs qui craignent d'être bannis, enfermés ou réutilisés par une IA, la vitrine vit sur leur domaine, avec leurs données et une sauvegarde qu'ils emportent.
Preuves : bannissement (10), conditions et IA (7), enfermement (5), sur 2 sources. Fort en émotion, faible en volume.

**Recommandation : A**, avec B en appui. C'est le reproche le plus lourd du proxy, c'est déjà vrai dans le clone, et c'est ce qui compte pour un public qui donne en mobile money. Ne pas citer Linktree ni les autres outils sur le site : une comparaison nominative est une question pour un juriste.

## Ce qu'il faut demander à Marcel (le vrai retour sur l'original)

Les avis ci-dessus parlent des outils, pas de son site. Avant /replica-brand, trois questions à lui poser, et cinq à dix fans ou marques à interroger par WhatsApp :
1. Qu'est-ce qui l'agace aujourd'hui pour mettre son site à jour ?
2. Les marques l'ont-elles déjà contacté par le site ? Par quel bouton ?
3. Des fans ont-ils demandé comment le soutenir, et avec quel moyen de paiement ?
Leurs réponses, avec leur accord, vont dans `replica/reviews.csv` (source `entretien`, lien vers la note datée), jamais sur le site comme témoignages.
