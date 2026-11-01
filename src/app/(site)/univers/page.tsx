import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { ConceptSection } from "@/components/site/pages/univers/concept-section";
import { EpisodesSection } from "@/components/site/pages/univers/episodes-section";
import { FabricHero } from "@/components/site/pages/univers/fabric-hero";
import { pageMetadata } from "@/lib/page-metadata";
import { getSiteContent } from "@/lib/site-data";
import { channelUrl, getLatestEpisodes } from "@/lib/youtube";

export const metadata: Metadata = pageMetadata(
  "Mon univers",
  "Le Repos, le concept de Rosemark Marcel : regardez les derniers épisodes de la série sans quitter le site.",
);

// Un fan vient voir les épisodes : ils passent juste après le titre, le concept ensuite.
export default async function UniversPage() {
  const content = await getSiteContent();
  const universe = content.pages.universe;
  // Le plus récent en grand et six autres : deux rangées pleines sur bureau.
  const episodes = await getLatestEpisodes(universe.youtubeChannelId, 7);

  return (
    <main id="contenu">
      <PageIntro kicker={universe.kicker} heading={universe.heading} intro={universe.intro} aside={<FabricHero />} />
      <EpisodesSection universe={universe} episodes={episodes} channelHref={channelUrl(universe.youtubeChannelId)} />
      <ConceptSection heading={universe.conceptHeading} paragraphs={universe.concept} />
    </main>
  );
}
