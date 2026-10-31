"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

import { REFUSED_MESSAGE } from "./messages";

export type LoginState = {
  step: "email" | "code";
  email: string;
  message: string | null;
  error: boolean;
};

const emailSchema = z.email({ error: "Entrez une adresse e-mail valide." });
const codeSchema = z.string().regex(/^\d{6}$/, { error: "Le code fait 6 chiffres." });

/** Deux étapes : envoyer un code (et un lien) par e-mail, puis vérifier le code tapé. */
export async function signIn(previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { ...previous, message: "Supabase n’est pas configuré sur ce serveur (voir .env.example).", error: true };
  }

  const intent = formData.get("intent");
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (intent === "restart") return { step: "email", email: rawEmail, message: null, error: false };

  const email = emailSchema.safeParse(rawEmail);
  if (!email.success) return { step: "email", email: rawEmail, message: email.error.issues[0].message, error: true };

  const supabase = await createSessionClient();

  if (intent === "send") {
    // shouldCreateUser: false — une adresse hors liste blanche ne crée pas de compte et ne reçoit rien.
    const { error } = await supabase.auth.signInWithOtp({ email: email.data, options: { shouldCreateUser: false } });
    if (error?.status === 429) {
      return { step: "email", email: email.data, message: "Trop de demandes. Réessayez dans une minute.", error: true };
    }
    // Même réponse que l'adresse soit admin ou non : la liste blanche ne se devine pas.
    return {
      step: "code",
      email: email.data,
      message: "Si cette adresse a accès à l’administration, un e-mail avec un code vient de partir.",
      error: false,
    };
  }

  const code = codeSchema.safeParse(String(formData.get("code") ?? "").replace(/\s/g, ""));
  if (!code.success) return { step: "code", email: email.data, message: code.error.issues[0].message, error: true };

  const { data, error } = await supabase.auth.verifyOtp({ email: email.data, token: code.data, type: "email" });
  if (error || !data.user) {
    return { step: "code", email: email.data, message: "Code incorrect ou expiré.", error: true };
  }

  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { step: "email", email: "", message: REFUSED_MESSAGE, error: true };
  }

  redirect("/admin");
}
