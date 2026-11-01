import type { Page } from "@playwright/test";

import { OWNER_STATE, serviceClient } from "./support/env";
import { expect, expectAccessible, mainNav, test } from "./support/test";

// Provenance des visites (référencement, réseaux, campagnes) sans traqueur tiers : la vue de la page d'arrivée
// porte un nom court de source et la campagne du lien, jamais l'adresse de la page d'origine.

/** Vues de page envoyées par le navigateur, dans l'ordre. */
function pageViews(page: Page): Record<string, unknown>[] {
  const views: Record<string, unknown>[] = [];
  page.on("request", (request) => {
    if (request.method() !== "POST" || new URL(request.url()).pathname !== "/api/evenements") return;
    const body = JSON.parse(request.postData() ?? "{}") as Record<string, unknown>;
    if (body.kind === "page_view") views.push(body);
  });
  return views;
}

test.describe("Provenance des visites (visiteur)", () => {
  test.beforeEach(async ({ page }) => {
    await serviceClient().from("click_events").delete().gte("id", 0);
    // Le corps d'un sendBeacon n'est pas toujours lisible côté Playwright : l'envoi passe par le fetch de secours.
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "sendBeacon", { value: () => false, configurable: true });
    });
  });

  test("lien de campagne : la page d'arrivée porte source et campagne, la navigation suivante n'en porte pas", async ({ page }) => {
    const views = pageViews(page);
    const landing = page.waitForRequest((request) => request.method() === "POST" && new URL(request.url()).pathname === "/api/evenements");
    // utm_source l'emporte sur le site d'origine.
    await page.goto("/?utm_source=Facebook&utm_campaign=lancement", { referer: "https://www.google.com/search?q=marcel" });
    expect(JSON.parse((await landing).postData() ?? "{}")).toEqual({
      kind: "page_view",
      path: "/",
      source: "facebook",
      campaign: "lancement",
    });

    await (await mainNav(page)).getByRole("link", { name: "À propos" }).click();
    await expect(page).toHaveURL(/\/a-propos$/);
    await expect.poll(() => views.length).toBe(2);
    expect(views[1]).toEqual({ kind: "page_view", path: "/a-propos" });

    await expect
      .poll(async () => (await serviceClient().from("click_events").select("kind, path, source, campaign").order("id")).data)
      .toEqual([
        { kind: "page_view", path: "/", source: "facebook", campaign: "lancement" },
        { kind: "page_view", path: "/a-propos", source: null, campaign: null },
      ]);
  });

  test("arrivée depuis un moteur : seul son nom part, jamais l'adresse de la page d'origine", async ({ page }) => {
    const views = pageViews(page);
    await page.goto("/", { referer: "https://www.google.com/search?q=marcel" });
    await expect.poll(() => views.length).toBe(1);
    expect(views[0]).toEqual({ kind: "page_view", path: "/", source: "google" });
    expect(JSON.stringify(views)).not.toMatch(/search|q=marcel|www\.google/);
  });
});

test.describe("Provenance des visites (administration)", () => {
  test.use({ storageState: OWNER_STATE });

  test("statistiques : tableau « D’où viennent les visites », trié, avec campagne et part", async ({ page }) => {
    const db = serviceClient();
    await db.from("click_events").delete().gte("id", 0);
    await page.goto("/admin/statistiques?periode=7");
    const section = page.getByRole("region", { name: "D’où viennent les visites" });
    await expect(section.getByText(/^Pas de visite sur cette période/)).toBeVisible();

    const view = (source: string | null, campaign: string | null = null) => ({ kind: "page_view", path: "/", source, campaign });
    const { error } = await db.from("click_events").insert([
      view("facebook", "lancement"),
      view("facebook", "lancement"),
      view("facebook", "lancement"),
      view("google"),
      view("direct"),
      view("direct"),
      // Une page vue après l'arrivée (navigation sur le site) n'a pas de provenance : ni visite ni accès direct.
      view(null),
      // Un clic ne compte pas comme une visite.
      { kind: "social", target: "facebook", path: "/" },
    ]);
    expect(error).toBeNull();

    await page.reload();
    const rows = section.getByRole("table").getByRole("row");
    await expect(rows).toHaveCount(4); // en-tête + 3 lignes
    await expect(rows.nth(1)).toContainText("Facebook");
    await expect(rows.nth(1)).toContainText("lancement");
    await expect(rows.nth(1)).toContainText(/3\s*50\s%/);
    await expect(rows.nth(2)).toContainText("Accès direct");
    await expect(rows.nth(2)).toContainText(/2\s*33\s%/);
    await expect(rows.nth(3)).toContainText("Google");
    await expect(section.getByRole("columnheader")).toHaveText(["Source", "Campagne", "Visites", "Part"]);
    await expectAccessible(page);
  });
});
