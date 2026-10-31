import { buttonClasses } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import type { SiteContent } from "@/content/schema";
import { whatsappHref } from "@/lib/format";

type ContactSectionProps = Pick<SiteContent, "contact" | "contacts">;

/** S05 : le contact des marques ; F02. Chaque canal s'affiche seulement s'il est renseigné. */
export function ContactSection({ contact, contacts }: ContactSectionProps) {
  const whatsapp = contacts.find((channel) => channel.type === "whatsapp");
  const phone = contacts.find((channel) => channel.type === "phone");
  const email = contacts.find((channel) => channel.type === "email");

  return (
    <section id="contact" aria-labelledby="contact-titre" className="border-t border-line">
      {/* Colonne du titre plus large : « quelque chose ensemble ? » tient sur une ligne en desktop. */}
      <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div>
          <Kicker>{contact.kicker}</Kicker>
          <div className="mt-4">
            <SectionHeading as="h2" id="contact-titre" heading={contact.heading} className="text-ink" highlightClassName="text-ink" />
          </div>
          <p className="mt-6 max-w-prose text-base text-muted">{contact.intro}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          {whatsapp?.type === "whatsapp" && (
            <a
              href={whatsappHref(whatsapp.value, whatsapp.prefilledMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary")}
            >
              <Decorated text={whatsapp.label} />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.value}`} aria-label={`${phone.label}, ${phone.display}`} className="inline-flex min-h-11 items-center text-tel text-ink">
              {phone.display}
            </a>
          )}
          {email && (
            <a href={`mailto:${email.value}`} className={buttonClasses("text")}>
              {email.display}
            </a>
          )}
          <p className="text-xs text-muted">{contact.note}</p>
        </div>
      </div>
    </section>
  );
}
