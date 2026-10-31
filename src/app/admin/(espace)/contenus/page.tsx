import type { Metadata } from "next";

import { readEditableContent } from "@/lib/admin/read-content";
import { requireAdmin } from "@/lib/admin/session";

import { ContentForm } from "./content-form";
import { CONTENT_GROUPS } from "./groups";

export const metadata: Metadata = { title: "Textes du site" };

export default async function ContenusPage() {
  const { supabase } = await requireAdmin();
  const current = await readEditableContent(supabase);

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Textes du site</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Chaque bloc s’enregistre séparément et met la page publique à jour tout de suite.
      </p>

      {current === null ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire les textes pour le moment. Rechargez la page.
        </p>
      ) : (
        <>
          <nav aria-label="Blocs de texte" className="mt-6">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {CONTENT_GROUPS.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`} className="inline-flex min-h-11 items-center text-ink underline decoration-line-input underline-offset-4 hover:decoration-accent">
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 grid gap-6">
            {CONTENT_GROUPS.map((group) => (
              <ContentForm key={group.id} group={group} content={current.content} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
