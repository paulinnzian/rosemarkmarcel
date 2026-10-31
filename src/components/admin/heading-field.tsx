import type { Heading } from "@/content/schema";

import { TextArea } from "./text-area";

type HeadingFieldProps = {
  /** Préfixe des champs : `${name}.lines` et `${name}.highlightFrom` (lus par headingOf). */
  name: string;
  idPrefix: string;
  label: string;
  heading: Heading;
  errors: Record<string, string>;
};

/** Titre de section : une ligne par retour à la ligne, et la ligne à partir de laquelle il passe en orange. */
export function HeadingField({ name, idPrefix, label, heading, errors }: HeadingFieldProps) {
  const selectId = `${idPrefix}-couleur`;
  const highlightError = errors[`${name}.highlightFrom`];

  return (
    <fieldset className="grid gap-3 rounded-md border border-line p-4">
      <legend className="px-1 text-sm font-bold text-ink">{label}</legend>
      <TextArea
        id={`${idPrefix}-lignes`}
        name={`${name}.lines`}
        label="Texte du titre"
        rows={Math.max(2, heading.lines.length)}
        defaultValue={heading.lines.join("\n")}
        hint="Une ligne par retour à la ligne, quatre au plus."
        error={errors[`${name}.lines`]}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-bold text-ink">
          Couleur orange
        </label>
        <select
          id={selectId}
          name={`${name}.highlightFrom`}
          defaultValue={heading.highlightFrom === null ? "" : String(heading.highlightFrom)}
          aria-invalid={highlightError ? true : undefined}
          aria-describedby={highlightError ? `${selectId}-erreur` : undefined}
          className="h-12 rounded-sm border border-line-input bg-surface px-3 text-base text-ink hover:border-ink focus-visible:border-focus aria-invalid:border-danger"
        >
          <option value="">Tout le titre en noir</option>
          <option value="1">Orange à partir de la ligne 2</option>
          <option value="2">Orange à partir de la ligne 3</option>
          <option value="3">Orange à partir de la ligne 4</option>
        </select>
        {highlightError && (
          <p id={`${selectId}-erreur`} className="text-xs font-bold text-danger">
            {highlightError}
          </p>
        )}
      </div>
    </fieldset>
  );
}
