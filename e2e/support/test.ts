import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page } from "@playwright/test";

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
