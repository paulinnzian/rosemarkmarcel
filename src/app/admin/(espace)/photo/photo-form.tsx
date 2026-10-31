"use client";

import { useEffect, useState } from "react";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { buttonClasses } from "@/components/site/button-styles";
import { useAdminForm } from "@/lib/admin/use-admin-form";
import { useHydrated } from "@/lib/use-hydrated";

import { updatePhoto } from "./actions";

type PhotoFormProps = { alt: string; isCustom: boolean };

export function PhotoForm({ alt, isCustom }: PhotoFormProps) {
  const { state, pending, onSubmit } = useAdminForm(updatePhoto);
  const ready = useHydrated();
  const [preview, setPreview] = useState<string | null>(null);
  const photoError = state.fieldErrors.photo;

  // Libère l'aperçu local quand il change ou quand le formulaire disparaît.
  useEffect(() => (preview ? () => URL.revokeObjectURL(preview) : undefined), [preview]);

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-lg bg-surface p-6" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo-fichier" className="text-sm font-bold text-ink">
          Nouvelle photo
        </label>
        <input
          id="photo-fichier"
          name="photo"
          type="file"
          accept="image/png,image/webp,image/jpeg"
          aria-describedby={photoError ? "photo-fichier-aide photo-fichier-erreur" : "photo-fichier-aide"}
          aria-invalid={photoError ? true : undefined}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="text-sm text-ink file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-pill file:border-0 file:bg-tint file:px-5 file:font-bold file:text-ink"
        />
        <p id="photo-fichier-aide" className="text-xs text-muted">
          PNG ou WebP détouré (fond transparent) de préférence, 5 Mo au plus. Laissez vide pour ne changer que le texte.
        </p>
        {photoError && (
          <p id="photo-fichier-erreur" className="text-xs font-bold text-danger">
            {photoError}
          </p>
        )}
      </div>

      {preview && (
        <figure className="grid gap-2">
          {/* Aperçu local du fichier choisi, avant l'envoi : next/image ne sert pas les adresses blob:. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-80 w-auto self-start rounded-md bg-tint" />
          <figcaption className="text-xs text-muted">Aperçu du fichier choisi (pas encore enregistré).</figcaption>
        </figure>
      )}

      <Field
        id="photo-alt"
        name="alt"
        label="Description de la photo"
        defaultValue={alt}
        hint="Lue à voix haute pour les personnes aveugles. Décrivez ce qu’on voit en une phrase."
        error={state.fieldErrors.alt}
      />

      <SubmitRow state={state} pending={pending} label="Enregistrer la photo" pendingLabel="Envoi…" />

      {isCustom && (
        <button type="submit" name="intent" value="reset" disabled={pending || !ready} className={buttonClasses("text", "justify-self-start")}>
          Revenir à la photo livrée avec le site
        </button>
      )}
    </form>
  );
}
