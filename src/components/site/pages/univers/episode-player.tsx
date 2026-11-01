"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type EpisodePlayerProps = {
  id: string;
  title: string;
  thumbnail: string;
  /** Short (vidéo verticale) : le lecteur prend le format 9:16 ; sinon 16:9. */
  vertical: boolean;
  /** Largeur affichée de la miniature, pour next/image. */
  sizes: string;
};

/**
 * Miniature d'un épisode qui devient le lecteur YouTube au clic. Avant le clic, rien ne vient de YouTube :
 * la miniature passe par l'optimiseur d'images du site. Toutes les miniatures sont au même cadre portrait (4:5),
 * pour une grille régulière quel que soit le format ; le lecteur prend ensuite le format de la vidéo.
 */
export function EpisodePlayer({ id, title, thumbnail, vertical, sizes }: EpisodePlayerProps) {
  const [playing, setPlaying] = useState(false);
  // Miniature choisie absente chez YouTube (hq720 ou oar2 ne sont pas garanties) : hqdefault, qui existe toujours.
  const [fallback, setFallback] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Le bouton disparaît : le focus passe au lecteur une seule fois, pour ne pas se perdre en haut de page.
  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <iframe
        ref={frame}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`}
        title={title}
        // YouTube refuse de lire une vidéo intégrée sans l'origine du site.
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className={`w-full rounded-lg bg-ink ${vertical ? "aspect-[9/16]" : "aspect-video"}`}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Lire « ${title} »`}
      data-track="cta"
      data-track-target="episode"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-lg bg-ink"
    >
      <Image
        src={fallback ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : thumbnail}
        alt=""
        fill
        sizes={sizes}
        onError={() => setFallback(true)}
        className="object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-highlight text-on-highlight shadow-float transition-transform duration-200 ease-brand group-hover:scale-110 lg:size-16"
      >
        <svg viewBox="0 0 24 24" className="ml-1 size-6 fill-current" focusable="false">
          <path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
        </svg>
      </span>
    </button>
  );
}
