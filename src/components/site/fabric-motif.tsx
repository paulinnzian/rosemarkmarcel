import { useId } from "react";

type FabricMotifProps = {
  /** Hauteur et placement ; la largeur suit le conteneur. Par défaut, une bande d'un rang de motifs. */
  className?: string;
  /** Côté d'un motif en px : la bande en montre un rang entier, le héros de grands motifs. */
  tile?: number;
};

/**
 * Le « tissu du Repos » : motif dessiné d'après la chemise de Marcel (blocs bleus, triangles en escalier orange,
 * rayures et rangées de points), répété sur toute la largeur. Purement décoratif.
 */
export function FabricMotif({ className = "h-8", tile = 32 }: FabricMotifProps) {
  // useId contient des caractères (« : », « « ») que url(#…) ne résout pas partout.
  const id = `tissu-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg aria-hidden="true" focusable="false" className={`block w-full ${className}`} preserveAspectRatio="xMinYMin slice">
      <defs>
        <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse" patternTransform={`scale(${tile / 96})`}>
          <rect width="96" height="96" fill="var(--surface)" />
          {/* Bloc bleu pointillé */}
          <rect width="48" height="48" fill="var(--accent)" />
          {[8, 20, 32, 44].map((y) => [8, 20, 32, 44].map((x) => <circle key={`${x}-${y}`} cx={x - 2} cy={y - 2} r="2" fill="var(--decor-sky)" />))}
          {/* Rayures */}
          <rect x="48" y="6" width="48" height="5" fill="var(--accent)" />
          <rect x="48" y="16" width="48" height="3" fill="var(--decor-sky)" />
          <rect x="48" y="24" width="48" height="5" fill="var(--accent)" />
          {[54, 66, 78, 90].map((x) => <circle key={x} cx={x} cy="38" r="2.5" fill="var(--highlight)" />)}
          {/* Triangles en escalier */}
          <path d="M0 96V84h8v-8h8v-8h8v-8h8v-8h8v-4h8v52Z" fill="var(--highlight)" />
          <rect x="48" y="48" width="48" height="48" fill="var(--decor-sky)" />
          <path d="M48 96V84h8v-8h8v-8h8v-8h8v-8h8v-4h8v52Z" fill="var(--accent)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
