# Site de Marcel Detoure

Site vitrine (Next.js 16, Supabase) avec espace d'administration.

## Développement

```bash
pnpm install
cp .env.example .env.local   # puis remplir les variables
pnpm dev                     # http://localhost:3000
```

| Commande | Rôle |
| --- | --- |
| `pnpm lint` | ESLint |
| `pnpm test:unit` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests de bout en bout (Playwright) |
| `pnpm db:reset` | Réinitialise la base Supabase locale |
| `pnpm db:types` | Régénère `src/lib/supabase/database.types.ts` |
| `pnpm admin:add` | Ajoute un administrateur |

## Mise en ligne sur Hostinger (Node.js)

1. **Application** : hPanel > Sites web > Node.js. Build `pnpm install && pnpm build`, démarrage `pnpm start`,
   Node.js 20.9 ou plus récent.
2. **Variables d'environnement** (mêmes noms que `.env.example`), à saisir **avant** le build : les `NEXT_PUBLIC_*`
   sont figées dans le code au moment du build.
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://zchsdhqmsuwqgtllhofn.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` : Supabase > Project Settings > API Keys
   - `NEXT_PUBLIC_SITE_URL` = `https://<domaine>` (sans barre finale)
   - `CRON_SECRET` = une longue valeur aléatoire (`openssl rand -hex 32`)
3. **Domaine** : `NEXT_PUBLIC_SITE_URL` donne l'adresse canonique. Hostinger fait tourner `www.<domaine>` et
   `<domaine>` dans deux processus séparés, chacun avec son cache ; `src/proxy.ts` redirige l'autre (308) vers
   l'adresse canonique pour qu'une modification faite dans l'admin soit visible partout.
4. **Vérification quotidienne des liens** : hPanel > Avancé > Cron Jobs > Custom, `0 6 * * *` (UTC), commande
   `/bin/sh <chemin du site>/scripts/cron-verifier-liens.sh`. Hostinger refuse guillemets et redirections dans ce
   champ, d'où le script. Il lit ses réglages dans `~/.vitrine-cron` (à créer en SSH, puis `chmod 600`) :

   ```bash
   SITE_URL=https://<domaine>
   CRON_SECRET=<même valeur que la variable d'environnement>
   ```

5. **Connexion admin** (Supabase > Authentication) :
   - URL Configuration : Site URL `https://<domaine>`, Redirect URLs `https://<domaine>/admin/auth/callback`
   - Email Templates > Magic Link : sujet « Votre code de connexion », contenu de `supabase/templates/magic-link.html`
   - Sign In / Providers : « Allow new users to sign up » désactivé, fournisseur Email activé
6. **Pays dans les statistiques** : vide sur Hostinger seul. Il se remplit si Cloudflare est placé devant le domaine
   (en-tête `cf-ipcountry`).
