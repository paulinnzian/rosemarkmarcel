-- Site de Rosemark Marcel : schéma Supabase (Postgres). Première migration.
-- Un seul créateur : pas de colonne propriétaire, l'accès se joue sur « est admin ».
-- Accès : Row Level Security sur toutes les tables (lecture publique du contenu, écriture réservée aux admins).
-- Heures en timestamptz (UTC) ; affichage des statistiques en Africa/Abidjan.

-- ---------------------------------------------------------------------------
-- Admins (liste blanche). Gérée par SQL ou par un admin « owner », jamais par l'inscription libre.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  role       text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;

create or replace function public.touch_row()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Contenu du site (une seule ligne). Les textes des sections sont en jsonb, validés par Zod
-- à l'écriture : ajouter un texte ne demande pas de migration.
-- ---------------------------------------------------------------------------
create table public.site_content (
  id            smallint primary key default 1 check (id = 1),
  creator_name  text not null check (char_length(creator_name) between 1 and 80),
  tagline       text not null,
  role_line     text not null,
  concept_name  text not null,
  photo_path    text,                      -- objet du bucket public-media ; null = pas de photo
  photo_alt     text not null,
  photo_width   integer check (photo_width > 0),
  photo_height  integer check (photo_height > 0),
  sections      jsonb not null default '{}'::jsonb check (jsonb_typeof(sections) = 'object'),
                                           -- hero, photoLabel, marquee, about, universe, community, contact, footer
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users (id) on delete set null,
  constraint photo_dimensions_together check ((photo_path is null) or (photo_width is not null and photo_height is not null))
);

create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Dons (une seule ligne). Lien de paiement collé dans l'admin ; aucun prestataire intégré.
-- ---------------------------------------------------------------------------
create table public.donation_settings (
  id             smallint primary key default 1 check (id = 1),
  enabled        boolean not null default false,
  payment_url    text check (payment_url is null or payment_url ~ '^https://[^[:space:]]+$'),
  button_label   text not null,            -- « Soutenir Marcel ♡ »
  floating_label text not null,            -- « Me soutenir ♡ » (bouton épinglé)
  texts          jsonb not null default '{}'::jsonb check (jsonb_typeof(texts) = 'object'),
  disabled_modal jsonb not null default '{}'::jsonb check (jsonb_typeof(disabled_modal) = 'object'),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null,
  constraint enabled_needs_url check (not enabled or payment_url is not null)
);

create trigger donation_settings_touch before update on public.donation_settings
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Réseaux sociaux et compteurs d'abonnés.
-- ---------------------------------------------------------------------------
create table public.social_links (
  id                   uuid primary key default gen_random_uuid(),
  network              text not null check (network in ('facebook', 'instagram', 'tiktok', 'youtube', 'snapchat', 'x', 'whatsapp_channel')),
  handle               text not null check (char_length(handle) between 1 and 60),
  url                  text not null check (url ~ '^https://[^[:space:]]+$'),
  followers            bigint check (followers >= 0),   -- null = carte sans compteur
  followers_updated_at timestamptz,
  sync_mode            text not null default 'manual' check (sync_mode in ('manual', 'auto')),
  action_label         text not null,                   -- « Rejoindre la communauté »
  fallback_label       text,                            -- « Mes vidéos », si followers est null
  fallback_sublabel    text,
  position             smallint not null default 0,
  visible              boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users (id) on delete set null
);

create index social_links_visible_position_idx on public.social_links (position) where visible;

create trigger social_links_touch before update on public.social_links
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Canaux de contact (WhatsApp, téléphone, e-mail).
-- ---------------------------------------------------------------------------
create table public.contact_channels (
  id                uuid primary key default gen_random_uuid(),
  type              text not null check (type in ('whatsapp', 'phone', 'email')),
  value             text not null,          -- E.164 (+2250706400690) ou adresse e-mail
  display           text not null,          -- « +225 07 06 40 06 90 »
  label             text not null,          -- « Discuter sur WhatsApp »
  prefilled_message text check (char_length(prefilled_message) <= 500),
  note              text,
  position          smallint not null default 0,
  visible           boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  updated_by        uuid references auth.users (id) on delete set null,
  constraint value_format check (
    (type in ('whatsapp', 'phone') and value ~ '^\+[1-9][0-9]{7,14}$')
    or (type = 'email' and value ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
  ),
  constraint message_only_whatsapp check (prefilled_message is null or type = 'whatsapp')
);

create index contact_channels_visible_position_idx on public.contact_channels (position) where visible;

create trigger contact_channels_touch before update on public.contact_channels
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Statistiques : vues et clics. Ni cookie, ni IP, ni identifiant de visiteur.
-- Écrites uniquement par la route serveur /api/evenements (clé service), lues par les admins.
-- ---------------------------------------------------------------------------
create table public.click_events (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('page_view', 'social', 'whatsapp', 'phone', 'donation', 'cta')),
  target      text check (char_length(target) <= 40),          -- réseau, « floating », « hero »…
  path        text not null default '/' check (char_length(path) <= 200),
  country     char(2),                                          -- cf-ipcountry ou équivalent (src/lib/request-host.ts)
  device      text check (device in ('mobile', 'tablet', 'desktop')),
  occurred_at timestamptz not null default now()
);

create index click_events_occurred_at_idx on public.click_events (occurred_at);
create index click_events_kind_occurred_at_idx on public.click_events (kind, occurred_at);

create view public.click_daily
with (security_invoker = true)
as
  select (occurred_at at time zone 'Africa/Abidjan')::date as day,
         kind,
         target,
         count(*)::integer as total
  from public.click_events
  group by 1, 2, 3;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users       enable row level security;
alter table public.site_content      enable row level security;
alter table public.donation_settings enable row level security;
alter table public.social_links      enable row level security;
alter table public.contact_channels  enable row level security;
alter table public.click_events      enable row level security;

-- admin_users : chacun voit sa ligne, un admin voit la liste, seul un owner l'écrit.
create policy admin_users_select on public.admin_users for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy admin_users_write on public.admin_users for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- Contenu : lecture publique, écriture admins.
create policy site_content_read on public.site_content for select to anon, authenticated using (true);
create policy site_content_write on public.site_content for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy donation_settings_read on public.donation_settings for select to anon, authenticated using (true);
create policy donation_settings_write on public.donation_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy social_links_read on public.social_links for select to anon, authenticated
  using (visible or public.is_admin());
create policy social_links_write on public.social_links for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy contact_channels_read on public.contact_channels for select to anon, authenticated
  using (visible or public.is_admin());
create policy contact_channels_write on public.contact_channels for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Statistiques : aucune politique d'écriture (la clé service contourne RLS côté serveur) ; lecture admins.
create policy click_events_read on public.click_events for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Stockage : photo détourée et images (bucket public en lecture, écriture admins).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-media', 'public-media', true, 5242880, array['image/png', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;

create policy public_media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());
create policy public_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and public.is_admin()) with check (bucket_id = 'public-media' and public.is_admin());
create policy public_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Lignes uniques de départ (le contenu réel vient de seed.sql, généré depuis src/content.ts).
-- ---------------------------------------------------------------------------
insert into public.site_content (id, creator_name, tagline, role_line, concept_name, photo_alt)
values (1, 'Rosemark Marcel', 'Humour & bonne humeur', 'Web humoriste · créateur du Repos', 'Le Repos',
        'Rosemark Marcel dans sa tenue bleue, blanche et orange du concept Le Repos')
on conflict (id) do nothing;

insert into public.donation_settings (id, button_label, floating_label)
values (1, 'Soutenir Marcel ♡', 'Me soutenir ♡')
on conflict (id) do nothing;

-- Purge des statistiques de plus de 13 mois (extension pg_cron, à activer dans Supabase) :
-- select cron.schedule('purge-click-events', '15 3 * * *',
--   $$ delete from public.click_events where occurred_at < now() - interval '13 months' $$);
