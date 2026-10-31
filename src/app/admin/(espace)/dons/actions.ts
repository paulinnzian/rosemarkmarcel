"use server";

import { donationSchema } from "@/content/schema";
import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { checkedOf, headingOf, optionalTextOf, textOf } from "@/lib/admin/form-values";
import { saveAndPublish } from "@/lib/admin/publish";
import { requireAdmin } from "@/lib/admin/session";
import { checkLinksAfterSave } from "@/lib/links/run";

export async function updateDonation(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const parsed = donationSchema.safeParse({
    enabled: checkedOf(formData, "enabled"),
    paymentUrl: optionalTextOf(formData, "paymentUrl"),
    buttonLabel: textOf(formData, "buttonLabel"),
    floatingLabel: textOf(formData, "floatingLabel"),
    texts: {
      kicker: textOf(formData, "texts.kicker"),
      heading: headingOf(formData, "texts.heading"),
      text: textOf(formData, "texts.text"),
      cardTitle: [textOf(formData, "texts.cardTitle.0"), textOf(formData, "texts.cardTitle.1")],
      cardText: textOf(formData, "texts.cardText"),
      thanks: textOf(formData, "texts.thanks"),
      feeNote: optionalTextOf(formData, "texts.feeNote") ?? undefined,
    },
    disabledModal: {
      kicker: textOf(formData, "disabledModal.kicker"),
      title: textOf(formData, "disabledModal.title"),
      text: textOf(formData, "disabledModal.text"),
      close: textOf(formData, "disabledModal.close"),
    },
  });
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const donation = parsed.data;

  const result = await saveAndPublish(
    supabase
      .from("donation_settings")
      .update({
        enabled: donation.enabled,
        payment_url: donation.paymentUrl,
        button_label: donation.buttonLabel,
        floating_label: donation.floatingLabel,
        texts: donation.texts,
        disabled_modal: donation.disabledModal,
      })
      .eq("id", 1)
      .select("id"),
  );
  if (!result.ok) return { status: "error", message: result.message, fieldErrors: {} };
  checkLinksAfterSave(supabase);

  return {
    status: "saved",
    message: donation.enabled
      ? "Enregistré. Les boutons de soutien ouvrent maintenant votre lien de paiement."
      : "Enregistré. Les dons sont fermés : les boutons affichent le message « bientôt ».",
    fieldErrors: {},
  };
}
