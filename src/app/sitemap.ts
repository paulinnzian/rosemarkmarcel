import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/json-ld";

// Pages publiques seulement ; /design répond 404 en ligne et l'admin est exclu par robots.txt.
// Pas de lastModified : aucune date de modification fiable par page (une date inventée ferait ignorer le champ).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/a-propos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/univers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/communaute`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/collaborations`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/confidentialite`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
