import Link from "next/link";

import { buttonClasses } from "@/components/site/button-styles";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import { SocialCard } from "@/components/site/social-card";
import type { SiteContent } from "@/content/schema";
import { formatUpdateDate } from "@/lib/format";

type CommunitySectionProps = Pick<SiteContent, "community" | "socials">;

/** S04 : les réseaux et leurs compteurs ; F01 se termine ici. */
export function CommunitySection({ community, socials }: CommunitySectionProps) {
  const visible = socials.filter((link) => link.visible);
  const counted = visible.filter((link) => link.followers !== null);
  // La plus récente des dates de mise à jour des compteurs affichés (dates ISO : l'ordre alphabétique suffit).
  const lastUpdate = counted
    .map((link) => link.updatedAt)
    .filter((date) => date !== undefined)
    .sort()
    .at(-1);

  return (
    <section id="communaute" aria-labelledby="communaute-titre">
      <div className="container-site section-y">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-end lg:gap-12">
          <div>
            <Kicker>{community.kicker}</Kicker>
            <div className="mt-4">
              <SectionHeading as="h2" id="communaute-titre" heading={community.heading} />
            </div>
          </div>
          <p className="text-base text-muted">{community.intro}</p>
        </div>

        {visible.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {visible.map((link) => (
              <li key={link.network}>
                <SocialCard link={link} />
              </li>
            ))}
          </ul>
        )}

        {counted.length > 0 && (
          <p className="mt-4 text-sm text-muted">
            {community.countersSourceLabel}
            {lastUpdate && ` · mis à jour le ${formatUpdateDate(lastUpdate)}`}
          </p>
        )}

        <Link href="/communaute" className={buttonClasses("text", "mt-6")}>
          En savoir plus<span className="sr-only"> sur la communauté</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
