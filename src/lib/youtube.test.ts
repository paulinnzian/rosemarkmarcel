import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { getLatestEpisodes, parseFeed } = await import("./youtube");

const entry = (id: string, title: string, published = "2026-07-31T12:00:00+00:00") => `
  <entry>
    <id>yt:video:${id}</id>
    <yt:videoId>${id}</yt:videoId>
    <title>${title}</title>
    <published>${published}</published>
    <media:group><media:title>${title}</media:title></media:group>
  </entry>`;

const feed = (...entries: string[]) => `<?xml version="1.0"?><feed><title>Chaîne</title>${entries.join("")}</feed>`;

describe("parseFeed", () => {
  it("lit l'identifiant, le titre, la date et construit la miniature", () => {
    expect(parseFeed(feed(entry("PCVTcl2fSAU", "le repos 14")))).toEqual([
      {
        id: "PCVTcl2fSAU",
        title: "le repos 14",
        publishedAt: "2026-07-31T12:00:00+00:00",
        thumbnail: "https://i.ytimg.com/vi/PCVTcl2fSAU/hqdefault.jpg",
      },
    ]);
  });

  it("décode les entités XML du titre, sans prendre le titre de la chaîne", () => {
    expect(parseFeed(feed(entry("yHXyB-Yb4z4", "Rire &amp; bonne humeur &quot;Le Repos&quot;")))[0].title).toBe('Rire & bonne humeur "Le Repos"');
  });

  it("décode les entités numériques (décimales et hexadécimales)", () => {
    expect(parseFeed(feed(entry("yHXyB-Yb4z4", "L&#8217;épisode d&#x27;été &amp;#38;")))[0].title).toBe("L’épisode d'été &#38;");
  });

  it("ignore une entrée sans identifiant valide", () => {
    expect(parseFeed(feed(entry("trop-court", "x"), entry("alxMFfgV6bQ", "le repos 13")))).toHaveLength(1);
  });

  it("rend une liste vide pour un flux sans épisode ou illisible", () => {
    expect(parseFeed(feed())).toEqual([]);
    expect(parseFeed("pas du xml")).toEqual([]);
  });
});

describe("getLatestEpisodes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("garde les premiers épisodes, dans l'ordre du flux", async () => {
    const ids = ["PCVTcl2fSAU", "yHXyB-Yb4z4", "alxMFfgV6bQ"];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(feed(...ids.map((id, n) => entry(id, `le repos ${n}`))))));
    expect((await getLatestEpisodes("UCz5yqpyGfCWmcqLo6oL6PhQ", 2)).map((episode) => episode.id)).toEqual(ids.slice(0, 2));
  });

  it("rend une liste vide si YouTube répond en erreur ou ne répond pas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    expect(await getLatestEpisodes("UCz5yqpyGfCWmcqLo6oL6PhQ")).toEqual([]);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("réseau coupé"))));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getLatestEpisodes("UCz5yqpyGfCWmcqLo6oL6PhQ")).toEqual([]);
  });
});
