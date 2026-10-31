"use server";

import type { FormState } from "@/lib/admin/form-state";
import { textOf } from "@/lib/admin/form-values";
import { imageInfo } from "@/lib/admin/image-info";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";

const MAX_BYTES = 5 * 1024 * 1024; // limite du bucket public-media
const MIN_SIDE = 400;
const BUCKET = "public-media";
const CONTENT_TYPES = { png: "image/png", webp: "image/webp", jpeg: "image/jpeg" } as const;

const fail = (message: string, fieldErrors: Record<string, string> = {}): FormState => ({ status: "error", message, fieldErrors });

/** Remplace la photo du héros, change seulement son texte alternatif, ou revient à la photo livrée avec le site. */
export async function updatePhoto(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const alt = textOf(formData, "alt");
  if (alt.length === 0) return fail("Corrigez les champs signalés.", { alt: "Décrivez la photo pour les personnes qui ne la voient pas." });
  if (alt.length > 200) return fail("Corrigez les champs signalés.", { alt: "200 caractères au plus." });

  const { data: current } = await supabase.from("site_content").select("photo_path").eq("id", 1).maybeSingle();
  const previousPath = current?.photo_path ?? null;

  if (formData.get("intent") === "reset") {
    const result = await saveAndPublish(
      supabase.from("site_content").update({ photo_path: null, photo_width: null, photo_height: null, photo_alt: alt }).eq("id", 1).select("id"),
    );
    if (!result.ok) return fail(result.message);
    await removeObject(supabase, previousPath);
    return { status: "saved", message: "La photo livrée avec le site est de retour sur la page publique.", fieldErrors: {} };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    const result = await saveAndPublish(supabase.from("site_content").update({ photo_alt: alt }).eq("id", 1).select("id"));
    return result.ok ? { status: "saved", message: "Texte de la photo enregistré.", fieldErrors: {} } : fail(result.message);
  }

  if (file.size > MAX_BYTES) return fail("Corrigez les champs signalés.", { photo: "La photo dépasse 5 Mo. Exportez-la plus légère (WebP ou PNG)." });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = imageInfo(bytes);
  if (!info) return fail("Corrigez les champs signalés.", { photo: "Format non reconnu : envoyez un PNG, un WebP ou un JPEG." });
  if (Math.min(info.width, info.height) < MIN_SIDE) {
    return fail("Corrigez les champs signalés.", { photo: `Photo trop petite (${info.width} × ${info.height} px) : ${MIN_SIDE} px au moins de chaque côté.` });
  }

  // Nom nouveau à chaque envoi : l'ancienne photo reste en cache chez les visiteurs sans jamais être confondue.
  const path = `photo/${Date.now()}.${info.format === "jpeg" ? "jpg" : info.format}`;
  const upload = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: CONTENT_TYPES[info.format], cacheControl: "31536000", upsert: false });
  if (upload.error) {
    console.error("Envoi de la photo refusé par Supabase Storage :", upload.error.message);
    return fail("L’envoi de la photo a échoué. Réessayez dans un instant.");
  }

  const result = await saveAndPublish(
    supabase
      .from("site_content")
      .update({ photo_path: path, photo_width: info.width, photo_height: info.height, photo_alt: alt })
      .eq("id", 1)
      .select("id"),
  );
  if (!result.ok) {
    await removeObject(supabase, path);
    return fail(result.message);
  }
  await removeObject(supabase, previousPath);

  return {
    status: "saved",
    message: info.hasAlpha
      ? "Photo enregistrée. La page publique est à jour."
      : "Photo enregistrée. Elle n’a pas de fond transparent : elle s’affichera dans un rectangle, sans le détourage.",
    fieldErrors: {},
  };
}

type Client = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/** Supprime une ancienne photo envoyée par l'admin ; un échec ne bloque rien (fichier orphelin, sans effet visible). */
async function removeObject(supabase: Client, path: string | null) {
  if (!path?.startsWith("photo/")) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Ancienne photo non supprimée :", error.message);
}
