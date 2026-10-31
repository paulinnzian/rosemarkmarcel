import { z } from "zod";

import { httpsUrl } from "@/content/schema";

const required = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} : champ obligatoire.` })
    .max(max, { error: `${label} : ${max} caractères au plus.` });

/** Formulaire d'un réseau dans /admin/reseaux. Mêmes règles que la base (contraintes CHECK) et que le site. */
export const socialLinkFormSchema = z
  .object({
    id: z.uuid(),
    handle: required("Pseudo", 60),
    url: httpsUrl,
    // « 340 000 », « 340000 » ou « 340.000 » ; vide = carte sans compteur. \s couvre les espaces insécables.
    followers: z
      .string()
      .trim()
      .regex(/^[\d\s.]*$/, { error: "Entrez le nombre complet en chiffres, par exemple 340000." })
      .transform((value) => {
        const digits = value.replace(/\D/g, "");
        return digits === "" ? null : Number(digits);
      }),
    actionLabel: required("Texte sous le compteur", 60),
    fallbackLabel: z
      .string()
      .trim()
      .max(40, { error: "Texte de remplacement : 40 caractères au plus." })
      .transform((value) => value || null),
    visible: z.boolean(),
  })
  .refine((link) => link.followers !== null || link.fallbackLabel !== null, {
    error: "Sans compteur, ajoutez un texte de remplacement (par exemple « Mes vidéos »).",
    path: ["fallbackLabel"],
  });
