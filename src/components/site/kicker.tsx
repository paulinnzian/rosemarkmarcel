import { Decorated } from "@/components/site/decorated";

type KickerProps = {
  children: string;
  /** Pastille orange devant le texte (héros). */
  withDot?: boolean;
  className?: string;
};

export function Kicker({ children, withDot = false, className = "text-ink" }: KickerProps) {
  return (
    <p className={`flex items-center gap-2.5 text-kicker uppercase ${className}`}>
      {withDot && <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-highlight" />}
      <span>
        <Decorated text={children} />
      </span>
    </p>
  );
}
