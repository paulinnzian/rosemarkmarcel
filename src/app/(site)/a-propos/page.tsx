import type { Metadata } from "next";

import { HeroPhoto } from "@/components/site/hero-photo";
import { PageIntro } from "@/components/site/page-intro";
import { AboutClosing } from "@/components/site/pages/a-propos/about-closing";
import { AboutStory } from "@/components/site/pages/a-propos/about-story";
import { AboutValues } from "@/components/site/pages/a-propos/about-values";
import { pageMetadata } from "@/lib/page-metadata";
import { breadcrumb, graph, JsonLd, profilePage } from "@/lib/seo/json-ld";
import { getSiteContent } from "@/lib/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const { pages } = await getSiteContent();
  return pageMetadata("À propos : le web humoriste du Repos", pages.about.intro, "/a-propos");
}

// Le fan curieux voit d'abord qui est Marcel, avec sa photo ; la page le mène ensuite vers la communauté.
export default async function AboutPage() {
  const content = await getSiteContent();
  const { pages, photo, photoLabel, creatorName } = content;
  const about = pages.about;

  return (
    <main id="contenu">
      <JsonLd data={graph(profilePage(content, "/a-propos"), breadcrumb("À propos", "/a-propos"))} />
      <PageIntro
        kicker={about.kicker}
        heading={about.heading}
        intro={about.intro}
        aside={<HeroPhoto photo={photo} label={photoLabel} fallbackText={creatorName} />}
      />
      <AboutStory story={about.story} />
      <AboutValues valuesHeading={about.valuesHeading} values={about.values} />
      <AboutClosing closing={about.closing} closingCta={about.closingCta} />
    </main>
  );
}
