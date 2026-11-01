import { buttonClasses } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";
import { EpisodePlayer } from "@/components/site/pages/univers/episode-player";
import type { Pages } from "@/content/schema";
import type { Episode } from "@/lib/youtube";

type EpisodesSectionProps = {
  universe: Pages["universe"];
  episodes: Episode[];
  channelHref: string;
};

const publishedDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function EpisodeDate({ publishedAt }: { publishedAt: string }) {
  return (
    <time dateTime={publishedAt} className="text-sm text-muted">
      {publishedDate.format(new Date(publishedAt))}
    </time>
  );
}

function ChannelLink({ href, variant, label }: { href: string; variant: "accent" | "text"; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="social"
      data-track-target="youtube"
      className={buttonClasses(variant)}
    >
      <Decorated text={label} />
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}

/** Les derniers épisodes du Repos : le plus récent en grand, les autres en grille, lecture sur place. */
export function EpisodesSection({ universe, episodes, channelHref }: EpisodesSectionProps) {
  const [latest, ...others] = episodes;

  return (
    <section id="episodes" aria-labelledby="episodes-titre" className="container-site section-y">
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-end lg:gap-12">
        <h2 id="episodes-titre" className="text-h2 text-balance text-ink">
          <Decorated text={universe.episodesHeading} />
        </h2>
        <p className="text-base text-muted">{universe.episodesIntro}</p>
      </div>

      {latest ? (
        <>
          <article className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end lg:gap-10">
            <EpisodePlayer id={latest.id} title={latest.title} thumbnail={latest.thumbnail} sizes="(min-width: 1024px) 860px, 92vw" />
            <div className="lg:pb-2">
              <h3 className="line-clamp-4 break-words text-count text-ink">{latest.title}</h3>
              <p className="mt-3">
                <EpisodeDate publishedAt={latest.publishedAt} />
              </p>
            </div>
          </article>

          {others.length > 0 && (
            <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((episode) => (
                <li key={episode.id}>
                  <article>
                    <EpisodePlayer
                      id={episode.id}
                      title={episode.title}
                      thumbnail={episode.thumbnail}
                      sizes="(min-width: 1024px) 420px, (min-width: 640px) 46vw, 92vw"
                    />
                    <h3 className="mt-4 line-clamp-2 break-words text-label text-ink">{episode.title}</h3>
                    <p className="mt-1">
                      <EpisodeDate publishedAt={episode.publishedAt} />
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10">
            <ChannelLink href={channelHref} variant="text" label="Tous les épisodes sur YouTube ↗" />
          </div>
        </>
      ) : (
        <div className="mt-10 rounded-xl bg-tint p-6 lg:p-10">
          <p className="max-w-prose text-lead text-ink">{universe.episodesEmpty}</p>
          <div className="mt-6">
            <ChannelLink href={channelHref} variant="accent" label="Ouvrir la chaîne YouTube ↗" />
          </div>
        </div>
      )}
    </section>
  );
}
