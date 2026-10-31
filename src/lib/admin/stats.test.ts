import { describe, expect, it } from "vitest";

import { lastDays, summarize, type StatRow } from "./stats";

describe("lastDays", () => {
  it("compte la date du jour et passe la fin de mois", () => {
    expect(lastDays(3, new Date("2026-11-01T23:30:00Z"))).toEqual(["2026-10-30", "2026-10-31", "2026-11-01"]);
  });

  it("année bissextile : 29 février compris", () => {
    expect(lastDays(2, new Date("2028-03-01T00:00:00Z"))).toEqual(["2028-02-29", "2028-03-01"]);
  });
});

describe("summarize", () => {
  const row = (day: string, kind: string, total: number, extra: Partial<StatRow> = {}): StatRow => ({
    day,
    kind,
    target: null,
    device: null,
    country: null,
    total,
    ...extra,
  });

  it("totaux par type, vues par jour (jours vides à 0), hors période ignoré", () => {
    const days = ["2026-10-30", "2026-10-31"];
    const stats = summarize(
      [
        row("2026-10-30", "page_view", 3, { device: "mobile", country: "CI" }),
        row("2026-10-31", "page_view", 1, { device: "desktop", country: "FR" }),
        row("2026-10-31", "social", 2, { target: "tiktok" }),
        row("2026-10-31", "social", 5, { target: "facebook" }),
        row("2026-10-31", "donation", 1, { target: "floating-ferme" }),
        row("2026-10-29", "page_view", 99),
      ],
      days,
    );
    expect(stats.days).toEqual([
      { day: "2026-10-30", views: 3 },
      { day: "2026-10-31", views: 1 },
    ]);
    expect(stats.totals).toEqual({ views: 4, social: 7, whatsapp: 0, phone: 0, donation: 1, cta: 0 });
    expect(stats.byNetwork).toEqual([
      { key: "facebook", total: 5 },
      { key: "tiktok", total: 2 },
    ]);
    expect(stats.byDevice).toEqual([
      { key: "mobile", total: 3 },
      { key: "desktop", total: 1 },
    ]);
    expect(stats.byCountry[0]).toEqual({ key: "CI", total: 3 });
    expect(stats.byDonationButton).toEqual([{ key: "floating-ferme", total: 1 }]);
  });

  it("aucune donnée : tout à zéro, listes vides", () => {
    const stats = summarize([], ["2026-10-31"]);
    expect(stats.totals.views).toBe(0);
    expect(stats.days).toEqual([{ day: "2026-10-31", views: 0 }]);
    expect(stats.byNetwork).toEqual([]);
  });
});
