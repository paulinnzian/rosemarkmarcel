"use client";

import Image from "next/image";
import { useState } from "react";

import type { SiteContent } from "@/content/schema";

type HeroImageProps = {
  photo: SiteContent["photo"];
  /** Texte affiché dans le cadre si la photo ne charge pas. */
  fallbackText: string;
};

/** Photo du héros ; si elle ne charge pas, le cadre garde sa taille et montre le nom au lieu d'une image cassée. */
export function HeroImage({ photo, fallbackText }: HeroImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={photo.alt}
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        className="flex items-center justify-center p-8 text-center text-h2 text-accent"
      >
        <span aria-hidden="true">{fallbackText}</span>
      </div>
    );
  }

  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading="eager"
      fetchPriority="high"
      sizes="(min-width: 1024px) 604px, 92vw"
      className="h-auto w-full"
      onError={() => setFailed(true)}
    />
  );
}
