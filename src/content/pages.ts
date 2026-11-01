import { seedContent } from "@/content";
import { pagesSchema, type Pages } from "@/content/schema";

/**
 * Textes des pages lus en base, complétés page par page et champ par champ par les valeurs initiales :
 * une base enregistrée avant l'ajout d'une page (ou d'un champ) reste valide au lieu de faire servir tout le
 * contenu initial. Une page encore invalide après complément (ancienne forme d'un bloc) reprend ses valeurs
 * initiales, seule : les autres pages et le reste du site gardent leurs textes.
 */
export function mergePages(stored: unknown): Pages {
  const saved = (stored !== null && typeof stored === "object" ? stored : {}) as Partial<Record<keyof Pages, object>>;
  const seed = seedContent.pages;

  function page<K extends keyof Pages>(key: K): Pages[K] {
    const result = pagesSchema.shape[key].safeParse({ ...seed[key], ...saved[key] });
    if (result.success) return result.data as Pages[K];
    console.error(`Textes de la page « ${key} » invalides en base, valeurs initiales servies :`, result.error.issues);
    return seed[key];
  }

  return { about: page("about"), universe: page("universe"), community: page("community"), collaborations: page("collaborations") };
}
