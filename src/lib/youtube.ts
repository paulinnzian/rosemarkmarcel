import "server-only";

export type Episode = {
  id: string;
  title: string;
  /** Date ISO de publication. */
  publishedAt: string;
  thumbnail: string;
  /** Vidéo verticale (Short) : miniature et lecteur au format 9:16. */
  vertical: boolean;
  /** Texte de la vidéo sur YouTube (media:description), absent s'il est vide. */
  description?: string;
};

const FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=";

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };

function decode(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity, code: string) => {
    if (!code.startsWith("#")) return ENTITIES[entity.toLowerCase()] ?? entity;
    const point = code[1].toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

function tag(entry: string, name: string): string | undefined {
  return entry.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1];
}

/** Épisodes d'un flux YouTube (Atom), du plus récent au plus ancien ; les entrées incomplètes sont ignorées. */
export function parseFeed(xml: string): Episode[] {
  const episodes: Episode[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = tag(entry, "yt:videoId");
    const title = tag(entry, "title");
    const publishedAt = tag(entry, "published");
    if (!id || !/^[\w-]{11}$/.test(id) || !title || !publishedAt) continue;
    const description = decode(tag(entry, "media:description") ?? "").trim();
    // Le flux donne aux Shorts une adresse /shorts/ ; leur miniature verticale (oar2, 1080×1920) n'existe que pour eux.
    // Les autres : hq720 (1280×720, sans les bandes noires de hqdefault) ; le lecteur retombe sur hqdefault au besoin.
    const vertical = /<link rel="alternate" href="https:\/\/www\.youtube\.com\/shorts\//.test(entry);
    episodes.push({
      id,
      title: decode(title).trim(),
      publishedAt,
      thumbnail: `https://i.ytimg.com/vi/${id}/${vertical ? "oar2" : "hq720"}.jpg`,
      vertical,
      ...(description && { description }),
    });
  }
  return episodes;
}

/**
 * Derniers épisodes de la chaîne, relus au plus une fois par heure. Flux injoignable ou illisible : liste vide,
 * la page affiche alors un lien vers la chaîne au lieu d'échouer.
 */
export async function getLatestEpisodes(channelId: string, limit = 6): Promise<Episode[]> {
  try {
    // Un flux qui ne répond pas ne doit pas bloquer la construction ni le rendu de la page.
    const response = await fetch(`${FEED_URL}${channelId}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    return parseFeed(await response.text()).slice(0, limit);
  } catch (error) {
    console.error("Flux YouTube illisible :", error);
    return [];
  }
}

export function channelUrl(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}`;
}
