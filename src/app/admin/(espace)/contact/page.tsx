import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/session";
import { whatsappHref } from "@/lib/format";

import { ChannelForm, type EditableChannel } from "./channel-form";

export const metadata: Metadata = { title: "Contact" };

const isChannelType = (type: string): type is EditableChannel["type"] => type === "whatsapp" || type === "phone" || type === "email";

export default async function ContactPage() {
  const { supabase } = await requireAdmin();
  const { data: channels, error } = await supabase
    .from("contact_channels")
    .select("id, type, value, display, label, prefilled_message, visible")
    .order("position");

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Contact</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">Les moyens de vous joindre affichés dans la section Contact.</p>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les contacts pour le moment. Rechargez la page.
        </p>
      ) : channels.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Aucun contact pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-6">
          {channels.flatMap((channel) =>
            isChannelType(channel.type)
              ? [
                  <ChannelForm
                    key={channel.id}
                    channel={{
                      id: channel.id,
                      type: channel.type,
                      value: channel.value,
                      display: channel.display,
                      label: channel.label,
                      prefilledMessage: channel.prefilled_message,
                      visible: channel.visible,
                    }}
                    testHref={channel.type === "whatsapp" ? whatsappHref(channel.value, channel.prefilled_message ?? undefined) : null}
                  />,
                ]
              : [],
          )}
        </div>
      )}
    </>
  );
}
