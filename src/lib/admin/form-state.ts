import type { z } from "zod";

/** Retour d'une action de formulaire de l'admin (useActionState). */
export type FormState = {
  status: "idle" | "saved" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const idleForm: FormState = { status: "idle", message: null, fieldErrors: {} };

/** Première erreur de chaque champ, pour l'afficher sous le champ concerné. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
