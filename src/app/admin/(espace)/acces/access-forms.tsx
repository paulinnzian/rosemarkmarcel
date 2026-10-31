"use client";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { buttonClasses } from "@/components/site/button-styles";
import { useAdminForm } from "@/lib/admin/use-admin-form";
import { useHydrated } from "@/lib/use-hydrated";

import { addEditor, removeEditor } from "./actions";

export function AddEditorForm() {
  const { state, pending, onSubmit } = useAdminForm(addEditor);

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
      <Field
        id="acces-email"
        name="email"
        label="Adresse e-mail du gestionnaire"
        type="email"
        inputMode="email"
        autoComplete="off"
        hint="Cette personne pourra tout modifier, sauf les accès. Elle se connecte avec un code reçu à cette adresse."
        error={state.fieldErrors.email}
      />
      <SubmitRow state={state} pending={pending} label="Donner l’accès" pendingLabel="Ajout…" />
    </form>
  );
}

/** Retrait en deux temps : le bouton déplie une confirmation, rien ne part sur un seul clic. */
export function RemoveEditorForm({ userId, email }: { userId: string; email: string }) {
  const { state, pending, onSubmit } = useAdminForm(removeEditor);
  const ready = useHydrated();

  if (state.status === "saved") {
    return (
      <p role="status" className="text-sm font-bold text-success">
        {state.message}
      </p>
    );
  }

  return (
    <details className="text-sm">
      <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-danger underline underline-offset-4">Retirer l’accès</summary>
      <form onSubmit={onSubmit} className="mt-2 grid gap-3 rounded-md border border-line p-4">
        <input type="hidden" name="userId" value={userId} />
        <p>
          {email} ne pourra plus se connecter et ses sessions ouvertes seront fermées.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending || !ready} className={buttonClasses("primary")}>
            {pending ? "Retrait…" : "Confirmer le retrait"}
          </button>
          <p role={state.status === "error" ? "alert" : "status"} className={state.status === "error" ? "font-bold text-danger" : "text-success"}>
            {state.message}
          </p>
        </div>
      </form>
    </details>
  );
}
