import { SiteChrome } from "@/components/site/site-chrome";

// Pages publiques : en-tête, pied de page et bouton de soutien épinglé sur chacune d'elles (jamais dans /admin).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
