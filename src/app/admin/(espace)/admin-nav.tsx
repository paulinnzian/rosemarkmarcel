"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/dons", label: "Dons" },
  { href: "/admin/reseaux", label: "Réseaux" },
  { href: "/admin/contenus", label: "Textes" },
  { href: "/admin/photo", label: "Photo" },
  { href: "/admin/contact", label: "Contact" },
  { href: "/admin/statistiques", label: "Statistiques" },
  { href: "/admin/acces", label: "Accès" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="w-full md:w-auto">
      <ul className="flex flex-wrap gap-x-5">
        {LINKS.map((link) => {
          const current = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="inline-flex min-h-11 items-center text-sm text-ink decoration-accent decoration-2 underline-offset-4 hover:underline aria-[current=page]:font-bold aria-[current=page]:underline"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
