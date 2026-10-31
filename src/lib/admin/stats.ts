// Agrégation des statistiques (vue click_daily_detail) pour le tableau de bord et /admin/statistiques.
// Fonctions pures : testées sans base.

export type StatRow = { day: string; kind: string; target: string | null; device: string | null; country: string | null; total: number };

export type StatsSummary = {
  days: { day: string; views: number }[];
  totals: { views: number; social: number; whatsapp: number; phone: number; donation: number; cta: number };
  byNetwork: { key: string; total: number }[];
  byDevice: { key: string; total: number }[];
  byCountry: { key: string; total: number }[];
  byDonationButton: { key: string; total: number }[];
};

/** Les `count` derniers jours (date du jour comprise), au format AAAA-MM-JJ. Abidjan = UTC, toute l'année. */
export function lastDays(count: number, today: Date): string[] {
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Array.from({ length: count }, (_, index) => new Date(end - (count - 1 - index) * 86_400_000).toISOString().slice(0, 10));
}

function ranked(counts: Map<string, number>): { key: string; total: number }[] {
  return [...counts].map(([key, total]) => ({ key, total })).sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
}

function add(counts: Map<string, number>, key: string, total: number) {
  counts.set(key, (counts.get(key) ?? 0) + total);
}

export function summarize(rows: StatRow[], days: string[]): StatsSummary {
  const inRange = new Set(days);
  const views = new Map<string, number>();
  const totals = { views: 0, social: 0, whatsapp: 0, phone: 0, donation: 0, cta: 0 };
  const byNetwork = new Map<string, number>();
  const byDevice = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const byDonationButton = new Map<string, number>();

  for (const row of rows) {
    if (!inRange.has(row.day)) continue;
    switch (row.kind) {
      case "page_view":
        totals.views += row.total;
        add(views, row.day, row.total);
        // Appareil et pays : comptés sur les vues, pour décrire les visiteurs et non leurs clics.
        add(byDevice, row.device ?? "inconnu", row.total);
        add(byCountry, row.country ?? "inconnu", row.total);
        break;
      case "social":
        totals.social += row.total;
        add(byNetwork, row.target ?? "inconnu", row.total);
        break;
      case "donation":
        totals.donation += row.total;
        add(byDonationButton, row.target ?? "inconnu", row.total);
        break;
      case "whatsapp":
      case "phone":
      case "cta":
        totals[row.kind] += row.total;
        break;
    }
  }

  return {
    days: days.map((day) => ({ day, views: views.get(day) ?? 0 })),
    totals,
    byNetwork: ranked(byNetwork),
    byDevice: ranked(byDevice),
    byCountry: ranked(byCountry),
    byDonationButton: ranked(byDonationButton),
  };
}
