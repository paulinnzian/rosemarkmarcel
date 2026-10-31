import { CtaLink } from "@/components/site/cta-link";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import type { SiteContent } from "@/content/schema";

/** S02 : la présentation du créateur. */
export function AboutSection({ about }: { about: SiteContent["about"] }) {
  return (
    <section id="a-propos" aria-labelledby="a-propos-titre" className="border-b border-line">
      <div className="container-site section-y grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Kicker>{about.kicker}</Kicker>
          <div className="mt-4">
            <SectionHeading as="h2" id="a-propos-titre" heading={about.heading} />
          </div>
          <p className="mt-4 text-sm font-bold text-accent">{about.subtitle}</p>
        </div>
        <div>
          <div className="max-w-prose space-y-4 text-base text-muted">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-4">
            <CtaLink cta={about.cta} variant="text" track="a-propos" />
          </div>
        </div>
      </div>
    </section>
  );
}
