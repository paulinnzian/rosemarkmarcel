import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/json-ld";

// Hors index : l'administration, les routes d'API et la page de démonstration du design (404 en ligne).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/design"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
