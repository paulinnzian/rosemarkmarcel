import { cacheLife, cacheTag } from "next/cache";

import { seedContent } from "@/content";
import type { SiteContent } from "@/content/schema";

/** Tag du contenu public : chaque enregistrement de l'admin appelle revalidateTag(CONTENT_TAG). */
export const CONTENT_TAG = "contenu";

/**
 * Contenu de la page publique, gardé en cache jusqu'au prochain enregistrement dans l'admin.
 * Couche provisoire : renvoie les valeurs initiales de content.ts. /replica-backend la remplace
 * par la lecture Supabase, avec la même signature, sans toucher aux écrans.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return seedContent;
}
