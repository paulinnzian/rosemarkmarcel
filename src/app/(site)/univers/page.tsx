import type { Metadata } from "next";

import { PageIntro } from "@/components/site/page-intro";
import { ConceptSection } from "@/components/site/pages/univers/concept-section";
import { EpisodesSection } from "@/components/site/pages/univers/episodes-section";
import { FabricHero } from "@/components/site/pages/univers/fabric-hero";
import { pageMetadata } from "@/lib/page-metadata";
import { breadcrumb, episodeList, graph, JsonLd } from "@/lib/seo/json-ld";
import { getSiteContent } from "@/lib/site-data";
import { channelUrl, getLatestEpisodes } from "@/lib/youtube";

export const metadata: Metadata = pageMetadata(
  "Mon univers : les épisodes du Repos",
  "Le Repos, le concept de Rosemark Marcel : regardez les derniers épisodes de la série humoristique sans quitter le site, puis retrouvez toute la chaîne YouTube.",
  "/univers",
);

// Un fan vient voir les épisodes : ils passent juste après le titre, le concept ensuite.
export default async function UniversPage() {
  const content = await getSiteContent();
  const universe = content.pages.universe;
  // Le plus récent en grand et six autres : deux rangées pleines sur bureau.
  const episodes = await getLatestEpisodes(universe.youtubeChannelId, 7);
  // Les vidéos décrites sont celles affichées ; flux vide : le fil d'Ariane seul.
  const trail = breadcrumb("Mon univers", "/univers");
  const structuredData = episodes.length > 0 ? graph(trail, episodeList(episodes)) : trail;

  return (
    <main id="contenu">
      <JsonLd data={structuredData} />
      <PageIntro kicker={universe.kicker} heading={universe.heading} intro={universe.intro} aside={<FabricHero />} />
      <EpisodesSection universe={universe} episodes={episodes} channelHref={channelUrl(universe.youtubeChannelId)} />
      <ConceptSection heading={universe.conceptHeading} paragraphs={universe.concept} />
    </main>
  );
}
