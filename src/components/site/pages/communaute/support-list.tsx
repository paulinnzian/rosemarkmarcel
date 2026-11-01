import type { ReactNode } from "react";

import { buttonClasses } from "@/components/site/button-styles";
import { ShareButton } from "@/components/site/pages/communaute/share-button";
import { SupportButton } from "@/components/site/support-button";
import type { Donation, Pages } from "@/content/schema";

type SupportListProps = {
  texts: Pages["community"];
  donation: Donation;
  shareTitle: string;
  /** Ancre de la liste des réseaux, pour le bloc « suivre » ; absente s'il n'y a aucun réseau affiché. */
  networksId?: string;
};

/** « Comment soutenir » : titre à gauche, une ligne par geste à droite, le don mis à part sur fond bleu. */
export function SupportList({ texts, donation, shareTitle, networksId }: SupportListProps) {
  const { follow, share, donate } = texts.support;
  const rows: { key: string; block: { title: string; text: string }; action: ReactNode; isDonation?: boolean }[] = [
    {
      key: "suivre",
      block: follow,
      action: networksId ? (
        <a href={`#${networksId}`} className={buttonClasses("text")}>
          <span aria-hidden="true">↑</span> Voir mes réseaux
        </a>
      ) : null,
    },
    {
      key: "partager",
      block: share,
      action: <ShareButton label={texts.shareLabel} title={shareTitle} text={texts.shareText} className="sm:w-64" />,
    },
    {
      key: "donner",
      block: donate,
      isDonation: true,
      action: (
        <div className="sm:w-64">
          <SupportButton donation={donation} variant="section" />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="soutenir-titre">
      <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-16">
        <h2 id="soutenir-titre" className="text-h2 text-balance">
          {texts.supportHeading}
        </h2>
        <ul className="grid gap-3">
          {rows.map(({ key, block, action, isDonation }) => {
            return (
              <li
                key={key}
                className={`grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 ${
                  isDonation ? "on-accent rounded-lg bg-accent px-6 text-on-accent lg:px-8" : "border-b border-line"
                }`}
              >
                <div>
                  <h3 className="text-label">{block.title}</h3>
                  <p className={`mt-2 max-w-prose text-base ${isDonation ? "text-on-accent" : "text-muted"}`}>{block.text}</p>
                </div>
                {action}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
