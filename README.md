This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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

# rosemarkmarcel
