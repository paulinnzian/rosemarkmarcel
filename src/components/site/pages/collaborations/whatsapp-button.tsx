import { buttonClasses } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";
import { whatsappHref } from "@/lib/format";

type WhatsappButtonProps = {
  /** Numéro au format international (+225…), lu dans les contacts. */
  number: string;
  label: string;
  /** Message pré-rempli de la page Collaborations. */
  message: string;
  /** Emplacement du bouton dans les statistiques : « intro » ou « fin ». */
  track: string;
  className?: string;
};

/** Bouton principal de la page : WhatsApp dans un nouvel onglet, message pré-rempli (même idiome que l'accueil). */
export function WhatsappButton({ number, label, message, track, className = "" }: WhatsappButtonProps) {
  return (
    <a
      href={whatsappHref(number, message)}
      data-track="whatsapp"
      data-track-target={track}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses("primary", className)}
    >
      <Decorated text={label} />
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}
