"use client";

import { useActionState } from "react";

import { Field } from "@/components/admin/field";
import { buttonClasses } from "@/components/site/button-styles";
import { useHydrated } from "@/lib/use-hydrated";

import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { step: "email", email: "", message: null, error: false };

// Rendu dans la coquille statique de la page (sans Suspense autour) : ce qui est tapé avant l'hydratation est conservé.
export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, initialState);
  // Envoyé avant le chargement du JavaScript (téléphone lent), le formulaire partirait sans que la réponse s'affiche :
  // les boutons restent inactifs jusque-là (et la touche Entrée aussi, le bouton par défaut étant inactif).
  const ready = useHydrated();
  const busy = pending || !ready;

  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message && (
        <p role={state.error ? "alert" : "status"} className={`text-sm ${state.error ? "font-bold text-danger" : "text-ink"}`}>
          {state.message}
        </p>
      )}

      {state.step === "email" ? (
        <>
          <Field
            id="email"
            name="email"
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={state.email}
            hint="Vous recevrez un code à 6 chiffres et un lien de connexion."
          />
          <button type="submit" name="intent" value="send" disabled={busy} className={buttonClasses("primary", "w-full")}>
            {pending ? "Envoi…" : "Recevoir mon code"}
          </button>
        </>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email} />
          <Field
            id="code"
            name="code"
            label="Code reçu par e-mail"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            hint={`Envoyé à ${state.email}. Vous pouvez aussi toucher le lien de l’e-mail.`}
          />
          <button type="submit" name="intent" value="verify" disabled={busy} className={buttonClasses("primary", "w-full")}>
            {pending ? "Vérification…" : "Se connecter"}
          </button>
          <button type="submit" name="intent" value="restart" formNoValidate disabled={busy} className={buttonClasses("text")}>
            Changer d’adresse ou renvoyer un code
          </button>
        </>
      )}
    </form>
  );
}
