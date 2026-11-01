import type { ReactNode } from "react";

import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import type { Heading } from "@/content/schema";

type PageIntroProps = {
  kicker: string;
  heading: Heading;
  intro: string;
  /** Colonne de droite en bureau (photo, chiffre, motif) ; sous le texte en mobile. */
  aside?: ReactNode;
  className?: string;
};

/** En-tête commun des pages : petit titre, titre de niveau 1, introduction. */
export function PageIntro({ kicker, heading, intro, aside, className = "" }: PageIntroProps) {
  return (
    <header className={`container-site section-y grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16 ${className}`}>
      <div>
        <Kicker withDot>{kicker}</Kicker>
        <div className="mt-5">
          <SectionHeading as="h1" heading={heading} />
        </div>
        <p className="mt-6 max-w-prose text-lead text-muted">{intro}</p>
      </div>
      {aside}
    </header>
  );
}
