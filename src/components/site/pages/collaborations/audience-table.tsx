import type { SocialLink } from "@/content/schema";
import { formatFollowersFull } from "@/lib/format";

type AudienceTableProps = {
  heading: string;
  note: string;
  socials: SocialLink[];
};

const monthYear = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Les chiffres d'abord : un tableau compact réseau / abonnés, lu dans `socials`. Seuls les réseaux visibles qui ont
 * un compteur y figurent ; un réseau sans chiffre n'a rien à dire à une marque dans ce tableau.
 */
export function AudienceTable({ heading, note, socials }: AudienceTableProps) {
  const counted = socials.filter((link): link is SocialLink & { followers: number } => link.visible && link.followers !== null);
  if (counted.length === 0) return null;

  // La plus récente des dates de mise à jour (dates ISO : l'ordre alphabétique suffit).
  const lastUpdate = counted
    .map((link) => link.updatedAt)
    .filter((date) => date !== undefined)
    .sort()
    .at(-1);

  return (
    <section aria-labelledby="audience-titre" className="border-t border-line">
      <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <div>
          <h2 id="audience-titre" className="text-h2 text-balance">
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-xs text-muted">
            {note}
            {lastUpdate && (
              <>
                {" "}
                Mis à jour en <time dateTime={lastUpdate.slice(0, 7)}>{monthYear.format(new Date(`${lastUpdate}T00:00:00Z`))}</time>.
              </>
            )}
          </p>
        </div>

        <table aria-labelledby="audience-titre" className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-kicker uppercase">
              <th scope="col" className="pb-3 pr-4 font-bold">
                Réseau
              </th>
              <th scope="col" className="pb-3 text-right font-bold">
                Abonnés
              </th>
            </tr>
          </thead>
          <tbody>
            {counted.map((link) => (
              <tr key={link.network} className="border-b border-line">
                <th scope="row" className="py-3 pr-4 align-middle font-normal">
                  <span className="block text-label">{link.name}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="social"
                    data-track-target={link.network}
                    className="inline-flex min-h-11 items-center text-sm text-muted [overflow-wrap:anywhere] decoration-accent decoration-2 underline-offset-4 hover:text-ink hover:underline"
                  >
                    {link.handle}
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </th>
                <td className="py-3 text-right align-middle text-count tabular-nums whitespace-nowrap">{formatFollowersFull(link.followers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
