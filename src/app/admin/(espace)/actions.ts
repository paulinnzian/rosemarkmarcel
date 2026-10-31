"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/session";
import { runLinkChecks } from "@/lib/links/run";

/** Bouton « Vérifier maintenant » du tableau de bord. */
export async function checkLinksNow(): Promise<void> {
  const { supabase } = await requireAdmin();
  await runLinkChecks(supabase);
  revalidatePath("/admin");
}
