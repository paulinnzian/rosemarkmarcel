import type { ContactChannel } from "@/content/schema";
import { whatsappHref } from "@/lib/format";

type ContactChannelsProps = {
  contacts: ContactChannel[];
  /** Message pré-rempli de la page Contact (général, pas « collaboration »). */
  whatsappMessage: string;
};

// Le plus rapide d'abord : un message WhatsApp, puis un appel, puis un e-mail.
const ORDER: Record<ContactChannel["type"], number> = { whatsapp: 0, phone: 1, email: 2 };
const NAMES: Record<ContactChannel["type"], string> = { whatsapp: "WhatsApp", phone: "Téléphone", email: "E-mail" };

function channelLink(channel: ContactChannel, whatsappMessage: string) {
  switch (channel.type) {
    case "whatsapp":
      return { href: whatsappHref(channel.value, whatsappMessage), track: "whatsapp", target: "liste", external: true };
    case "phone":
      return { href: `tel:${channel.value}`, track: "phone", target: "liste", external: false };
    case "email":
      return { href: `mailto:${channel.value}`, track: "cta", target: "email", external: false };
  }
}

/**
 * Les moyens de joindre Marcel, en liste de lignes : chaque ligne entière est le lien (cible large en mobile),
 * le moyen en petit, la coordonnée en grand et en clair. Un seul canal par type, le premier saisi dans l'admin.
 */
export function ContactChannels({ contacts, whatsappMessage }: ContactChannelsProps) {
  const channels = contacts
    .filter((channel, index) => contacts.findIndex((other) => other.type === channel.type) === index)
    .sort((a, b) => ORDER[a.type] - ORDER[b.type]);
  if (channels.length === 0) return null;

  return (
    <section aria-labelledby="joindre-titre" className="container-site pb-[var(--section-y)]">
      <h2 id="joindre-titre" className="sr-only">
        Me joindre
      </h2>
      <ul className="border-t-2 border-ink lg:max-w-3xl">
        {channels.map((channel) => {
          const link = channelLink(channel, whatsappMessage);
          return (
            <li key={channel.type} className="border-b border-line">
              <a
                href={link.href}
                data-track={link.track}
                data-track-target={link.target}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex min-h-11 items-center justify-between gap-4 py-4 text-ink transition-colors duration-150 ease-brand hover:text-accent sm:py-5"
              >
                <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="text-sm font-bold text-muted sm:w-28 sm:shrink-0">{NAMES[channel.type]}</span>{" "}
                  <span className="text-tel [overflow-wrap:anywhere] decoration-accent decoration-2 underline-offset-4 group-hover:underline">
                    {channel.display}
                  </span>
                </span>
                {link.external && (
                  <>
                    <span aria-hidden="true" className="shrink-0 text-label">
                      ↗
                    </span>
                    <span className="sr-only"> (nouvel onglet)</span>
                  </>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
