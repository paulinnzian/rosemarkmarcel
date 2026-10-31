import Link from "next/link";

import { AdminSidebarNav, AdminTabBar } from "./admin-nav";

function SiteLink() {
  return (
    <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-ink hover:underline">
      Voir le site <span aria-hidden="true">&nbsp;↗</span>
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

function SignOut() {
  return (
    <form method="post" action="/admin/deconnexion">
      <button type="submit" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:underline">
        Se déconnecter
      </button>
    </form>
  );
}

// Espace connecté de l'admin (spec AdminShell). Téléphone : barre du haut + onglets en bas ; ordinateur : barre latérale.
// Chaque page vérifie elle-même la session (requireAdmin) ; le proxy ne fait qu'un tri optimiste.
export default function AdminSpaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
      >
        Aller au contenu
      </a>
      <div className="md:flex md:min-h-dvh">
        <aside className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:gap-6 md:border-r md:border-line md:bg-surface md:px-3 md:py-6">
          <Link href="/admin" className="inline-flex min-h-11 items-center px-3 text-kicker uppercase text-ink">
            Administration
          </Link>
          <AdminSidebarNav />
          <div className="mt-auto flex flex-col px-3">
            <SiteLink />
            <SignOut />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="border-b border-line bg-surface md:hidden">
            <div className="flex items-center gap-x-5 px-4">
              <Link href="/admin" className="inline-flex min-h-11 items-center text-kicker uppercase text-ink">
                Administration
              </Link>
              <div className="ml-auto flex items-center gap-5">
                <SiteLink />
                <SignOut />
              </div>
            </div>
          </header>
          <main id="contenu" className="pb-admin-tabbar mx-auto max-w-3xl px-4 pt-8 md:pb-8">
            {children}
          </main>
        </div>
      </div>
      <AdminTabBar />
    </>
  );
}
