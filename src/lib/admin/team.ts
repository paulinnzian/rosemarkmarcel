import "server-only";

import { createServiceClient } from "@/lib/supabase/service-client";

/**
 * Compte Supabase Auth de cette adresse, créé s'il n'existe pas (adresse confirmée d'office : c'est le propriétaire
 * qui l'invite). Les inscriptions libres restant fermées, c'est le seul chemin de création d'un compte depuis le site.
 */
export async function findOrCreateUser(email: string): Promise<{ userId: string } | { error: string }> {
  const auth = createServiceClient().auth.admin;

  for (let page = 1; ; page += 1) {
    const { data, error } = await auth.listUsers({ page, perPage: 200 });
    if (error) return { error: error.message };
    const existing = data.users.find((user) => user.email?.toLowerCase() === email);
    if (existing) return { userId: existing.id };
    if (data.users.length < 200) break;
  }

  const { data, error } = await auth.createUser({ email, email_confirm: true });
  if (error || !data.user) return { error: error?.message ?? "compte non créé" };
  return { userId: data.user.id };
}

/** Supprime le compte : ses sessions tombent, sa ligne admin_users part en cascade. */
export async function deleteUser(userId: string): Promise<{ error: string } | null> {
  const { error } = await createServiceClient().auth.admin.deleteUser(userId);
  return error ? { error: error.message } : null;
}
