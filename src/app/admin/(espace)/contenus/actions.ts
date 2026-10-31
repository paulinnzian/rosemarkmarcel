"use server";

import { fieldErrorsOf, type FormState } from "@/lib/admin/form-state";
import { headingOf, linesOf, paragraphsOf, textOf } from "@/lib/admin/form-values";
import { saveAndPublish } from "@/lib/admin/publish";
import { CONTENT_COLUMNS, editableContentSchema, readEditableContent } from "@/lib/admin/read-content";
import { requireAdmin } from "@/lib/admin/session";

import { CONTENT_GROUPS, setValueAt, type ContentField } from "./groups";

function readField(formData: FormData, field: ContentField): unknown {
  switch (field.kind) {
    case "heading":
      return headingOf(formData, field.path);
    case "lines":
      return linesOf(formData, field.path);
    case "paragraphs":
      return paragraphsOf(formData, field.path);
    default:
      return textOf(formData, field.path);
  }
}

/** Enregistre un groupe de textes ; les autres groupes gardent leur valeur en base. */
export async function updateContent(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const group = CONTENT_GROUPS.find((candidate) => candidate.id === formData.get("group"));
  if (!group) return { status: "error", message: "Formulaire inconnu. Rechargez la page.", fieldErrors: {} };

  const current = await readEditableContent(supabase);
  if (!current) return { status: "error", message: "Impossible de lire les textes actuels. Réessayez dans un instant.", fieldErrors: {} };

  const draft = structuredClone(current.content) as Record<string, unknown>;
  for (const field of group.fields) setValueAt(draft, field.path, readField(formData, field));

  const parsed = editableContentSchema.safeParse(draft);
  if (!parsed.success) {
    return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const { creatorName, tagline, roleLine, conceptName, ...sectionTexts } = parsed.data;
  const result = await saveAndPublish(
    supabase
      .from("site_content")
      .update({
        [CONTENT_COLUMNS.creatorName]: creatorName,
        [CONTENT_COLUMNS.tagline]: tagline,
        [CONTENT_COLUMNS.roleLine]: roleLine,
        [CONTENT_COLUMNS.conceptName]: conceptName,
        // Les clés que l'admin ne gère pas (ajoutées plus tard) sont conservées.
        sections: { ...current.sections, ...sectionTexts },
      })
      .eq("id", 1)
      .select("id"),
  );

  return result.ok
    ? { status: "saved", message: `« ${group.title} » enregistré. La page publique est à jour.`, fieldErrors: {} }
    : { status: "error", message: result.message, fieldErrors: {} };
}
