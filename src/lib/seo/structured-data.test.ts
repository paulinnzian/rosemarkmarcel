import { describe, expect, it } from "vitest";

import { seedContent } from "@/content";
import type { SocialLink } from "@/content/schema";
import type { Episode } from "@/lib/youtube";

import { absoluteUrl, breadcrumb, episodeList, homeGraph, person, profilePage, siteUrl, website } from "./structured-data";

const social = (network: SocialLink["network"], url: string, visible = true): SocialLink => ({
  network,
  name: network,
  handle: network,
  url,
  followers: null,
  actionLabel: "Suivre",
  visible,
});

const facts = {
  creatorName: "Rosemark Marcel",
  roleLine: "Web humoriste · Créateur du Repos",
  photo: { src: "/images/marcel.webp", alt: "Marcel", width: 800, height: 1000 },
  socials: [
    social("tiktok", "https://www.tiktok.com/@rosemarkmarcel"),
    social("instagram", "https://www.instagram.com/marcel_rosemark_officiel"),
    social("facebook", "https://www.facebook.com/cache", false),
  ],
};

describe("siteUrl et absoluteUrl", () => {
  it("n'a jamais de barre finale", () => {
    expect(siteUrl).not.toMatch(/\/$/);
  });

  it("préfixe un chemin du site et garde une adresse déjà absolue", () => {
    expect(absoluteUrl("/images/marcel.webp")).toBe(`${siteUrl}/images/marcel.webp`);
    expect(absoluteUrl("images/marcel.webp")).toBe(`${siteUrl}/images/marcel.webp`);
    expect(absoluteUrl("https://x.supabase.co/storage/v1/object/public/public-media/p.webp")).toBe(
      "https://x.supabase.co/storage/v1/object/public/public-media/p.webp",
    );
  });
});

describe("person", () => {
  it("décrit Marcel avec les seuls faits affichés : nom, ligne de présentation, photo, profils visibles", () => {
    expect(person(facts)).toEqual({
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Rosemark Marcel",
      description: "Web humoriste · Créateur du Repos",
      jobTitle: "Web humoriste",
      image: `${siteUrl}/images/marcel.webp`,
      url: `${siteUrl}/`,
      sameAs: ["https://www.tiktok.com/@rosemarkmarcel", "https://www.instagram.com/marcel_rosemark_officiel"],
    });
  });

  it("n'invente rien : ni lieu, ni nationalité, ni date de naissance", () => {
    const keys = Object.keys(person(facts));
    for (const invented of ["address", "homeLocation", "nationality", "birthDate", "birthPlace", "gender"]) {
      expect(keys).not.toContain(invented);
    }
  });

  it("omet sameAs sans profil visible, ignore les doublons et les adresses non https", () => {
    expect(person({ ...facts, socials: [] })).not.toHaveProperty("sameAs");
    const twice = social("tiktok", "https://www.tiktok.com/@rosemarkmarcel");
    expect(person({ ...facts, socials: [twice, twice, social("x", "javascript:alert(1)")] }).sameAs).toEqual([
      "https://www.tiktok.com/@rosemarkmarcel",
    ]);
  });

  it("reprend « Web humoriste » si la ligne de présentation est vide", () => {
    expect(person({ ...facts, roleLine: "  " }).description).toBe("Web humoriste");
  });

  it("fonctionne avec le contenu initial du site", () => {
    const node = person(seedContent);
    expect(node.name).toBe(seedContent.creatorName);
    expect(node.sameAs).toEqual(seedContent.socials.filter((link) => link.visible).map((link) => link.url));
  });
});

describe("homeGraph", () => {
  it("relie le site à Marcel, son éditeur", () => {
    const { "@graph": nodes } = homeGraph(facts) as { "@graph": Record<string, unknown>[] };
    expect(nodes.map((node) => node["@type"])).toEqual(["WebSite", "Person"]);
    expect(website()).toMatchObject({ name: "Rosemark Marcel", url: `${siteUrl}/`, publisher: { "@id": `${siteUrl}/#person` } });
  });
});

describe("profilePage", () => {
  it("a Marcel pour sujet principal", () => {
    expect(profilePage(facts, "/a-propos")).toMatchObject({
      "@type": "ProfilePage",
      url: `${siteUrl}/a-propos`,
      mainEntity: { "@type": "Person", name: "Rosemark Marcel" },
    });
  });
});

describe("breadcrumb", () => {
  it("mène de l'accueil à la page", () => {
    expect(breadcrumb("À propos", "/a-propos")).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "À propos", item: `${siteUrl}/a-propos` },
      ],
    });
  });
});

describe("episodeList", () => {
  const episodes: Episode[] = [
    {
      id: "PCVTcl2fSAU",
      title: "le repos 14",
      publishedAt: "2026-07-31T12:00:00+00:00",
      thumbnail: "https://i.ytimg.com/vi/PCVTcl2fSAU/hqdefault.jpg",
      description: "Un peu de rire.",
    },
    {
      id: "yHXyB-Yb4z4",
      title: "le repos 13",
      publishedAt: "2026-07-24T12:00:00+00:00",
      thumbnail: "https://i.ytimg.com/vi/yHXyB-Yb4z4/hqdefault.jpg",
    },
  ];

  it("liste exactement les épisodes affichés, dans leur ordre, en VideoObject complets", () => {
    const list = episodeList(episodes) as { numberOfItems: number; itemListElement: { position: number; item: Record<string, unknown> }[] };
    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement.map((entry) => entry.position)).toEqual([1, 2]);
    expect(list.itemListElement[0].item).toEqual({
      "@type": "VideoObject",
      name: "le repos 14",
      description: "Un peu de rire.",
      thumbnailUrl: "https://i.ytimg.com/vi/PCVTcl2fSAU/hqdefault.jpg",
      uploadDate: "2026-07-31T12:00:00+00:00",
      embedUrl: "https://www.youtube-nocookie.com/embed/PCVTcl2fSAU",
      url: "https://www.youtube.com/watch?v=PCVTcl2fSAU",
    });
  });

  it("prend le titre pour description quand le flux n'en donne pas", () => {
    const list = episodeList(episodes) as { itemListElement: { item: Record<string, unknown> }[] };
    expect(list.itemListElement[1].item.description).toBe("le repos 13");
  });

  it("rend une liste vide sans épisode", () => {
    expect(episodeList([])).toMatchObject({ numberOfItems: 0, itemListElement: [] });
  });
});
