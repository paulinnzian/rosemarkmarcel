import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { WhatsappButton } from "@/components/site/pages/collaborations/whatsapp-button";
import { ContactBrands } from "@/components/site/pages/contact/contact-brands";
import { ContactChannels } from "@/components/site/pages/contact/contact-channels";
import { ContactSocials } from "@/components/site/pages/contact/contact-socials";
import { pageMetadata } from "@/lib/page-metadata";
import { breadcrumb, JsonLd } from "@/lib/seo/json-ld";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = pageMetadata(
  "Contact",
  "Contacter Rosemark Marcel, créateur du Repos : un message sur WhatsApp, un appel ou un message privé sur les réseaux, et la page des marques.",
  "/contact",
);

// Visiteur : un fan, un média ou une marque. D'abord les moyens de joindre Marcel, le plus rapide en premier ;
// action principale : écrire sur WhatsApp. Sans aucun canal renseigné, les réseaux passent en tête.
export default async function ContactPage() {
  const content = await getSiteContent();
  const page = content.pages.contact;
  const whatsapp = content.contacts.find((channel) => channel.type === "whatsapp");
  const hasChannels = content.contacts.length > 0;

  return (
    <main id="contenu">
      <JsonLd data={breadcrumb("Contact", "/contact")} />
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
      <ContactChannels contacts={content.contacts} whatsappMessage={page.whatsappMessage} />
      <ContactSocials heading={page.socialsHeading} text={page.socialsText} socials={content.socials} first={!hasChannels} />
      <ContactBrands brandsHeading={page.brandsHeading} brandsText={page.brandsText} brandsCta={page.brandsCta} />
    </main>
  );
}
