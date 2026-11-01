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
3. **Domaine** : `NEXT_PUBLIC_SITE_URL` donne l'adresse canonique. Cloudflare est autoritatif pour le DNS et sa règle
   de redirection `Canonicaliser www vers apex` renvoie `www.<domaine>` vers `<domaine>` en 308, en conservant le
   chemin, la query string et la méthode HTTP. La canonicalisation est faite à l'edge, avant l'application Hostinger.
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
   - Ajouter un admin uniquement avec `pnpm admin:add` (adresse confirmée d'office). Un compte créé par l'inscription
     publique reste non confirmé : Supabase lui envoie alors l'e-mail « Confirm signup » au lieu du code de connexion.
6. **Pays dans les statistiques** : vide sur Hostinger seul. Il se remplit si Cloudflare est placé devant le domaine
   (en-tête `cf-ipcountry`).
7. **E-mails (Resend)** : les codes de connexion partent par le SMTP de Resend, depuis un sous-domaine dédié
   (`mail.<domaine>`) pour ne pas exposer la réputation du domaine principal. Sans cette étape, Supabase envoie depuis
   `noreply@mail.app.supabase.io`, limité à quelques e-mails par heure et souvent classé en spam.
   - Resend > Domains > Add Domain : `mail.<domaine>`, puis copier les enregistrements affichés (DKIM, SPF et MX
     `send.mail`) dans hPanel > Domaines > DNS, et cliquer sur Verify DNS Records
   - Resend > API Keys : une clé « Sending access » limitée à `mail.<domaine>`
   - Supabase > Authentication > Emails > SMTP Settings : activer Custom SMTP, Sender `connexion@mail.<domaine>`,
     nom `Rosemark Marcel`, Host `smtp.resend.com`, Port `465`, Username `resend`, Password = la clé Resend
   - Supabase > Authentication > Rate Limits : « emails per hour » à 30
   - En local, rien ne change : les e-mails arrivent dans Mailpit (`http://127.0.0.1:54324`).
