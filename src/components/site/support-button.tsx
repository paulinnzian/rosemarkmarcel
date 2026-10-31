import { buttonClasses } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";
import { SupportDialog } from "@/components/site/support-dialog";
import type { Donation } from "@/content/schema";

export type SupportVariant = "hero" | "section" | "floating";

const variantClasses: Record<SupportVariant, string> = {
  hero: buttonClasses("text"),
  section: buttonClasses("primary", "w-full"),
  floating:
    "inline-flex min-h-[54px] items-center gap-2 rounded-pill border-2 border-surface bg-accent px-[22px] py-[15px] text-sm font-bold text-on-accent shadow-float transition-colors duration-150 ease-brand hover:bg-accent-hover lg:min-h-[58px] lg:px-6 lg:py-[17px]",
};

/** Tous les boutons de soutien passent par ici : lien de paiement si les dons sont ouverts, sinon la modale. */
export function SupportButton({ donation, variant }: { donation: Donation; variant: SupportVariant }) {
  const label = variant === "floating" ? donation.floatingLabel : donation.buttonLabel;
  const className = variantClasses[variant];

  if (donation.enabled && donation.paymentUrl) {
    return (
      <a href={donation.paymentUrl} target="_blank" rel="noopener noreferrer" className={className}>
        <Decorated text={label} />
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  }

  return <SupportDialog label={label} triggerClassName={className} modal={donation.disabledModal} />;
}
