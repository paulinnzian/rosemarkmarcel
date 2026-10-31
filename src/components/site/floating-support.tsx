import { SupportButton } from "@/components/site/support-button";
import type { Donation } from "@/content/schema";

/** Bouton de soutien épinglé : visible pendant tout le défilement, sur toutes les pages publiques. */
export function FloatingSupport({ donation }: { donation: Donation }) {
  return (
    <div
      data-print-hidden
      className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-[calc(16px+env(safe-area-inset-right))] z-40"
    >
      <SupportButton donation={donation} variant="floating" />
    </div>
  );
}
