-- Statistiques par appareil et par pays pour /admin/statistiques. La vue click_daily (jour, type, cible) reste
-- telle quelle ; celle-ci ajoute les deux dimensions, toujours agrégées : aucun événement individuel n'est exposé.
-- security_invoker : la lecture passe par la politique click_events_read (admins seulement).

create view public.click_daily_detail
with (security_invoker = true)
as
  select (occurred_at at time zone 'Africa/Abidjan')::date as day,
         kind,
         target,
         device,
         country,
         count(*)::integer as total
  from public.click_events
  group by 1, 2, 3, 4, 5;
