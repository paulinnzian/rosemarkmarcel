import { SupportButton } from "@/components/site/support-button";
import type { Donation } from "@/content/schema";

/**
 * Bouton de soutien épinglé, sur toutes les pages publiques. Sur petit écran, il apparaît dès les premiers pixels
 * de défilement (reveal-after-scroll, tokens.css) : le haut de la page reste dégagé.
 */
export function FloatingSupport({ donation }: { donation: Donation }) {
  return (
    <div
      data-print-hidden
      className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-[calc(16px+env(safe-area-inset-right))] z-40 reveal-after-scroll"
    >
      <SupportButton donation={donation} variant="floating" />
    </div>
  );
}
