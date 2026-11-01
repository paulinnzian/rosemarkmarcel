// Provenance d'une visite, calculée dans le navigateur à l'arrivée sur le site : un nom court (google, facebook…),
// jamais l'adresse de la page d'origine. Fonctions pures : testées sans navigateur.

export type VisitSource = { source: string | null; campaign: string | null };

/** Sites d'origine reconnus : nom court ← domaines (le domaine lui-même et ses sous-domaines). */
const KNOWN_HOSTS: [name: string, domains: string[]][] = [
  ["bing", ["bing.com"]],
  ["duckduckgo", ["duckduckgo.com"]],
  ["facebook", ["facebook.com", "fb.com"]],
  ["instagram", ["instagram.com"]],
  ["tiktok", ["tiktok.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["whatsapp", ["wa.me", "whatsapp.com"]],
  ["x", ["twitter.com", "t.co", "x.com"]],
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["chatgpt", ["chatgpt.com", "chat.openai.com"]],
  ["perplexity", ["perplexity.ai"]],
];

/** Moteurs présents sous plusieurs extensions nationales (google.fr, google.ci, fr.search.yahoo.com…). */
const MULTI_TLD = /(?:^|\.)(google|yahoo)\.(?:co\.|com\.)?[a-z]{2,}$/;

/** Applications Android qui s'annoncent comme android-app://paquet (l'appli Google en tête). */
const ANDROID_APPS: Record<string, string> = {
  "com.google.android.googlequicksearchbox": "google",
  "com.facebook.katana": "facebook",
  "com.instagram.android": "instagram",
  "com.linkedin.android": "linkedin",
};

function onDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function bareHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function sourceFromReferrer(referrer: string, ownHost: string): string | null {
  if (referrer === "") return null;
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return "autre";
  }
  // Comparaison sur l'hôte avec le port : en local, localhost:3000 et localhost:3100 sont deux sites.
  if (bareHost(url.host) === bareHost(ownHost)) return null;
  const host = bareHost(url.hostname);
  if (url.protocol === "android-app:") return ANDROID_APPS[host] ?? "autre";
  if (host === "") return "autre";
  const multi = MULTI_TLD.exec(host);
  if (multi) return multi[1];
  return KNOWN_HOSTS.find(([, domains]) => domains.some((domain) => onDomain(host, domain)))?.[0] ?? "autre";
}

/** Minuscules, chiffres, « _ » et « - » seulement : un nom de campagne, jamais un texte libre (ni e-mail ni nom). */
function slug(value: string | null, max: number): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, max);
}

/**
 * Provenance de la visite d'arrivée : utm_source s'il est renseigné, sinon le site d'origine réduit à un nom court
 * (« autre » s'il est inconnu), sinon « direct ». La campagne vient de utm_campaign. Les pages vues ensuite sur le
 * site n'ont pas de provenance (null) : elles ne comptent pas comme des accès directs.
 */
export function visitSource(search: string, referrer: string, ownHost: string): VisitSource {
  const params = new URLSearchParams(search);
  const campaign = slug(params.get("utm_campaign"), 60);
  return {
    source: slug(params.get("utm_source"), 40) || sourceFromReferrer(referrer, ownHost) || "direct",
    campaign: campaign || null,
  };
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Accès direct",
  autre: "Autre site",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  yahoo: "Yahoo",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
};

/** Nom affiché d'une source ; une source de campagne inconnue (utm_source libre) s'affiche telle quelle. */
export function sourceLabel(source: string): string {
  // hasOwn : une source « constructor » ou « __proto__ » envoyée par n'importe qui ne lit pas le prototype.
  return Object.hasOwn(SOURCE_LABELS, source) ? SOURCE_LABELS[source] : source;
}

export type SourceRow = { source: string | null; campaign: string | null; total: number | null };
export type RankedSource = { source: string; campaign: string | null; total: number; share: number };

/** Cumule les lignes de la vue visit_sources (une par jour) par source et campagne, de la plus fréquente à la moins. */
export function rankSources(rows: SourceRow[]): { rows: RankedSource[]; total: number } {
  const counts = new Map<string, { source: string; campaign: string | null; total: number }>();
  let total = 0;
  for (const row of rows) {
    const value = row.total ?? 0;
    if (value <= 0) continue;
    const source = row.source ?? "direct";
    const key = JSON.stringify([source, row.campaign]);
    const entry = counts.get(key) ?? { source, campaign: row.campaign, total: 0 };
    entry.total += value;
    counts.set(key, entry);
    total += value;
  }
  const ranked = [...counts.values()]
    .map((entry) => ({ ...entry, share: entry.total / total }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        sourceLabel(a.source).localeCompare(sourceLabel(b.source), "fr") ||
        (a.campaign ?? "").localeCompare(b.campaign ?? "", "fr"),
    );
  return { rows: ranked, total };
}
