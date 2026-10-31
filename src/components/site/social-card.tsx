import type { SocialLink } from "@/content/schema";
import { formatFollowers, formatFollowersFull } from "@/lib/format";

export function SocialCard({ link }: { link: SocialLink }) {
  const hasCount = link.followers !== null;
  const accessibleName = hasCount
    ? `${link.name}, ${formatFollowersFull(link.followers ?? 0)} abonnés, ${link.actionLabel} (nouvel onglet)`
    : `${link.name}, ${link.fallbackLabel ?? ""}, ${link.fallbackSublabel ?? link.actionLabel} (nouvel onglet)`;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
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
            <span className="mt-1 block text-xs text-muted">abonnés · {link.actionLabel}</span>
          </>
        ) : (
          <>
            <span className="block text-[24px] font-bold leading-tight tracking-[-0.03em] lg:text-[28px]">{link.fallbackLabel}</span>
            <span className="mt-1 block text-xs text-muted">{link.fallbackSublabel ?? link.actionLabel}</span>
          </>
        )}
      </span>
    </a>
  );
}
