import type { SocialLink } from "@/content/schema";
import { formatFollowers } from "@/lib/format";

// Nom accessible = le texte visible de la carte (WCAG 2.5.3 : le nom contient ce qu'on lit), plus « nouvel onglet ».
export function SocialCard({ link }: { link: SocialLink }) {
  const hasCount = link.followers !== null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-track="social"
      data-track-target={link.network}
      className="group flex h-full min-h-[146px] flex-col justify-between rounded-md border border-line px-3.5 py-[18px] text-ink transition duration-200 ease-brand hover:border-accent hover:shadow-card-hover lg:min-h-[191px] lg:p-7"
    >
      <span className="flex items-start justify-between gap-2 text-sm font-bold">
        {link.name}
        <span aria-hidden="true" className="transition-transform duration-200 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
      <span>
        {hasCount ? (
          <>
            <span className="block text-count">{formatFollowers(link.followers ?? 0)}</span>
            <span className="mt-1 block text-sm text-muted">abonnés · {link.actionLabel}</span>
          </>
        ) : (
          <>
            <span className="block text-[24px] font-bold leading-tight tracking-[-0.03em] lg:text-[28px]">{link.fallbackLabel}</span>
            <span className="mt-1 block text-sm text-muted">{link.fallbackSublabel ?? link.actionLabel}</span>
          </>
        )}
      </span>
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}
