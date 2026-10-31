import { z } from "zod";

import { httpsUrl, networkSchema } from "@/content/schema";

const required = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} : champ obligatoire.` })
    .max(max, { error: `${label} : ${max} caractères au plus.` });

// Champs communs à la modification et à l'ajout. Mêmes règles que la base (contraintes CHECK) et que le site.
const linkFields = {
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
};

const hasCounterOrFallback = (link: { followers: number | null; fallbackLabel: string | null }) => link.followers !== null || link.fallbackLabel !== null;
const fallbackRequired = {
  error: "Sans compteur, ajoutez un texte de remplacement (par exemple « Mes vidéos »).",
  path: ["fallbackLabel"],
};

/** Modification d'un réseau existant dans /admin/reseaux. */
export const socialLinkFormSchema = z.object({ id: z.uuid(), ...linkFields }).refine(hasCounterOrFallback, fallbackRequired);

/** Ajout d'un réseau : le réseau est choisi, l'identifiant vient de la base. */
export const newSocialLinkFormSchema = z
  .object({ network: z.enum(networkSchema.options, { error: "Choisissez un réseau." }), ...linkFields })
  .refine(hasCounterOrFallback, fallbackRequired);
