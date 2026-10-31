import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses } from "@/components/site/button-styles";
import { requireAdmin } from "@/lib/admin/session";
import { lastDays, summarize, type StatRow } from "@/lib/admin/stats";
import { formatFollowers } from "@/lib/format";
import { networkName } from "@/lib/networks";

export const metadata: Metadata = { title: "Tableau de bord" };

const number = new Intl.NumberFormat("fr-FR");
const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" });

export default async function AdminHomePage() {
  const { supabase, email } = await requireAdmin();
  const days30 = lastDays(30, new Date());
  const [donation, socials, site, contacts, stats] = await Promise.all([
    supabase.from("donation_settings").select("enabled, payment_url, updated_at").eq("id", 1).single(),
    supabase.from("social_links").select("id, network, followers, visible, updated_at").order("position"),
    supabase.from("site_content").select("updated_at").eq("id", 1).single(),
    supabase.from("contact_channels").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("click_daily_detail").select("day, kind, target, device, country, total").gte("day", days30[0]),
  ]);

  const donationsOpen = donation.data?.enabled === true && donation.data.payment_url !== null;
  const visibleLinks = (socials.data ?? []).filter((link) => link.visible);
  const rows = (stats.data ?? []) as StatRow[];
  const week = summarize(rows, days30.slice(-7)).totals;
  const month = summarize(rows, days30).totals;
  const clicks = (totals: typeof week) => totals.social + totals.whatsapp + totals.phone + totals.donation + totals.cta;

  // Dernière modification de chaque partie : repère si deux personnes ont enregistré en même temps.
  const latestSocial = (socials.data ?? []).map((link) => link.updated_at).sort().at(-1);
  const changes = [
    { label: "Textes et photo", href: "/admin/contenus", at: site.data?.updated_at },
    { label: "Dons", href: "/admin/dons", at: donation.data?.updated_at },
    { label: "Réseaux", href: "/admin/reseaux", at: latestSocial },
    { label: "Contact", href: "/admin/contact", at: contacts.data?.updated_at },
  ].filter((change): change is { label: string; href: string; at: string } => Boolean(change.at));
  changes.sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Bonjour !</h1>
      <p className="mt-2 text-sm text-muted">Connecté avec {email}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="carte-visites" className="rounded-lg bg-surface p-6 sm:col-span-2">
          <h2 id="carte-visites" className="text-kicker uppercase">
            Visites et clics
          </h2>
          {stats.error ? (
            <p className="mt-3 text-sm text-muted">Statistiques indisponibles pour le moment.</p>
          ) : (
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Vues · 7 jours", value: week.views },
                { label: "Clics · 7 jours", value: clicks(week) },
                { label: "Vues · 30 jours", value: month.views },
                { label: "Clics · 30 jours", value: clicks(month) },
              ].map((tile) => (
                <div key={tile.label}>
                  <dt className="text-xs text-muted">{tile.label}</dt>
                  <dd className="text-[28px] font-bold leading-none tracking-[-0.03em] tabular-nums">{number.format(tile.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link href="/admin/statistiques" className={buttonClasses("text", "mt-4")}>
            Voir le détail
          </Link>
        </section>

        <section aria-labelledby="carte-dons" className="rounded-lg bg-surface p-6">
          <h2 id="carte-dons" className="text-kicker uppercase">
            Dons
          </h2>
          <p className="mt-3 text-label">{donationsOpen ? "Ouverts" : "Fermés"}</p>
          <p className="mt-1 text-xs text-muted">
            {donationsOpen
              ? "Les boutons « Soutenir » ouvrent votre lien de paiement."
              : "Les boutons « Soutenir » affichent « Les dons arrivent bientôt »."}
          </p>
          <Link href="/admin/dons" className={buttonClasses("text", "mt-4")}>
            {donationsOpen ? "Modifier le lien" : "Coller un lien de paiement"}
          </Link>
        </section>

        <section aria-labelledby="carte-reseaux" className="rounded-lg bg-surface p-6">
          <h2 id="carte-reseaux" className="text-kicker uppercase">
            Réseaux affichés
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {visibleLinks.map((link) => (
              <li key={link.id} className="flex justify-between gap-4">
                <span>{networkName(link.network)}</span>
                <span className="font-bold">{link.followers === null ? "sans compteur" : formatFollowers(link.followers)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/reseaux" className={buttonClasses("primary", "mt-5 w-full")}>
            Mettre à jour les compteurs
          </Link>
        </section>

        {changes.length > 0 && (
          <section aria-labelledby="carte-modifs" className="rounded-lg bg-surface p-6 sm:col-span-2">
            <h2 id="carte-modifs" className="text-kicker uppercase">
              Dernières modifications
            </h2>
            <ul className="mt-3 space-y-1 text-sm">
              {changes.map((change) => (
                <li key={change.label} className="flex flex-wrap justify-between gap-x-4">
                  <Link href={change.href} className="underline underline-offset-4 hover:decoration-accent">
                    {change.label}
                  </Link>
                  <span className="text-muted">{dateTime.format(new Date(change.at))}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
