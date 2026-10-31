import "server-only";

import { updateTag } from "next/cache";

import { CONTENT_TAG } from "@/lib/site-data";

type Write = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/**
 * Seul chemin d'écriture de l'admin : enregistre, vérifie qu'une ligne a bien changé (RLS peut filtrer sans erreur),
 * puis régénère la page publique tout de suite (updateTag : l'admin voit sa modification sans délai).
 * L'écriture doit se terminer par .select() pour renvoyer les lignes touchées.
 */
export async function saveAndPublish(write: Write): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await write;
  if (error) {
    console.error("Enregistrement refusé par Supabase :", error.message);
    return { ok: false, message: "L’enregistrement a échoué. Réessayez dans un instant." };
  }
  if (!data || data.length === 0) {
    return { ok: false, message: "Enregistrement refusé : votre compte n’a pas les droits nécessaires." };
  }
  updateTag(CONTENT_TAG);
  return { ok: true };
}
