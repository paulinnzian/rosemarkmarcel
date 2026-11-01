import Link from "next/link";

import { buttonClasses } from "@/components/site/button-styles";
import { ConceptCard } from "@/components/site/concept-card";
import { CtaLink } from "@/components/site/cta-link";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import type { SiteContent } from "@/content/schema";

/** S03 : le concept et sa signature visuelle. */
export function UniverseSection({ universe }: { universe: SiteContent["universe"] }) {
  return (
    <section id="univers" aria-labelledby="univers-titre" className="bg-tint">
      <div className="container-site section-y grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <ConceptCard lines={universe.cardText} />
        <div>
          <Kicker>{universe.kicker}</Kicker>
          <div className="mt-4">
            <SectionHeading as="h2" id="univers-titre" heading={universe.heading} className="text-ink" highlightClassName="text-ink" />
          </div>
          <div className="mt-6 max-w-prose space-y-4 text-base text-muted">
            {universe.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6">
            <CtaLink cta={universe.cta} variant="text" track="univers" />
            <Link href="/univers" className={buttonClasses("text")} data-track="cta" data-track-target="univers-page">
              Voir les épisodes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
