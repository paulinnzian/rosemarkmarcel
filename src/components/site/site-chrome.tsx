import { FloatingSupport } from "@/components/site/floating-support";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteContent } from "@/lib/site-data";

/**
 * Habillage de toutes les pages publiques (layout du site et page 404) : lien d'évitement, en-tête, pied de page,
 * bouton de soutien épinglé, et l'espace réservé sous le contenu pour ce bouton.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const { creatorName, tagline, nav, footerLine, donation } = await getSiteContent();

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
      >
        Aller au contenu
      </a>
      <div className="pb-floating">
        <SiteHeader creatorName={creatorName} tagline={tagline} nav={nav} />
        {children}
        <SiteFooter creatorName={creatorName} footerLine={footerLine} />
      </div>
      <FloatingSupport donation={donation} />
    </>
  );
}
