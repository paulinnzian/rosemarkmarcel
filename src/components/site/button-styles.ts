export type ButtonVariant = "primary" | "accent" | "text";

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-150 ease-brand disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "min-h-[54px] rounded-sm bg-highlight px-[18px] py-[17px] text-on-highlight hover:bg-highlight-hover active:translate-y-px lg:px-6",
  accent:
    "min-h-[54px] rounded-sm bg-accent px-[18px] py-[17px] text-on-accent hover:bg-accent-hover active:translate-y-px lg:px-6",
  text: "min-h-11 py-[15px] pr-[15px] text-ink decoration-accent decoration-2 underline-offset-4 hover:underline",
};

export function buttonClasses(variant: ButtonVariant, extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}
