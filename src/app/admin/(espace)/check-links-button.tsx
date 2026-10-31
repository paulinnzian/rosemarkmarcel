"use client";

import { useFormStatus } from "react-dom";

import { buttonClasses } from "@/components/site/button-styles";

/** Bouton du formulaire « Vérifier maintenant » : la vérification prend quelques secondes. */
export function CheckLinksButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClasses("text", "mt-2")}>
      {pending ? "Vérification…" : "Vérifier maintenant"}
    </button>
  );
}
