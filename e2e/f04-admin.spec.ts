import { devices, type Page } from "@playwright/test";

import { EDITOR, NOT_ADMIN, OWNER_STATE, serviceClient } from "./support/env";
import { codeIn, mailCount, nextMail, requestCode, signIn } from "./support/login";
import { solidPng } from "./support/png";
import { expect, expectAccessible, expectNoHorizontalScroll, test } from "./support/test";

// F04 : Marcel met à jour son site depuis son téléphone. Chaque test remet ce qu'il change, la base est
// de toute façon remise à zéro par global-setup au lancement suivant.

const saved = (page: Page, text: string | RegExp = /Enregistré|enregistré/) => expect(page.getByRole("status").filter({ hasText: text })).toBeVisible();
const fieldError = (page: Page, text: string) => expect(page.getByText(text, { exact: true })).toBeVisible();

test.describe("F04 accès à l’administration", () => {
  test("F04-N1 sans session : chaque écran renvoie vers la connexion", async ({ page }) => {
    for (const path of ["/admin", "/admin/dons", "/admin/contenus", "/admin/photo", "/admin/contact", "/admin/statistiques", "/admin/acces"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/connexion$/);
    }
    await expectAccessible(page);
  });

  test("F04-N2 adresse inconnue et compte hors liste : même réponse, puis refus après le code", async ({ page }) => {
    const unknownBefore = await mailCount("inconnu@exemple.test");
    const unknownMessage = await requestCode(page, "inconnu@exemple.test");
    const before = await mailCount(NOT_ADMIN);
    const visitorMessage = await requestCode(page, NOT_ADMIN);
    expect(visitorMessage).toBe(unknownMessage);

    const code = codeIn(await nextMail(NOT_ADMIN, before));
    await page.getByLabel("Code reçu par e-mail").fill(code);
    await page.getByRole("button", { name: "Se connecter" }).click();
    // Dans le formulaire : l'annonceur de routes de Next a aussi un role=alert, parfois rempli.
    await expect(page.locator("form").getByRole("alert")).toHaveText("Cette adresse n’a pas accès à l’administration.");
    expect(await mailCount("inconnu@exemple.test")).toBe(unknownBefore);
  });
});

test.describe("F04 écrans de l’administration (propriétaire connecté)", () => {
  test.use({ storageState: OWNER_STATE });

  test("F04-E1 chaque écran : titre, pas de débordement à 390 px, accessibilité", async ({ page }) => {
    const screens: [string, string][] = [
      ["/admin", "Bonjour !"],
      ["/admin/dons", "Dons"],
      ["/admin/reseaux", "Réseaux et compteurs"],
      ["/admin/contenus", "Textes du site"],
      ["/admin/photo", "Photo"],
      ["/admin/contact", "Contact"],
      ["/admin/statistiques", "Statistiques"],
      ["/admin/acces", "Accès"],
    ];
    for (const [path, title] of screens) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expectNoHorizontalScroll(page);
      await expectAccessible(page);
    }
  });

  test("F04-H1 dons : lien refusé en http, ouverture sans lien refusée, puis le bouton épinglé ouvre le lien", async ({ page }) => {
    await page.goto("/admin/dons");
    const link = page.getByLabel("Lien de paiement");
    const open = page.getByRole("switch", { name: /Dons ouverts/ });

    await link.fill("http://paiement.exemple.test/marcel");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await fieldError(page, "Le lien doit commencer par https://");
    // BUG-003 : une erreur ne doit pas effacer la saisie.
    await expect(link).toHaveValue("http://paiement.exemple.test/marcel");

    await link.fill("");
    await open.check({ force: true });
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await fieldError(page, "Collez un lien de paiement avant d’activer les dons.");
    await expect(open).toBeChecked();

    await link.fill("https://paiement.exemple.test/marcel");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await saved(page, "Enregistré. Les boutons de soutien ouvrent maintenant votre lien de paiement.");

    await page.goto("/");
    await expect(page.getByRole("link", { name: /Me soutenir/ })).toHaveAttribute("href", "https://paiement.exemple.test/marcel");

    // Retour à l'état initial : dons fermés, modale « bientôt ».
    await page.goto("/admin/dons");
    await page.getByLabel("Lien de paiement").fill("");
    await page.getByRole("switch", { name: /Dons ouverts/ }).uncheck({ force: true });
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await saved(page, /Les dons sont fermés/);
    await page.goto("/");
    await expect(page.getByRole("button", { name: /^Me soutenir/ })).toBeVisible();
  });

  test("F04-H2 textes : une modification de l’accueil arrive sur la page publique ; champs vides refusés", async ({ page }) => {
    await page.goto("/admin/contenus");
    const accueil = page.getByRole("region", { name: "Accueil" });
    const intro = accueil.getByLabel("Texte d’introduction");
    const original = await intro.inputValue();

    await intro.fill("");
    await accueil.getByRole("button", { name: "Enregistrer" }).click();
    await expect(accueil.getByText("Ce champ ne peut pas être vide.")).toBeVisible();

    await accueil.getByLabel("Texte du titre").fill("Une seule ligne");
    await accueil.getByLabel("Couleur orange").selectOption({ label: "Orange à partir de la ligne 3" });
    await intro.fill("Bienvenue chez Marcel : éèàç ✦ 😄 « guillemets »");
    await accueil.getByRole("button", { name: "Enregistrer" }).click();
    await expect(accueil.getByText("Le titre n’a pas assez de lignes pour cette couleur.")).toBeVisible();

    await page.reload();
    const fresh = page.getByRole("region", { name: "Accueil" });
    await fresh.getByLabel("Texte d’introduction").fill("Bienvenue chez Marcel : éèàç ✦ 😄 « guillemets »");
    await fresh.getByRole("button", { name: "Enregistrer" }).click();
    await expect(fresh.getByRole("status")).toHaveText("« Accueil » enregistré. La page publique est à jour.");

    await page.goto("/");
    await expect(page.getByText("Bienvenue chez Marcel : éèàç ✦ 😄 « guillemets »")).toBeVisible();

    await page.goto("/admin/contenus");
    const restore = page.getByRole("region", { name: "Accueil" });
    await restore.getByLabel("Texte d’introduction").fill(original);
    await restore.getByRole("button", { name: "Enregistrer" }).click();
    await expect(restore.getByRole("status")).toHaveText(/enregistré/);
  });

  test("F04-H3 photo : envoi, avertissement sans transparence, refus trop petite ou non image, retour à l’origine", async ({ page }) => {
    await page.goto("/admin/photo");
    const file = page.getByLabel("Nouvelle photo");
    const submit = page.getByRole("button", { name: "Enregistrer la photo" });

    await file.setInputFiles({ name: "petite.png", mimeType: "image/png", buffer: solidPng(120, 120, { alpha: true }) });
    await submit.click();
    await fieldError(page, "Photo trop petite (120 × 120 px) : 400 px au moins de chaque côté.");

    await file.setInputFiles({ name: "pas-une-image.png", mimeType: "image/png", buffer: Buffer.from("ceci n’est pas une image") });
    await submit.click();
    await fieldError(page, "Format non reconnu : envoyez un PNG, un WebP ou un JPEG.");

    await file.setInputFiles({ name: "detouree.png", mimeType: "image/png", buffer: solidPng(500, 700, { alpha: true }) });
    await submit.click();
    await saved(page, "Photo enregistrée. La page publique est à jour.");

    await page.goto("/");
    const hero = page.locator("#accueil img").first();
    await expect(hero).toHaveAttribute("src", /public-media%2Fphoto%2F/);
    await expect.poll(() => hero.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

    await page.goto("/admin/photo");
    await page.getByLabel("Nouvelle photo").setInputFiles({ name: "rectangle.png", mimeType: "image/png", buffer: solidPng(500, 700, { alpha: false }) });
    await page.getByRole("button", { name: "Enregistrer la photo" }).click();
    await saved(page, /n’a pas de fond transparent/);

    await page.reload();
    await page.getByRole("button", { name: "Revenir à la photo livrée avec le site" }).click();
    await saved(page, "La photo livrée avec le site est de retour sur la page publique.");
    const { data: objects } = await serviceClient().storage.from("public-media").list("photo");
    expect(objects ?? []).toHaveLength(0);
  });

  test("F04-H4 contact : numéro invalide refusé, message WhatsApp mis à jour sur la page publique", async ({ page }) => {
    await page.goto("/admin/contact");
    const whatsapp = page.getByRole("region", { name: "WhatsApp" });
    const number = whatsapp.getByLabel("Numéro au format international");
    const message = whatsapp.getByLabel("Message déjà écrit pour le visiteur");
    const original = await message.inputValue();

    await number.fill("07 06");
    await whatsapp.getByRole("button", { name: "Enregistrer" }).click();
    await expect(whatsapp.getByText("Numéro au format international : +225…")).toBeVisible();

    await number.fill("+225 07 06 40 06 90");
    await message.fill("Bonjour, c’est pour un partenariat & une vidéo ?");
    await whatsapp.getByRole("button", { name: "Enregistrer" }).click();
    await expect(whatsapp.getByRole("status")).toHaveText("Enregistré. La page publique est à jour.");

    await page.goto("/");
    const href = (await page.getByRole("link", { name: /Discuter sur WhatsApp/ }).getAttribute("href")) ?? "";
    expect(new URL(href).searchParams.get("text")).toBe("Bonjour, c’est pour un partenariat & une vidéo ?");

    await page.goto("/admin/contact");
    const restore = page.getByRole("region", { name: "WhatsApp" });
    await restore.getByLabel("Message déjà écrit pour le visiteur").fill(original);
    await restore.getByRole("button", { name: "Enregistrer" }).click();
    await expect(restore.getByRole("status")).toHaveText(/Enregistré/);
  });

  test("F04-H5 réseaux : ajouter Snapchat, le monter d’un cran, le masquer", async ({ page }) => {
    await page.goto("/admin/reseaux");
    const add = page.getByRole("region", { name: "Ajouter un réseau" });
    await add.getByRole("button", { name: "Ajouter" }).click();
    await expect(add.getByText("Choisissez un réseau.")).toBeVisible();

    await add.getByLabel("Réseau").selectOption({ label: "Snapchat" });
    await add.getByLabel("Pseudo").fill("rosemarkmarcel");
    await add.getByLabel("Lien du profil").fill("https://www.snapchat.com/add/rosemarkmarcel");
    await add.getByLabel("Nombre d’abonnés").fill("12 500");
    await add.getByLabel("Texte sous le compteur").fill("Me suivre sur Snapchat");
    await add.getByRole("button", { name: "Ajouter" }).click();
    await expect(add.getByRole("status")).toHaveText("Réseau ajouté en dernière position.");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Réseaux et compteurs");
    const headings = page.getByRole("heading", { level: 2 });
    const before = await headings.allTextContents();
    expect(before.at(-2)).toBe("Snapchat");
    await page.getByRole("button", { name: "Monter Snapchat" }).click();
    await expect.poll(async () => (await page.getByRole("heading", { level: 2 }).allTextContents()).indexOf("Snapchat")).toBe(before.length - 3);

    await page.goto("/");
    const order = await page
      .locator("#communaute")
      .getByRole("link", { name: /nouvel onglet/ })
      .evaluateAll((cards) => cards.map((card) => card.firstElementChild?.firstChild?.textContent?.trim() ?? ""));
    expect(order.indexOf("Snapchat")).toBeLessThan(order.length - 1);

    await page.goto("/admin/reseaux");
    const snapchat = page.getByRole("region", { name: "Snapchat" });
    await snapchat.getByRole("switch", { name: "Afficher sur le site" }).uncheck({ force: true });
    await snapchat.getByRole("button", { name: "Enregistrer" }).click();
    await expect(snapchat.getByRole("status")).toHaveText(/Enregistré/);
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Snapchat / })).toHaveCount(0);
  });

  test("F04-H6 statistiques : événements valides comptés ; robots, admin connecté et envois douteux écartés", async ({ page, browser, playwright, request: adminRequest }) => {
    // Visiteur anonyme : sans les cookies de session du propriétaire (ceux-là sont ignorés, vérifié plus bas).
    const request = await playwright.request.newContext({ baseURL: "http://localhost:3100", storageState: { cookies: [], origins: [] } });
    await serviceClient().from("click_events").delete().gte("id", 0);

    // Un vrai navigateur, sans session : la vue et le clic sur le bouton du héros partent par sendBeacon.
    // Agent d'un Chrome de bureau ordinaire : « HeadlessChrome » est écarté comme robot.
    const visitor = await browser.newContext({ baseURL: "http://localhost:3100", userAgent: devices["Desktop Chrome"].userAgent,
      storageState: { cookies: [], origins: [] },
    });
    const visitorPage = await visitor.newPage();
    await visitorPage.goto("/");
    await visitorPage.getByRole("link", { name: /Entrez dans l’univers/ }).click();
    await expect
      .poll(async () => (await serviceClient().from("click_events").select("kind, target")).data)
      .toEqual(expect.arrayContaining([{ kind: "page_view", target: null }, { kind: "cta", target: "hero" }]));
    await visitor.close();
    const phone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
    const post = (data: unknown, headers: Record<string, string> = {}) =>
      request.post("/api/evenements", { data: JSON.stringify(data), headers: { "user-agent": phone, "content-type": "text/plain", ...headers } });

    expect((await post({ kind: "page_view", path: "/" })).status()).toBe(204);
    expect((await post({ kind: "social", target: "facebook", path: "/" })).status()).toBe(204);
    expect((await post({ kind: "page_view", path: "/" }, { "user-agent": "Googlebot/2.1" })).status()).toBe(204);
    expect((await post({ kind: "nimporte", path: "/" })).status()).toBe(400);
    expect((await post({ kind: "page_view", path: "/" }, { origin: "https://ailleurs.exemple.test" })).status()).toBe(403);
    const asAdmin = await adminRequest.post("/api/evenements", {
      data: JSON.stringify({ kind: "page_view", path: "/" }),
      headers: { "user-agent": phone, "content-type": "text/plain" },
    });
    expect(asAdmin.status()).toBe(204);
    await request.dispose();

    const { data: events } = await serviceClient().from("click_events").select("kind, target, device");
    expect(events).toEqual(
      expect.arrayContaining([
        { kind: "page_view", target: null, device: "mobile" },
        { kind: "social", target: "facebook", device: "mobile" },
        { kind: "page_view", target: null, device: "desktop" },
        { kind: "cta", target: "hero", device: "desktop" },
      ]),
    );
    // Rien d'autre : ni le robot, ni l'envoi invalide, ni l'origine étrangère, ni l'admin connecté.
    expect(events).toHaveLength(4);

    await page.goto("/admin/statistiques?periode=7");
    await expect(page.getByRole("term").filter({ hasText: "Vues de la page" }).locator("xpath=following-sibling::dd")).toHaveText("2");
    await expect(page.getByRole("row", { name: /Facebook/ })).toContainText("1");
    await expect(page.getByRole("row", { name: /Téléphone/ })).toContainText("1");
    await expect(page.getByRole("row", { name: /Ordinateur/ })).toContainText("1");
    await expectAccessible(page);
  });

  test("F04-H7 accès : le propriétaire ajoute un gestionnaire, qui ne gère pas les accès, puis le retire", async ({ page, browser }) => {
    await page.goto("/admin/acces");
    await page.getByLabel("Adresse e-mail du gestionnaire").fill(EDITOR);
    await page.getByRole("button", { name: "Donner l’accès" }).click();
    await saved(page, /peut maintenant se connecter/);
    await page.reload();
    await expect(page.getByText(EDITOR, { exact: true })).toBeVisible();

    await page.getByLabel("Adresse e-mail du gestionnaire").fill(EDITOR);
    await page.getByRole("button", { name: "Donner l’accès" }).click();
    await fieldError(page, "Cette adresse a déjà accès.");

    const editorContext = await browser.newContext({ baseURL: "http://localhost:3100", viewport: { width: 390, height: 844 } });
    const editorPage = await editorContext.newPage();
    await signIn(editorPage, EDITOR);
    await editorPage.goto("/admin/acces");
    await expect(editorPage.getByText("Seul le propriétaire du site peut ajouter ou retirer des gestionnaires.")).toBeVisible();
    await editorPage.goto("/admin/dons");
    await expect(editorPage.getByRole("heading", { level: 1 })).toHaveText("Dons");

    await page.getByText("Retirer l’accès").click();
    await page.getByRole("button", { name: "Confirmer le retrait" }).click();
    await saved(page, `${EDITOR} n’a plus accès. Ses sessions ouvertes sont fermées.`);

    await editorPage.goto("/admin/dons");
    await expect(editorPage).toHaveURL(/\/admin\/connexion$/);
    await editorContext.close();
  });
});
