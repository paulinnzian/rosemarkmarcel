// Adresse publique d'une requête derrière le proxy de l'hébergeur (Hostinger : un processus Node par domaine, derrière
// un proxy qui transmet l'hôte d'origine dans x-forwarded-host). Fonctions pures : testées sans serveur.

type HeaderSource = { get(name: string): string | null };

/** Hôte vu par le visiteur : x-forwarded-host (premier proxy) s'il existe, sinon Host. Next fait de même (Server Actions). */
export function publicHost(headers: HeaderSource): string | null {
  return headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
}

/** Adresse absolue de `path` sur l'hôte public, pour une redirection. Sans en-tête utilisable : relative à `requestUrl`. */
export function publicUrl(path: string, headers: HeaderSource, requestUrl: string): URL {
  const host = publicHost(headers);
  const proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host && (proto === "https" || proto === "http")) {
    try {
      return new URL(path, `${proto}://${host}`);
    } catch {
      // Hôte invalide : on retombe sur l'adresse reçue.
    }
  }
  return new URL(path, requestUrl);
}

/** Vrai si l'en-tête Origin désigne l'hôte public (ou s'il est absent). Origin « null » ou invalide : refusé. */
export function sameOrigin(headers: HeaderSource): boolean {
  const origin = headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === publicHost(headers);
  } catch {
    return false;
  }
}

/**
 * Hôte canonique vers lequel rediriger, ou null. Seul le jumeau www / sans www est redirigé : chez Hostinger, chacun
 * tourne dans son propre processus avec son propre cache, et une modification faite dans l'admin (updateTag) ne
 * rafraîchirait que l'un des deux.
 */
export function canonicalHost(host: string | null, siteUrl: string | undefined): string | null {
  if (!host || !siteUrl) return null;
  let canonical: string;
  try {
    canonical = new URL(siteUrl).host;
  } catch {
    return null;
  }
  const twin = canonical.startsWith("www.") ? canonical.slice(4) : `www.${canonical}`;
  return host.toLowerCase() === twin ? canonical : null;
}

// Pays : en-tête posé par le réseau devant le serveur (Cloudflare, CloudFront, Vercel). Hébergé tel quel sur Hostinger
// Node.js, aucun n'est présent et le pays reste vide. « XX » = pays inconnu chez Cloudflare.
const COUNTRY_HEADERS = ["cf-ipcountry", "cloudfront-viewer-country", "x-vercel-ip-country"];

export function countryOf(headers: HeaderSource): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX") return value;
  }
  return null;
}
