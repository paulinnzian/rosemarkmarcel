import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Locator, type Page } from "@playwright/test";

/**
 * `page` surveillé : un test échoue sur toute erreur console, exception de page ou réponse 5xx,
 * même si ses propres vérifications passent.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      // Une page 404 voulue (la page elle-même) : le navigateur le signale en console, ce n'est pas un défaut.
      if (/status of 404/.test(message.text()) && message.location().url === page.url()) return;
      problems.push(`console : ${message.text()} (${message.location().url})`);
    });
    page.on("pageerror", (error) => problems.push(`exception : ${error.message}`));
    page.on("response", (response) => {
      if (response.status() >= 500) problems.push(`${response.status()} sur ${response.url()}`);
    });
    await provide(page);
    expect(problems, "erreurs console, exceptions ou réponses 5xx pendant le test").toEqual([]);
  },
});

export { expect };

/** Scan axe (WCAG 2.2 A et AA) de la page affichée. */
export async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((violation) => `${violation.id} : ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
}

/** Aucun défilement horizontal à la largeur courante. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "débordement horizontal en px").toBeLessThanOrEqual(0);
}

/**
 * Navigation principale prête à l'emploi : sur petit écran, ouvre d'abord le menu replié derrière le bouton « Menu ».
 * Sur ordinateur, les rubriques sont déjà en ligne.
 */
export async function mainNav(page: Page) {
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  const toggle = nav.getByRole("button", { name: "Menu" });
  if (await toggle.isVisible()) await openMenu(toggle);
  return nav;
}

/**
 * Ouvre le menu mobile. Un appui avant que React ait pris la main sur la page est perdu (le bouton n'a pas encore
 * de gestionnaire) : l'appui est répété jusqu'à ce que le bouton annonce le menu ouvert.
 */
export async function openMenu(toggle: Locator) {
  await expect(async () => {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
  }).toPass();
}

/**
 * Fait défiler la page sous le premier écran : sur petit écran, le bouton de soutien épinglé n'apparaît qu'après
 * les premiers pixels de défilement (reveal-after-scroll). Défilement instantané, sans l'effet doux du site.
 */
export async function scrollPastFirstScreen(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
}
