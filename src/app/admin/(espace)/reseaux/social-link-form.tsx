"use client";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { Switch } from "@/components/admin/switch";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { updateSocialLink } from "./actions";

export type EditableSocialLink = {
  id: string;
  network: string;
  name: string;
  handle: string;
  url: string;
  followers: number | null;
  updatedLabel: string | null;
  actionLabel: string;
  fallbackLabel: string | null;
  visible: boolean;
};

/** `orderControls` : boutons de déplacement (formulaires à part, rendus par la page). */
export function SocialLinkForm({ link, orderControls }: { link: EditableSocialLink; orderControls?: React.ReactNode }) {
  const { state, pending, onSubmit } = useAdminForm(updateSocialLink);
  const id = (field: string) => `${link.network}-${field}`;
  const error = (field: string) => state.fieldErrors[field];

  return (
    <section aria-labelledby={id("titre")} className="rounded-lg bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id("titre")} className="text-label">
          {link.name}
        </h2>
        {orderControls}
      </div>
      <p className="mt-1 text-xs text-muted">{link.updatedLabel ? `Compteur mis à jour le ${link.updatedLabel}` : "Compteur jamais mis à jour ici"}</p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
        <input type="hidden" name="id" value={link.id} />
        <Field
          id={id("followers")}
          name="followers"
          label="Nombre d’abonnés"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={link.followers ?? ""}
          hint="Le nombre complet, par exemple 340000. Laissez vide pour afficher le texte de remplacement."
          error={error("followers")}
        />
        <Field
          id={id("fallbackLabel")}
          name="fallbackLabel"
          label="Texte de remplacement (sans compteur)"
          defaultValue={link.fallbackLabel ?? ""}
          hint="Par exemple « Mes vidéos »."
          error={error("fallbackLabel")}
        />
        <Field id={id("actionLabel")} name="actionLabel" label="Texte sous le compteur" defaultValue={link.actionLabel} error={error("actionLabel")} />
        <Field id={id("handle")} name="handle" label="Pseudo" autoComplete="off" defaultValue={link.handle} error={error("handle")} />
        <Field
          id={id("url")}
          name="url"
          label="Lien du profil"
          type="url"
          inputMode="url"
          autoComplete="off"
          defaultValue={link.url}
          error={error("url")}
        />
        <Switch name="visible" label="Afficher sur le site" defaultChecked={link.visible} />

        <SubmitRow state={state} pending={pending} />
      </form>
    </section>
  );
}
