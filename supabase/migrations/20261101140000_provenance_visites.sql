-- Provenance des visites, pour mesurer le référencement, les réseaux et les campagnes payantes sans traqueur tiers.
-- Sur la vue de la page d'arrivée seulement : la source (utm_source, sinon le site d'origine réduit à un nom :
-- google, facebook…, ou « direct ») et la campagne (utm_campaign). Les pages vues ensuite sur le site n'ont pas de
-- source. Jamais l'adresse complète de la page d'origine ; la campagne est un nom court, pas un texte libre.

alter table public.click_events
  add column source   text check (source ~ '^[a-z0-9_-]{1,40}$'),
  add column campaign text check (campaign ~ '^[a-z0-9_-]{1,60}$');

-- Une ligne par arrivée sur le site, agrégée comme les autres vues : aucun événement individuel n'est exposé.
-- security_invoker : la lecture passe par la politique click_events_read (admins seulement).
create view public.visit_sources
with (security_invoker = true)
as
  select (occurred_at at time zone 'Africa/Abidjan')::date as day,
         source,
         campaign,
         count(*)::integer as total
  from public.click_events
  where kind = 'page_view' and source is not null
  group by 1, 2, 3;
