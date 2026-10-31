"use client";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { Switch } from "@/components/admin/switch";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { addSocialLink } from "./actions";

/** Ajout d'un réseau ; `available` = les réseaux pas encore présents (un seul par réseau). */
export function NewSocialLinkForm({ available }: { available: { network: string; name: string }[] }) {
  const { state, pending, onSubmit } = useAdminForm(addSocialLink);
  const errors = state.fieldErrors;

  return (
    <section aria-labelledby="ajout-titre" className="rounded-lg bg-surface p-6">
      <h2 id="ajout-titre" className="text-label">
        Ajouter un réseau
      </h2>
      <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ajout-network" className="text-sm font-bold text-ink">
            Réseau
          </label>
          <select
            id="ajout-network"
            name="network"
            defaultValue=""
            aria-invalid={errors.network ? true : undefined}
            aria-describedby={errors.network ? "ajout-network-erreur" : undefined}
            className="h-12 rounded-sm border border-line-input bg-surface px-3 text-base text-ink hover:border-ink focus-visible:border-focus aria-invalid:border-danger"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {available.map((option) => (
              <option key={option.network} value={option.network}>
                {option.name}
              </option>
            ))}
          </select>
          {errors.network && (
            <p id="ajout-network-erreur" className="text-xs font-bold text-danger">
              {errors.network}
            </p>
          )}
        </div>
        <Field id="ajout-handle" name="handle" label="Pseudo" autoComplete="off" error={errors.handle} />
        <Field id="ajout-url" name="url" label="Lien du profil" type="url" inputMode="url" autoComplete="off" placeholder="https://…" error={errors.url} />
        <Field
          id="ajout-followers"
          name="followers"
          label="Nombre d’abonnés"
          inputMode="numeric"
          autoComplete="off"
          hint="Laissez vide pour afficher un texte à la place du compteur."
          error={errors.followers}
        />
        <Field id="ajout-fallbackLabel" name="fallbackLabel" label="Texte de remplacement (sans compteur)" error={errors.fallbackLabel} />
        <Field id="ajout-actionLabel" name="actionLabel" label="Texte sous le compteur" placeholder="Rejoindre la communauté" error={errors.actionLabel} />
        <Switch name="visible" label="Afficher sur le site" defaultChecked />
        <SubmitRow state={state} pending={pending} label="Ajouter" pendingLabel="Ajout…" />
      </form>
    </section>
  );
}
