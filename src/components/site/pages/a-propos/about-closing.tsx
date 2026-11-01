import { CtaLink } from "@/components/site/cta-link";
import { FabricMotif } from "@/components/site/fabric-motif";
import type { Pages } from "@/content/schema";

type AboutClosingProps = Pick<Pages["about"], "closing" | "closingCta">;

/** Conclusion : le mot de la fin et le chemin vers la communauté, sur la bande bleue du site. */
export function AboutClosing({ closing, closingCta }: AboutClosingProps) {
  return (
    <section aria-labelledby="conclusion-titre">
      <FabricMotif />
      <div className="on-accent bg-accent text-on-accent">
        <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <h2 id="conclusion-titre" className="max-w-[22ch] text-h2 text-balance">
            {closing}
          </h2>
          <div>
            <CtaLink cta={closingCta} variant="primary" track="a-propos-communaute" />
          </div>
        </div>
      </div>
    </section>
  );
}
