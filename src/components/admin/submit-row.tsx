"use client";

import { buttonClasses } from "@/components/site/button-styles";
import type { FormState } from "@/lib/admin/form-state";
import { useHydrated } from "@/lib/use-hydrated";

type SubmitRowProps = {
  state: FormState;
  pending: boolean;
  label?: string;
  pendingLabel?: string;
};

/** Bouton d'enregistrement et message de retour d'un formulaire de l'admin (annoncé aux lecteurs d'écran). */
export function SubmitRow({ state, pending, label = "Enregistrer", pendingLabel = "Enregistrement…" }: SubmitRowProps) {
  const ready = useHydrated();
  const isError = state.status === "error";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="submit" disabled={pending || !ready} className={buttonClasses("accent")}>
        {pending ? pendingLabel : label}
      </button>
      <p role={isError ? "alert" : "status"} className={`text-sm ${isError ? "font-bold text-danger" : "text-success"}`}>
        {state.message}
      </p>
    </div>
  );
}
