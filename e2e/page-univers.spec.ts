import type { Page } from "@playwright/test";

import { expect, expectAccessible, expectNoHorizontalScroll, mainNav, test } from "./support/test";

// Page Mon univers : un fan regarde un épisode du Repos sans quitter le site. Le flux YouTube est le vrai :
// une liste vide est acceptée (message et lien vers la chaîne). La lecture n'est jamais lancée : le lecteur
// tiers écrit en console, ce que le `page` surveillé compte comme une erreur.

const YOUTUBE_HOST = /(^|\.)(youtube(-nocookie)?\.com|ytimg\.com|googlevideo\.com)$/;

function episodesOrEmpty(page: Page) {
  const play = page.getByRole("button", { name: /^Lire «\s.+\s»$/ });
  const empty = page.getByText(/Les épisodes ne s’affichent pas/);
  return { play, empty };
}

test.describe("Page Mon univers", () => {
  test("répond 200, un seul titre de niveau 1, le menu signale la page", async ({ page }) => {
    const response = await page.goto("/univers");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect((await mainNav(page)).getByRole("link", { name: "Mon univers" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("les épisodes se lisent sur place, ou un message renvoie vers la chaîne", async ({ page }) => {
    await page.goto("/univers");
    const { play, empty } = episodesOrEmpty(page);
    await expect(play.first().or(empty)).toBeVisible();

    if ((await play.count()) > 0) {
      await expect(play.first()).toHaveAttribute("data-track", "cta");
      await expect(play.first()).toHaveAttribute("data-track-target", "episode");
      const box = await play.first().boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    const channel = page.getByRole("main").getByRole("link", { name: /YouTube.*nouvel onglet/ });
    await expect(channel).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\/channel\/UC[\w-]{22}$/);
    await expect(channel).toHaveAttribute("target", "_blank");
  });

  test("rien ne vient de YouTube avant le clic : ni lecteur, ni requête du navigateur", async ({ page }) => {
    const youtube: string[] = [];
    page.on("request", (request) => {
      if (YOUTUBE_HOST.test(new URL(request.url()).hostname)) youtube.push(request.url());
    });
    await page.goto("/univers");
    // Fait défiler jusqu'en bas : les miniatures chargées à la demande sont alors demandées.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForLoadState("load");

    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(0);
    expect(youtube, "requêtes vers YouTube avant tout clic").toEqual([]);
  });

  test("l’accueil mène à la page depuis la section univers", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("#univers").getByRole("link", { name: "Voir les épisodes" });
    await expect(link).toHaveAttribute("href", "/univers");
    await link.click();
    await expect(page).toHaveURL(/\/univers$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("à 390 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.goto("/univers");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("à 1440 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/univers");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("au clic, la miniature devient le lecteur youtube-nocookie et reçoit le focus", async ({ page }) => {
    // Lecteur remplacé par une page vide : on vérifie l'échange sans dépendre de YouTube ni de ses messages console.
    await page.route("https://www.youtube-nocookie.com/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>lecteur</title>" }));
    await page.goto("/univers");
    const { play } = episodesOrEmpty(page);
    test.skip((await play.count()) === 0, "flux YouTube vide au moment de la construction");

    await play.first().click();
    const player = page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]');
    await expect(player).toHaveCount(1);
    await expect(player).toHaveAttribute("src", /autoplay=1&playsinline=1$/);
    await expect(player).toBeFocused();
  });

  test("le lien partagé annonce la page, pas l’accueil", async ({ page }) => {
    await page.goto("/univers");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Mon univers : les épisodes du Repos · Rosemark Marcel");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/opengraph-image$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content")) ?? "");
    const response = await page.request.get(image.pathname);
    expect(response.headers()["content-type"]).toBe("image/png");
  });
});
