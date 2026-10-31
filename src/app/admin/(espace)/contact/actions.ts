"use server";

import { z } from "zod";

import { contactChannelSchema } from "@/content/schema";
import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { checkedOf, textOf } from "@/lib/admin/form-values";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";

const idSchema = z.uuid();
const typeSchema = z.enum(["whatsapp", "phone", "email"], { error: "Choisissez un moyen de contact." });

/** Valeur nettoyée : « +225 07 06 40 06 90 » est accepté, espaces, points et tirets sont retirés des numéros. */
const cleanValue = (type: string, raw: string) => (type === "email" ? raw.toLowerCase() : raw.replace(/[\s.\-()]/g, ""));

/** Ajout d'un moyen de contact absent (un seul par type : la section Contact en affiche un de chaque). */
export async function addContactChannel(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const type = typeSchema.safeParse(formData.get("type") ?? "");
  if (!type.success) return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: { type: type.error.issues[0].message } };

  const { data: existing } = await supabase.from("contact_channels").select("type, position");
  if (existing?.some((row) => row.type === type.data)) {
    return { status: "error", message: "Ce moyen de contact existe déjà : modifiez-le plus haut.", fieldErrors: {} };
  }

  const message = textOf(formData, "prefilledMessage");
  const parsed = contactChannelSchema.safeParse({
    type: type.data,
    value: cleanValue(type.data, textOf(formData, "value")),
    display: textOf(formData, "display"),
    label: textOf(formData, "label"),
    ...(type.data === "whatsapp" && message ? { prefilledMessage: message } : {}),
  });
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const channel = parsed.data;

  const result = await saveAndPublish(
    supabase
      .from("contact_channels")
      .insert({
        type: channel.type,
        value: channel.value,
        display: channel.display,
        label: channel.label,
        prefilled_message: channel.type === "whatsapp" ? (channel.prefilledMessage ?? null) : null,
        visible: checkedOf(formData, "visible"),
        position: Math.max(-1, ...(existing ?? []).map((row) => row.position)) + 1,
      })
      .select("id"),
  );

  return result.ok
    ? { status: "saved", message: "Contact ajouté. La page publique est à jour.", fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}

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
    value: cleanValue(row.type, rawValue),
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
