import { CtaLink } from "@/components/site/cta-link";
import { HeroPhoto } from "@/components/site/hero-photo";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import { SupportButton } from "@/components/site/support-button";
import type { SiteContent } from "@/content/schema";

/** S01 : qui est le créateur, en un écran. */
export function HeroSection({ content }: { content: SiteContent }) {
  const { roleLine, hero, photo, photoLabel, creatorName, donation } = content;

  return (
    <section id="accueil" aria-labelledby="accueil-titre">
      <div className="container-site grid items-center gap-10 pb-12 pt-8 lg:grid-cols-2 lg:gap-12 lg:pb-10">
        <div>
          <Kicker withDot>{roleLine}</Kicker>
          <div className="mt-5">
            <SectionHeading as="h1" id="accueil-titre" heading={hero.heading} />
          </div>
          <p className="mt-6 max-w-[34rem] text-lead text-muted">{hero.intro}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <CtaLink cta={hero.primaryCta} variant="primary" />
            <SupportButton donation={donation} variant="hero" />
          </div>
        </div>
        <HeroPhoto photo={photo} label={photoLabel} fallbackText={creatorName} />
      </div>
    </section>
  );
}
