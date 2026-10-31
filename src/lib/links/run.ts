import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { networkName } from "@/lib/networks";

import { checkUrl, type LinkStatus } from "./check";

export type LinkCheck = { url: string; label: string; status: LinkStatus; httpStatus: number | null; checkedAt: string };

/** Les liens sortants affichés sur le site : lien de paiement (s'il y en a un) et réseaux visibles. */
async function linksOnSite(supabase: SupabaseClient<Database>): Promise<{ url: string; label: string }[] | null> {
  const [donation, socials] = await Promise.all([
    supabase.from("donation_settings").select("payment_url").eq("id", 1).single(),
    supabase.from("social_links").select("network, url").eq("visible", true).order("position"),
  ]);
  if (donation.error || socials.error) return null;

  const links = [
    ...(donation.data.payment_url ? [{ url: donation.data.payment_url, label: "Lien de paiement des dons" }] : []),
    ...socials.data.map((link) => ({ url: link.url, label: networkName(link.network) })),
  ];
  return links.filter((link, index) => links.findIndex((other) => other.url === link.url) === index);
}

/**
 * Vérifie tous les liens et remplace les résultats précédents. Client de session d'un admin (RLS) ou client
 * à clé service (tâche quotidienne). Renvoie null si la base ne répond pas.
 */
export async function runLinkChecks(supabase: SupabaseClient<Database>): Promise<LinkCheck[] | null> {
  const links = await linksOnSite(supabase);
  if (!links) return null;

  const checkedAt = new Date().toISOString();
  const results = await Promise.all(links.map(async (link) => ({ ...link, ...(await checkUrl(link.url)), checkedAt })));

  const cleared = await supabase.from("link_checks").delete().neq("url", "");
  const saved = results.length
    ? await supabase.from("link_checks").insert(
        results.map((result) => ({ url: result.url, label: result.label, status: result.status, http_status: result.httpStatus, checked_at: checkedAt })),
      )
    : { error: null };
  if (cleared.error || saved.error) {
    console.error("Vérification des liens non enregistrée :", (cleared.error ?? saved.error)?.message);
    return null;
  }
  return results;
}

/** Après un enregistrement qui touche un lien : vérification une fois la réponse partie, l'admin n'attend pas. */
export function checkLinksAfterSave(supabase: SupabaseClient<Database>): void {
  after(async () => {
    await runLinkChecks(supabase);
  });
}
