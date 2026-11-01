import { describe, expect, it, vi } from "vitest";

import { seedContent } from "@/content";
import { mergePages } from "@/content/pages";

describe("mergePages", () => {
  it("sert les valeurs initiales quand la base n'a pas encore de pages", () => {
    expect(mergePages(undefined)).toEqual(seedContent.pages);
  });

  it("garde les textes enregistrés et complète les champs ajoutés depuis", () => {
    const older: Partial<typeof seedContent.pages.universe> = { ...seedContent.pages.universe };
    delete older.conceptHeading;
    const pages = mergePages({ universe: { ...older, intro: "Texte modifié dans l'admin." } });
    expect(pages.universe.intro).toBe("Texte modifié dans l'admin.");
    expect(pages.universe.conceptHeading).toBe(seedContent.pages.universe.conceptHeading);
  });

  it("une page invalide reprend ses valeurs initiales sans toucher aux autres", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const pages = mergePages({
      community: { support: [{ title: "Ancienne forme", text: "tableau" }] },
      about: { intro: "Présentation modifiée." },
    });
    expect(pages.community).toEqual(seedContent.pages.community);
    expect(pages.about.intro).toBe("Présentation modifiée.");
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });
});
