"use client";

import { Field } from "@/components/admin/field";
import { HeadingField } from "@/components/admin/heading-field";
import { SubmitRow } from "@/components/admin/submit-row";
import { Switch } from "@/components/admin/switch";
import { TextArea } from "@/components/admin/text-area";
import type { Donation } from "@/content/schema";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { updateDonation } from "./actions";

export function DonationForm({ donation }: { donation: Donation }) {
  const { state, pending, onSubmit } = useAdminForm(updateDonation);
  const errors = state.fieldErrors;
  const { texts, disabledModal } = donation;

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8" noValidate>
      <section aria-labelledby="dons-lien" className="grid gap-5 rounded-lg bg-surface p-6">
        <h2 id="dons-lien" className="text-label">
          Ouverture des dons
        </h2>
        <Field
          id="dons-paymentUrl"
          name="paymentUrl"
          label="Lien de paiement"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://…"
          defaultValue={donation.paymentUrl ?? ""}
          hint="Le lien que vous donne votre service de paiement (Wave, Orange Money, PayPal…). Il doit commencer par https://."
          error={errors.paymentUrl}
        />
        <Switch
          name="enabled"
          label="Dons ouverts"
          description="Fermés, les boutons de soutien affichent le message « bientôt » ci-dessous."
          defaultChecked={donation.enabled}
        />
        <Field id="dons-buttonLabel" name="buttonLabel" label="Texte des boutons de soutien" defaultValue={donation.buttonLabel} error={errors.buttonLabel} />
        <Field
          id="dons-floatingLabel"
          name="floatingLabel"
          label="Texte du bouton épinglé"
          defaultValue={donation.floatingLabel}
          hint="Le bouton qui reste en bas de l’écran."
          error={errors.floatingLabel}
        />
      </section>

      <section aria-labelledby="dons-section" className="grid gap-5 rounded-lg bg-surface p-6">
        <h2 id="dons-section" className="text-label">
          Section « Soutenir »
        </h2>
        <Field id="dons-kicker" name="texts.kicker" label="Petit titre" defaultValue={texts.kicker} error={errors["texts.kicker"]} />
        <HeadingField name="texts.heading" idPrefix="dons-titre" label="Titre" heading={texts.heading} errors={errors} />
        <TextArea id="dons-text" name="texts.text" label="Texte" defaultValue={texts.text} error={errors["texts.text"]} />
        <Field id="dons-cardTitle-0" name="texts.cardTitle.0" label="Titre de la carte, 1re ligne" defaultValue={texts.cardTitle[0]} error={errors["texts.cardTitle.0"]} />
        <Field id="dons-cardTitle-1" name="texts.cardTitle.1" label="Titre de la carte, 2e ligne" defaultValue={texts.cardTitle[1]} error={errors["texts.cardTitle.1"]} />
        <Field id="dons-cardText" name="texts.cardText" label="Texte de la carte" defaultValue={texts.cardText} error={errors["texts.cardText"]} />
        <Field id="dons-thanks" name="texts.thanks" label="Remerciement sous le bouton" defaultValue={texts.thanks} error={errors["texts.thanks"]} />
      </section>

      <section aria-labelledby="dons-bientot" className="grid gap-5 rounded-lg bg-surface p-6">
        <h2 id="dons-bientot" className="text-label">
          Message quand les dons sont fermés
        </h2>
        <Field id="dons-modal-kicker" name="disabledModal.kicker" label="Petit titre" defaultValue={disabledModal.kicker} error={errors["disabledModal.kicker"]} />
        <Field id="dons-modal-title" name="disabledModal.title" label="Titre" defaultValue={disabledModal.title} error={errors["disabledModal.title"]} />
        <TextArea id="dons-modal-text" name="disabledModal.text" label="Texte" rows={3} defaultValue={disabledModal.text} error={errors["disabledModal.text"]} />
        <Field id="dons-modal-close" name="disabledModal.close" label="Bouton de fermeture" defaultValue={disabledModal.close} error={errors["disabledModal.close"]} />
      </section>

      <SubmitRow state={state} pending={pending} />
    </form>
  );
}
