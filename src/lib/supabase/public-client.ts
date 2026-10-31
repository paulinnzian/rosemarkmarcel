import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Client anonyme, sans cookie ni session : lit le contenu public (RLS : lecture seule) dans les fonctions « use cache ».
 * Une lecture qui dépendrait des cookies ne pourrait pas être mise en cache pour tous les visiteurs.
 */
export function createPublicClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
