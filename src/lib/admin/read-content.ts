import "server-only";

import type { z } from "zod";

import { seedContent } from "@/content";
import { mergePages } from "@/content/pages";
import { donationSchema, siteContentSchema, type Donation } from "@/content/schema";
import type { createSessionClient } from "@/lib/supabase/server";

type SessionClient = Awaited<ReturnType<typeof createSessionClient>>;

/** Textes modifiables dans /admin/contenus : 4 colonnes de site_content + les sections jsonb. */
export const editableContentSchema = siteContentSchema.pick({
  creatorName: true,
  tagline: true,
  roleLine: true,
  conceptName: true,
  nav: true,
  hero: true,
  photoLabel: true,
  marquee: true,
  about: true,
  community: true,
  universe: true,
  contact: true,
  footerLine: true,
  pages: true,
});

export type EditableContent = z.infer<typeof editableContentSchema>;

/** Les colonnes ; tout le reste vit dans site_content.sections. */
export const CONTENT_COLUMNS = { creatorName: "creator_name", tagline: "tagline", roleLine: "role_line", conceptName: "concept_name" } as const;

const seedEditable: EditableContent = editableContentSchema.parse(seedContent);

/**
 * Textes actuels, ou null si la base ne répond pas. Une section absente de la base (jsonb incomplet)
 * reprend la valeur initiale de content.ts : l'admin peut toujours l'enregistrer pour la créer.
 */
export async function readEditableContent(supabase: SessionClient): Promise<{ content: EditableContent; sections: Record<string, unknown> } | null> {
  const { data, error } = await supabase.from("site_content").select("creator_name, tagline, role_line, concept_name, sections").eq("id", 1).single();
  if (error) return null;

  const sections = (data.sections ?? {}) as Record<string, unknown>;
  const parsed = editableContentSchema.safeParse({
    ...seedEditable,
    ...sections,
    pages: mergePages(sections.pages),
    creatorName: data.creator_name,
    tagline: data.tagline,
    roleLine: data.role_line,
    conceptName: data.concept_name,
  });
  return { content: parsed.success ? parsed.data : seedEditable, sections };
}

/** Réglages des dons, ou null si la base ne répond pas. */
export async function readDonation(supabase: SessionClient): Promise<Donation | null> {
  const { data, error } = await supabase.from("donation_settings").select("*").eq("id", 1).single();
  if (error) return null;

  const seed = seedContent.donation;
  const parsed = donationSchema.safeParse({
    enabled: data.enabled,
    paymentUrl: data.payment_url,
    buttonLabel: data.button_label,
    floatingLabel: data.floating_label,
    texts: { ...seed.texts, ...(data.texts as object) },
    disabledModal: { ...seed.disabledModal, ...(data.disabled_modal as object) },
  });
  return parsed.success ? parsed.data : { ...seed, enabled: data.enabled, paymentUrl: data.payment_url };
}
