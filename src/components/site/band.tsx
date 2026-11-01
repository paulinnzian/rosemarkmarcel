import { Fragment } from "react";

export function Band({ phrases }: { phrases: string[] }) {
  if (phrases.length === 0) return null;

  return (
    <div className="bg-accent text-on-accent">
      <p className="container-site flex flex-col items-center justify-center gap-x-6 gap-y-1.5 py-[22px] sm:flex-row sm:flex-wrap sm:gap-y-2 text-center text-sm font-bold uppercase tracking-[1px]">
        {phrases.map((phrase, index) => (
          <Fragment key={index}>
            {index > 0 && (
              // Sur téléphone, une phrase par ligne : le séparateur ne finit jamais seul en bout de ligne.
              <span aria-hidden="true" className="hidden text-highlight sm:inline">
                ✦
              </span>
            )}
            <span>{phrase}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
