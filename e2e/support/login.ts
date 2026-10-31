import { expect, type Page } from "@playwright/test";

import { MAILPIT } from "./env";

type MailSearch = { messages_count: number; messages: { ID: string }[] };

export async function mailCount(to: string): Promise<number> {
  const response = await fetch(`${MAILPIT}/search?query=${encodeURIComponent(`to:${to}`)}`);
  return ((await response.json()) as MailSearch).messages_count;
}

/** Dernier e-mail reçu par cette adresse après `before` messages : son HTML. */
export async function nextMail(to: string, before: number): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetch(`${MAILPIT}/search?query=${encodeURIComponent(`to:${to}`)}`);
    const search = (await response.json()) as MailSearch;
    if (search.messages_count > before) {
      const message = await (await fetch(`${MAILPIT}/message/${search.messages[0].ID}`)).json();
      return message.HTML as string;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Aucun e-mail reçu par ${to}`);
}

// Le code seul dans sa balise : les couleurs du style (#171744) ont aussi six chiffres.
export const codeIn = (html: string) => html.match(/>\s*(\d{6})\s*</)?.[1] ?? "";

/** Demande un code depuis /admin/connexion ; renvoie le message affiché. */
export async function requestCode(page: Page, email: string): Promise<string> {
  await page.goto("/admin/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  const send = page.getByRole("button", { name: "Recevoir mon code" });
  await expect(send).toBeEnabled();
  await send.click();
  // Dans le formulaire : l'annonceur de routes de Next (role=alert) est hors du formulaire.
  const form = page.locator("form");
  const message = form.getByRole("status").or(form.getByRole("alert")).filter({ hasText: /\S/ });
  await expect(message.first()).toBeVisible();
  return (await message.first().textContent())?.trim() ?? "";
}

/** Connexion complète par code à 6 chiffres lu dans Mailpit. */
export async function signIn(page: Page, email: string): Promise<void> {
  const before = await mailCount(email);
  await requestCode(page, email);
  const code = codeIn(await nextMail(email, before));
  await page.getByLabel("Code reçu par e-mail").fill(code);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
