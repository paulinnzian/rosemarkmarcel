/** L'histoire, à la 1re personne : une colonne de lecture, le premier paragraphe mis en avant. */
export function AboutStory({ story }: { story: string[] }) {
  const [first, ...rest] = story;

  return (
    <div className="container-site pb-(--section-y)">
      <div className="max-w-prose space-y-5">
        <p className="text-lead font-semibold text-ink">{first}</p>
        {rest.map((paragraph, index) => (
          <p key={index} className="text-lead text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
