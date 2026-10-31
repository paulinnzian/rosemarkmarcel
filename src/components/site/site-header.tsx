import Link from "next/link";

import type { SiteContent } from "@/content/schema";

type SiteHeaderProps = Pick<SiteContent, "creatorName" | "tagline" | "nav">;

export function SiteHeader({ creatorName, tagline, nav }: SiteHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="container-site flex flex-col gap-2 py-[18px] lg:flex-row lg:items-center lg:justify-between">
        <Link href="/#accueil" className="w-fit">
          <span className="block text-logo uppercase">
            {creatorName}
            <span aria-hidden="true" className="text-highlight">
              .
            </span>
          </span>
          <span className="mt-1 block text-kicker uppercase tracking-[0.32em]">{tagline}</span>
        </Link>
        <nav aria-label="Navigation principale" className="-mx-1 overflow-x-auto">
          <ul className="flex gap-x-[18px] whitespace-nowrap px-1 lg:gap-x-8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${item.href}`}
                  className="inline-flex min-h-11 items-center text-[13px] text-ink decoration-accent decoration-2 underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
