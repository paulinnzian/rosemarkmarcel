import { expect, expectNoHorizontalScroll, scrollPastFirstScreen, test } from "./support/test";

// Affichage sur téléphone : haut de page dégagé, ponctuation française, mise en page sans débordement.

const PAGES = ["/", "/a-propos", "/univers", "/communaute", "/collaborations", "/contact", "/confidentialite"];

test.describe("affichage mobile (390 px)", () => {
  test("le bouton de soutien épinglé laisse le haut de page dégagé et apparaît au défilement", async ({ page }) => {
    await page.goto("/collaborations");
    const support = page.getByRole("button", { name: /^Me soutenir/ });
    await expect(support).toBeHidden();
    await scrollPastFirstScreen(page);
    await expect(support).toBeVisible();
  });

  test("ponctuation française : « ! », « ? » et « » » restent collés au mot qui précède", async ({ page }) => {
    await page.goto("/");
    const donation = await page.locator("#soutenir").textContent();
    expect(donation).toContain("force\u00a0!");
    expect(donation).not.toMatch(/ [!?»]/);
    await page.goto("/collaborations");
    expect(await page.getByRole("main").textContent()).not.toMatch(/ [!?:;»]/);
  });

  test("bande de phrases : une phrase par ligne, sans séparateur en bout de ligne", async ({ page }) => {
    await page.goto("/");
    // Les séparateurs de la bande (en orange) ; les ✦ des titres décorés sont d'autres éléments.
    const separators = page.locator("span.text-highlight", { hasText: "✦" });
    await expect(separators.first()).toBeAttached();
    for (const separator of await separators.all()) await expect(separator).toBeHidden();
  });

  test("page 404 courte : le pied de page reste en bas de l’écran", async ({ page }) => {
    await page.goto("/cette-page-n-existe-pas");
    const footer = await page.getByRole("contentinfo").boundingBox();
    const viewport = page.viewportSize();
    if (!footer || !viewport) throw new Error("pied de page ou écran introuvable");
    expect(footer.y + footer.height).toBeGreaterThanOrEqual(viewport.height - 100);
  });

  for (const path of PAGES) {
    test(`${path} à 360 px : aucun débordement horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      await expectNoHorizontalScroll(page);
    });
  }
});

test.describe("bouton de soutien, mouvements réduits", () => {
  test.use({ reducedMotion: "reduce" });

  test("toujours visible, même en haut de page", async ({ page }) => {
    await page.goto("/collaborations");
    await expect(page.getByRole("button", { name: /^Me soutenir/ })).toBeVisible();
  });
});

test.describe("bouton de soutien sur ordinateur (1440 px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("visible dès le haut de page : l’écran est assez large pour ne rien cacher", async ({ page }) => {
    await page.goto("/collaborations");
    await expect(page.getByRole("button", { name: /^Me soutenir/ })).toBeVisible();
  });
});
