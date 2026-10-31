-- Vérification des liens sortants (lien de paiement, réseaux) : le dernier résultat de chaque lien, lu sur le
-- tableau de bord. Remplacée en entier à chaque vérification (après un enregistrement, sur demande, chaque jour).
-- Admins seulement ; la tâche quotidienne écrit avec la clé service.

create table public.link_checks (
  url         text primary key,
  label       text not null,
  status      text not null check (status in ('ok', 'broken', 'unreachable', 'unverifiable')),
  http_status smallint,
  checked_at  timestamptz not null default now()
);

alter table public.link_checks enable row level security;

create policy link_checks_admin on public.link_checks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
