import { timingSafeEqual } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { runLinkChecks } from "@/lib/links/run";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service-client";

/** Comparaison en temps constant : la durée de la réponse ne dit rien du secret. */
function authorized(request: NextRequest, secret: string): boolean {
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Vérification quotidienne des liens, appelée par une tâche planifiée de l'hébergeur (Hostinger : hPanel > Cron Jobs)
 * avec l'en-tête Authorization: Bearer CRON_SECRET. Commande dans le README, section « Mise en ligne sur Hostinger ».
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !isServiceConfigured()) return NextResponse.json({ error: "Tâche désactivée sur ce serveur." }, { status: 503 });
  if (!authorized(request, secret)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const results = await runLinkChecks(createServiceClient());
  if (!results) return NextResponse.json({ error: "Base injoignable." }, { status: 503 });
  return NextResponse.json({ checked: results.length, problems: results.filter((result) => result.status !== "ok").length });
}
