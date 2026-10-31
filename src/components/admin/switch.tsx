import type { InputHTMLAttributes } from "react";

type SwitchProps = {
  label: string;
  description?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role" | "className">;

/** Interrupteur accessible : une vraie case à cocher (role=switch) sous une piste dessinée. */
export function Switch({ label, description, ...inputProps }: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-bold text-ink">
        {label}
        {description && <span className="block text-xs font-normal text-muted">{description}</span>}
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" {...inputProps} />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-pill bg-line-input transition-colors duration-150 peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-focus peer-disabled:opacity-50 peer-checked:[&>span]:translate-x-5"
      >
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-surface transition-transform duration-150" />
      </span>
    </label>
  );
}
