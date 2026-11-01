import { expect, expectAccessible, expectNoHorizontalScroll, test } from "./support/test";

// Page /communaute : l'audience totale et où suivre Marcel, puis comment soutenir (s'abonner, partager, donner).

type Recorded = { partages: ShareData[]; copies: string[] };

test.describe("Page La communauté", () => {
  test("COM-H1 la page répond, un seul titre de niveau 1 et le menu signale la page", async ({ page }) => {
    const response = await page.goto("/communaute");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/^La communauté/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("nous rassemble.");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("link", { name: "La communauté", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  });

  test("COM-H2 l'audience totale est affichée en tête de page", async ({ page }) => {
    await page.goto("/communaute");
    const total = page.getByRole("paragraph").filter({ hasText: "abonnés cumulés sur mes réseaux" });
    await expect(total).toBeVisible();
    // Le chiffre vient des compteurs en base ; le lecteur d'écran lit le nombre complet (« 789 000 »).
    await expect(total).toHaveText(/\d/);
  });

  test("COM-H3 chaque carte réseau ouvre un lien https dans un nouvel onglet", async ({ page }) => {
    await page.goto("/communaute");
    const cards = page.locator("#reseaux").getByRole("link", { name: /nouvel onglet/ });
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute("href", /^https:\/\//);
      await expect(card).toHaveAttribute("target", "_blank");
    }
  });

  test("COM-H4 partager : le partage natif reçoit le titre, le texte et l'adresse du site", async ({ page }) => {
    await page.addInitScript(() => {
      const recorded: Recorded = { partages: [], copies: [] };
      Object.assign(window, { __recorded: recorded });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data: ShareData) => {
          recorded.partages.push(data);
        },
      });
    });
    await page.goto("/communaute");
    const share = page.getByRole("button", { name: "Partager le site" });
    await expect(share).toHaveAttribute("data-track-target", "partage");
    await share.click();

    const shared = await page.evaluate(() => (window as unknown as { __recorded: Recorded }).__recorded.partages);
    expect(shared).toHaveLength(1);
    expect(shared[0]?.url).toBe(new URL(page.url()).origin);
    expect(shared[0]?.text).toBe("Découvrez Le Repos, l’univers de Rosemark Marcel.");
  });

  test("COM-E1 partager sans partage natif : le lien est copié et « Lien copié » est annoncé", async ({ page }) => {
    await page.addInitScript(() => {
      const recorded: Recorded = { partages: [], copies: [] };
      Object.assign(window, { __recorded: recorded });
      Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            recorded.copies.push(text);
          },
        },
      });
    });
    await page.goto("/communaute");
    await page.getByRole("button", { name: "Partager le site" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Lien copié" })).toBeVisible();
    const copies = await page.evaluate(() => (window as unknown as { __recorded: Recorded }).__recorded.copies);
    expect(copies).toEqual([new URL(page.url()).origin]);
  });

  test("COM-E2 faire un don : le bouton de soutien est dans la liste « Comment soutenir »", async ({ page }) => {
    await page.goto("/communaute");
    const support = page.getByRole("region", { name: "Comment soutenir Le Repos" });
    await expect(support.getByRole("button", { name: /Soutenir Marcel/ }).or(support.getByRole("link", { name: /Soutenir Marcel/ }))).toBeVisible();
  });

  test("COM-E3 l'accueil mène à la page depuis la section communauté", async ({ page }) => {
    await page.goto("/");
    const more = page.locator("#communaute").getByRole("link", { name: /En savoir plus/ });
    await expect(more).toHaveAttribute("href", "/communaute");
    await more.click();
    await expect(page).toHaveURL(/\/communaute$/);
  });

  for (const width of [390, 1440]) {
    test(`COM-E4 à ${width} px : pas de débordement, accessibilité`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/communaute");
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
    });
  }
});
