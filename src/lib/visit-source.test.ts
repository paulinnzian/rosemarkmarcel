import { describe, expect, it } from "vitest";

import { rankSources, sourceLabel, visitSource } from "./visit-source";

const OWN = "marcel.exemple";

describe("visitSource", () => {
  it("préfère utm_source, réduit à [a-z0-9_-] en minuscules, 40 caractères au plus", () => {
    expect(visitSource("?utm_source=Facebook&utm_campaign=lancement", "https://www.google.com/", OWN)).toEqual({
      source: "facebook",
      campaign: "lancement",
    });
    expect(visitSource("?utm_source=Google%20Ads!", "", OWN).source).toBe("googleads");
    expect(visitSource("?utm_source=news_letter-2", "", OWN).source).toBe("news_letter-2");
    expect(visitSource(`?utm_source=${"a".repeat(50)}`, "", OWN).source).toBe("a".repeat(40));
  });

  it("ignore un utm_source vide ou sans caractère gardé et retombe sur le site d'origine", () => {
    expect(visitSource("?utm_source=", "https://www.bing.com/search?q=marcel", OWN).source).toBe("bing");
    expect(visitSource("?utm_source=%C3%A9%20!", "https://duckduckgo.com/", OWN).source).toBe("duckduckgo");
    expect(visitSource("?utm_source=", "", OWN).source).toBe("direct");
  });

  it("réduit le site d'origine à un nom court, sans jamais garder l'adresse", () => {
    const cases: [string, string][] = [
      ["https://www.google.com/", "google"],
      ["https://www.google.ci/", "google"],
      ["https://www.google.co.uk/search?q=x", "google"],
      ["https://news.google.com/", "google"],
      ["https://fr.search.yahoo.com/", "yahoo"],
      ["https://www.facebook.com/", "facebook"],
      ["https://m.facebook.com/story.php?id=1", "facebook"],
      ["https://l.facebook.com/l.php?u=x", "facebook"],
      ["https://lm.facebook.com/", "facebook"],
      ["https://fb.com/", "facebook"],
      ["https://www.instagram.com/", "instagram"],
      ["https://l.instagram.com/?u=x", "instagram"],
      ["https://www.tiktok.com/@marcel", "tiktok"],
      ["https://www.youtube.com/watch?v=x", "youtube"],
      ["https://m.youtube.com/", "youtube"],
      ["https://youtu.be/x", "youtube"],
      ["https://wa.me/", "whatsapp"],
      ["https://web.whatsapp.com/", "whatsapp"],
      ["https://t.co/abc", "x"],
      ["https://twitter.com/", "x"],
      ["https://x.com/", "x"],
      ["https://www.linkedin.com/feed/", "linkedin"],
      ["https://lnkd.in/abc", "linkedin"],
      ["https://chatgpt.com/", "chatgpt"],
      ["https://chat.openai.com/", "chatgpt"],
      ["https://www.perplexity.ai/", "perplexity"],
      ["android-app://com.google.android.googlequicksearchbox/", "google"],
      ["android-app://com.exemple.appli/", "autre"],
      ["https://blog.exemple.org/article", "autre"],
      ["https://notfacebook.com/", "autre"],
      ["https://google.exemple.com/", "autre"],
      ["pas une adresse", "autre"],
    ];
    for (const [referrer, source] of cases) expect(visitSource("", referrer, OWN).source, referrer).toBe(source);
  });

  it("arrivée sans référent ou depuis le site lui-même : accès direct", () => {
    expect(visitSource("", "", OWN)).toEqual({ source: "direct", campaign: null });
    expect(visitSource("", "https://marcel.exemple/a-propos", OWN).source).toBe("direct");
    expect(visitSource("", "https://www.marcel.exemple/", OWN).source).toBe("direct");
    expect(visitSource("", "http://localhost:3100/", "localhost:3100").source).toBe("direct");
    expect(visitSource("", "http://localhost:3000/", "localhost:3100").source).toBe("autre");
  });

  it("réduit utm_campaign à un nom : minuscules, chiffres, _ et -, 60 caractères au plus, vide → null", () => {
    expect(visitSource("?utm_campaign=Pub-Rentree_2026", "", OWN).campaign).toBe("pub-rentree_2026");
    expect(visitSource("?utm_campaign=%20Rentr%C3%A9e%202026%20", "", OWN).campaign).toBe("rentre2026");
    // Ni adresse e-mail ni texte libre : seuls les caractères d'un nom de campagne restent.
    expect(visitSource("?utm_campaign=jean.dupont%40mail.com", "", OWN).campaign).toBe("jeandupontmailcom");
    expect(visitSource(`?utm_campaign=${"x".repeat(80)}`, "", OWN).campaign).toBe("x".repeat(60));
    expect(visitSource("?utm_campaign=%20%F0%9F%8E%89%20", "", OWN).campaign).toBeNull();
    expect(visitSource("", "", OWN).campaign).toBeNull();
  });
});

describe("sourceLabel", () => {
  it("donne un nom lisible, et la source libre d'une campagne telle quelle", () => {
    expect(sourceLabel("direct")).toBe("Accès direct");
    expect(sourceLabel("autre")).toBe("Autre site");
    expect(sourceLabel("google")).toBe("Google");
    expect(sourceLabel("newsletter")).toBe("newsletter");
  });

  it("une source envoyée par n'importe qui ne lit jamais le prototype de l'objet", () => {
    expect(sourceLabel("__proto__")).toBe("__proto__");
    expect(sourceLabel("constructor")).toBe("constructor");
    expect(sourceLabel("tostring")).toBe("tostring");
  });
});

describe("rankSources", () => {
  it("cumule les jours par source et campagne, trie par visites et calcule la part", () => {
    const { rows, total } = rankSources([
      { source: "direct", campaign: null, total: 3 },
      { source: "facebook", campaign: "lancement", total: 2 },
      { source: "facebook", campaign: "lancement", total: 4 },
      { source: "facebook", campaign: null, total: 1 },
      { source: null, campaign: null, total: 2 },
      { source: "google", campaign: null, total: null },
    ]);
    expect(total).toBe(12);
    expect(rows).toEqual([
      { source: "facebook", campaign: "lancement", total: 6, share: 0.5 },
      { source: "direct", campaign: null, total: 5, share: 5 / 12 },
      { source: "facebook", campaign: null, total: 1, share: 1 / 12 },
    ]);
  });

  it("rien sur la période : aucune ligne", () => {
    expect(rankSources([])).toEqual({ rows: [], total: 0 });
  });
});
