import { seedContent } from "../src/content";

import { expect, expectAccessible, expectNoHorizontalScroll, test } from "./support/test";

// Page /contact : un fan, un média ou une marque trouve d'abord comment joindre Marcel, WhatsApp en tête.

const texts = seedContent.pages.contact;
const phone = seedContent.contacts.find((channel) => channel.type === "phone");
const networks = seedContent.socials.filter((link) => link.visible);

test.describe("page Contact", () => {
  test("la page répond 200 avec un seul titre de niveau 1", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(texts.heading.lines[0]);
  });

  test("le menu signale la page Contact comme page courante", async ({ page }) => {
    await page.goto("/contact");
    const link = page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Contact", exact: true });
    await expect(link).toHaveAttribute("href", "/contact");
    await expect(link).toHaveAttribute("aria-current", "page");
  });

  test("WhatsApp s’ouvre avec le message de la page Contact encodé", async ({ page }) => {
    await page.goto("/contact");
    const links = page.locator('main a[href^="https://wa.me/"]');
    // Le bouton principal de l'en-tête, puis la ligne WhatsApp de la liste des moyens de contact.
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      const href = (await link.getAttribute("href")) ?? "";
      expect(href.startsWith("https://wa.me/")).toBe(true);
      expect(href).toContain(encodeURIComponent("depuis votre site"));
      expect(new URL(href).searchParams.get("text")).toBe(texts.whatsappMessage);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("data-track", "whatsapp");
    }
  });

  test("le téléphone est un lien d’appel, numéro affiché en clair", async ({ page }) => {
    expect(phone, "un téléphone dans le contenu initial").toBeDefined();
    await page.goto("/contact");
    const link = page.locator(`main a[href="tel:${phone?.value}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toContainText(phone?.display ?? "");
    await expect(link).toHaveAttribute("data-track", "phone");
  });

  test("un lien par réseau visible, en https et dans un nouvel onglet", async ({ page }) => {
    await page.goto("/contact");
    const region = page.getByRole("region", { name: texts.socialsHeading });
    await expect(region).toContainText(texts.socialsText);
    const links = region.getByRole("link");
    await expect(links).toHaveCount(networks.length);
    for (const network of networks) {
      const link = region.getByRole("link", { name: new RegExp(network.name) });
      await expect(link).toHaveAttribute("href", network.url);
      expect(network.url.startsWith("https://")).toBe(true);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("data-track", "social");
    }
  });

  test("les marques sont renvoyées vers la page Collaborations", async ({ page }) => {
    await page.goto("/contact");
    const region = page.getByRole("region", { name: texts.brandsHeading });
    const link = region.getByRole("link", { name: texts.brandsCta.label });
    await expect(link).toHaveAttribute("href", "/collaborations");
    await link.click();
    await expect(page).toHaveURL(/\/collaborations$/);
  });

  test("aperçu de partage, adresse canonique et fil d’Ariane", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveTitle(/Contact/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Contact · Rosemark Marcel");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/contact$/);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = scripts.map((script) => (JSON.parse(script) as { "@type"?: string })["@type"]);
    expect(types).toContain("BreadcrumbList");
  });

  test("à 390 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.goto("/contact");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("à 1440 px : pas de débordement, WhatsApp visible sans défiler, accessibilité", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");
    await expect(page.locator('main a[href^="https://wa.me/"]').first()).toBeInViewport();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });
});
