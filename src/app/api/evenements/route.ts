import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { countryOf, sameOrigin } from "@/lib/request-host";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service-client";

// Statistiques sans cookie, sans IP stockée, sans identifiant de visiteur : un événement = type, cible, page,
// pays (en-tête du réseau, s'il existe) et type d'appareil. L'IP ne sert qu'à limiter le débit, en mémoire.
// Une vue de page peut aussi porter sa provenance (nom court du site d'origine ou utm_source) et sa campagne
// (utm_campaign), calculées dans le navigateur : jamais l'adresse de la page d'origine.

const eventSchema = z.object({
  kind: z.enum(["page_view", "social", "whatsapp", "phone", "donation", "cta"]),
  target: z
    .string()
    .regex(/^[a-z0-9_-]{1,40}$/)
    .optional(),
  path: z.string().regex(/^\/[^\s]{0,199}$/),
  // Provenance : lue à part (plus bas), une valeur invalide est ignorée sans perdre la visite.
  source: z.unknown().optional(),
  campaign: z.unknown().optional(),
});

/** Un nom court (google, pub-rentree…), jamais un texte libre : ni adresse e-mail, ni nom de personne lisible. */
const NAME = /^[a-z0-9_-]+$/;

function nameOrNull(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max && NAME.test(value) ? value : null;
}

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|curl|wget|python|node-fetch/i;
const MAX_BODY = 1024;
const WINDOW_MS = 60_000;
// Large : les opérateurs mobiles partagent une même adresse IP entre de nombreux abonnés (CGNAT) ; une limite
// serrée ferait perdre les visites réelles de tout un quartier.
const MAX_PER_WINDOW = 300;

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

  // cf-connecting-ip est posé par Cloudflare et ne peut pas être choisi par le visiteur, contrairement au début
  // de x-forwarded-for.
  const ip =
    request.headers.get("cf-connecting-ip")?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
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

  // Provenance : sur la vue de la page d'arrivée seulement, ignorée sur un clic. Colonnes omises quand elles sont
  // vides : un clic s'enregistre même si la migration de la provenance n'est pas encore passée.
  const isView = parsed.data.kind === "page_view";
  const source = isView ? nameOrNull(parsed.data.source, 40) : null;
  const campaign = isView && source ? nameOrNull(parsed.data.campaign, 60) : null;
  const { error } = await createServiceClient()
    .from("click_events")
    .insert({
      kind: parsed.data.kind,
      target: parsed.data.target ?? null,
      path: parsed.data.path,
      country: countryOf(request.headers),
      device: deviceOf(userAgent),
      ...(source && { source }),
      ...(campaign && { campaign }),
    });
  if (error) {
    console.error("Événement non enregistré :", error.message);
    return new NextResponse(null, { status: 503 });
  }
  return noContent();
}
