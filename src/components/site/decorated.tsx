const DECOR = /([♡↗✦])/u;

/** Rend les symboles décoratifs du template (♡ ↗ ✦) invisibles pour les lecteurs d'écran. */
export function Decorated({ text }: { text: string }) {
  return text.split(DECOR).map((part, index) =>
    DECOR.test(part) ? (
      <span key={index} aria-hidden="true">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
