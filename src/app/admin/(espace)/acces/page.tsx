import type { Metadata } from "next";

import { requireAdmin } from "@/lib/admin/session";

import { AddEditorForm, RemoveEditorForm } from "./access-forms";

export const metadata: Metadata = { title: "Accès" };

const ROLES = { owner: "Propriétaire", editor: "Gestionnaire" } as const;
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function AccesPage() {
  const { supabase, role, userId } = await requireAdmin();

  if (role !== "owner") {
    return (
      <>
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Accès</h1>
        <p className="mt-4 max-w-prose text-sm text-ink">Seul le propriétaire du site peut ajouter ou retirer des gestionnaires.</p>
      </>
    );
  }

  const { data: admins, error } = await supabase.from("admin_users").select("user_id, email, role, created_at").order("created_at");

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Accès</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">Les personnes qui peuvent se connecter à cette administration.</p>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire la liste des accès pour le moment. Rechargez la page.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {admins.map((admin) => (
            <li key={admin.user_id} className="grid gap-1 rounded-lg bg-surface p-5">
              <p className="break-all font-bold text-ink">
                {admin.email}
                {admin.user_id === userId && <span className="font-normal text-muted"> (vous)</span>}
              </p>
              <p className="text-xs text-muted">
                {ROLES[admin.role as keyof typeof ROLES] ?? admin.role} · depuis le {dateFormat.format(new Date(admin.created_at))}
              </p>
              {admin.role === "editor" && <RemoveEditorForm userId={admin.user_id} email={admin.email} />}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="acces-ajout" className="mt-8 rounded-lg bg-surface p-6">
        <h2 id="acces-ajout" className="text-label">
          Ajouter un gestionnaire
        </h2>
        <AddEditorForm />
      </section>
    </>
  );
}
