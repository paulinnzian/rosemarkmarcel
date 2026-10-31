import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

// Vérifie qu'un lien sortant répond encore. Appelé côté serveur sur des adresses saisies dans l'admin : seules les
// adresses https vers des IP publiques sont contactées (pas de réseau interne, pas de métadonnées de l'hébergeur),
// et seul le code HTTP est gardé, jamais le contenu de la page.

export type LinkStatus = "ok" | "broken" | "unreachable" | "unverifiable";
export type LinkResult = { status: LinkStatus; httpStatus: number | null };
export type Outcome = { kind: "response"; status: number } | { kind: "network" } | { kind: "blocked" } | { kind: "redirects" };

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 5_000;
// Ces sites répondent 200 (page de connexion) même pour un profil supprimé : seul un 404 y veut dire quelque chose.
const WALLED = /(^|\.)(instagram|tiktok|facebook|x|twitter|linkedin|whatsapp)\.com$/i;

/** Adresse IP joignable sur Internet ; non pour le privé, la boucle locale, le lien local, le multicast et le réservé. */
export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 0 || b === 168)) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    return true;
  }
  if (version === 6) {
    const lower = address.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    const first = parseInt(lower.split(":")[0] || "0", 16);
    if (first === 0) return false; // ::, ::1, ::ffff:… en hexadécimal
    if ((first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00) return false;
    if (lower.startsWith("64:ff9b:") || lower.startsWith("2001:db8:")) return false;
    return true;
  }
  return false;
}

/** Ce que veut dire la réponse pour l'admin. `host` = celui du lien saisi, avant redirection. */
export function classify(host: string, outcome: Outcome): LinkResult {
  if (outcome.kind === "network") return { status: "unreachable", httpStatus: null };
  if (outcome.kind !== "response") return { status: "unverifiable", httpStatus: null };
  const code = outcome.status;
  if (code === 404 || code === 410) return { status: "broken", httpStatus: code };
  if (WALLED.test(host) || code === 999) return { status: "unverifiable", httpStatus: code };
  if (code >= 200 && code < 400) return { status: "ok", httpStatus: code };
  if (code >= 500 && code < 600) return { status: "unreachable", httpStatus: code };
  return { status: "unverifiable", httpStatus: code };
}

export type CheckDeps = {
  fetch: typeof fetch;
  lookup: (hostname: string) => Promise<string[]>;
};

const defaultDeps: CheckDeps = {
  fetch: (...args) => fetch(...args),
  lookup: async (hostname) => (await dnsLookup(hostname, { all: true })).map((entry) => entry.address),
};

async function request(deps: CheckDeps, url: URL, method: "HEAD" | "GET"): Promise<Response> {
  const response = await deps.fetch(url, {
    method,
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: "text/html,*/*;q=0.8", "user-agent": "Mozilla/5.0 (compatible; verification-liens/1.0)" },
  });
  await response.body?.cancel();
  return response;
}

/** Ne lève jamais d'erreur : toute panne devient un statut. */
export async function checkUrl(url: string, deps: CheckDeps = defaultDeps): Promise<LinkResult> {
  let current: URL;
  try {
    current = new URL(url);
  } catch {
    return classify("", { kind: "blocked" });
  }
  const host = current.hostname;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (current.protocol !== "https:" || (current.port !== "" && current.port !== "443")) return classify(host, { kind: "blocked" });

    // Chaque saut est revérifié : une redirection vers une adresse interne est refusée comme le lien lui-même.
    const target = current.hostname.replace(/^\[|\]$/g, "");
    let addresses: string[];
    try {
      addresses = isIP(target) ? [target] : await deps.lookup(target);
    } catch {
      return classify(host, { kind: "network" });
    }
    if (addresses.length === 0 || !addresses.every(isPublicAddress)) return classify(host, { kind: "blocked" });

    let response: Response;
    try {
      response = await request(deps, current, "HEAD");
      // Certains serveurs refusent HEAD : on redemande en GET (le contenu n'est pas lu).
      if (response.status === 403 || response.status === 405 || response.status === 501) response = await request(deps, current, "GET");
    } catch {
      return classify(host, { kind: "network" });
    }

    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400 || !location) return classify(host, { kind: "response", status: response.status });
    try {
      current = new URL(location, current);
    } catch {
      return classify(host, { kind: "blocked" });
    }
  }
  return classify(host, { kind: "redirects" });
}
