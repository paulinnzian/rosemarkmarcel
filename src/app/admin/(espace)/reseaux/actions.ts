"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";
import { checkLinksAfterSave } from "@/lib/links/run";
import { CONTENT_TAG } from "@/lib/site-data";

import { newSocialLinkFormSchema, socialLinkFormSchema } from "./schema";

export async function addSocialLink(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const parsed = newSocialLinkFormSchema.safeParse({
    network: formData.get("network") ?? "",
    handle: formData.get("handle"),
    url: formData.get("url"),
    followers: String(formData.get("followers") ?? ""),
    actionLabel: formData.get("actionLabel"),
    fallbackLabel: String(formData.get("fallbackLabel") ?? ""),
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const link = parsed.data;

  // Nouveau réseau en dernière position.
  const { data: last } = await supabase.from("social_links").select("position").order("position", { ascending: false }).limit(1).maybeSingle();

  const result = await saveAndPublish(
    supabase
      .from("social_links")
      .insert({
        network: link.network,
        handle: link.handle,
        url: link.url,
        followers: link.followers,
        followers_updated_at: link.followers === null ? null : new Date().toISOString(),
        action_label: link.actionLabel,
        fallback_label: link.fallbackLabel,
        visible: link.visible,
        position: (last?.position ?? -1) + 1,
      })
      .select("id"),
  );

  if (result.ok) checkLinksAfterSave(supabase);
  return result.ok
    ? { status: "saved", message: "Réseau ajouté en dernière position.", fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}

const moveSchema = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });

/** Échange un réseau avec son voisin ; les positions sont renumérotées 0, 1, 2… au passage. */
export async function moveSocialLink(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const parsed = moveSchema.safeParse({ id: formData.get("id"), direction: formData.get("direction") });
  if (!parsed.success) return;

  const { data: links } = await supabase.from("social_links").select("id").order("position").order("created_at");
  if (!links) return;
  const ids = links.map((link) => link.id);
  const from = ids.indexOf(parsed.data.id);
  const to = parsed.data.direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];

  const results = await Promise.all(ids.map((id, position) => supabase.from("social_links").update({ position }).eq("id", id)));
  const failed = results.find((result) => result.error);
  if (failed?.error) console.error("Ordre des réseaux non enregistré :", failed.error.message);
  updateTag(CONTENT_TAG);
}

export async function updateSocialLink(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const parsed = socialLinkFormSchema.safeParse({
    id: formData.get("id"),
    handle: formData.get("handle"),
    url: formData.get("url"),
    followers: String(formData.get("followers") ?? ""),
    actionLabel: formData.get("actionLabel"),
    fallbackLabel: String(formData.get("fallbackLabel") ?? ""),
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const link = parsed.data;

  // La date de mise à jour du compteur ne bouge que si le compteur change.
  const { data: current } = await supabase.from("social_links").select("followers").eq("id", link.id).maybeSingle();
  if (!current) return { status: "error", message: "Ce réseau n’existe plus. Rechargez la page.", fieldErrors: {} };
  const followersChanged = current.followers !== link.followers;

  const result = await saveAndPublish(
    supabase
      .from("social_links")
      .update({
        handle: link.handle,
        url: link.url,
        followers: link.followers,
        action_label: link.actionLabel,
        fallback_label: link.fallbackLabel,
        visible: link.visible,
        ...(followersChanged ? { followers_updated_at: new Date().toISOString() } : {}),
      })
      .eq("id", link.id)
      .select("id"),
  );

  if (result.ok) checkLinksAfterSave(supabase);
  return result.ok
    ? { status: "saved", message: "Enregistré. La page publique est à jour.", fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}
