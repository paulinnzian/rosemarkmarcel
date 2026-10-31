import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/site/button-styles";
import { requireAdmin } from "@/lib/admin/session";
import { formatFollowers } from "@/lib/format";
import { networkName } from "@/lib/networks";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function AdminHomePage() {
  const { supabase, email } = await requireAdmin();
  const [donation, socials] = await Promise.all([
    supabase.from("donation_settings").select("enabled, payment_url").eq("id", 1).single(),
    supabase.from("social_links").select("id, network, followers, visible").order("position"),
  ]);

  const donationsOpen = donation.data?.enabled === true && donation.data.payment_url !== null;
  const visibleLinks = (socials.data ?? []).filter((link) => link.visible);

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Bonjour !</h1>
      <p className="mt-2 text-sm text-muted">Connecté avec {email}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="carte-dons" className="rounded-lg bg-surface p-6">
          <h2 id="carte-dons" className="text-kicker uppercase">
            Dons
          </h2>
          <p className="mt-3 text-label">{donationsOpen ? "Ouverts" : "Fermés"}</p>
          <p className="mt-1 text-xs text-muted">
            {donationsOpen
              ? "Les boutons « Soutenir » ouvrent votre lien de paiement."
              : "Les boutons « Soutenir » affichent « Les dons arrivent bientôt »."}
          </p>
        </section>

        <section aria-labelledby="carte-reseaux" className="rounded-lg bg-surface p-6">
          <h2 id="carte-reseaux" className="text-kicker uppercase">
            Réseaux affichés
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {visibleLinks.map((link) => (
              <li key={link.id} className="flex justify-between gap-4">
                <span>{networkName(link.network)}</span>
                <span className="font-bold">{link.followers === null ? "sans compteur" : formatFollowers(link.followers)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/reseaux" className={buttonClasses("primary", "mt-5 w-full")}>
            Mettre à jour les compteurs
          </Link>
        </section>
      </div>
    </>
  );
}
