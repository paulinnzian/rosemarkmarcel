"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { FormState } from "@/lib/admin/form-state";
import { textOf } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";
import { deleteUser, findOrCreateUser } from "@/lib/admin/team";
import { isServiceConfigured } from "@/lib/supabase/service-client";

const OWNER_ONLY: FormState = { status: "error", message: "Seul le propriétaire du site gère les accès.", fieldErrors: {} };
const emailSchema = z.email({ error: "Adresse e-mail invalide." });

export async function addEditor(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase, role } = await requireAdmin();
  if (role !== "owner") return OWNER_ONLY;
  if (!isServiceConfigured()) return { status: "error", message: "Invitation indisponible : la clé service n’est pas configurée.", fieldErrors: {} };

  const email = emailSchema.safeParse(textOf(formData, "email").toLowerCase());
  if (!email.success) return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: { email: email.error.issues[0].message } };

  const { data: existing } = await supabase.from("admin_users").select("user_id").eq("email", email.data).maybeSingle();
  if (existing) return { status: "error", message: "Corrigez les champs signalés.", fieldErrors: { email: "Cette adresse a déjà accès." } };

  const account = await findOrCreateUser(email.data);
  if ("error" in account) {
    console.error("Compte gestionnaire non créé :", account.error);
    return { status: "error", message: "L’ajout a échoué. Réessayez dans un instant.", fieldErrors: {} };
  }

  // Écriture avec la session du propriétaire : la politique RLS admin_users_write vérifie le rôle une seconde fois.
  const { error } = await supabase.from("admin_users").insert({ user_id: account.userId, email: email.data, role: "editor" });
  if (error) {
    console.error("Accès gestionnaire non enregistré :", error.message);
    return { status: "error", message: "L’ajout a échoué. Réessayez dans un instant.", fieldErrors: {} };
  }

  revalidatePath("/admin/acces");
  return {
    status: "saved",
    message: `${email.data} peut maintenant se connecter sur la page de connexion de l’administration. Prévenez cette personne.`,
    fieldErrors: {},
  };
}

export async function removeEditor(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase, role, userId } = await requireAdmin();
  if (role !== "owner") return OWNER_ONLY;

  const target = z.uuid().safeParse(formData.get("userId"));
  if (!target.success || target.data === userId) return { status: "error", message: "Accès introuvable. Rechargez la page.", fieldErrors: {} };

  // Seuls les gestionnaires se retirent ici : un propriétaire ne peut pas être supprimé depuis le site.
  const { data: row } = await supabase.from("admin_users").select("email").eq("user_id", target.data).eq("role", "editor").maybeSingle();
  if (!row) return { status: "error", message: "Accès introuvable. Rechargez la page.", fieldErrors: {} };

  const failure = await deleteUser(target.data);
  if (failure) {
    console.error("Compte gestionnaire non supprimé :", failure.error);
    return { status: "error", message: "Le retrait a échoué. Réessayez dans un instant.", fieldErrors: {} };
  }

  // Pas de revalidatePath ici : la ligne reste affichée avec la confirmation, la liste se met à jour à la visite suivante.
  return { status: "saved", message: `${row.email} n’a plus accès. Ses sessions ouvertes sont fermées.`, fieldErrors: {} };
}
