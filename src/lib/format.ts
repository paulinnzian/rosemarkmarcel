const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("fr-FR");

const NBSP = "\u00a0";

/** 340000 -> « 340 K », 55600 -> « 55,6 K », 1200000 -> « 1,2 M » (espace insécable avant l'unité). */
export function formatFollowers(count: number): string {
  // \s couvre aussi les espaces insécables (U+00A0, U+202F) qu'Intl place avant l'unité.
  return compact
    .format(count)
    .replace(/\s*k$/i, `${NBSP}K`)
    .replace(/\s*(M|Md)$/, `${NBSP}$1`);
}

/** 340000 -> « 340 000 », pour les lecteurs d'écran. */
export function formatFollowersFull(count: number): string {
  return full.format(count);
}

const longDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** « 2026-10-31 » -> « 31 octobre 2026 » (date ISO sans heure, lue en UTC pour ne pas glisser d'un jour). */
export function formatUpdateDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T00:00:00Z`));
}

export function whatsappHref(e164: string, message?: string): string {
  const base = `https://wa.me/${e164.replace(/^\+/, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
