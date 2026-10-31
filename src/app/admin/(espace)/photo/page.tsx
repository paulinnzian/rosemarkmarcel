import type { Metadata } from "next";
import Image from "next/image";

import { seedContent } from "@/content";
import { requireAdmin } from "@/lib/admin/session";
import { publicMediaUrl } from "@/lib/supabase/env";

import { PhotoForm } from "./photo-form";

export const metadata: Metadata = { title: "Photo" };

export default async function PhotoPage() {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from("site_content").select("photo_path, photo_alt, photo_width, photo_height").eq("id", 1).single();

  const photo =
    row?.photo_path && row.photo_width && row.photo_height
      ? { src: publicMediaUrl(row.photo_path), width: row.photo_width, height: row.photo_height }
      : { src: seedContent.photo.src, width: seedContent.photo.width, height: seedContent.photo.height };

  return (
    <>
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em]">Photo</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">La grande photo de l’accueil. Le changement est visible sur le site dès l’enregistrement.</p>

      {error ? (
        <p role="alert" className="mt-8 text-sm font-bold text-danger">
          Impossible de lire la photo actuelle pour le moment. Rechargez la page.
        </p>
      ) : (
        <>
          <figure className="mt-6 grid gap-2 rounded-lg bg-surface p-6">
            <Image
              src={photo.src}
              alt={row.photo_alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 768px) 320px, 70vw"
              className="h-auto w-full max-w-80 rounded-md bg-tint"
            />
            <figcaption className="text-xs text-muted">
              Photo actuelle · {photo.width} × {photo.height} px{row.photo_path ? "" : " · livrée avec le site"}
            </figcaption>
          </figure>
          <PhotoForm alt={row.photo_alt} isCustom={row.photo_path !== null} />
        </>
      )}
    </>
  );
}
