// Variables publiques de Supabase. Absentes (pas encore de projet) : le site tourne sur les valeurs initiales de content.ts.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== "" && supabaseAnonKey !== "";
}

/** URL publique d'un fichier du bucket public-media (photo détourée, images). */
export function publicMediaUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/public-media/${path}`;
}
