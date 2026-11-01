"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Adresse d'une rubrique : une page (« /univers ») telle quelle, une ancre de l'accueil (« #contact ») depuis l'accueil. */
export function navTarget(href: string): string {
  return href.startsWith("#") ? `/${href}` : href;
}

/** Une ancre de l'accueil n'est jamais la page courante : elle mène à une section, pas à une page. */
export function isCurrentPage(href: string, pathname: string): boolean {
  return !href.startsWith("#") && pathname === href;
}

/** Lien du menu principal en ligne (ordinateur) : une page (« /univers ») ou une ancre de l'accueil (« #contact »). */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={navTarget(href)}
      aria-current={isCurrentPage(href, pathname) ? "page" : undefined}
      className="inline-flex min-h-11 items-center text-[13px] text-ink decoration-accent decoration-2 underline-offset-4 hover:underline aria-[current=page]:text-accent aria-[current=page]:underline"
    >
      {label}
    </Link>
  );
}
