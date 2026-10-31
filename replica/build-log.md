# Journal de construction

Une ligne par écran : ID, date, état, ce qui manque, ce qui a été plus dur que prévu.
Dépôt git créé pendant /replica-backend : commits locaux, jamais poussés (un commit par lot, pas par écran).

| ID | date | état | ce qui manque | plus dur que prévu |
| --- | --- | --- | --- | --- |
| socle | 2026-10-31 | fait | — | `getSiteContent()` (`src/lib/site-data.ts`) : `use cache` + tag `contenu`, renvoie les valeurs initiales ; /replica-backend le remplace par Supabase avec la même signature. En-tête, pied de page et bouton épinglé regroupés dans `SiteChrome`, partagé par le layout `(site)` et la 404. |
| S00 | 2026-10-31 | fait | lien de nav actif (could) | — |
| S01 | 2026-10-31 | fait | animations d'apparition (should) | la photo qui ne charge pas demande un composant client (`HeroImage`) ; c'est le seul JS ajouté à la page en dehors de la modale |
| bandeau | 2026-10-31 | fait | — | statique, comme l'original (décision /replica-design) |
| S02 | 2026-10-31 | fait | — | — |
| S04 | 2026-10-31 | fait | variante « synchronisés automatiquement » de la mention (attend la synchro) | — |
| S03 | 2026-10-31 | fait | — | — |
| S06 + M01 | 2026-10-31 | partiel | coller le lien de paiement depuis /admin/dons ; événement `donation` (sendBeacon) | chaque `SupportButton` monte sa propre `<dialog>` : 3 copies fermées dans le DOM (invisibles pour les lecteurs d'écran tant qu'elles sont fermées) ; à mutualiser si la page grossit |
| S05 | 2026-10-31 | fait | événements `whatsapp` / `phone` | colonne du titre élargie (1,25fr) pour garder « quelque chose ensemble ? » sur une ligne en desktop |
| 404 | 2026-10-31 | fait | — | `not-found.tsx` est hors du groupe `(site)` : il reprend `SiteChrome` lui-même |

Vérifié le 2026-10-31 (Playwright, serveur de dev) : 390 et 1440 px sans débordement horizontal, aucune erreur console, premier Tab = « Aller au contenu », modale : focus sur Fermer, Échap ferme, focus rendu au bouton ; 404 répond 404 avec en-tête et bouton épinglé. `next build` : `/`, `/design` et la 404 prérendues en statique.
Non vérifié en capture (logique seulement) : réseau masqué, contact sans WhatsApp, dons activés sur l'accueil (vu sur /design), photo qui ne charge pas.

Captures : `replica/clone-screens/home-390.png`, `home-1440.png`, `404-390.png` (une seule page : les sections ne sont pas des écrans séparés).

## Tranche verticale (backend), 2026-10-31

| ID | date | état | ce qui manque | plus dur que prévu |
| --- | --- | --- | --- | --- |
| A01 connexion | 2026-10-31 | fait (local) | SMTP Resend en production | `[auth.email] enable_signup = false` coupe toute connexion par e-mail ; le formulaire placé dans un Suspense (pour lire `?erreur=`) perdait la saisie faite avant l'hydratation ; boutons inactifs jusqu'à l'hydratation |
| A00 tableau de bord | 2026-10-31 | fait | — | `getClaims()` lit l'heure : `connection()` obligatoire avec le préchargement partiel |
| A03 réseaux | 2026-10-31 | fait | — | réordonner = échange de deux positions puis renumérotation ; boutons « Monter » / « Descendre » plutôt que glisser-déposer (utilisable au clavier et au pouce) |
| déconnexion | 2026-10-31 | fait | — | la redirection d'une Server Action déclenchait un préchargement 404 du routeur : remplacée par un POST + 303 |

Captures : `replica/clone-screens/admin-dashboard-390.png`, `admin-reseaux-390.png`.

## Écrans admin restants et statistiques, 2026-10-31

| ID | date | état | ce qui manque | plus dur que prévu |
| --- | --- | --- | --- | --- |
| A02 dons | 2026-10-31 | fait | — | React 19 vide un `<form action>` après chaque action, même en erreur : l'admin perdait sa saisie (BUG-003). Envoi par `useAdminForm` (onSubmit + transition), repris par les 8 formulaires |
| A04 textes | 2026-10-31 | fait | — | un seul écran pour 7 groupes de textes ; les titres à lignes colorées ont un champ « Couleur orange » validé contre le nombre de lignes |
| A05 photo | 2026-10-31 | fait | recadrage dans le navigateur (could) | format et dimensions lus dans les octets (`imageInfo`), pas dans le nom ; `remove()` de Supabase Storage ne supprimait rien faute de politique SELECT, sans erreur (BUG-002) |
| A06 contact | 2026-10-31 | partiel | ajouter un canal (seuls les canaux existants se modifient) | numéro normalisé (espaces, points, tirets retirés) avant validation |
| A07 statistiques | 2026-10-31 | fait | — | graphique en barres en CSS avec tableau de repli ; vue `click_daily_detail` pour appareils et pays |
| A08 accès | 2026-10-31 | fait | — | le message « retiré » disparaissait : `revalidatePath` remontait le formulaire ; l'état enregistré est maintenant affiché par le formulaire lui-même |
| /api/evenements | 2026-10-31 | fait | purge pg_cron à activer en production | la limite de débit est en mémoire, donc par instance ; les tests Playwright héritaient de la session admin (`storageState`) et leurs événements étaient ignorés |
| barre d'onglets mobile | 2026-10-31 | fait | — | voir « AdminShell » plus bas |

Captures : `replica/clone-screens/admin-{dashboard,dons,reseaux,contenus,photo,contact,statistiques,acces}-390.png` (build de production, 0 erreur console).
Tests : `replica/test-plan.md` ; bugs : `replica/bugs.md`.

## Écarts relevés par /replica-diff, 2026-10-31

| ID | date | état | ce qui manque | plus dur que prévu |
| --- | --- | --- | --- | --- |
| favicon | 2026-10-31 | fait | — | `icon.svg` (convention Next) + `apple-icon.png` rendu une fois depuis le SVG (carré plein : iOS arrondit lui-même) ; `favicon.ico` par défaut retiré |
| S05 bouton WhatsApp | 2026-10-31 | fait | — | pleine largeur sous 1024 px, comme l'original |
| S01 cadre photo | 2026-10-31 | fait | — | cadre 3/4 (mobile) et 4/5 (≥ 1024 px), photo en `object-cover` calée en haut : hauteur de l'accueil 827 px contre 824 pour l'original en bureau (977 avant) ; toute photo envoyée depuis l'admin garde le visage visible |
| bandeau mobile | 2026-10-31 | gardé | — | retour à la ligne gardé (toutes les phrases lisibles) ; la spec disait « comme l'original », corrigée en « écart assumé » |
| AdminShell | 2026-10-31 | fait | icônes d'onglets (texte seul, pas de dépendance Lucide) | « Plus » en popover natif : marche sans JavaScript, mais le popover ne se ferme pas tout seul après une navigation côté client, d'où `hidePopover()` au clic ; test F04-E5 écrit avant, vu en échec |

Captures : `home-390.png`, `home-1440.png`, `modal-dons-390.png`, `admin-*-390.png` (barre d'onglets), `admin-plus-390.png`, `admin-dashboard-1440.png` (barre latérale) ; 0 erreur console.
