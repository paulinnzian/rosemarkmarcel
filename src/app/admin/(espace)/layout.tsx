import Link from "next/link";

import { AdminNav } from "./admin-nav";

// Espace connecté de l'admin. Chaque page vérifie elle-même la session (requireAdmin) ; le proxy ne fait qu'un tri optimiste.
export default function AdminSpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
      >
        Aller au contenu
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
          <Link href="/admin" className="inline-flex min-h-11 items-center text-kicker uppercase text-ink">
            Administration
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-5">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-ink hover:underline">
              Voir le site <span aria-hidden="true">&nbsp;↗</span>
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            <form method="post" action="/admin/deconnexion">
              <button type="submit" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:underline">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="contenu" className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </>
  );
}
