import type { Page } from "@playwright/test";

import { OWNER_STATE } from "./support/env";
import { expect, expectAccessible, expectNoHorizontalScroll, test } from "./support/test";

// Page /collaborations : une marque voit l'audience par réseau et écrit sur WhatsApp.

const MESSAGE = "Bonjour Marcel, je souhaite vous proposer une collaboration pour ma marque.";

test.describe("page Collaborations", () => {
  test("la page répond 200 avec un seul titre de niveau 1", async ({ page }) => {
    const response = await page.goto("/collaborations");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Votre marque,");
  });

  test("le menu signale la page Collaborations comme page courante", async ({ page }) => {
    await page.goto("/collaborations");
    const link = page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Collaborations" });
    await expect(link).toHaveAttribute("aria-current", "page");
  });

  test("l’audience affiche au moins un nombre d’abonnés par réseau", async ({ page }) => {
    await page.goto("/collaborations");
    const table = page.getByRole("table", { name: "Mon audience" });
    await expect(table.getByRole("columnheader", { name: "Abonnés" })).toBeVisible();
    await expect(table.getByRole("rowheader", { name: /Facebook/ })).toBeVisible();
    await expect(table.getByRole("cell", { name: /^\d[\d\s]*$/ }).first()).toBeVisible();
  });

  test("les étapes forment une liste ordonnée de trois éléments", async ({ page }) => {
    await page.goto("/collaborations");
    const steps = page.getByRole("region", { name: "Comment ça se passe" }).locator("ol > li");
    await expect(steps).toHaveCount(3);
    await expect(steps.first()).toContainText("Vous m’écrivez");
  });

  test("WhatsApp s’ouvre avec le message de collaboration encodé, en tête et en fin de page", async ({ page }) => {
    await page.goto("/collaborations");
    const links = page.getByRole("link", { name: /Discuter sur WhatsApp/ });
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      const href = (await link.getAttribute("href")) ?? "";
      expect(href.startsWith("https://wa.me/")).toBe(true);
      expect(href).toContain(`text=${encodeURIComponent(MESSAGE)}`);
      expect(new URL(href).searchParams.get("text")).toBe(MESSAGE);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("data-track", "whatsapp");
    }
  });

  test("le téléphone est un lien d’appel, affiché en clair", async ({ page }) => {
    await page.goto("/collaborations");
    const phone = page.getByRole("link", { name: /^Appeler Marcel, \+225 07 06 40 06 90$/ });
    await expect(phone).toHaveAttribute("href", "tel:+2250706400690");
    await expect(phone).toHaveAttribute("data-track", "phone");
    await expect(phone).toHaveText("+225 07 06 40 06 90");
  });

  test("l’accueil mène à la page Collaborations depuis la section contact", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("#contact").getByRole("link", { name: "Voir les collaborations" });
    await expect(link).toHaveAttribute("href", "/collaborations");
    await link.click();
    await expect(page).toHaveURL(/\/collaborations$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Votre marque,");
  });

  test("à 390 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.goto("/collaborations");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("à 1440 px : pas de débordement, WhatsApp visible sans défiler, accessibilité", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/collaborations");
    await expect(page.getByRole("link", { name: /Discuter sur WhatsApp/ }).first()).toBeInViewport();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });
});

test.describe("page Collaborations, contacts masqués", () => {
  test.use({ storageState: OWNER_STATE });

  /** Coche ou décoche « Afficher sur le site » d'un canal dans l'admin, puis enregistre. */
  async function showChannel(page: Page, name: "WhatsApp" | "Téléphone", visible: boolean) {
    const region = page.getByRole("region", { name });
    const toggle = region.getByRole("switch", { name: "Afficher sur le site" });
    if ((await toggle.isChecked()) !== visible) await region.getByText("Afficher sur le site").click();
    await expect(toggle).toBeChecked({ checked: visible });
    await region.getByRole("button", { name: "Enregistrer" }).click();
    await expect(region.getByRole("status")).toHaveText(/Enregistré/);
  }

  test("WhatsApp et téléphone masqués : la bande finale renvoie vers la page Contact", async ({ page }) => {
    await page.goto("/admin/contact");
    await showChannel(page, "WhatsApp", false);
    await showChannel(page, "Téléphone", false);

    try {
      await page.goto("/collaborations");
      const band = page.getByRole("region", { name: "Parlons de votre projet" });
      await expect(band.getByRole("link", { name: /WhatsApp/ })).toHaveCount(0);
      const fallback = band.getByRole("link", { name: "Voir comment me joindre" });
      await expect(fallback).toHaveAttribute("href", "/contact");
      await expectAccessible(page);
    } finally {
      await page.goto("/admin/contact");
      await showChannel(page, "WhatsApp", true);
      await showChannel(page, "Téléphone", true);
    }
  });
});
