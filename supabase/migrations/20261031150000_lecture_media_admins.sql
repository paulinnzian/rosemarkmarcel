-- Les admins doivent pouvoir lister les objets du bucket public-media : Storage cherche les fichiers à supprimer
-- avec un SELECT soumis à RLS. Sans cette politique, remove() ne trouve rien et répond « succès » sans rien effacer
-- (anciennes photos jamais supprimées, BUG-002). La lecture publique des fichiers passe par l'URL publique du bucket,
-- pas par cette table : les visiteurs n'en ont pas besoin.

create policy public_media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
