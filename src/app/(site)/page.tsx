import { Band } from "@/components/site/band";
import { AboutSection } from "@/components/site/sections/about-section";
import { CommunitySection } from "@/components/site/sections/community-section";
import { ContactSection } from "@/components/site/sections/contact-section";
import { DonationSection } from "@/components/site/sections/donation-section";
import { HeroSection } from "@/components/site/sections/hero-section";
import { UniverseSection } from "@/components/site/sections/universe-section";
import { getSiteContent } from "@/lib/site-data";

// Ordre affiché de l'original (recon.md, « Ordre réel de la page ») : la communauté passe avant l'univers.
export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <main id="contenu">
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
