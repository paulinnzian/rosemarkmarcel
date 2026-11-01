type Block = { title: string; text: string };

/** Les formats proposés : une liste de définitions en deux colonnes (titre, description), pas une grille de cartes. */
export function FormatsList({ heading, formats }: { heading: string; formats: Block[] }) {
  return (
    <section aria-labelledby="formats-titre" className="border-t border-line">
      <div className="container-site section-y">
        <h2 id="formats-titre" className="max-w-[18ch] text-h2 text-balance">
          {heading}
        </h2>
        <dl className="mt-10 border-t-2 border-ink">
          {formats.map((format) => (
            <div key={format.title} className="grid gap-2 border-b border-line py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
              <dt className="text-label">{format.title}</dt>
              <dd className="max-w-prose text-base text-muted">{format.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
