import { Fragment } from "react";

export function Band({ phrases }: { phrases: string[] }) {
  if (phrases.length === 0) return null;

  return (
    <div className="bg-accent text-on-accent">
      <p className="container-site flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-[22px] text-center text-sm font-bold uppercase tracking-[1px]">
        {phrases.map((phrase, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span aria-hidden="true" className="text-highlight">
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
