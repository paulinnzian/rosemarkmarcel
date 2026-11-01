"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { visitSource } from "@/lib/visit-source";

const ENDPOINT = "/api/evenements";

// Une fois par chargement du document : la provenance n'accompagne que la vue de la page d'arrivée. Au niveau
// du module, et non dans le composant : elle survit à un remontage (passage par la page 404, par exemple).
let landingCounted = false;

function send(event: { kind: string; target?: string; path: string; source?: string; campaign?: string }) {
  const body = JSON.stringify(event); // les champs undefined ne partent pas
  // sendBeacon survit à la navigation (lien externe, nouvel onglet) ; fetch keepalive en secours.
  if (!navigator.sendBeacon?.(ENDPOINT, body)) {
    void fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

/**
 * Compte la vue de la page et les clics sur les éléments marqués data-track (réseaux, WhatsApp, appel, dons, boutons).
 * Rien n'est stocké dans le navigateur : ni cookie, ni identifiant. La vue de la page d'arrivée porte en plus sa
 * provenance (google, facebook…, ou la campagne du lien), jamais l'adresse de la page d'origine.
 */
export function ClickTracker() {
  // Le gabarit reste monté d'une page à l'autre : une vue par changement d'adresse, pas une seule à l'arrivée.
  const pathname = usePathname();
  useEffect(() => {
    if (landingCounted) {
      send({ kind: "page_view", path: pathname });
      return;
    }
    landingCounted = true;
    // Après une navigation interne, document.referrer reste celui de l'arrivée : seule la première vue le lit.
    const { source, campaign } = visitSource(window.location.search, document.referrer, window.location.host);
    send({ kind: "page_view", path: pathname, source: source ?? undefined, campaign: campaign ?? undefined });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const element = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!element?.dataset.track) return;
      send({ kind: element.dataset.track, target: element.dataset.trackTarget, path: window.location.pathname });
    }
    // Phase de capture : le clic est compté même si un gestionnaire plus bas arrête sa propagation.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
