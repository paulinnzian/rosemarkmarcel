"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

type NavLink = { href: string; label: string; tab?: string };

// `tab` : libellé court dans la barre d'onglets du téléphone ; les écrans sans `tab` vont dans « Plus ».
const LINKS: NavLink[] = [
  { href: "/admin", label: "Tableau de bord", tab: "Accueil" },
  { href: "/admin/dons", label: "Dons", tab: "Dons" },
  { href: "/admin/reseaux", label: "Réseaux", tab: "Réseaux" },
  { href: "/admin/contenus", label: "Textes", tab: "Textes" },
  { href: "/admin/photo", label: "Photo" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/statistiques", label: "Statistiques" },
  { href: "/admin/acces", label: "Accès" },
];

const TABS = LINKS.filter((link) => link.tab);
const MORE = LINKS.filter((link) => !link.tab);

/** Ordinateur : tous les écrans dans la barre latérale. */
export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration">
      <ul className="flex flex-col">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="flex min-h-11 items-center rounded-sm px-3 text-sm text-ink hover:bg-tint aria-[current=page]:bg-tint aria-[current=page]:font-bold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Téléphone : quatre onglets sous le pouce, le reste dans « Plus » (popover natif, fonctionne sans JavaScript). */
export function AdminTabBar() {
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);
  const currentMore = MORE.find((link) => link.href === pathname);
  const tabClasses =
    "group flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-ink aria-[current=page]:font-bold aria-[current=page]:text-accent";

  return (
    <nav aria-label="Administration" className="admin-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden">
      <ul className="grid h-full grid-cols-5">
        {TABS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={tabClasses}>
              <span aria-hidden="true" className="h-1 w-6 rounded-pill bg-current opacity-0 group-aria-[current=page]:opacity-100" />
              {link.tab}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            popoverTarget="admin-plus"
            aria-current={currentMore ? "page" : undefined}
            className={`${tabClasses} cursor-pointer`}
          >
            <span aria-hidden="true" className="h-1 w-6 rounded-pill bg-current opacity-0 group-aria-[current=page]:opacity-100" />
            Plus
            {currentMore && <span className="sr-only"> (écran actuel : {currentMore.label})</span>}
          </button>
        </li>
      </ul>
      <div
        id="admin-plus"
        ref={moreRef}
        popover="auto"
        className="above-admin-tabbar inset-x-4 top-auto m-0 w-auto rounded-md border border-line bg-surface p-2 shadow-pop"
      >
        <ul aria-label="Autres écrans">
          {MORE.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => moreRef.current?.hidePopover()}
                className="flex min-h-12 items-center rounded-sm px-4 text-base text-ink hover:bg-tint aria-[current=page]:bg-tint aria-[current=page]:font-bold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
