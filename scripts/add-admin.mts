// Ajoute une adresse à la liste blanche de l'admin (crée le compte s'il n'existe pas).
// Usage : pnpm admin:add marcel@exemple.com [owner|editor]   (lit .env.local : URL + clé service)
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement (CI, production).
}

const [email, role = "owner"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !["owner", "editor"].includes(role)) {
  console.error("Usage : pnpm admin:add <email> [owner|editor]");
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.example).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const normalized = email.trim().toLowerCase();

const created = await supabase.auth.admin.createUser({ email: normalized, email_confirm: true });
let userId = created.data.user?.id;

if (!userId) {
  // Compte déjà existant : on le retrouve.
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  userId = data.users.find((user) => user.email === normalized)?.id;
}
if (!userId) {
  console.error(`Impossible de créer ou retrouver le compte ${normalized} :`, created.error?.message);
  process.exit(1);
}

const { error } = await supabase.from("admin_users").upsert({ user_id: userId, email: normalized, role }, { onConflict: "user_id" });
if (error) throw error;
console.log(`${normalized} a accès à l'administration (${role}).`);
