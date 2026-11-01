import { expect, expectAccessible, expectNoHorizontalScroll, openMenu, test } from "./support/test";

// Menu principal : replié derrière un bouton « Menu » sur petit écran, en ligne sur ordinateur.

test.describe("menu mobile (390 px)", () => {
  // Sans animation d'ouverture : les vérifications (contraste compris) lisent le panneau dans son état final.
  test.use({ reducedMotion: "reduce" });

  test("replié par défaut, il s’ouvre sur les rubriques et marque la page courante", async ({ page }) => {
    await page.goto("/univers");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link")).toHaveCount(0);

    await openMenu(toggle);
    await expect(nav.getByRole("link")).toHaveText(["À propos", "Mon univers", "La communauté", "Collaborations", "Contact"]);
    await expect(nav.getByRole("link", { name: "Mon univers" })).toHaveAttribute("aria-current", "page");
    // Le panneau contrôlé par le bouton est bien celui qui contient les rubriques.
    const panelId = await toggle.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`).getByRole("link")).toHaveCount(5);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("Échap referme le menu et rend le focus au bouton", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await openMenu(toggle);
    await nav.getByRole("link", { name: "À propos" }).focus();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(nav.getByRole("link")).toHaveCount(0);
  });

  test("choisir une rubrique ouvre la page et referme le menu", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await openMenu(toggle);
    await nav.getByRole("link", { name: "Collaborations" }).click();
    await expect(page).toHaveURL(/\/collaborations$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Votre marque,");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("un retour arrière puis avant ne rouvre pas le menu", async ({ page }) => {
    await page.goto("/univers");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await openMenu(toggle);
    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/univers$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await page.goForward();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("le focus qui quitte le menu au clavier le referme", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await openMenu(toggle);
    await nav.getByRole("link", { name: "Contact" }).focus();
    await page.keyboard.press("Tab");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("l’en-tête tient sur une ligne : logo et bouton côte à côte, moins de 100 px de haut", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    const header = page.getByRole("banner");
    expect((await header.boundingBox())?.height ?? 0).toBeLessThan(100);
    const logo = await header.getByRole("link").first().boundingBox();
    const toggle = await header.getByRole("navigation", { name: "Navigation principale" }).getByRole("button", { name: "Menu" }).boundingBox();
    if (!logo || !toggle) throw new Error("logo ou bouton Menu introuvable");
    // Même rangée : le centre du bouton tombe dans la hauteur du logo, et le bouton est à sa droite.
    expect(toggle.y + toggle.height / 2).toBeGreaterThan(logo.y);
    expect(toggle.y + toggle.height / 2).toBeLessThan(logo.y + logo.height);
    expect(toggle.x).toBeGreaterThanOrEqual(logo.x + logo.width);
    expect(toggle.width).toBeGreaterThanOrEqual(44);
    expect(toggle.height).toBeGreaterThanOrEqual(44);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("menu mobile au toucher", () => {
  test.use({ hasTouch: true, isMobile: true, reducedMotion: "reduce" });

  test("toucher la page assombrie referme le menu sans rien ouvrir dessous", async ({ page }) => {
    await page.goto("/contact");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    const toggle = nav.getByRole("button", { name: "Menu" });
    await openMenu(toggle);
    // Le bouton de soutien est sous le voile : le toucher referme le menu, sans ouvrir la fenêtre de don.
    const support = await page.getByRole("button", { name: /Me soutenir/ }).boundingBox();
    if (!support) throw new Error("bouton de soutien introuvable");
    await page.touchscreen.tap(support.x + support.width / 2, support.y + support.height / 2);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/contact$/);
  });
});

test.describe("menu ordinateur (1440 px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("les rubriques sont en ligne, sans bouton Menu", async ({ page }) => {
    await page.goto("/communaute");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("button")).toHaveCount(0);
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: "La communauté" })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("les rubriques restent atteignables en clair, sans bouton Menu inutilisable", async ({ page }) => {
    await page.goto("/a-propos");
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav.getByRole("button", { name: "Menu" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
