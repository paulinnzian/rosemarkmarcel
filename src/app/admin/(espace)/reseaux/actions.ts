"use server";

import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";

import { socialLinkFormSchema } from "./schema";

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

  return result.ok
    ? { status: "saved", message: "Enregistré. La page publique est à jour.", fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}
