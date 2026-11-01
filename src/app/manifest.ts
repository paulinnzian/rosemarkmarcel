import type { MetadataRoute } from "next";

// Manifeste web : nom, couleurs de la charte (tokens.css : --accent, --bg) et icônes de src/app.
// Les fichiers icon.png et apple-icon.png y sont servis tels quels sous /icon.png et /apple-icon.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rosemark Marcel — Le Repos",
    short_name: "Le Repos",
    description: "Rosemark Marcel, web humoriste et créateur du concept « Le Repos ».",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    // Un site vitrine, pas une application : ouvert depuis l'écran d'accueil, il garde la barre d'adresse.
    display: "browser",
    theme_color: "#2025B9",
    background_color: "#F9F8F2",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
