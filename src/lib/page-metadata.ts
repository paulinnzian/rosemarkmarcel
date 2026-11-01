import type { Metadata } from "next";

/**
 * Titre et description d'une page, repris dans l'aperçu de partage : sans `openGraph` propre, une page partagée
 * s'annoncerait avec le titre et le texte de l'accueil. Un `openGraph` de page remplace tout celui du gabarit,
 * image comprise : l'image du site (src/app/opengraph-image.tsx) est donc redonnée ici.
 */
export function pageMetadata(title: string, description: string, path: `/${string}`): Metadata {
  return {
    title,
    description,
    // Adresse de référence sans paramètres (utm_…) : les liens de campagne ne créent pas de doublons pour les moteurs.
    alternates: { canonical: path },
    openGraph: {
      url: path,
      type: "website",
      locale: "fr_FR",
      siteName: "Rosemark Marcel",
      title: `${title} · Rosemark Marcel`,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Rosemark Marcel, web humoriste, créateur du concept « Le Repos »" }],
    },
  };
}
