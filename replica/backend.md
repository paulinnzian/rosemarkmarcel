# Backend : site de Rosemark Marcel

Lit : `replica/architecture.md`. Date : 2026-10-31.
Stack : Supabase (Postgres + Auth + Storage), Next.js 16 (Server Actions, route handlers, `proxy.ts`). **Aucun paiement intégré** : les dons ouvrent un lien de paiement collé dans l'admin (décision du 2026-10-31), donc ni Stripe ni webhook.

## Ce qui marche (vérifié en local le 2026-10-31)

| partie | où | preuve |
| --- | --- | --- |
| Schéma + RLS | `supabase/migrations/` (schéma initial, `140000` vue `click_daily_detail`, `150000` lecture des fichiers par les admins) | `pnpm exec supabase test db` : 25 tests pgTAP verts (anonyme, connecté non admin, admin) |
| Valeurs initiales | `pnpm db:seed` → `supabase/seed.sql` (généré depuis `src/content.ts`) | appliqué par `supabase start` / `db reset` |
| Lecture publique | `src/lib/site-data.ts` (client anonyme, `use cache`, tag `contenu`) | build de production : la page lit la base ; repli sur `content.ts` si la base ne répond pas (cache court) |
| Connexion admin | `/admin/connexion` : code à 6 chiffres **ou** lien de l'e-mail (`/admin/auth/callback?token_hash=`), liste blanche `admin_users` | parcours Playwright, 4 passes vertes sur 4 (ci-dessous) |
| Réseaux et compteurs | `/admin/reseaux` → `saveAndPublish()` → `updateTag("contenu")` | compteur modifié dans l'admin, visible aussitôt sur la page publique, date de mise à jour affichée |
| Déconnexion | POST `/admin/deconnexion` (303) | parcours Playwright |
| Dons, textes, photo, contact | `/admin/dons`, `/admin/contenus`, `/admin/photo`, `/admin/contact` → `saveAndPublish()` | Playwright F04-H1 à H4 |
| Statistiques | `POST /api/evenements` (client service, filtre robots, admins ignorés, origine vérifiée, 60 / min) → `/admin/statistiques` | Playwright F04-H6 |
| Gestionnaires | `/admin/acces` (propriétaire seul) : ajout et retrait via le client service | Playwright F04-H7 |
| Ajout d'un admin | `pnpm admin:add <email> [owner\|editor]` | `marcel@exemple.test` (owner) créé en local |

Parcours Playwright (build de production, port 3100, e-mails lus dans Mailpit) : `/admin` sans session → connexion ; adresse inconnue : même message qu'un admin, aucun e-mail envoyé ; compte existant hors liste blanche : refusé après le code, sans session ; mauvais code refusé ; bon code → tableau de bord ; compteur Facebook 350 000 enregistré → page publique à jour ; lien en `http://` refusé ; déconnexion ; lien de l'e-mail ouvert dans un autre navigateur → connecté ; même lien rejoué → « lien expiré » ; aucune erreur console. Repris en `@playwright/test` dans `e2e/` par /replica-test (voir `replica/test-plan.md`).

## Lancer en local

```bash
colima start                       # Docker
pnpm exec supabase start -x realtime,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
cp .env.example .env.local         # puis coller l'URL et les clés affichées par supabase start
pnpm admin:add vous@exemple.com    # se donner l'accès
pnpm dev                           # e-mails de connexion : http://127.0.0.1:54324 (Mailpit)
```

Tests : `pnpm test:unit`, `pnpm exec supabase test db`, `pnpm test:e2e` (remet la base à zéro, build de production sur le port 3100).

Après un changement de schéma : nouvelle migration dans `supabase/migrations/`, `pnpm db:reset`, `pnpm db:types`.
Après un changement de `src/content.ts` : `pnpm db:seed` puis `pnpm db:reset`.

## Passer en production (à faire par vous : comptes et clés)

1. **Supabase** : créer le projet (région Europe, la plus proche d'Abidjan), puis `pnpm exec supabase link --project-ref <ref>` et `pnpm exec supabase db push` (applique la migration). Charger `supabase/seed.sql` une seule fois (SQL Editor).
2. **Auth > Sign In / Providers** : désactiver **« Allow new users to sign up »**, mais **laisser le fournisseur E-mail activé** (piège rencontré en local : couper les inscriptions côté e-mail coupe toute connexion par e-mail). Durée du code : 900 s.
3. **Auth > URL Configuration** : Site URL = l'adresse du site ; Redirect URLs = `https://<domaine>/admin/auth/callback`.
4. **Auth > Email Templates > Magic Link** : coller `supabase/templates/magic-link.html`, sujet « Votre code de connexion ».
5. **SMTP** : brancher Resend (domaine du site, SPF/DKIM). Sans lui, Supabase n'envoie que quelques e-mails par heure.
6. **Vercel** : les 4 variables de `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur (jamais `NEXT_PUBLIC_`).
7. `pnpm admin:add <e-mail de Marcel> owner` avec les variables de production.
8. **pg_cron** : activer l'extension, puis la purge des statistiques (commentée en fin de migration) quand `/api/evenements` existera.
9. **Sauvegardes** : vérifier les sauvegardes quotidiennes du plan Supabase (le plan gratuit met aussi le projet en pause après 7 jours sans activité).

## Checklist de sécurité

- [x] secrets seulement en variables d'environnement ; `.env*` ignoré par git sauf `.env.example` ; la clé service n'est importée que par `scripts/add-admin.mts` et `src/lib/supabase/service-client.ts` (`server-only` : `/api/evenements` et `/admin/acces`)
- [x] entrées validées côté serveur (Zod) : connexion, code, `token_hash`, chaque formulaire admin, corps de `/api/evenements` ; contraintes CHECK en base en double
- [x] autorisation vérifiée à chaque lecture et écriture : RLS sur toutes les tables + `requireAdmin()` dans chaque page et action ; testé avec un second compte (pgTAP + Playwright)
- [x] limites de débit sur l'auth : celles de Supabase Auth (envoi d'e-mails, vérifications de code) ; `/api/evenements` : 60 / min par adresse, en mémoire donc par instance (suffisant contre une boucle, pas contre une attaque répartie)
- [x] webhooks : aucun
- [x] envois de fichiers : bucket `public-media` limité à 5 Mo et PNG / WebP / JPEG ; l'action vérifie aussi taille, format réel (octets) et dimensions ; ancien fichier supprimé
- [x] pas de donnée personnelle dans les URL ni les journaux (l'e-mail ne passe jamais dans l'URL ; les erreurs journalisées n'en contiennent pas)
- [x] dépendances auditées (`pnpm audit`) : 0 en production ; 1 modérée en développement (`minimatch` via eslint-config-next, non livrée)
- [ ] politique de confidentialité listant les sous-traitants (Supabase, Resend, Vercel) : à rédiger avant la mise en ligne

## Reste à faire

- SMTP Resend en production (étape 5) et test d'un vrai e-mail (F04-M1).
- pg_cron : activer la purge des statistiques (étape 8).
- Barre d'onglets en bas d'écran sur mobile (spec AdminShell) ; aujourd'hui une barre en haut.
- Ajouter un canal de contact (seuls les canaux existants se modifient).
- Politique de confidentialité (case de la checklist).
