import type { Pages } from "@/content/schema";

type AboutValuesProps = Pick<Pages["about"], "valuesHeading" | "values">;

/** Les valeurs : une liste typographique (titre fort, texte en regard), pas une grille de cartes. */
export function AboutValues({ valuesHeading, values }: AboutValuesProps) {
  return (
    <section aria-labelledby="valeurs-titre" className="bg-surface">
      <div className="container-site section-y">
        <h2 id="valeurs-titre" className="text-h2 text-balance text-ink">
          {valuesHeading}
        </h2>
        <ul className="mt-10 divide-y divide-line border-y border-line lg:mt-14">
          {values.map((value, index) => (
            <li key={index} className="grid gap-3 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-baseline lg:gap-16 lg:py-10">
              <h3 className="text-count text-balance text-accent">{value.title}</h3>
              <p className="max-w-prose text-lead text-muted">{value.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
