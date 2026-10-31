import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Ferme la session sur tous les appareils, puis recharge la page de connexion (303 : vraie navigation,
 * sans préchargement du routeur client sur des pages admin qui ne sont plus accessibles).
 */
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/admin/connexion", request.url), 303);
}
