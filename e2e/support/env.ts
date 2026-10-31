import { createClient } from "@supabase/supabase-js";

import type { Database } from "../../src/lib/supabase/database.types";

// Clés de la pile Supabase locale (.env.local, jamais de clé de production dans les tests).
try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement (CI).
}

export const OWNER = "marcel@exemple.test";
export const NOT_ADMIN = "visiteur@exemple.test";
export const EDITOR = "gestion@exemple.test";
export const OWNER_STATE = "e2e/.auth/owner.json";
export const MAILPIT = "http://127.0.0.1:54324/api/v1";

/** Client à clé service locale : vérifier l'état de la base et remettre les données de test en place. */
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^http:\/\/(127\.0\.0\.1|localhost)/.test(url)) {
    throw new Error("Les tests de bout en bout tournent seulement sur la pile Supabase locale (.env.local).");
  }
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}
