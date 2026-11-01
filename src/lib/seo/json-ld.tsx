import type { JsonLdNode } from "@/lib/seo/structured-data";

// Constructeurs purs dans structured-data.ts (testés sans React) ; réexportés ici pour les pages.
export { breadcrumb, episodeList, graph, homeGraph, person, profilePage, siteUrl, website } from "@/lib/seo/structured-data";

/** Données structurées schema.org, rendues côté serveur ; « < » est échappé pour ne jamais fermer la balise. */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c") }}
    />
  );
}
