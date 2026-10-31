const NAMES: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
  x: "X",
  whatsapp_channel: "Chaîne WhatsApp",
};

/** Nom affiché d'un réseau (la base ne stocke que son identifiant). */
export function networkName(network: string): string {
  return NAMES[network] ?? network;
}
