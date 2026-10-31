import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin/session";
import { lastDays, summarize, type StatRow } from "@/lib/admin/stats";
import { networkName } from "@/lib/networks";

import { DailyChart } from "./daily-chart";

export const metadata: Metadata = { title: "Statistiques" };

const PERIODS = [7, 30, 90] as const;
const number = new Intl.NumberFormat("fr-FR");
const regions = new Intl.DisplayNames("fr-FR", { type: "region" });
const DEVICES: Record<string, string> = { mobile: "Téléphone", tablet: "Tablette", desktop: "Ordinateur", inconnu: "Inconnu" };
const DONATION_BUTTONS: Record<string, string> = {
  hero: "Accueil (dons ouverts)",
  section: "Section Soutenir (dons ouverts)",
  floating: "Bouton épinglé (dons ouverts)",
  "hero-ferme": "Accueil (dons fermés)",
  "section-ferme": "Section Soutenir (dons fermés)",
  "floating-ferme": "Bouton épinglé (dons fermés)",
};

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

  const { data, error } = await supabase.from("click_daily_detail").select("day, kind, target, device, country, total").gte("day", days[0]);
  const stats = summarize((data ?? []) as StatRow[], days);
  const { totals } = stats;

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
        Sans cookie ni adresse IP : on compte les visites et les clics, pas les personnes. Vos propres visites, connecté, ne sont pas comptées.
      </p>

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
