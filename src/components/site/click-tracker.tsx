"use client";

import { useEffect } from "react";

const ENDPOINT = "/api/evenements";

function send(event: { kind: string; target?: string; path: string }) {
  const body = JSON.stringify(event);
  // sendBeacon survit à la navigation (lien externe, nouvel onglet) ; fetch keepalive en secours.
  if (!navigator.sendBeacon?.(ENDPOINT, body)) {
    void fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

/**
 * Compte la vue de la page et les clics sur les éléments marqués data-track (réseaux, WhatsApp, appel, dons, boutons).
 * Rien n'est stocké dans le navigateur : ni cookie, ni identifiant.
 */
export function ClickTracker() {
  useEffect(() => {
    const path = window.location.pathname;
    send({ kind: "page_view", path });

    function onClick(event: MouseEvent) {
      const element = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!element?.dataset.track) return;
      send({ kind: element.dataset.track, target: element.dataset.trackTarget, path });
    }
    // Phase de capture : le clic est compté même si un gestionnaire plus bas arrête sa propagation.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
