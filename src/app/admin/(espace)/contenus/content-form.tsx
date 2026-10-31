"use client";

import { Field } from "@/components/admin/field";
import { HeadingField } from "@/components/admin/heading-field";
import { SubmitRow } from "@/components/admin/submit-row";
import { TextArea } from "@/components/admin/text-area";
import type { Heading } from "@/content/schema";
import { useAdminForm } from "@/lib/admin/use-admin-form";

import { updateContent } from "./actions";
import { valueAt, type ContentField, type ContentGroup } from "./groups";

/** Un formulaire par groupe de textes. `content` = les textes actuels (EditableContent). */
export function ContentForm({ group, content }: { group: ContentGroup; content: unknown }) {
  const { state, pending, onSubmit } = useAdminForm(updateContent);
  const titleId = `${group.id}-titre`;

  return (
    <section id={group.id} aria-labelledby={titleId} className="scroll-mt-6 rounded-lg bg-surface p-6">
      <h2 id={titleId} className="text-label">
        {group.title}
      </h2>
      <form onSubmit={onSubmit} className="mt-5 grid gap-5" noValidate>
        <input type="hidden" name="group" value={group.id} />
        {group.fields.map((field) => (
          <ContentInput key={field.path} field={field} idPrefix={group.id} value={valueAt(content, field.path)} errors={state.fieldErrors} />
        ))}
        <SubmitRow state={state} pending={pending} />
      </form>
    </section>
  );
}

function ContentInput({ field, idPrefix, value, errors }: { field: ContentField; idPrefix: string; value: unknown; errors: Record<string, string> }) {
  const id = `${idPrefix}-${field.path.replaceAll(".", "-")}`;
  const error = errors[field.path];

  switch (field.kind) {
    case "heading":
      return <HeadingField name={field.path} idPrefix={id} label={field.label} heading={value as Heading} errors={errors} />;
    case "lines":
      return <TextArea id={id} name={field.path} label={field.label} hint={field.hint} rows={5} defaultValue={(value as string[]).join("\n")} error={error} />;
    case "paragraphs":
      return <TextArea id={id} name={field.path} label={field.label} hint={field.hint} rows={8} defaultValue={(value as string[]).join("\n\n")} error={error} />;
    case "paragraph":
      return <TextArea id={id} name={field.path} label={field.label} hint={field.hint} rows={3} defaultValue={value as string} error={error} />;
    default:
      return <Field id={id} name={field.path} label={field.label} hint={field.hint} defaultValue={value as string} error={error} />;
  }
}
