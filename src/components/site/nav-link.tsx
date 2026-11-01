"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Lien du menu principal : une page (« /univers ») ou une ancre de l'accueil (« #contact »). */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const target = href.startsWith("#") ? `/${href}` : href;
  const current = !href.startsWith("#") && pathname === href;

  return (
    <Link
      href={target}
      aria-current={current ? "page" : undefined}
      className="inline-flex min-h-11 items-center text-[13px] text-ink decoration-accent decoration-2 underline-offset-4 hover:underline aria-[current=page]:text-accent aria-[current=page]:underline"
    >
      {label}
    </Link>
  );
}
