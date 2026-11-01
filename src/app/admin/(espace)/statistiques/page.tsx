import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin/session";
import { lastDays, summarize, type StatRow } from "@/lib/admin/stats";
import { networkName } from "@/lib/networks";
import { rankSources, sourceLabel, type RankedSource } from "@/lib/visit-source";

import { DailyChart } from "./daily-chart";

export const metadata: Metadata = { title: "Statistiques" };

const PERIODS = [7, 30, 90] as const;
const number = new Intl.NumberFormat("fr-FR");
const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });
const regions = new Intl.DisplayNames("fr-FR", { type: "region" });
const dayFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Abidjan" });
const momentFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Abidjan" });
const DEVICES: Record<string, string> = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur", inconnu: "Inconnu" };
const DONATION_BUTTONS: Record<string, string> = {
  hero: "Accueil (dons ouverts)",
  section: "Section Soutenir (dons ouverts)",
  floating: "Bouton épinglé (dons ouverts)",
  "hero-ferme": "Accueil (dons fermés)",
  "section-ferme": "Section Soutenir (dons fermés)",
  "floating-ferme": "Bouton épinglé (dons fermés)",
};

const PAGE_SIZE = 1000;

/**
 * Toutes les lignes d'une vue agrégée : l'API de Supabase en rend 1000 au plus par requête, et une période de 90
 * jours (jour × type × cible × appareil × pays) les dépasse vite. Sans pagination, les totaux seraient faux sans erreur.
 */
async function allRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) return { data: rows, error: null };
  }
}

function countryName(code: string): string {
  if (code === "inconnu") return "Inconnu";
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function StatistiquesPage({ searchParams }: PageProps<"/admin/statistiques">) {
  const { supabase } = await requireAdmin();
  const requested = Number((await searchParams).periode);
  const period = PERIODS.find((value) => value === requested) ?? 30;
  const days = lastDays(period, new Date());

  // Bornes du comptage : sans elles, « 0 » ne dit pas si personne n'est venu ou si rien n'est encore enregistré.
  const [{ data, error }, { data: first }, { data: last }, { data: sourceData, error: sourcesError }] = await Promise.all([
    allRows((from, to) =>
      supabase
        .from("click_daily_detail")
        .select("day, kind, target, device, country, total")
        .gte("day", days[0])
        .order("day")
        .order("kind")
        .order("target")
        .order("device")
        .order("country")
        .range(from, to),
    ),
    supabase.from("click_events").select("occurred_at").order("occurred_at", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("click_events").select("occurred_at").order("occurred_at", { ascending: false }).limit(1).maybeSingle(),
    // Même période que le reste de la page (les jours de lastDays, aujourd'hui compris).
    allRows((from, to) =>
      supabase
        .from("visit_sources")
        .select("source, campaign, total")
        .gte("day", days[0])
        .lte("day", days[days.length - 1])
        .order("day")
        .order("source")
        .order("campaign")
        .range(from, to),
    ),
  ]);
  const stats = summarize((data ?? []) as StatRow[], days);
  const { totals } = stats;
  const sources = rankSources(sourceData ?? []);

  const tiles = [
    { label: "Vues de la page", value: totals.views },
    { label: "Clics vers les réseaux", value: totals.social },
    { label: "Conversations WhatsApp", value: totals.whatsapp },
    { label: "Appels", value: totals.phone },
    { label: "Clics sur « soutenir »", value: totals.donation },
  ];

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Statistiques</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Sans cookie ni adresse IP : on compte les visites et les clics, pas les personnes. Ne sont pas comptés : les robots (moteurs de
        recherche, aperçus de liens), vos visites faites en étant connecté à l’admin, et les envois venus d’autres sites.
      </p>
      {!error && (
        <p className="mt-2 max-w-prose text-sm text-ink">
          {first && last ? (
            <>
              Comptage depuis le {dayFormat.format(new Date(first.occurred_at))}. Dernière activité enregistrée le{" "}
              {momentFormat.format(new Date(last.occurred_at))}.
            </>
          ) : (
            "Pas encore de données : le comptage commence à la première visite du site en ligne."
          )}
        </p>
      )}

      <nav aria-label="Période" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {PERIODS.map((value) => (
            <li key={value}>
              <Link
                href={`/admin/statistiques?periode=${value}`}
                aria-current={value === period ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-pill border border-line-input px-4 text-sm text-ink hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-surface"
              >
                {value} jours
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les statistiques pour le moment. Rechargez la page.
        </p>
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-lg bg-surface p-4">
                <dt className="text-xs text-muted">{tile.label}</dt>
                <dd className="mt-1 text-[28px] font-bold leading-none tracking-[-0.03em] tabular-nums">{number.format(tile.value)}</dd>
              </div>
            ))}
          </dl>

          <section aria-label="Vues par jour" className="mt-6 rounded-lg bg-surface p-6">
            {totals.views === 0 ? <p className="text-sm text-muted">Aucune visite enregistrée sur cette période.</p> : <DailyChart days={stats.days} />}
          </section>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Breakdown title="Clics par réseau" rows={stats.byNetwork} name={(key) => (key === "inconnu" ? "Inconnu" : networkName(key))} />
            <Breakdown title="Boutons de soutien" rows={stats.byDonationButton} name={(key) => DONATION_BUTTONS[key] ?? key} />
            <Breakdown title="Visites par appareil" rows={stats.byDevice} name={(key) => DEVICES[key] ?? key} />
            <Breakdown title="Visites par pays" rows={stats.byCountry} name={countryName} />
          </div>

          <VisitSources rows={sources.rows} failed={sourcesError !== null} />
        </>
      )}
    </>
  );
}

function Breakdown({ title, rows, name }: { title: string; rows: { key: string; total: number }[]; name: (key: string) => string }) {
  return (
    <section className="rounded-lg bg-surface p-6">
      <h2 className="text-label">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Rien sur cette période.</p>
      ) : (
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-line last:border-0">
                <th scope="row" className="py-2 font-normal">
                  {name(row.key)}
                </th>
                <td className="py-2 text-right font-bold tabular-nums">{number.format(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function VisitSources({ rows, failed }: { rows: RankedSource[]; failed: boolean }) {
  const withCampaign = rows.some((row) => row.campaign !== null);
  return (
    <section aria-labelledby="stats-provenance" className="mt-6 rounded-lg bg-surface p-6">
      <h2 id="stats-provenance" className="text-label">
        D’où viennent les visites
      </h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Le site d’origine réduit à son nom (Google, Facebook…), ou la campagne indiquée dans le lien (utm_source, utm_campaign). Jamais
        l’adresse exacte de la page d’origine.
      </p>
      {failed ? (
        <p role="alert" className="mt-3 text-sm font-bold text-danger">
          Impossible de lire la provenance des visites pour le moment. Rechargez la page.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Pas de visite sur cette période, donc pas de provenance à montrer.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="py-2 font-normal">
                  Source
                </th>
                {withCampaign && (
                  <th scope="col" className="py-2 pl-3 font-normal">
                    Campagne
                  </th>
                )}
                <th scope="col" className="py-2 pl-3 text-right font-normal">
                  Visites
                </th>
                <th scope="col" className="py-2 pl-3 text-right font-normal">
                  Part
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.source}|${row.campaign ?? ""}`} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 font-normal">
                    {sourceLabel(row.source)}
                  </th>
                  {withCampaign && (
                    <td className="py-2 pl-3 [overflow-wrap:anywhere]">
                      {row.campaign ?? (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">aucune</span>
                        </>
                      )}
                    </td>
                  )}
                  <td className="py-2 pl-3 text-right font-bold tabular-nums">{number.format(row.total)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{percent.format(row.share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
