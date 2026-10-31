import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { publicMediaUrl } from "@/lib/supabase/env";

/**
 * Sauvegarde de tout le contenu du site en un fichier JSON (textes, réseaux, contacts, dons, lien de la photo).
 * Admin seulement ; les comptes d'accès et les statistiques n'y sont pas.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const { supabase } = session;

  const [site, socials, contacts, donation] = await Promise.all([
    supabase.from("site_content").select("*").eq("id", 1).single(),
    supabase.from("social_links").select("*").order("position"),
    supabase.from("contact_channels").select("*").order("position"),
    supabase.from("donation_settings").select("*").eq("id", 1).single(),
  ]);
  if (site.error || socials.error || contacts.error || donation.error) {
    return NextResponse.json({ error: "Impossible de lire le contenu pour le moment." }, { status: 503 });
  }

  const now = new Date();
  const backup = {
    format: "vitrine-createur/sauvegarde",
    version: 1,
    createdAt: now.toISOString(),
    siteContent: site.data,
    photoUrl: site.data.photo_path ? publicMediaUrl(site.data.photo_path) : null,
    socialLinks: socials.data,
    contactChannels: contacts.data,
    donationSettings: donation.data,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="sauvegarde-site-${now.toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}
