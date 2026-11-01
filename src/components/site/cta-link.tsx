import Link from "next/link";

import { buttonClasses, type ButtonVariant } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";

type CtaLinkProps = {
  cta: { label: string; href: string };
  variant: ButtonVariant;
  /** Cible enregistrée dans les statistiques (« hero », « a-propos »…). */
  track: string;
};

/** Lien d'appel à l'action : page du site, ancre de la page, ou lien externe ouvert dans un nouvel onglet. */
export function CtaLink({ cta, variant, track }: CtaLinkProps) {
  const external = cta.href.startsWith("https://");

  if (cta.href.startsWith("/")) {
    return (
      <Link href={cta.href} className={buttonClasses(variant)} data-track="cta" data-track-target={track}>
        <Decorated text={cta.label} />
      </Link>
    );
  }

  return (
    <a
      href={cta.href}
      className={buttonClasses(variant)}
      data-track="cta"
      data-track-target={track}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Decorated text={cta.label} />
      {external && <span className="sr-only"> (nouvel onglet)</span>}
    </a>
  );
}
