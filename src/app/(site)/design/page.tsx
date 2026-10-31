import type { Metadata } from "next";

import { Field } from "@/components/admin/field";
import { Switch } from "@/components/admin/switch";
import { Band } from "@/components/site/band";
import { buttonClasses } from "@/components/site/button-styles";
import { ConceptCard } from "@/components/site/concept-card";
import { HeroPhoto } from "@/components/site/hero-photo";
import { Kicker } from "@/components/site/kicker";
import { SectionHeading } from "@/components/site/section-heading";
import { SocialCard } from "@/components/site/social-card";
import { SupportButton } from "@/components/site/support-button";
import { seedContent } from "@/content";
import type { Donation } from "@/content/schema";
import { whatsappHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Design",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "canvas (bg)", className: "bg-canvas", hex: "#F9F8F2" },
  { name: "surface", className: "bg-surface", hex: "#FFFFFF" },
  { name: "tint", className: "bg-tint", hex: "#E9F1F6" },
  { name: "line", className: "bg-line", hex: "#DDDDD7" },
  { name: "line-input", className: "bg-line-input", hex: "#7C7C8E" },
  { name: "ink (text)", className: "bg-ink", hex: "#171744" },
  { name: "muted", className: "bg-muted", hex: "#5C5C70" },
  { name: "accent", className: "bg-accent", hex: "#2025B9" },
  { name: "highlight", className: "bg-highlight", hex: "#FF9718" },
  { name: "sky (décor)", className: "bg-sky", hex: "#2AA3DC" },
  { name: "danger", className: "bg-danger", hex: "#B42318" },
  { name: "success", className: "bg-success", hex: "#067647" },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-6 text-kicker uppercase text-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignPage() {
  const content = seedContent;
  const disabledDonation = content.donation;
  const enabledDonation: Donation = { ...content.donation, enabled: true, paymentUrl: "https://example.com/paiement-exemple" };
  const whatsapp = content.contacts.find((contact) => contact.type === "whatsapp");
  const phone = content.contacts.find((contact) => contact.type === "phone");
  const withoutCounts = content.socials.map((link) =>
    link.followers === null ? link : { ...link, followers: null, fallbackLabel: "Me suivre", fallbackSublabel: link.actionLabel },
  );

  return (
    <>
      <main id="contenu" className="container-site py-10">
        <Kicker withDot>Système de design · tokens + composants</Kicker>
        <h1 className="mt-4 text-h2">Primitives du site</h1>
        <p className="mt-3 max-w-prose text-base text-muted">
          Page de contrôle (non indexée). Chaque composant dans ses états, avec les tokens de replica/design/tokens.json.
        </p>

        <Block title="Couleurs (rôles)">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {swatches.map((swatch) => (
              <li key={swatch.name} className="overflow-hidden rounded-md border border-line bg-surface">
                <span className={`block h-14 ${swatch.className}`} />
                <span className="block px-3 py-2 text-xs">
                  <strong className="block">{swatch.name}</strong>
                  <span className="text-muted">{swatch.hex}</span>
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Typographie">
          <div className="space-y-6">
            <p className="text-h1" aria-hidden="true">
              <span className="block">{content.hero.heading.lines[0]}</span>
              <span className="block text-accent">{content.hero.heading.lines.slice(1).join(" ")}</span>
            </p>
            <SectionHeading as="h2" heading={content.about.heading} />
            <p className="text-count">340 K</p>
            <p className="text-tel">+225 07 06 40 06 90</p>
            <p className="max-w-prose text-lead text-muted">{content.hero.intro}</p>
            <p className="max-w-prose text-base text-muted">{content.about.paragraphs[0]}</p>
            <p className="text-xs text-muted">Texte xs · 12px · notes et légendes</p>
            <div className="flex flex-wrap gap-6">
              <Kicker withDot>{content.roleLine}</Kicker>
              <Kicker>{content.about.kicker}</Kicker>
              <Kicker>{content.community.kicker}</Kicker>
            </div>
          </div>
        </Block>

        <Block title="Boutons">
          <div className="flex flex-wrap items-center gap-4">
            <a href="#communaute" className={buttonClasses("primary")}>
              Entrez dans l’univers <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className={buttonClasses("accent")}>
              Bouton accent
            </button>
            <a href="#contact" className={buttonClasses("text")}>
              Retrouvez-moi sur les réseaux <span aria-hidden="true">↗</span>
            </a>
            <button type="button" disabled className={buttonClasses("primary")}>
              Désactivé
            </button>
          </div>
        </Block>

        <Block title="Bouton de soutien · dons désactivés (modale) / dons activés (lien)">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-md border border-line bg-surface p-5">
              <p className="text-xs text-muted">Lien vide : ouvre « Les dons arrivent bientôt »</p>
              <SupportButton donation={disabledDonation} variant="hero" />
              <SupportButton donation={disabledDonation} variant="section" />
              <SupportButton donation={disabledDonation} variant="floating" />
            </div>
            <div className="space-y-3 rounded-md border border-line bg-surface p-5">
              <p className="text-xs text-muted">Lien collé dans l’admin : ouvre le paiement</p>
              <SupportButton donation={enabledDonation} variant="hero" />
              <SupportButton donation={enabledDonation} variant="section" />
              <SupportButton donation={enabledDonation} variant="floating" />
            </div>
          </div>
        </Block>

        <Block title="Photo détourée + étiquette">
          <div className="max-w-md lg:max-w-lg">
            <HeroPhoto photo={content.photo} label={content.photoLabel} fallbackText={content.creatorName} />
          </div>
        </Block>
      </main>

      <Band phrases={content.marquee} />

      <div className="container-site">
        <Block title="Cartes réseaux · avec compteur / sans compteur">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {content.socials.map((link) => (
              <SocialCard key={link.network} link={link} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">{content.community.countersSourceLabel} · Synchronisation automatique non activée.</p>
          <p className="mb-3 mt-8 text-xs text-muted">État : aucun compteur renseigné</p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {withoutCounts.map((link) => (
              <SocialCard key={link.network} link={link} />
            ))}
          </div>
        </Block>

        <Block title="Carte du concept">
          <div className="max-w-xl">
            <ConceptCard lines={content.universe.cardText} />
          </div>
        </Block>

        <Block title="Bloc de don">
          <div className="on-accent grid gap-6 rounded-lg bg-accent p-6 lg:grid-cols-2 lg:p-[58px]">
            <div>
              <Kicker className="text-highlight">{content.donation.texts.kicker}</Kicker>
              <div className="mt-4">
                <SectionHeading as="h2" heading={content.donation.texts.heading} className="text-on-accent" />
              </div>
              <p className="mt-4 max-w-prose text-base text-on-accent">{content.donation.texts.text}</p>
            </div>
            <div className="rounded-md bg-surface p-7 text-ink">
              <p className="text-label">
                <span className="block">{content.donation.texts.cardTitle[0]}</span>
                <span className="block">{content.donation.texts.cardTitle[1]}</span>
              </p>
              <p className="mb-6 mt-2 text-xs text-muted">{content.donation.texts.cardText}</p>
              <SupportButton donation={disabledDonation} variant="section" />
              <p className="mt-4 text-center text-xs text-muted">{content.donation.texts.thanks}</p>
            </div>
          </div>
        </Block>

        <Block title="Contact">
          <div className="flex flex-col items-start gap-4">
            {whatsapp?.type === "whatsapp" && (
              <a href={whatsappHref(whatsapp.value, whatsapp.prefilledMessage)} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary")}>
                Discuter sur WhatsApp <span aria-hidden="true">↗</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.value}`} className="inline-flex min-h-11 items-center text-tel">
                {phone.display}
              </a>
            )}
            <p className="text-xs text-muted">{content.contact.note}</p>
          </div>
        </Block>

        <Block title="Admin · champs et interrupteurs">
          <form className="grid max-w-xl gap-6">
            <Field id="lien-paiement" label="Lien de paiement" type="url" inputMode="url" placeholder="https://…" hint="Le lien que vous donne votre service de paiement (Wave, Orange Money…)." />
            <Field id="lien-invalide" label="Lien de paiement (erreur)" type="url" defaultValue="http://lien-non-securise" error="Le lien doit commencer par https://" />
            <Field id="champ-desactive" label="Compteur synchronisé" defaultValue="340 000" disabled />
            <Switch label="Activer les dons" description="Le bouton « Soutenir » ouvrira le lien de paiement." />
            <Switch label="Afficher YouTube" defaultChecked />
          </form>
        </Block>
      </div>

    </>
  );
}
