import { NextResponse, type NextRequest } from "next/server";

import { publicUrl } from "@/lib/request-host";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Lien de l'e-mail de connexion : ?token_hash=…&type=email. Vérifié côté serveur, sans code PKCE,
 * donc le lien marche aussi s'il s'ouvre dans un autre navigateur que celui de la demande (Gmail, WhatsApp).
 */
export async function GET(request: NextRequest) {
  const to = (path: string) => NextResponse.redirect(publicUrl(path, request.headers, request.url));
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (!isSupabaseConfigured() || !tokenHash || type !== "email") return to("/admin/connexion?erreur=lien");

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data.user) return to("/admin/connexion?erreur=lien");

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return to("/admin/connexion?erreur=refus");
  }

  return to("/admin");
}
