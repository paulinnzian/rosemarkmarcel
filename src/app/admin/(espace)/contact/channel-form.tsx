"use client";

import { Field } from "@/components/admin/field";
import { SubmitRow } from "@/components/admin/submit-row";
import { Switch } from "@/components/admin/switch";
import { TextArea } from "@/components/admin/text-area";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { updateContactChannel } from "./actions";

export type EditableChannel = {
  id: string;
  type: "whatsapp" | "phone" | "email";
  value: string;
  display: string;
  label: string;
  prefilledMessage: string | null;
  visible: boolean;
};

const TITLES = { whatsapp: "WhatsApp", phone: "Téléphone", email: "E-mail" } as const;

export function ChannelForm({ channel, testHref }: { channel: EditableChannel; testHref: string | null }) {
  const { state, pending, onSubmit } = useAdminForm(updateContactChannel);
  const id = (field: string) => `${channel.type}-${field}`;
  const errors = state.fieldErrors;
  const isEmail = channel.type === "email";

  return (
    <section aria-labelledby={id("titre")} className="rounded-lg bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id("titre")} className="text-label">
          {TITLES[channel.type]}
        </h2>
        {testHref && (
          <a href={testHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:underline">
            Tester sur WhatsApp <span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (nouvel onglet, avec le numéro et le message enregistrés)</span>
          </a>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
        <input type="hidden" name="id" value={channel.id} />
        <Field
          id={id("value")}
          name="value"
          label={isEmail ? "Adresse e-mail" : "Numéro au format international"}
          type={isEmail ? "email" : "tel"}
          inputMode={isEmail ? "email" : "tel"}
          autoComplete="off"
          defaultValue={channel.value}
          hint={isEmail ? undefined : "Avec l’indicatif du pays : +225 07 06 40 06 90. Les espaces sont acceptés."}
          error={errors.value}
        />
        <Field id={id("display")} name="display" label="Texte affiché" defaultValue={channel.display} hint="Tel qu’il apparaît sur la page." error={errors.display} />
        <Field id={id("label")} name="label" label="Texte du bouton" defaultValue={channel.label} error={errors.label} />
        {channel.type === "whatsapp" && (
          <TextArea
            id={id("prefilledMessage")}
            name="prefilledMessage"
            label="Message déjà écrit pour le visiteur"
            rows={3}
            maxLength={500}
            defaultValue={channel.prefilledMessage ?? ""}
            hint="Le visiteur peut le modifier avant de l’envoyer. Laissez vide pour ouvrir une conversation vierge."
            error={errors.prefilledMessage}
          />
        )}
        <Switch name="visible" label="Afficher sur le site" defaultChecked={channel.visible} />
        <SubmitRow state={state} pending={pending} />
      </form>
    </section>
  );
}
