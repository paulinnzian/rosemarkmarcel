import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import { SupportButton } from "@/components/site/support-button";
import type { Donation } from "@/content/schema";

/** S06 : le don libre ; F03. Seul le comportement du bouton change selon que les dons sont ouverts ou non. */
export function DonationSection({ donation }: { donation: Donation }) {
  const { texts } = donation;

  return (
    <section id="soutenir" aria-labelledby="soutenir-titre" className="section-y">
      <div className="container-site">
        <div className="on-accent grid gap-6 rounded-lg bg-accent p-5 sm:p-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-[58px]">
          <div>
            <Kicker className="text-highlight">{texts.kicker}</Kicker>
            <div className="mt-4">
              <SectionHeading as="h2" id="soutenir-titre" heading={texts.heading} className="text-on-accent" highlightClassName="text-highlight" />
            </div>
            <p className="mt-4 max-w-prose text-base text-on-accent">{texts.text}</p>
          </div>
          <div className="rounded-md bg-surface p-5 text-ink sm:p-7">
            <h3 className="text-label">
              <span className="block">{texts.cardTitle[0]}</span>
              <span className="block">{texts.cardTitle[1]}</span>
            </h3>
            <p className="mb-6 mt-2 text-sm text-muted">{texts.cardText}</p>
            <SupportButton donation={donation} variant="section" />
            <p className="mt-4 text-sm text-muted sm:text-center">{texts.thanks}</p>
            {texts.feeNote && <p className="mt-2 text-sm text-muted sm:text-center">{texts.feeNote}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
