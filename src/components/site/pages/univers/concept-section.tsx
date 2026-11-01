import { Decorated } from "@/components/site/decorated";

type ConceptSectionProps = {
  heading: string;
  paragraphs: string[];
};

/** Le concept en quelques lignes : une colonne de lecture courte, sous les épisodes. */
export function ConceptSection({ heading, paragraphs }: ConceptSectionProps) {
  return (
    <section aria-labelledby="concept-titre" className="bg-tint">
      <div className="container-site section-y grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <h2 id="concept-titre" className="text-h2 text-balance text-ink">
          <Decorated text={heading} />
        </h2>
        <div className="max-w-prose space-y-4 text-lead text-ink">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
