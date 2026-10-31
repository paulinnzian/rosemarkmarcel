import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/session";
import { formatUpdateDate } from "@/lib/format";
import { networkName } from "@/lib/networks";

import { SocialLinkForm } from "./social-link-form";

export const metadata: Metadata = { title: "Réseaux et compteurs" };

export default async function ReseauxPage() {
  const { supabase } = await requireAdmin();
  const { data: links, error } = await supabase
    .from("social_links")
    .select("id, network, handle, url, followers, followers_updated_at, action_label, fallback_label, visible")
    .order("position");

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Réseaux et compteurs</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Recopiez vos chiffres depuis chaque application. Chaque enregistrement met la page publique à jour tout de suite.
      </p>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les réseaux pour le moment. Rechargez la page.
        </p>
      ) : links.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucun réseau pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-6">
          {links.map((link) => (
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
            />
          ))}
        </div>
      )}
    </>
  );
}
