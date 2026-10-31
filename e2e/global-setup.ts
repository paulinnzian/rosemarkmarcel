import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

import { chromium, expect, type FullConfig } from "@playwright/test";

import { EDITOR, NOT_ADMIN, OWNER, OWNER_STATE, serviceClient } from "./support/env";
import { signIn } from "./support/login";

/**
 * Avant toute la suite : base locale remise aux valeurs initiales, comptes de test en place,
 * session du propriétaire enregistrée, et page publique republiée depuis la base.
 */
export default async function globalSetup(config: FullConfig) {
  const supabase = serviceClient();

  // 1. Contenu : seed.sql rejoué (il remplace réseaux et contacts), photo d'origine, statistiques vides.
  const sql = `${readFileSync("supabase/seed.sql", "utf8")}
    update public.site_content set photo_path = null, photo_width = null, photo_height = null where id = 1;
    delete from public.click_events;`;
  execFileSync("docker", ["exec", "-i", "supabase_db_vitrine-createur", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q"], { input: sql });
  const { data: photos } = await supabase.storage.from("public-media").list("photo");
  if (photos?.length) await supabase.storage.from("public-media").remove(photos.map((file) => `photo/${file.name}`));

  // 2. Comptes : le propriétaire, un compte existant hors liste blanche, et pas encore de gestionnaire.
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const userId = async (email: string) =>
    list.users.find((user) => user.email === email)?.id ?? (await supabase.auth.admin.createUser({ email, email_confirm: true })).data.user!.id;
  const ownerId = await userId(OWNER);
  await supabase.from("admin_users").upsert({ user_id: ownerId, email: OWNER, role: "owner" }, { onConflict: "user_id" });
  const visitorId = await userId(NOT_ADMIN);
  await supabase.from("admin_users").delete().eq("user_id", visitorId);
  const editor = list.users.find((user) => user.email === EDITOR);
  if (editor) await supabase.auth.admin.deleteUser(editor.id);

  // 3. Session du propriétaire, puis un enregistrement sans changement : la page publique relit la base.
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: config.projects[0].use.baseURL, viewport: { width: 390, height: 844 } });
  await signIn(page, OWNER);
  mkdirSync("e2e/.auth", { recursive: true });
  await page.context().storageState({ path: OWNER_STATE });
  await page.goto("/admin/dons");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Enregistré" })).toBeVisible();
  await browser.close();
}
