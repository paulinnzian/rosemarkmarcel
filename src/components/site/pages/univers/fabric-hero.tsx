import { FabricMotif } from "@/components/site/fabric-motif";

/**
 * Le tissu du Repos en grand, à côté du titre : la seule page où le motif porte le héros. Une seule entrée
 * à l'arrivée (fondu et léger glissement), supprimée quand le visiteur limite les animations.
 */
export function FabricHero() {
  return (
    <div className="radius-photo overflow-hidden motion-safe:transition-[opacity,translate] motion-safe:duration-500 motion-safe:ease-brand motion-safe:starting:translate-y-3 motion-safe:starting:opacity-0">
      <FabricMotif className="h-24 sm:h-72 lg:h-120" tile={96} />
    </div>
  );
}
