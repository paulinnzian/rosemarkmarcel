import { describe, expect, it } from "vitest";

import { donationSchema, headingSchema, httpsUrl } from "@/content/schema";

import { headingOf, linesOf, optionalTextOf, paragraphsOf } from "./form-values";

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

describe("lecture des champs", () => {
  it("linesOf : une entrée par ligne, lignes vides et espaces retirés", () => {
    expect(linesOf(form({ marquee: "  Rire ✦ \r\n\n Partager \n" }), "marquee")).toEqual(["Rire ✦", "Partager"]);
  });

  it("paragraphsOf : séparés par une ligne vide, retours simples recollés", () => {
    expect(paragraphsOf(form({ texte: "Premier\nparagraphe.\n\n  \nSecond 😄" }), "texte")).toEqual(["Premier paragraphe.", "Second 😄"]);
  });

  it("headingOf : lignes et couleur, vide = tout en noir", () => {
    expect(headingOf(form({ "h.lines": "Un\nDeux", "h.highlightFrom": "1" }), "h")).toEqual({ lines: ["Un", "Deux"], highlightFrom: 1 });
    expect(headingOf(form({ "h.lines": "Un", "h.highlightFrom": "" }), "h").highlightFrom).toBeNull();
  });

  it("optionalTextOf : absent ou espaces = null", () => {
    expect(optionalTextOf(form({ url: "   " }), "url")).toBeNull();
    expect(optionalTextOf(new FormData(), "url")).toBeNull();
  });
});

describe("règles du contenu", () => {
  it("titre : la couleur ne peut pas commencer après la dernière ligne", () => {
    const result = headingSchema.safeParse({ lines: ["Une seule ligne"], highlightFrom: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["highlightFrom"], message: "Le titre n’a pas assez de lignes pour cette couleur." });
  });

  it("titre : cinq lignes refusées, message lisible", () => {
    const result = headingSchema.safeParse({ lines: ["1", "2", "3", "4", "5"], highlightFrom: null });
    expect(result.error?.issues[0].message).toBe("Quatre lignes au plus.");
  });

  it("lien de paiement : http refusé, https accepté", () => {
    expect(httpsUrl.safeParse("http://paiement.exemple.test").success).toBe(false);
    expect(httpsUrl.safeParse("https://paiement.exemple.test/marcel").success).toBe(true);
  });

  it("dons : ouverture impossible sans lien", () => {
    const base = donationSchema.safeParse({
      enabled: true,
      paymentUrl: null,
      buttonLabel: "Soutenir",
      floatingLabel: "Me soutenir",
      texts: { kicker: "k", heading: { lines: ["t"], highlightFrom: null }, text: "t", cardTitle: ["a", "b"], cardText: "c", thanks: "m" },
      disabledModal: { kicker: "k", title: "t", text: "t", close: "Fermer" },
    });
    expect(base.error?.issues[0]).toMatchObject({ path: ["paymentUrl"], message: "Collez un lien de paiement avant d’activer les dons." });
  });
});
