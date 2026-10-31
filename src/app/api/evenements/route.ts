import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { countryOf, sameOrigin } from "@/lib/request-host";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service-client";

// Statistiques sans cookie, sans IP stockée, sans identifiant de visiteur : un événement = type, cible, page,
// pays (en-tête du réseau, s'il existe) et type d'appareil. L'IP ne sert qu'à limiter le débit, en mémoire.

const eventSchema = z.object({
  kind: z.enum(["page_view", "social", "whatsapp", "phone", "donation", "cta"]),
  target: z
    .string()
    .regex(/^[a-z0-9_-]{1,40}$/)
    .optional(),
  path: z.string().regex(/^\/[^\s]{0,199}$/),
});

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|curl|wget|python|node-fetch/i;
const MAX_BODY = 1024;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

// Limite par instance de serveur : suffisante contre une boucle ou un script naïf, pas contre une attaque répartie.
const recent = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string, now: number): boolean {
  if (recent.size > 5_000) for (const [entry, value] of recent) if (value.resetAt < now) recent.delete(entry);
  const entry = recent.get(key);
  if (!entry || entry.resetAt < now) {
    recent.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function deviceOf(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|kindle|silk/i.test(userAgent) || (/android/i.test(userAgent) && !/mobile/i.test(userAgent))) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  if (!isServiceConfigured()) return noContent();

  // Envoi depuis une autre origine : refusé (le site seul compte ses visites).
  if (!sameOrigin(request.headers)) return new NextResponse(null, { status: 403 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (userAgent === "" || BOTS.test(userAgent)) return noContent();
  // Admin connecté (cookie de session Supabase) : ses propres visites ne gonflent pas les chiffres.
  if (request.cookies.getAll().some((cookie) => /^sb-.+-auth-token/.test(cookie.name))) return noContent();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
  if (rateLimited(ip, Date.now())) return new NextResponse(null, { status: 429 });

  const body = await request.text();
  if (body.length > MAX_BODY) return new NextResponse(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const { error } = await createServiceClient()
    .from("click_events")
    .insert({
      kind: parsed.data.kind,
      target: parsed.data.target ?? null,
      path: parsed.data.path,
      country: countryOf(request.headers),
      device: deviceOf(userAgent),
    });
  if (error) {
    console.error("Événement non enregistré :", error.message);
    return new NextResponse(null, { status: 503 });
  }
  return noContent();
}
