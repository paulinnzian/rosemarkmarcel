import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Rosemark Marcel — Le Repos", template: "%s · Rosemark Marcel" },
  description: "Rosemark Marcel, web humoriste et créateur du concept « Le Repos ». Un peu de rire, beaucoup de Repos.",
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
