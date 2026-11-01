import Link from "next/link";

import { MobileMenu } from "@/components/site/mobile-menu";
import { NavLink } from "@/components/site/nav-link";
import type { SiteContent } from "@/content/schema";

type SiteHeaderProps = Pick<SiteContent, "creatorName" | "tagline" | "nav">;

export function SiteHeader({ creatorName, tagline, nav }: SiteHeaderProps) {
  return (
    // relative : le panneau du menu mobile se déplie sous l'en-tête, sur toute sa largeur.
    <header className="relative border-b border-line">
      <div className="container-site flex items-center justify-between gap-4 py-3.5 lg:py-[18px]">
        <Link href="/#accueil" className="min-w-0">
          <span className="block text-logo uppercase">
            {creatorName}
            <span aria-hidden="true" className="text-highlight">
              .
            </span>
          </span>
          <span className="mt-1 block text-[11px] font-bold uppercase leading-4 tracking-[0.22em] lg:text-kicker lg:tracking-[0.32em]">{tagline}</span>
        </Link>
        <nav aria-label="Navigation principale" className="shrink-0">
          {/* Petits écrans : un bouton Menu (masqué sans JavaScript, qui reçoit la liste en clair) ; ordinateur : les
              rubriques en ligne. */}
          <MobileMenu nav={nav} />
          <noscript>
            <ul className="flex max-w-[55vw] flex-wrap justify-end gap-x-4 lg:hidden">
              {nav.map((item, index) => (
                <li key={`${index}-${item.href}`}>
                  <NavLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </noscript>
          <ul className="hidden whitespace-nowrap lg:flex lg:gap-x-8">
            {nav.map((item, index) => (
              <li key={`${index}-${item.href}`}>
                <NavLink href={item.href} label={item.label} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
