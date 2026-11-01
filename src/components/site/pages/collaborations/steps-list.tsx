type Block = { title: string; text: string };

/** Comment ça se passe : la seule numérotation du site, parce que c'est une vraie suite d'étapes. */
export function StepsList({ heading, steps }: { heading: string; steps: Block[] }) {
  return (
    <section aria-labelledby="etapes-titre" className="bg-tint">
      <div className="container-site section-y">
        <h2 id="etapes-titre" className="text-h2 text-balance">
          {heading}
        </h2>
        {/* role="list" : Safari retire la sémantique de liste quand list-style vaut none. */}
        <ol role="list" className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-ink pt-5">
              <span className="block text-count text-accent tabular-nums">{index + 1}</span>
              <h3 className="mt-3 text-label">{step.title}</h3>
              <p className="mt-2 max-w-prose text-base text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
