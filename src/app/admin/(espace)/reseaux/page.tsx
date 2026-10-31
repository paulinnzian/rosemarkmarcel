import type { Metadata } from "next";

import { networkSchema } from "@/content/schema";
import { requireAdmin } from "@/lib/admin/session";
import { formatUpdateDate } from "@/lib/format";
import { networkName } from "@/lib/networks";

import { moveSocialLink } from "./actions";
import { NewSocialLinkForm } from "./new-social-link-form";
import { SocialLinkForm } from "./social-link-form";

export const metadata: Metadata = { title: "Réseaux et compteurs" };

const moveButton =
  "inline-flex size-11 items-center justify-center rounded-pill border border-line-input text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40";

/** Monter / descendre : formulaires simples, qui marchent aussi avant le chargement du JavaScript. */
function OrderControls({ id, name, isFirst, isLast }: { id: string; name: string; isFirst: boolean; isLast: boolean }) {
  return (
    <form action={moveSocialLink} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="direction" value="up" disabled={isFirst} aria-label={`Monter ${name}`} className={moveButton}>
        <span aria-hidden="true">↑</span>
      </button>
      <button type="submit" name="direction" value="down" disabled={isLast} aria-label={`Descendre ${name}`} className={moveButton}>
        <span aria-hidden="true">↓</span>
      </button>
    </form>
  );
}

export default async function ReseauxPage() {
  const { supabase } = await requireAdmin();
  const { data: links, error } = await supabase
    .from("social_links")
    .select("id, network, handle, url, followers, followers_updated_at, action_label, fallback_label, visible")
    .order("position")
    .order("created_at");

  const present = new Set(links?.map((link) => link.network));
  const available = networkSchema.options.filter((network) => !present.has(network)).map((network) => ({ network, name: networkName(network) }));

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Réseaux et compteurs</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Recopiez vos chiffres depuis chaque application. Chaque enregistrement met la page publique à jour tout de suite. Les flèches changent
        l’ordre des cartes sur le site.
      </p>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les réseaux pour le moment. Rechargez la page.
        </p>
      ) : (
        <div className="mt-8 grid gap-6">
          {links.length === 0 && <p className="text-sm text-muted">Aucun réseau pour le moment.</p>}
          {links.map((link, index) => (
            <SocialLinkForm
              key={link.id}
              link={{
                id: link.id,
                network: link.network,
                name: networkName(link.network),
                handle: link.handle,
                url: link.url,
                followers: link.followers,
                updatedLabel: link.followers_updated_at ? formatUpdateDate(link.followers_updated_at.slice(0, 10)) : null,
                actionLabel: link.action_label,
                fallbackLabel: link.fallback_label,
                visible: link.visible,
              }}
              orderControls={<OrderControls id={link.id} name={networkName(link.network)} isFirst={index === 0} isLast={index === links.length - 1} />}
            />
          ))}
          {available.length > 0 && <NewSocialLinkForm available={available} />}
        </div>
      )}
    </>
  );
}
