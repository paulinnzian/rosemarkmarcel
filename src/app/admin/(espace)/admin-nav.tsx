"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/reseaux", label: "Réseaux" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration">
      <ul className="flex gap-5">
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
