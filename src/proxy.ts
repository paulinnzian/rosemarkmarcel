import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicUrl } from "@/lib/request-host";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

// Pages de l'admin accessibles sans session.
const PUBLIC_ADMIN_PATHS = ["/admin/connexion", "/admin/auth/"];

/**
 * Sur /admin : rafraîchit la session Supabase (cookies) et renvoie vers la connexion sans session.
 * Vérification optimiste seulement : chaque page et chaque action appelle requireAdmin().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  if ((pathname !== "/admin" && !pathname.startsWith("/admin/")) || !isSupabaseConfigured()) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isPublic = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!data?.claims && !isPublic) {
    const redirect = NextResponse.redirect(publicUrl("/admin/connexion", request.headers, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}

export const config = {
  // Le proxy Hostinger perd le corps des réponses qui traversent le proxy Next.js.
  // Seul l'admin exige le rafraîchissement de session Supabase.
  matcher: ["/admin/:path*"],
};
