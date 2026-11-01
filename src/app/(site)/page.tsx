import type { Metadata } from "next";

import { Band } from "@/components/site/band";
import { AboutSection } from "@/components/site/sections/about-section";
import { CommunitySection } from "@/components/site/sections/community-section";
import { ContactSection } from "@/components/site/sections/contact-section";
import { DonationSection } from "@/components/site/sections/donation-section";
import { HeroSection } from "@/components/site/sections/hero-section";
import { UniverseSection } from "@/components/site/sections/universe-section";
import { homeGraph, JsonLd } from "@/lib/seo/json-ld";
import { getSiteContent } from "@/lib/site-data";

// Titre, description et aperçu de partage : ceux du gabarit (src/app/layout.tsx). Seule l'adresse de référence
// s'ajoute, ici et pas dans le gabarit : une page sans canonique propre ne doit pas se déclarer copie de l'accueil.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Ordre affiché de l'original (recon.md, « Ordre réel de la page ») : la communauté passe avant l'univers.
export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <main id="contenu">
      <JsonLd data={homeGraph(content)} />
      <HeroSection content={content} />
      <Band phrases={content.marquee} />
      <AboutSection about={content.about} />
      <CommunitySection community={content.community} socials={content.socials} />
      <UniverseSection universe={content.universe} />
      <DonationSection donation={content.donation} />
      <ContactSection contact={content.contact} contacts={content.contacts} />
    </main>
  );
}
