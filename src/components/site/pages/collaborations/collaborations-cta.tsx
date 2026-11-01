import { FabricMotif } from "@/components/site/fabric-motif";
import type { ContactChannel } from "@/content/schema";

import { WhatsappButton } from "./whatsapp-button";

type CollaborationsCtaProps = {
  heading: string;
  text: string;
  whatsappMessage: string;
  contacts: ContactChannel[];
};

/** Bande finale : WhatsApp (action principale), puis le téléphone en lien d'appel, affiché en clair. */
export function CollaborationsCta({ heading, text, whatsappMessage, contacts }: CollaborationsCtaProps) {
  const whatsapp = contacts.find((channel) => channel.type === "whatsapp");
  const phone = contacts.find((channel) => channel.type === "phone");

  return (
    <section aria-labelledby="ecrire-titre" className="on-accent bg-ink text-on-accent">
      <FabricMotif />
      <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <h2 id="ecrire-titre" className="text-h2 text-balance">
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-lead">{text}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          {whatsapp && <WhatsappButton number={whatsapp.value} label={whatsapp.label} message={whatsappMessage} track="fin" className="w-full lg:w-auto" />}
          {phone && (
            <a
              href={`tel:${phone.value}`}
              data-track="phone"
              data-track-target="fin"
              aria-label={`${phone.label}, ${phone.display}`}
              className="inline-flex min-h-11 items-center text-tel decoration-highlight decoration-2 underline-offset-4 hover:underline"
            >
              {phone.display}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
