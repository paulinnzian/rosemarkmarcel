import { expect, expectAccessible, expectNoHorizontalScroll, scrollPastFirstScreen, test } from "./support/test";

// Parcours visiteur sur la page publique : F01 suivre sur un réseau, F02 contacter, F03 soutenir (dons fermés).

test.describe("F01 un visiteur découvre le créateur et le suit sur un réseau", () => {
  test("F01-H1 du héros à une carte réseau, à 390 px", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Un peu de rire.");
    await page.getByRole("link", { name: /Entrez dans l’univers/ }).click();
    await expect(page).toHaveURL(/#communaute$/);

    const facebook = page.getByRole("link", { name: /^Facebook \d.* abonnés/ });
    await expect(facebook).toHaveAttribute("target", "_blank");
    await expect(facebook).toHaveAttribute("href", /^https:\/\//);
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("F01-E1 toutes les cartes réseau ouvrent un lien https dans un nouvel onglet", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("#communaute").getByRole("link", { name: /nouvel onglet/ });
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute("href", /^https:\/\//);
      await expect(card).toHaveAttribute("target", "_blank");
    }
  });

  test("F01-E2 réseau sans compteur : le texte de remplacement est annoncé", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^YouTube Mes vidéos/ })).toBeVisible();
  });

  test("F01-E3 à 1440 px : pas de débordement, accessibilité", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });

  test("F01-E4 clavier : la première tabulation propose d’aller au contenu", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
  });

  test("F01-N1 page inconnue : 404 avec l’habillage du site", async ({ page }) => {
    const response = await page.goto("/cette-page-n-existe-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cette page s’est mise au repos.");
    await expect(page.getByRole("button", { name: /Me soutenir/ }).or(page.getByRole("link", { name: /Me soutenir/ }))).toBeVisible();
    await expectAccessible(page);
  });

  test("F01-E5 pied de page : la page Confidentialité dit ce qui est compté ; la section Soutenir dit qui prend des frais", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#soutenir")).toContainText("Le site ne prend rien sur votre don");
    await page.getByRole("contentinfo").getByRole("link", { name: "Confidentialité" }).click();
    await expect(page).toHaveURL(/\/confidentialite$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confidentialité");
    await expect(page.getByText(/ne dépose aucun cookie/)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAccessible(page);
  });
});

test("F01-E6 partage du lien : aperçu 1200 × 630 avec titre et description", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Rosemark Marcel — Le Repos");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /web humoriste/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const image = new URL((await page.locator('meta[property="og:image"]').getAttribute("content")) ?? "");
  const response = await request.get(image.pathname + image.search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test.describe("F02 une marque contacte le créateur", () => {
  test("F02-H1 WhatsApp s’ouvre avec le message pré-rempli encodé", async ({ page }) => {
    await page.goto("/");
    const whatsapp = page.getByRole("link", { name: /Discuter sur WhatsApp/ });
    const href = (await whatsapp.getAttribute("href")) ?? "";
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://wa.me/2250706400690");
    expect(url.searchParams.get("text")).toBe("Bonjour Marcel, je souhaite vous contacter pour une collaboration.");
  });

  test("F02-H2 le numéro est un lien d’appel au format international", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Appeler Marcel, \+225 07 06 40 06 90$/ })).toHaveAttribute("href", "tel:+2250706400690");
  });
});

test.describe("F03 un fan veut faire un don (dons fermés)", () => {
  test("F03-H1 le bouton épinglé ouvre la modale « bientôt », Échap la ferme et rend le focus", async ({ page }) => {
    await page.goto("/");
    await scrollPastFirstScreen(page);
    const trigger = page.getByRole("button", { name: /^Me soutenir/ });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Les dons arrivent bientôt." })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Fermer" })).toBeFocused();
    await expectAccessible(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
