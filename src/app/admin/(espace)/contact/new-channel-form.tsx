"use client";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { Switch } from "@/components/admin/switch";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { addContactChannel } from "./actions";
import type { EditableChannel } from "./channel-form";

const NAMES = { whatsapp: "WhatsApp", phone: "Téléphone", email: "E-mail" } as const;

/** Ajout d'un moyen de contact ; `available` = les types pas encore présents. */
export function NewChannelForm({ available }: { available: EditableChannel["type"][] }) {
  const { state, pending, onSubmit } = useAdminForm(addContactChannel);
  const errors = state.fieldErrors;

  return (
    <section aria-labelledby="ajout-contact-titre" className="rounded-lg bg-surface p-6">
      <h2 id="ajout-contact-titre" className="text-label">
        Ajouter un moyen de contact
      </h2>
      <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ajout-contact-type" className="text-sm font-bold text-ink">
            Type
          </label>
          <select
            id="ajout-contact-type"
            name="type"
            defaultValue={available.length === 1 ? available[0] : ""}
            aria-invalid={errors.type ? true : undefined}
            aria-describedby={errors.type ? "ajout-contact-type-erreur" : undefined}
            className="h-12 rounded-sm border border-line-input bg-surface px-3 text-base text-ink hover:border-ink focus-visible:border-focus aria-invalid:border-danger"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {available.map((type) => (
              <option key={type} value={type}>
                {NAMES[type]}
              </option>
            ))}
          </select>
          {errors.type && (
            <p id="ajout-contact-type-erreur" className="text-xs font-bold text-danger">
              {errors.type}
            </p>
          )}
        </div>
        <Field
          id="ajout-contact-value"
          name="value"
          label="Numéro ou adresse e-mail"
          autoComplete="off"
          hint="Numéro avec l’indicatif du pays : +225 07 06 40 06 90."
          error={errors.value}
        />
        <Field id="ajout-contact-display" name="display" label="Texte affiché" hint="Tel qu’il apparaît sur la page." error={errors.display} />
        <Field id="ajout-contact-label" name="label" label="Texte du bouton" placeholder="Écrire à Marcel" error={errors.label} />
        <Switch name="visible" label="Afficher sur le site" defaultChecked />
        <SubmitRow state={state} pending={pending} label="Ajouter" pendingLabel="Ajout…" />
      </form>
    </section>
  );
}
