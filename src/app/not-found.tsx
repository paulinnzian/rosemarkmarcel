import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/site/button-styles";
import { Kicker } from "@/components/site/kicker";
import { SiteChrome } from "@/components/site/site-chrome";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

// Hors du groupe (site) : la page 404 reprend elle-même l'habillage public, bouton épinglé compris.
export default function NotFound() {
  return (
    <SiteChrome>
      <main id="contenu" className="container-site section-y">
        <Kicker withDot>Erreur 404</Kicker>
        <h1 className="mt-4 text-h2 text-balance">Cette page s’est mise au repos.</h1>
        <p className="mt-4 max-w-prose text-base text-muted">
          L’adresse est peut-être mal tapée, ou la page a changé de place. Tout le reste vous attend sur l’accueil.
        </p>
        <Link href="/" className={buttonClasses("primary", "mt-8")}>
          Revenir à l’accueil
        </Link>
      </main>
    </SiteChrome>
  );
}
