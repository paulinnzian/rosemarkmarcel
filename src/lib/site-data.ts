import { cacheLife, cacheTag } from "next/cache";

import { seedContent } from "@/content";
import { siteContentSchema, type SiteContent } from "@/content/schema";
import { networkName } from "@/lib/networks";
import { isSupabaseConfigured, publicMediaUrl } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public-client";

/** Tag du contenu public : chaque enregistrement de l'admin appelle updateTag(CONTENT_TAG). */
export const CONTENT_TAG = "contenu";

/**
 * Contenu de la page publique, gardé en cache jusqu'au prochain enregistrement dans l'admin.
 * Sans Supabase configuré, ou si la base ne répond pas, les valeurs initiales de content.ts sont servies
 * (avec un cache court dans le second cas, pour reprendre la base dès qu'elle revient).
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);

  if (!isSupabaseConfigured()) {
    cacheLife("max");
    return seedContent;
  }

  try {
    const content = await readContentFromDatabase();
    cacheLife("max");
    return content;
  } catch (error) {
    console.error("Contenu illisible dans Supabase, valeurs initiales servies :", error);
    cacheLife("minutes");
    return seedContent;
  }
}

async function readContentFromDatabase(): Promise<SiteContent> {
  const supabase = createPublicClient();
  const [site, donation, socials, contacts] = await Promise.all([
    supabase.from("site_content").select("*").eq("id", 1).single(),
    supabase.from("donation_settings").select("*").eq("id", 1).single(),
    supabase.from("social_links").select("*").eq("visible", true).order("position"),
    supabase.from("contact_channels").select("*").eq("visible", true).order("position"),
  ]);
  if (site.error) throw site.error;
  if (donation.error) throw donation.error;
  if (socials.error) throw socials.error;
  if (contacts.error) throw contacts.error;

  const row = site.data;
  // photo_path vide : la photo livrée avec le site.
  const photo = row.photo_path
    ? { src: publicMediaUrl(row.photo_path), width: row.photo_width, height: row.photo_height }
    : { src: seedContent.photo.src, width: seedContent.photo.width, height: seedContent.photo.height };

  // Le schéma Zod valide tout ce qui vient de la base, jsonb compris : une ligne invalide fait servir les valeurs initiales.
  return siteContentSchema.parse({
    ...(row.sections as object),
    creatorName: row.creator_name,
    tagline: row.tagline,
    roleLine: row.role_line,
    conceptName: row.concept_name,
    photo: { ...photo, alt: row.photo_alt },
    socials: socials.data.map((link) => ({
      network: link.network,
      name: networkName(link.network),
      handle: link.handle,
      url: link.url,
      followers: link.followers,
      actionLabel: link.action_label,
      fallbackLabel: link.fallback_label ?? undefined,
      fallbackSublabel: link.fallback_sublabel ?? undefined,
      // Heure d'Abidjan = UTC : la date UTC est la bonne date locale.
      updatedAt: link.followers_updated_at?.slice(0, 10),
      visible: link.visible,
    })),
    contacts: contacts.data.map((channel) => ({
      type: channel.type,
      value: channel.value,
      display: channel.display,
      label: channel.label,
      ...(channel.type === "whatsapp" && channel.prefilled_message ? { prefilledMessage: channel.prefilled_message } : {}),
    })),
    donation: {
      enabled: donation.data.enabled,
      paymentUrl: donation.data.payment_url,
      buttonLabel: donation.data.button_label,
      floatingLabel: donation.data.floating_label,
      texts: donation.data.texts,
      disabledModal: donation.data.disabled_modal,
    },
  });
}
