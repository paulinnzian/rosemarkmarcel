import { describe, expect, it } from "vitest";

import { frenchSpacing, withFrenchSpacing } from "./format";

const NBSP = "\u00a0";

describe("frenchSpacing", () => {
  it("lie la ponctuation haute et les guillemets au mot voisin par une espace insécable", () => {
    expect(frenchSpacing("Merci pour la force !")).toBe(`Merci pour la force${NBSP}!`);
    expect(frenchSpacing("C’est quoi, Le Repos ?")).toBe(`C’est quoi, Le Repos${NBSP}?`);
    expect(frenchSpacing("votre don : 5 %")).toBe(`votre don${NBSP}: 5 %`);
    expect(frenchSpacing("« Le Repos », mon concept ; la suite")).toBe(`«${NBSP}Le Repos${NBSP}», mon concept${NBSP}; la suite`);
  });

  it("ne touche ni une ponctuation déjà collée ni une adresse", () => {
    expect(frenchSpacing("Bonjour!")).toBe("Bonjour!");
    expect(frenchSpacing("https://exemple.test/a?b=c")).toBe("https://exemple.test/a?b=c");
  });
});

describe("withFrenchSpacing", () => {
  it("corrige tous les textes imbriqués, jamais les champs techniques", () => {
    const content = {
      heading: ["Écrivez-moi,", "je réponds !"],
      cta: { label: "Voir : la page", href: "/contact?x=1 :y" },
      contacts: [{ type: "email", value: "a@b.test", label: "Écrire : e-mail" }],
      page: { whatsappMessage: "Bonjour, une collaboration ?" },
      count: 3,
      empty: null,
    };
    expect(withFrenchSpacing(content)).toEqual({
      heading: ["Écrivez-moi,", `je réponds${NBSP}!`],
      cta: { label: `Voir${NBSP}: la page`, href: "/contact?x=1 :y" },
      contacts: [{ type: "email", value: "a@b.test", label: `Écrire${NBSP}: e-mail` }],
      page: { whatsappMessage: "Bonjour, une collaboration ?" },
      count: 3,
      empty: null,
    });
  });
});
