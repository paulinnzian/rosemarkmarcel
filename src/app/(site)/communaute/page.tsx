import type { Metadata } from "next";

import { FabricMotif } from "@/components/site/fabric-motif";
import { PageIntro } from "@/components/site/page-intro";
import { AudienceTotal, audienceTotal } from "@/components/site/pages/communaute/audience-total";
import { SupportList } from "@/components/site/pages/communaute/support-list";
import { SocialCard } from "@/components/site/social-card";
import { formatUpdateDate } from "@/lib/format";
import { pageMetadata } from "@/lib/page-metadata";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = pageMetadata(
  "La communauté",
  "Où suivre Rosemark Marcel et Le Repos sur les réseaux, et comment soutenir l’aventure : s’abonner, partager, faire un don.",
);

const NETWORKS_ID = "reseaux";

export default async function CommunautePage() {
  const content = await getSiteContent();
  const texts = content.pages.community;
  const visible = content.socials.filter((link) => link.visible);
  const total = audienceTotal(visible);
  // Même source que l'accueil : la date de mise à jour la plus récente des compteurs affichés (dates ISO).
  const lastUpdate = visible
    .filter((link) => link.followers !== null)
    .map((link) => link.updatedAt)
    .filter((date) => date !== undefined)
    .sort()
    .at(-1);

  return (
    <main id="contenu">
      <PageIntro
        kicker={texts.kicker}
        heading={texts.heading}
        intro={texts.intro}
        aside={total !== null ? <AudienceTotal total={total} label={texts.totalLabel} /> : undefined}
      />

      <FabricMotif />

      {visible.length > 0 && (
        <section id={NETWORKS_ID} aria-labelledby="reseaux-titre" className="container-site section-y">
          <h2 id="reseaux-titre" className="sr-only">
            Mes réseaux
          </h2>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {visible.map((link) => (
              <li key={link.network}>
                <SocialCard link={link} />
              </li>
            ))}
          </ul>
          {total !== null && (
            <p className="mt-4 text-xs text-muted">
              {content.community.countersSourceLabel}
              {lastUpdate && ` · mis à jour le ${formatUpdateDate(lastUpdate)}`}
            </p>
          )}
        </section>
      )}

      <SupportList
        texts={texts}
        donation={content.donation}
        shareTitle={`${content.creatorName} — ${content.conceptName}`}
        networksId={visible.length > 0 ? NETWORKS_ID : undefined}
      />
    </main>
  );
}
