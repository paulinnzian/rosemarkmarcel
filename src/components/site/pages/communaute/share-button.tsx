"use client";

import { useState } from "react";

import { buttonClasses } from "@/components/site/button-styles";

type ShareButtonProps = {
  label: string;
  title: string;
  text: string;
  className?: string;
};

/** Partage natif du site quand le navigateur le propose ; sinon le lien est copié et l'annonce lue à voix haute. */
export function ShareButton({ label, title, text, className = "" }: ShareButtonProps) {
  const [message, setMessage] = useState("");

  async function share() {
    const url = window.location.origin;
    setMessage("");

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Partage annulé par le visiteur : rien à faire. Autre refus : on se rabat sur la copie.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setMessage("Lien copié");
    } catch {
      setMessage(`Copiez ce lien : ${url}`);
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={share} className={buttonClasses("accent", "w-full")} data-track="cta" data-track-target="partage">
        {label}
      </button>
      {/* Toujours présente dans le DOM : une région live ajoutée en même temps que son texte n'est pas annoncée. */}
      <p role="status" aria-live="polite" className="mt-2 min-h-[18px] break-words text-xs text-muted">
        {message}
      </p>
    </div>
  );
}
