"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { FabricMotif } from "@/components/site/fabric-motif";
import { isCurrentPage, navTarget } from "@/components/site/nav-link";
import type { SiteContent } from "@/content/schema";

type MobileMenuProps = Pick<SiteContent, "nav">;

/**
 * Menu des petits écrans : un bouton « Menu » qui déplie, sous l'en-tête, un panneau bleu aux grandes rubriques,
 * fermé par le motif du tissu, sur un voile qui assombrit la page. Il se referme à chaque changement d'adresse
 * (lien, retour arrière), sur Échap (le focus revient au bouton), d'un appui à côté ou quand le focus le quitte.
 * Sur ordinateur, la liste en ligne de l'en-tête le remplace ; sans JavaScript, une liste en clair (site-header).
 */
export function MobileMenu({ nav }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Nouvelle adresse : le menu se referme, y compris après un retour arrière ou avant dans l'historique.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="lg:hidden [@media(scripting:none)]:hidden"
      onBlur={(event) => {
        // relatedTarget null : Safari ne donne pas le focus à un lien touché ; seul un focus parti ailleurs ferme.
        const next = event.relatedTarget;
        if (next && !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      {/* Nom stable « Menu » : l'état ouvert est dit par aria-expanded et montré par la croix. Au-dessus du voile. */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="group relative z-50 inline-flex min-h-11 min-w-11 items-center gap-2.5 rounded-pill border border-line bg-surface py-2 pl-4 pr-3.5 text-sm font-bold text-ink transition-colors duration-150 ease-brand hover:border-ink aria-expanded:border-accent aria-expanded:bg-accent aria-expanded:text-on-accent"
      >
        Menu
        <span aria-hidden="true" className="relative block h-3 w-[18px]">
          <span className="absolute left-0 top-0 h-0.5 w-full rounded-pill bg-current transition-[transform,top] duration-200 ease-brand group-aria-expanded:top-[5px] group-aria-expanded:rotate-45 motion-reduce:transition-none" />
          <span className="absolute bottom-0 right-0 h-0.5 w-3 rounded-pill bg-highlight transition-[transform,bottom,width] duration-200 ease-brand group-aria-expanded:bottom-[5px] group-aria-expanded:w-full group-aria-expanded:-rotate-45 group-aria-expanded:bg-current motion-reduce:transition-none" />
        </span>
      </button>

      {/* Voile sur tout l'écran, sous le bouton et le panneau mais au-dessus du bouton de soutien (z-40) : un appui
          sur la page referme le menu sans rien déclencher dessous. */}
      {open && <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-[45] bg-ink/45 motion-safe:animate-fade-in" />}

      <div id={panelId} hidden={!open} className="on-accent absolute inset-x-0 top-full z-50 bg-accent text-on-accent shadow-pop motion-safe:animate-menu-in">
        <ul className="container-site py-2">
          {nav.map((item, index) => {
            const current = isCurrentPage(item.href, pathname);
            return (
              <li key={`${index}-${item.href}`} className="border-b border-on-accent/20 last:border-b-0">
                <Link
                  href={navTarget(item.href)}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-15 items-center gap-3.5 py-3 text-[26px] font-bold leading-tight tracking-[-0.03em]"
                >
                  {/* Le point orange du logo marque la page courante ; la place est gardée sur chaque ligne. */}
                  <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${current ? "bg-highlight" : ""}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <FabricMotif />
      </div>
    </div>
  );
}
