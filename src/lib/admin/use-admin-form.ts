"use client";

import { startTransition, useActionState, type FormEvent } from "react";

import { idleForm, type FormState } from "./form-state";

/**
 * useActionState pour les formulaires de l'admin, sans la remise à zéro automatique de React 19 : passée par
 * `<form action>`, une action réinitialise tous les champs à leur valeur initiale, même quand elle renvoie une erreur
 * de validation, et la saisie est perdue (BUG-003). Ici l'envoi passe par onSubmit, les champs gardent ce qui a été tapé.
 * Le bouton cliqué (name/value, par exemple intent=reset) est transmis avec les champs.
 */
export function useAdminForm(serverAction: (previous: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(serverAction, idleForm);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit };
}
