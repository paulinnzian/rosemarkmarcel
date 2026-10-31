import type { InputHTMLAttributes } from "react";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export function Field({ id, label, hint, error, ...inputProps }: FieldProps) {
  const hintId = hint ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="h-12 rounded-sm border border-line-input bg-surface px-3.5 text-base text-ink placeholder:text-muted hover:border-ink focus-visible:border-focus disabled:cursor-not-allowed disabled:bg-tint disabled:text-muted aria-invalid:border-danger"
        {...inputProps}
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
