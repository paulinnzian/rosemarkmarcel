import type { SiteContent } from "@/content/schema";
import type { Episode } from "@/lib/youtube";

/**
 * Données structurées schema.org du site, en objets purs (testés sans React). Elles ne décrivent que ce que la
 * page affiche : rien sur Marcel qui ne soit déjà visible (ni ville, ni nationalité, ni âge).
 */

export type JsonLdNode = Record<string, unknown>;

/** Adresse publique du site, pour les URL absolues des données structurées (même source que sitemap et robots). */
// Vide ou absente (copiée telle quelle de .env.example) : adresse locale. En production, le build le signale :
// adresses canoniques, sitemap et données structurées pointeraient sinon vers localhost.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
if (!configuredUrl && process.env.NODE_ENV === "production") {
  console.warn("NEXT_PUBLIC_SITE_URL n'est pas défini : les adresses du référencement pointent vers http://localhost:3000.");
}
export const siteUrl = (configuredUrl || "http://localhost:3000").replace(/\/$/, "");

/** Nom du site, le même que `og:site_name` (src/app/layout.tsx) : les moteurs comparent les deux. */
export const SITE_NAME = "Rosemark Marcel";

/** Identifiants stables : une même personne et un même site, quelle que soit la page qui les décrit. */
const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;

/** URL absolue d'une image : les photos envoyées depuis l'admin le sont déjà, celle livrée avec le site non. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Plusieurs nœuds dans un seul bloc JSON-LD. */
export function graph(...nodes: JsonLdNode[]): JsonLdNode {
  return { "@graph": nodes };
}

export type PersonFacts = Pick<SiteContent, "creatorName" | "roleLine" | "photo" | "socials">;

/** Marcel : nom, ligne de présentation, photo et profils sociaux affichés sur le site. */
export function person(content: PersonFacts): JsonLdNode {
  const sameAs = [...new Set(content.socials.filter((link) => link.visible && /^https:\/\//i.test(link.url)).map((link) => link.url))];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: content.creatorName,
    description: content.roleLine.trim() || "Web humoriste",
    jobTitle: "Web humoriste",
    image: absoluteUrl(content.photo.src),
    url: `${siteUrl}/`,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** Le site lui-même, publié par Marcel. */
export function website(): JsonLdNode {
  return { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, url: `${siteUrl}/`, inLanguage: "fr", publisher: { "@id": PERSON_ID } };
}

/** Accueil : le site et la personne qu'il présente. */
export function homeGraph(content: PersonFacts): JsonLdNode {
  return graph(website(), person(content));
}

/** Page À propos : une page de profil dont le sujet est Marcel. */
export function profilePage(content: PersonFacts, path: `/${string}`): JsonLdNode {
  return { "@type": "ProfilePage", "@id": `${siteUrl}${path}`, url: `${siteUrl}${path}`, inLanguage: "fr", mainEntity: person(content) };
}

/** Fil d'Ariane Accueil › page, pour les pages intérieures. */
export function breadcrumb(name: string, path: `/${string}`): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name, item: `${siteUrl}${path}` },
    ],
  };
}

function shorten(text: string, max: number): string {
  const chars = Array.from(text);
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}

/** Épisodes affichés sur la page, dans le même ordre ; sans description dans le flux, le titre en tient lieu. */
export function episodeList(episodes: Episode[]): JsonLdNode {
  return {
    "@type": "ItemList",
    numberOfItems: episodes.length,
    itemListElement: episodes.map((episode, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: episode.title,
        // 300 caractères suffisent aux moteurs ; le texte YouTube entier alourdirait la page de plusieurs Ko par vidéo.
        description: shorten(episode.description || episode.title, 300),
        thumbnailUrl: episode.thumbnail,
        uploadDate: episode.publishedAt,
        embedUrl: `https://www.youtube-nocookie.com/embed/${episode.id}`,
        url: `https://www.youtube.com/watch?v=${episode.id}`,
      },
    })),
  };
}
