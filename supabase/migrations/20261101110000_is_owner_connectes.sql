-- is_owner() : réservée aux comptes connectés (alerte « Public Can Execute SECURITY DEFINER Function » de Supabase).
-- Seule la politique admin_users_write (rôle authenticated) l'appelle ; aucun visiteur n'en a besoin.
-- is_admin() reste exécutable par anon : social_links_read et contact_channels_read l'appellent pour les visiteurs.

revoke execute on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated, service_role;
