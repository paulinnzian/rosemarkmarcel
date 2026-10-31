"use client";

import { useId, useRef } from "react";

import { buttonClasses } from "@/components/site/button-styles";
import { Decorated } from "@/components/site/decorated";
import { Kicker } from "@/components/site/kicker";
import type { Donation } from "@/content/schema";

type SupportDialogProps = {
  label: string;
  triggerClassName: string;
  /** Cible enregistrée dans les statistiques (« hero-ferme »…) : l'envie de donner compte même avant l'ouverture. */
  trackTarget: string;
  modal: Donation["disabledModal"];
};

/**
 * Bouton de soutien quand les dons ne sont pas encore ouverts : ouvre la modale « bientôt ».
 * <dialog> natif : focus piégé, Échap, retour du focus sur le bouton et fond inerte sont gérés par le navigateur.
 */
export function SupportDialog({ label, triggerClassName, trackTarget, modal }: SupportDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const textId = useId();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className={triggerClassName}
        data-track="donation"
        data-track-target={trackTarget}
        onClick={() => dialogRef.current?.showModal()}>
        <Decorated text={label} />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={textId}
        // Un clic sur le voile (hors du contenu) ferme la modale.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto w-[min(92vw,440px)] rounded-lg bg-surface p-0 text-ink shadow-pop backdrop:bg-ink/55"
      >
        <div className="p-7">
          <Kicker>{modal.kicker}</Kicker>
          <h2 id={titleId} className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.03em]">
            {modal.title}
          </h2>
          <p id={textId} className="mt-3 text-base text-muted">
            {modal.text}
          </p>
          <form method="dialog" className="mt-6">
            <button type="submit" className={buttonClasses("primary", "w-full")}>
              {modal.close}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
