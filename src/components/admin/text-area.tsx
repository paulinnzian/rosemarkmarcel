import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

/** Même contrat que Field, pour les textes sur plusieurs lignes. */
export function TextArea({ id, label, hint, error, rows = 4, ...textareaProps }: TextAreaProps) {
  const hintId = hint ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="rounded-sm border border-line-input bg-surface px-3.5 py-3 text-base text-ink placeholder:text-muted hover:border-ink focus-visible:border-focus disabled:cursor-not-allowed disabled:bg-tint disabled:text-muted aria-invalid:border-danger"
        {...textareaProps}
      />
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
