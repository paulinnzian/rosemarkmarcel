import type { z } from "zod";

/** Retour d'une action de formulaire de l'admin (useActionState). */
export type FormState = {
  status: "idle" | "saved" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const idleForm: FormState = { status: "idle", message: null, fieldErrors: {} };

/**
 * Première erreur de chaque champ, pour l'afficher sous le champ concerné.
 * Clé = chemin complet séparé par des points (« texts.heading.lines »), le même que le `name` du champ.
 */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
