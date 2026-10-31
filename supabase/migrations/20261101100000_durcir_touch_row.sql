-- touch_row() : search_path fixé (alerte « Function Search Path Mutable » de Supabase). La fonction n'utilise que
-- now() (pg_catalog, toujours résolu) et auth.uid() déjà qualifié : un search_path vide ne change rien à son effet.
-- is_admin() / is_owner() restent exécutables par anon : les politiques de lecture publique (social_links,
-- contact_channels) les appellent aussi pour les visiteurs ; elles ne révèlent que « l'appelant est-il admin ».

alter function public.touch_row() set search_path = '';
