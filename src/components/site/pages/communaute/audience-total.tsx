import type { SocialLink } from "@/content/schema";
import { formatFollowers, formatFollowersFull } from "@/lib/format";

/** Somme des compteurs des réseaux affichés ; null si aucun réseau n'a de compteur (on n'invente pas de total). */
export function audienceTotal(socials: SocialLink[]): number | null {
  const counts = socials.filter((link) => link.visible && link.followers !== null).map((link) => link.followers ?? 0);
  return counts.length > 0 ? counts.reduce((sum, count) => sum + count, 0) : null;
}

/** Le chiffre de l'en-tête : en grand pour l'œil, en toutes lettres pour les lecteurs d'écran. */
export function AudienceTotal({ total, label }: { total: number; label: string }) {
  return (
    <p className="flex flex-col gap-3 border-l-4 border-highlight pl-5 lg:justify-self-end lg:pl-8">
      <span aria-hidden="true" className="text-h1 whitespace-nowrap text-accent">
        {formatFollowers(total)}
      </span>
      <span className="sr-only">{formatFollowersFull(total)} </span>
      <span className="max-w-[18rem] text-lead text-ink">{label}</span>
    </p>
  );
}
