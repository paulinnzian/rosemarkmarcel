import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Pages publiques seulement ; /design répond 404 en ligne et l'admin est exclu par robots.txt.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/a-propos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/univers`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/communaute`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/collaborations`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/confidentialite`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
