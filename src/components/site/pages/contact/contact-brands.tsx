import { CtaLink } from "@/components/site/cta-link";
import { FabricMotif } from "@/components/site/fabric-motif";
import type { Pages } from "@/content/schema";

type ContactBrandsProps = Pick<Pages["contact"], "brandsHeading" | "brandsText" | "brandsCta">;

/** Les marques n'ont pas à chercher : un renvoi vers la page Collaborations, sur la bande bleue du site. */
export function ContactBrands({ brandsHeading, brandsText, brandsCta }: ContactBrandsProps) {
  return (
    <section aria-labelledby="marques-titre">
      <FabricMotif />
      <div className="on-accent bg-accent text-on-accent">
        <div className="container-site section-y grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2 id="marques-titre" className="text-h2 text-balance">
              {brandsHeading}
            </h2>
            <p className="mt-4 max-w-prose text-lead">{brandsText}</p>
          </div>
          <div>
            <CtaLink cta={brandsCta} variant="primary" track="contact-collaborations" />
          </div>
        </div>
      </div>
    </section>
  );
}
