import type { Metadata } from "next";

import { buttonClasses } from "@/components/site/button-styles";
import { readDonation } from "@/lib/admin/read-content";
import { requireAdmin } from "@/lib/admin/session";

import { DonationForm } from "./donation-form";

export const metadata: Metadata = { title: "Dons" };

export default async function DonsPage() {
  const { supabase } = await requireAdmin();
  const donation = await readDonation(supabase);

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Dons</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Le site ne prend pas l’argent lui-même : les boutons de soutien ouvrent le lien de paiement collé ici.
      </p>

      {donation === null ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les réglages des dons pour le moment. Rechargez la page.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg bg-surface p-6">
            <p className="text-sm text-ink">
              Aujourd’hui :{" "}
              <strong className={donation.enabled ? "text-success" : "text-ink"}>{donation.enabled ? "dons ouverts" : "dons fermés"}</strong>
            </p>
            {donation.paymentUrl && (
              <a href={donation.paymentUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("text")}>
                Tester le lien enregistré <span aria-hidden="true">&nbsp;↗</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            )}
          </div>
          <DonationForm donation={donation} />
        </>
      )}
    </>
  );
}
