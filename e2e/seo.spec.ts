import type { Page } from "@playwright/test";

import { expect, test } from "./support/test";

// Référencement technique : robots.txt, sitemap, manifeste, adresses canoniques et données structurées.
// Les URL absolues viennent de NEXT_PUBLIC_SITE_URL, pas du serveur de test : seuls les chemins sont vérifiés.

type Node = Record<string, unknown>;

/** Nœuds schema.org de la page, blocs `@graph` dépliés. */
async function structuredData(page: Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((block) => {
    const data = JSON.parse(block) as Node;
    expect(data["@context"]).toBe("https://schema.org");
    return Array.isArray(data["@graph"]) ? (data["@graph"] as Node[]) : [data];
  });
}

const ofType = (nodes: Node[], type: string) => nodes.filter((node) => node["@type"] === type);

test.describe("Référencement", () => {
  test("robots.txt exclut l’admin, l’API et la page de design, et annonce le sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    for (const path of ["/admin", "/api", "/design"]) expect(body).toMatch(new RegExp(`^Disallow: ${path}$`, "m"));
    expect(body).toMatch(/^Sitemap: https?:\/\/\S+\/sitemap\.xml$/m);
  });

  test("le sitemap liste les pages publiques, contact compris, et rien de l’admin", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    expect(locs).toEqual(
      expect.arrayContaining(["/", "/a-propos", "/univers", "/communaute", "/collaborations", "/contact", "/confidentialite"]),
    );
    expect(locs.some((path) => /^\/(admin|api|design)/.test(path))).toBe(false);
  });

  test("le manifeste web est annoncé et servi, avec des icônes qui répondent", async ({ page, request }) => {
    await page.goto("/");
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(href).toBeTruthy();
    const response = await request.get(href ?? "");
    expect(response.status()).toBe(200);
    const manifest = (await response.json()) as { name: string; short_name: string; lang: string; icons: { src: string }[] };
    expect(manifest).toMatchObject({ name: "Rosemark Marcel — Le Repos", short_name: "Le Repos", lang: "fr", start_url: "/" });
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
  });

  test("l’accueil : canonique et données structurées du site et de Marcel", async ({ page }) => {
    await page.goto("/?utm_source=tiktok&utm_medium=bio");
    const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute("href")) ?? "");
    expect(canonical.pathname).toBe("/");
    expect(canonical.search).toBe("");

    const nodes = await structuredData(page);
    expect(ofType(nodes, "WebSite")[0]).toMatchObject({ name: "Rosemark Marcel" });
    const [person] = ofType(nodes, "Person");
    expect(person).toMatchObject({ name: "Rosemark Marcel", jobTitle: "Web humoriste" });
    expect(person.image).toMatch(/^https?:\/\//);
    const sameAs = person.sameAs as string[];
    expect(sameAs.length).toBeGreaterThan(0);
    for (const url of sameAs) expect(url).toMatch(/^https:\/\//);
  });

  for (const { path, name } of [
    { path: "/a-propos", name: "À propos" },
    { path: "/univers", name: "Mon univers" },
    { path: "/communaute", name: "La communauté" },
    { path: "/collaborations", name: "Collaborations" },
  ]) {
    test(`${path} : canonique propre et fil d’Ariane`, async ({ page }) => {
      await page.goto(`${path}?utm_campaign=essai`);
      const canonical = new URL((await page.locator('link[rel="canonical"]').getAttribute("href")) ?? "");
      expect(canonical.pathname).toBe(path);
      expect(canonical.search).toBe("");

      const [trail] = ofType(await structuredData(page), "BreadcrumbList");
      const items = trail.itemListElement as { position: number; name: string; item: string }[];
      expect(items.map((item) => item.name)).toEqual(["Accueil", name]);
      expect(new URL(items[1].item).pathname).toBe(path);
    });
  }

  test("/a-propos : page de profil dont Marcel est le sujet", async ({ page }) => {
    await page.goto("/a-propos");
    const [profile] = ofType(await structuredData(page), "ProfilePage");
    expect(profile.mainEntity).toMatchObject({ "@type": "Person", name: "Rosemark Marcel" });
  });

  test("/univers : un VideoObject par épisode affiché (aucun si le flux est vide)", async ({ page }) => {
    await page.goto("/univers");
    const shown = await page.getByRole("button", { name: /^Lire «\s.+\s»$/ }).count();
    const videos = ofType(await structuredData(page), "ItemList").flatMap((list) =>
      (list.itemListElement as { item: Node }[]).map((entry) => entry.item),
    );
    expect(videos).toHaveLength(shown);
    for (const video of videos) {
      expect(video).toMatchObject({ "@type": "VideoObject" });
      expect(video.embedUrl).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}$/);
      expect(video.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
      for (const field of ["name", "description", "thumbnailUrl", "uploadDate"]) expect(video[field]).toBeTruthy();
    }
  });
});
