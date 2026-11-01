import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";

import { siteUrl } from "@/lib/seo/json-ld";

import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const description = "Rosemark Marcel, web humoriste et créateur du concept « Le Repos ». Un peu de rire, beaucoup de Repos.";

// Balises de vérification de Google Search Console et Bing Webmaster Tools, posées seulement si le jeton est défini.
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();
const verification: Metadata["verification"] =
  googleVerification || bingVerification
    ? {
        ...(googleVerification && { google: googleVerification }),
        ...(bingVerification && { other: { "msvalidate.01": bingVerification } }),
      }
    : undefined;

export const metadata: Metadata = {
  // Adresses absolues (canonique, og:url, og:image) : même source que le sitemap et les données structurées.
  metadataBase: new URL(siteUrl),
  title: { default: "Rosemark Marcel — Le Repos", template: "%s · Rosemark Marcel" },
  description,
  applicationName: "Rosemark Marcel — Le Repos",
  creator: "Rosemark Marcel",
  authors: [{ name: "Rosemark Marcel", url: "/" }],
  verification,
  openGraph: { type: "website", locale: "fr_FR", siteName: "Rosemark Marcel", title: "Rosemark Marcel — Le Repos", description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#2025B9",
  // Nécessaire pour env(safe-area-inset-*) : le bouton épinglé évite la barre de l'iPhone.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={interTight.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
