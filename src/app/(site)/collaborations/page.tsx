import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { AudienceTable } from "@/components/site/pages/collaborations/audience-table";
import { CollaborationsCta } from "@/components/site/pages/collaborations/collaborations-cta";
import { FormatsList } from "@/components/site/pages/collaborations/formats-list";
import { StepsList } from "@/components/site/pages/collaborations/steps-list";
import { WhatsappButton } from "@/components/site/pages/collaborations/whatsapp-button";
import { pageMetadata } from "@/lib/page-metadata";
import { breadcrumb, JsonLd } from "@/lib/seo/json-ld";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = pageMetadata(
  "Collaborations de marque avec Le Repos",
  "Marques et agences : l’audience de Rosemark Marcel réseau par réseau, les formats de collaboration autour du Repos et un contact direct sur WhatsApp.",
  "/collaborations",
);

// Visiteur : une marque. D'abord les chiffres et ce qu'on peut faire ensemble ; action principale : écrire sur WhatsApp.
export default async function CollaborationsPage() {
  const content = await getSiteContent();
  const page = content.pages.collaborations;
  const whatsapp = content.contacts.find((channel) => channel.type === "whatsapp");

  return (
    <main id="contenu">
      <JsonLd data={breadcrumb("Collaborations", "/collaborations")} />
      <PageIntro
        kicker={page.kicker}
        heading={page.heading}
        intro={page.intro}
        aside={
          whatsapp && (
            <div className="lg:justify-self-end">
              <WhatsappButton
                number={whatsapp.value}
                label={whatsapp.label}
                message={page.whatsappMessage}
                track="intro"
                className="w-full sm:w-auto"
              />
            </div>
          )
        }
      />
      <AudienceTable heading={page.audienceHeading} note={page.audienceNote} socials={content.socials} />
      <FormatsList heading={page.formatsHeading} formats={page.formats} />
      <StepsList heading={page.stepsHeading} steps={page.steps} />
      <CollaborationsCta heading={page.ctaHeading} text={page.ctaText} whatsappMessage={page.whatsappMessage} contacts={content.contacts} />
    </main>
  );
}
