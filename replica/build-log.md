# Journal de construction

Une ligne par écran : ID, date, état, ce qui manque, ce qui a été plus dur que prévu.
Pas de dépôt git dans le projet : pas de commit par écran (à créer avant /replica-deploy).

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
| A00 tableau de bord | 2026-10-31 | partiel | statistiques, dernières modifications | `getClaims()` lit l'heure : `connection()` obligatoire avec le préchargement partiel |
| A03 réseaux | 2026-10-31 | partiel | ajouter, réordonner | — |
| déconnexion | 2026-10-31 | fait | — | la redirection d'une Server Action déclenchait un préchargement 404 du routeur : remplacée par un POST + 303 |

Captures : `replica/clone-screens/admin-dashboard-390.png`, `admin-reseaux-390.png`.
