"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

/**
 * false au rendu serveur et avant l'hydratation, true ensuite.
 * Les boutons d'envoi des formulaires à useActionState restent inactifs jusque-là : un envoi natif avant
 * l'hydratation perdrait la réponse de l'action (page en streaming).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}
