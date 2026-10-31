import type { Metadata } from "next";
import { Suspense } from "react";

import { Kicker } from "@/components/site/kicker";

import { LoginForm } from "./login-form";
import { REFUSED_MESSAGE } from "./messages";

export const metadata: Metadata = { title: "Connexion" };

// Messages après un retour du lien de l'e-mail (/admin/auth/callback).
const RETURN_MESSAGES: Record<string, string> = {
  lien: "Ce lien a expiré ou a déjà servi. Demandez un nouveau code.",
  refus: REFUSED_MESSAGE,
};

export default function ConnexionPage({ searchParams }: PageProps<"/admin/connexion">) {
  return (
    <main id="contenu" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Kicker withDot>Administration du site</Kicker>
      <h1 className="mb-8 mt-3 text-[32px] font-bold leading-tight tracking-[-0.03em]">Connexion</h1>
      <div className="grid gap-5 rounded-lg bg-surface p-6 shadow-card-hover">
        {/* Seul le message dépend de l'URL : le formulaire reste hors du Suspense pour ne pas être remplacé au chargement. */}
        <Suspense fallback={null}>
          <ReturnMessage searchParams={searchParams} />
        </Suspense>
        <LoginForm />
      </div>
    </main>
  );
}

async function ReturnMessage({ searchParams }: Pick<PageProps<"/admin/connexion">, "searchParams">) {
  const { erreur } = await searchParams;
  const message = typeof erreur === "string" ? RETURN_MESSAGES[erreur] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-bold text-danger">
      {message}
    </p>
  );
}
