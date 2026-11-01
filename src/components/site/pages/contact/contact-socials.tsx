import type { SocialLink } from "@/content/schema";

type ContactSocialsProps = {
  heading: string;
  text: string;
  socials: SocialLink[];
  /** Première section après l'en-tête (aucun canal de contact renseigné) : ni filet ni marge en haut. */
  first: boolean;
};

/** Écrire en message privé : un lien par réseau visible, ouvert dans un nouvel onglet, le compte en clair. */
export function ContactSocials({ heading, text, socials, first }: ContactSocialsProps) {
  const visible = socials.filter((link) => link.visible);
  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="messages-titre" className={first ? "" : "border-t border-line"}>
      <div
        className={`container-site grid ${first ? "pb-[var(--section-y)]" : "section-y"} gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16`}
      >
        <div>
          <h2 id="messages-titre" className="text-h2 text-balance">
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-base text-muted">{text}</p>
        </div>
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:self-end">
          {visible.map((link) => (
            <li key={link.network} className="border-b border-line">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-track="social"
                data-track-target={link.network}
                className="group flex min-h-11 items-center justify-between gap-4 py-3 text-ink"
              >
                <span className="min-w-0">
                  <span className="block text-label decoration-accent decoration-2 underline-offset-4 group-hover:underline">
                    {link.name}
                  </span>{" "}
                  <span className="block text-sm text-muted [overflow-wrap:anywhere]">{link.handle}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-label">
                  ↗
                </span>
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
