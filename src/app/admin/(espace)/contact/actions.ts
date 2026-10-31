"use server";

import { z } from "zod";

import { contactChannelSchema } from "@/content/schema";
import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { checkedOf, textOf } from "@/lib/admin/form-values";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";

const idSchema = z.uuid();

export async function updateContactChannel(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Contact inconnu. Rechargez la page.", fieldErrors: {} };

  // Le type vient de la base, jamais du formulaire : un numéro ne devient pas une adresse e-mail.
  const { data: row } = await supabase.from("contact_channels").select("type").eq("id", id.data).maybeSingle();
  if (!row) return { status: "error", message: "Ce contact n’existe plus. Rechargez la page.", fieldErrors: {} };

  const rawValue = textOf(formData, "value");
  const message = textOf(formData, "prefilledMessage");
  const parsed = contactChannelSchema.safeParse({
    type: row.type,
    // « +225 07 06 40 06 90 » est accepté : espaces, points et tirets sont retirés des numéros.
    value: row.type === "email" ? rawValue.toLowerCase() : rawValue.replace(/[\s.\-()]/g, ""),
    display: textOf(formData, "display"),
    label: textOf(formData, "label"),
    ...(row.type === "whatsapp" && message ? { prefilledMessage: message } : {}),
  });
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const channel = parsed.data;

  const result = await saveAndPublish(
    supabase
      .from("contact_channels")
      .update({
        value: channel.value,
        display: channel.display,
        label: channel.label,
        prefilled_message: channel.type === "whatsapp" ? (channel.prefilledMessage ?? null) : null,
        visible: checkedOf(formData, "visible"),
      })
      .eq("id", id.data)
      .select("id"),
  );

  return result.ok
    ? { status: "saved", message: "Enregistré. La page publique est à jour.", fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}
