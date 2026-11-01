import { expect, expectAccessible, expectNoHorizontalScroll, mainNav, test } from "./support/test";

// Page À propos : un fan curieux découvre qui est Marcel, puis rejoint la communauté.

test.describe("Page À propos", () => {
  test("la page répond et présente Marcel, à 390 px", async ({ page }) => {
    const response = await page.goto("/a-propos");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/^À propos/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Rosemark Marcel");
    await expect(page.getByRole("main").getByRole("img", { name: /Rosemark Marcel/ })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("le lien « À propos » du menu signale la page active", async ({ page }) => {
    await page.goto("/a-propos");
    await expect((await mainNav(page)).getByRole("link", { name: "À propos" })).toHaveAttribute("aria-current", "page");
  });

  test("le bouton de conclusion mène à la communauté", async ({ page }) => {
    await page.goto("/a-propos");
    const cta = page.getByRole("main").getByRole("link", { name: "Rejoindre la communauté" });
    await expect(cta).toHaveAttribute("href", "/communaute");
    await cta.click();
    await expect(page).toHaveURL(/\/communaute$/);
  });

  test("depuis l’accueil, « En savoir plus » mène à la page À propos", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("#a-propos")
      .getByRole("link", { name: /^En savoir plus/ })
      .click();
    await expect(page).toHaveURL(/\/a-propos$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Rosemark Marcel");
  });

  test("à 1440 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/a-propos");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });
});
