import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "editor";

/** Admin connecté et présent dans la liste blanche, ou null. Une seule vérification par requête. */
export const getAdminSession = cache(async () => {
  // Toujours à la requête, jamais dans un pré-rendu ni un préchargement : getClaims() lit l'heure pour l'expiration du jeton.
  await connection();
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const { data: admin } = await supabase.from("admin_users").select("email, role").eq("user_id", userId).maybeSingle();
  if (!admin) return null;

  return { supabase, userId, email: admin.email, role: admin.role as AdminRole };
});

/** À appeler en tête de chaque page et de chaque action de l'admin. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/connexion");
  return session;
}
