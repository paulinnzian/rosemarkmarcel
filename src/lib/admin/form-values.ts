import type { Heading } from "@/content/schema";

// Lecture des champs des formulaires de l'admin. Aucune validation ici : le schéma Zod du contenu s'en charge,
// ces fonctions ne font que remettre le texte saisi dans la forme attendue.

export function textOf(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/** Texte facultatif : vide = null. */
export function optionalTextOf(formData: FormData, name: string): string | null {
  return textOf(formData, name) || null;
}

/** Une entrée par ligne (titres, bandeau). Les lignes vides sont ignorées. */
export function linesOf(formData: FormData, name: string): string[] {
  return textOf(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Paragraphes séparés par une ligne vide. */
export function paragraphsOf(formData: FormData, name: string): string[] {
  return textOf(formData, name)
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Champs `${name}.lines` et `${name}.highlightFrom` de HeadingField. */
export function headingOf(formData: FormData, name: string): Heading {
  const highlight = textOf(formData, `${name}.highlightFrom`);
  return { lines: linesOf(formData, `${name}.lines`), highlightFrom: highlight === "" ? null : Number(highlight) };
}

export function checkedOf(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}
