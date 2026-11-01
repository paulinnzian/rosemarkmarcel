# Référencement et publicité

Comment faire trouver Rosemark Marcel sur Google, Bing et les assistants IA, et savoir d'où viennent les visites,
sans cookie ni traqueur. Les étapes techniques sont pour Paulin ; les sections 3, 5 et 6 concernent aussi Marcel.

Rappel de la promesse du site (page Confidentialité) : aucun cookie, aucun pixel publicitaire. Les visites sont
comptées de façon anonyme dans nos propres statistiques, qui enregistrent désormais la provenance de la visite :
`utm_source` (en minuscules) ou, à défaut, le site d'origine réduit à un nom (google, facebook, tiktok, whatsapp,
direct…), plus `utm_campaign`. Résultats dans `/admin/statistiques`, tableau « D'où viennent les visites ».
Seule la page d'arrivée porte une provenance : les pages vues ensuite sur le site ne comptent pas comme des accès
directs. Les navigateurs intégrés de Facebook, Instagram et TikTok n'indiquent souvent pas le site d'origine : sans
lien UTM, ces visites apparaissent en « Accès direct ». D'où la règle : un lien UTM partout où l'on poste le site.

## 1. Avant tout : le domaine

Le domaine n'est pas encore choisi : partout ci-dessous, `<domaine>` est à remplacer.

1. Dans hPanel > Node.js > Variables d'environnement : `NEXT_PUBLIC_SITE_URL` = `https://<domaine>` (sans barre
   finale). Les adresses canoniques, le sitemap, `robots.txt` et les données structurées (JSON-LD) en dépendent.
   Sans elle, ils pointent vers `http://localhost:3000` et Google ignore le site.
2. Variable `NEXT_PUBLIC_*` : elle est figée au build. Après l'avoir saisie ou modifiée, relancer un build complet.
3. Vérifier en ligne :

   ```bash
   curl -s https://<domaine>/robots.txt                  # Disallow /admin et /api, ligne Sitemap en https://<domaine>
   curl -s https://<domaine>/sitemap.xml | grep '<loc>'  # 7 adresses en https://<domaine>, jamais localhost
   curl -s https://<domaine>/manifest.webmanifest        # nom du site, couleurs, icônes
   curl -s 'https://<domaine>/univers?utm_source=test' | grep -o '<link rel="canonical"[^>]*>'
   # attendu : href="https://<domaine>/univers", sans paramètre utm
   ```

Les pages publiques sont `/`, `/a-propos`, `/univers`, `/communaute`, `/collaborations`, `/contact` et
`/confidentialite`. Tout le reste (`/admin`, `/api`) est exclu du référencement.

## 2. Google Search Console et Bing Webmaster Tools

### Inscription et vérification

- [ ] **Google** : search.google.com/search-console > Ajouter une propriété > **Préfixe de l'URL** `https://<domaine>`
      > méthode **Balise HTML**. Copier uniquement la valeur de `content="…"`.
- [ ] hPanel : variable `GOOGLE_SITE_VERIFICATION` = cette valeur, puis redéployer (nouveau build).
- [ ] Vérifier que la balise est en ligne, puis cliquer sur « Valider » dans Search Console :

      ```bash
      curl -s https://<domaine> | grep -o '<meta name="\(google-site-verification\|msvalidate.01\)"[^>]*>'
      ```

- [ ] **Bing** : bing.com/webmasters. Le plus simple est « Importer depuis Google Search Console ». Sinon, ajouter
      le site, méthode **Balise meta**, valeur dans `BING_SITE_VERIFICATION`, redéployer, valider.
- [ ] Ne jamais supprimer ces variables ensuite : la propriété serait perdue à la prochaine vérification.

Une propriété **Domaine** (enregistrement TXT chez Cloudflare) est possible aussi et couvre `www` ; la balise suffit
puisque `www` est redirigé vers `<domaine>` par Cloudflare.

### Premiers pas

- [ ] Sitemaps > ajouter `sitemap.xml` (Google et Bing). État attendu : « Opération effectuée », 7 URL découvertes.
- [ ] Inspection d'URL : coller `https://<domaine>/`, puis « Demander une indexation ». Refaire pour `/a-propos`,
      `/univers` et `/collaborations`. Inutile de le répéter à chaque modification : le sitemap suffit ensuite.
- [ ] Tester les données structurées sur validator.schema.org (accueil et `/univers`) : aucune erreur attendue.

### Ce qu'il faut regarder chaque mois

| Rapport | Ce qu'on cherche |
| --- | --- |
| Performances > Requêtes | Les recherches qui amènent du monde ; « rosemark marcel » doit être en tête |
| Performances > Pages | Quelle page reçoit les clics ; une page à 0 clic pendant des mois mérite un meilleur titre |
| Indexation des pages | 7 pages indexées ; toute page « Explorée, non indexée » est à examiner |
| Améliorations / Vidéos | Les épisodes de `/univers` reconnus sans erreur |
| Bing > Search Performance | Même lecture, à plus petite échelle |

## 3. Être reconnu comme une personne

Google et les assistants IA rapprochent les sources qui disent la même chose. Le but : un seul nom, une seule
description, des liens qui pointent les uns vers les autres.

- [ ] **Le nom** : « Rosemark Marcel » exactement, dans cet ordre, sur le site et comme nom affiché sur Facebook,
      Instagram, TikTok et YouTube. Le compte Instagram s'appelle `marcel_rosemark_officiel` : l'identifiant peut
      rester, mais le nom affiché doit être « Rosemark Marcel ».
- [ ] **La description** : reprendre la même phrase partout, par exemple « Web humoriste · Créateur du Repos ».
- [ ] **Le lien vers le site dans chaque bio** (avec le lien de suivi de la section 5) : bio Instagram, bio TikTok,
      section « À propos » de la page Facebook, liens de la chaîne YouTube.
- [ ] **Le panneau de connaissances Google** (encadré à droite des résultats) : il apparaît seul, quand Google est
      assez sûr de qui est Marcel. Quand il apparaît sur une recherche « Rosemark Marcel », Marcel clique sur
      « Revendiquer ce panneau de connaissances » et se connecte avec le compte Google de sa chaîne YouTube. Il
      pourra ensuite proposer des corrections (photo, description, liens).
- [ ] **Données structurées, déjà fournies par le site** : l'accueil décrit Marcel (`Person` : nom, « web humoriste »,
      photo, adresse du site, `sameAs` = ses profils sociaux visibles) et `/univers` décrit les épisodes affichés.
      Elles se mettent à jour seules quand un réseau est ajouté ou masqué dans l'admin. Rien à faire, sauf garder
      les liens des réseaux à jour dans l'admin.

**Assistants IA (ChatGPT, Perplexity…)** : ils citent des pages claires et des faits concordants.

- Des pages qui répondent directement : qui est Marcel (`/a-propos`), ce qu'est Le Repos (`/univers`), comment
  collaborer (`/collaborations`), comment le joindre (`/contact`).
- Les mêmes faits partout : nom, description, réseaux. Une bio différente sur chaque réseau brouille le portrait.
- Bing compte : plusieurs assistants s'appuient sur son index, d'où l'inscription à Bing Webmaster Tools.
- `robots.txt` n'interdit aucun robot sur les pages publiques ; le laisser ainsi.
- Les articles de presse ou de sites tiers qui parlent de Marcel pèsent beaucoup. Quand il y en a, les garder (et
  pourquoi pas les citer un jour sur le site). Pas de fiche Wikipédia ou Wikidata créée par nous-mêmes sans sources
  indépendantes : elle serait supprimée.

## 4. Mots-clés et pages

Une page = une intention de recherche. Le titre et la description de chaque page (dans l'admin) servent cette
intention, avec des phrases naturelles.

| Page | Recherche visée | Exemples de recherches |
| --- | --- | --- |
| `/` | La marque | « rosemark marcel », « marcel rosemark » |
| `/a-propos` | Qui est-il | « qui est rosemark marcel », « rosemark marcel humoriste » |
| `/univers` | La série | « le repos rosemark marcel », « le repos épisode », « le repos vidéo » |
| `/communaute` | Le suivre | « rosemark marcel tiktok », « rosemark marcel facebook » |
| `/collaborations` | Travailler avec lui | « humoriste web collaboration », « humoriste pour marque », « humoriste pour événement » |
| `/contact` | Le joindre | « contacter rosemark marcel », « rosemark marcel whatsapp » |
| `/confidentialite` | Aucune | Page de confiance, pas de mot-clé visé |

- « Le Repos » seul est un mot courant : impossible de se classer dessus. Toujours l'associer au nom
  (« Le Repos de Rosemark Marcel »).
- Pas de bourrage de mots-clés : répéter « humoriste » dix fois dans une page la fait reculer, pas avancer.
- Ne jamais écrire dans un titre ou une description un fait non vérifié (ville, chiffres, partenaires).

**Idées pour plus tard** (chacune ajoute des recherches possibles) :

- Une page par épisode (`/univers/<episode>`) : titre de l'épisode, quelques phrases de résumé, la vidéo. C'est le
  levier principal sur « le repos épisode » et sur les titres des vidéos.
- Une page « Presse » si des articles existent.
- Un kit média téléchargeable sur `/collaborations` pour les marques.

## 5. Liens de suivi (UTM)

Sans paramètre, une visite depuis l'application TikTok, Instagram ou WhatsApp arrive souvent sans site d'origine et
compte comme « direct ». Le lien de suivi corrige cela.

**Convention** (lettres minuscules, chiffres et tirets seulement ; pas d'espace, pas d'accent) :

| Paramètre | Rôle | Valeurs |
| --- | --- | --- |
| `utm_source` | La plateforme | `facebook`, `instagram`, `tiktok`, `youtube`, `whatsapp`, `meta`, `google` |
| `utm_medium` | L'emplacement | `bio`, `description`, `statut`, `message`, `paid`, `cpc` |
| `utm_campaign` | L'opération : minuscules, chiffres, `-` et `_` seulement (60 max) ; le reste est retiré | `repos-<episode>`, `pub-fans-2026-11`, `pub-marque` |

Les campagnes payantes commencent toutes par `pub-` : on les distingue ainsi des liens gratuits dans les statistiques,
qui affichent la source et la campagne (pas l'emplacement).

**Liens prêts à copier** :

| Où | Lien |
| --- | --- |
| Bio TikTok | `https://<domaine>/?utm_source=tiktok&utm_medium=bio` |
| Bio Instagram | `https://<domaine>/?utm_source=instagram&utm_medium=bio` |
| Page Facebook (À propos) | `https://<domaine>/?utm_source=facebook&utm_medium=bio` |
| Liens de la chaîne YouTube | `https://<domaine>/?utm_source=youtube&utm_medium=bio` |
| Description d'un épisode YouTube | `https://<domaine>/univers?utm_source=youtube&utm_medium=description&utm_campaign=repos-<episode>` |
| Statut WhatsApp | `https://<domaine>/?utm_source=whatsapp&utm_medium=statut` |
| Message à une marque | `https://<domaine>/collaborations?utm_source=whatsapp&utm_medium=message&utm_campaign=prospection` |
| Campagne Meta (fans) | `https://<domaine>/communaute?utm_source=meta&utm_medium=paid&utm_campaign=pub-fans-2026-11` |
| Campagne TikTok | `https://<domaine>/univers?utm_source=tiktok&utm_medium=paid&utm_campaign=pub-repos-2026-11` |
| Google Ads (marque) | `https://<domaine>/?utm_source=google&utm_medium=cpc&utm_campaign=pub-marque` |

Ces paramètres n'abîment pas le référencement : l'adresse canonique de chaque page reste l'adresse sans paramètre.

**Lire les résultats** : `/admin/statistiques` > « D'où viennent les visites » (visites par source et par campagne,
par jour). Les visites venues de Google sans paramètre sont le référencement naturel.

## 6. Publicité (SEA)

### Un plan réaliste pour un humoriste

| Plateforme | Objectif | Page d'arrivée |
| --- | --- | --- |
| Meta (Facebook, Instagram) | Gagner de l'audience, faire découvrir Le Repos | `/univers` ou `/communaute` |
| TikTok | Même chose, public plus jeune | `/univers` ou `/communaute` |
| Google Search | Protéger le nom : « Rosemark Marcel », « Le Repos Rosemark Marcel » | `/` |
| Google Search, plus tard | « humoriste pour événement », si Marcel veut ce type de demandes | `/collaborations` |

- Pour gagner des abonnés, une publication sponsorisée qui reste sur le réseau (bouton « Booster ») fait souvent
  mieux qu'une publicité vers le site. Ses résultats se lisent alors dans les statistiques du réseau, pas ici.
- Une publicité vers le site a un objectif précis : les fans vers `/univers` ou `/communaute`, les marques vers
  `/collaborations`, la prise de contact vers `/contact`. Une campagne, une page, un lien de suivi.
- Google sur le nom : utile surtout si quelqu'un d'autre achète « Rosemark Marcel » ou si le site n'est pas encore
  premier dans les résultats naturels. Sinon, c'est facultatif. Mots-clés en expression exacte, très petit budget.
- Sans pixel, les plateformes ne savent pas ce qui se passe sur le site : choisir l'objectif **Trafic** optimisé sur
  les **clics sur le lien** (l'option « vues de la page de destination » exige un pixel).

### Tester avant de dépenser

1. Un petit budget quotidien, fixé à l'avance, dans votre devise.
2. Deux ou trois visuels (vidéos courtes du Repos), même texte, même page d'arrivée.
3. Sept jours, sans rien modifier en cours de route.
4. Une seule campagne vers le site à la fois : les clics WhatsApp ne sont pas reliés à une source (aucun
   identifiant), on compare donc la période de la campagne aux 7 jours d'avant.
5. Juger dans `/admin/statistiques` : visites de la campagne (« D'où viennent les visites »), « Conversations
   WhatsApp » et « Clics vers les réseaux » sur la période. Coût par visite = dépense / visites comptées.
6. Garder le visuel qui apporte le plus de visites et de clics, couper les autres, recommencer.

Nos chiffres seront plus bas que les « clics » annoncés par Meta ou TikTok (robots exclus, personnes qui ferment
avant le chargement). C'est normal ; comparer les campagnes entre elles avec nos chiffres.

**Ce qu'est une conversion ici** : un clic sur WhatsApp (ou un appel), un clic vers un réseau social. Pas de vente,
pas de formulaire.

### Le jour où vous voulez un pixel

Pas fait maintenant, volontairement : un pixel Meta, TikTok ou Google Ads dépose des cookies et casse la promesse
« aucun cookie » de la page Confidentialité. S'il le faut un jour :

- [ ] Un bandeau de consentement, avec « Refuser » aussi visible que « Accepter » ; le pixel ne se charge qu'après
      accord.
- [ ] La page Confidentialité réécrite : cookies déposés, finalités, partenaires destinataires, durée, moyen de
      retirer son accord.
- [ ] Une alternative à étudier d'abord : l'API Conversions de Meta (ou l'Events API de TikTok) envoie les
      événements depuis notre serveur, sans cookie dans le navigateur. Elle transmet tout de même des données aux
      plateformes : information des visiteurs et page Confidentialité à revoir dans tous les cas.

## 7. Checklist mensuelle

- [ ] Search Console : requêtes et pages du mois, 7 pages indexées, aucune erreur.
- [ ] Bing Webmaster Tools : même lecture rapide.
- [ ] `/admin/statistiques` : sources et campagnes du mois, comparées au mois précédent.
- [ ] Recherche « Rosemark Marcel » sur Google : site en tête ? panneau de connaissances apparu, à revendiquer ?
- [ ] Nom, description et lien de suivi identiques dans les quatre bios.
- [ ] Liens de suivi ajoutés aux nouvelles vidéos YouTube et aux statuts WhatsApp.
- [ ] Liens des réseaux à jour dans l'admin (ils alimentent les données structurées).
- [ ] Campagne payante en cours : jugée sur 7 jours, gardée ou coupée.
- [ ] `curl -s https://<domaine>/sitemap.xml | grep -c '<loc>'` : 7.
