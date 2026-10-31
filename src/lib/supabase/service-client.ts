import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabaseUrl } from "./env";

/** Clé service présente : sans elle, les statistiques et les invitations sont désactivées. */
export function isServiceConfigured(): boolean {
  return supabaseUrl !== "" && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Client à clé service : contourne RLS. Réservé à /api/evenements (écriture des statistiques) et aux invitations
 * de l'écran Accès, après vérification du rôle. Jamais importé par un composant client (server-only).
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return createClient<Database>(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
