import type { Metadata } from "next";
import Link from "next/link";

import { Kicker } from "@/components/site/kicker";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Ce que le site enregistre quand vous le visitez, et ce qu’il n’enregistre pas.",
};

// Doit rester vrai : à relire à chaque changement de la route /api/evenements, des prestataires ou de la purge.
export default function ConfidentialitePage() {
  return (
    <main id="contenu" className="container-site section-y">
      <Kicker withDot>Vos données</Kicker>
      <h1 className="mt-4 text-h2 text-balance">Confidentialité</h1>
      <div className="mt-8 grid max-w-prose gap-8 text-base text-ink">
        <section aria-labelledby="conf-court">
          <h2 id="conf-court" className="text-label">
            En bref
          </h2>
          <p className="mt-2">
            Ce site ne vous demande rien, ne dépose aucun cookie dans votre navigateur et ne garde pas votre adresse IP. Il n’envoie
            aucune donnée à un service d’intelligence artificielle.
          </p>
        </section>

        <section aria-labelledby="conf-compte">
          <h2 id="conf-compte" className="text-label">
            Ce qui est compté
          </h2>
          <p className="mt-2">
            Pour savoir si le site est utile, chaque visite et chaque clic sur un bouton (réseau, WhatsApp, appel, soutien) est
            compté de façon anonyme. Pour chaque événement, le site enregistre seulement :
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>le type d’événement et le bouton concerné ;</li>
            <li>la page visitée ;</li>
            <li>le pays, quand le réseau qui sert le site l’indique, sans ville ni adresse ;</li>
            <li>le type d’appareil : téléphone, tablette ou ordinateur ;</li>
            <li>la date et l’heure.</li>
          </ul>
          <p className="mt-2">
            Aucun identifiant ne relie deux visites entre elles : on compte des visites, pas des personnes. Ces chiffres ne sont
            visibles que dans l’espace d’administration. Ils sont prévus pour être effacés au bout de 13 mois.
          </p>
        </section>

        <section aria-labelledby="conf-tiers">
          <h2 id="conf-tiers" className="text-label">
            Les services utilisés
          </h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Hostinger héberge le site.</li>
            <li>Supabase stocke les textes du site, la photo et les chiffres anonymes ci-dessus.</li>
            <li>Resend envoie les e-mails de connexion à l’administration. Les visiteurs ne reçoivent jamais d’e-mail.</li>
            <li>Les polices de caractères sont servies par le site lui-même, sans appel à un service extérieur.</li>
          </ul>
          <p className="mt-2">
            Quand vous touchez un bouton vers WhatsApp, un réseau social ou le service de paiement des dons, vous quittez ce site :
            c’est alors la politique de confidentialité de ce service qui s’applique.
          </p>
        </section>

        <section aria-labelledby="conf-contact">
          <h2 id="conf-contact" className="text-label">
            Une question ?
          </h2>
          <p className="mt-2">
            Écrivez directement à Marcel par l’un des moyens de la{" "}
            <Link href="/#contact" className="font-bold underline decoration-accent decoration-2 underline-offset-4">
              section Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
