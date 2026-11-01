-- Menu : les rubriques ouvrent désormais leurs pages (/a-propos, /univers, /communaute, /collaborations) au lieu
-- de faire défiler l'accueil. Seuls les liens restés à leur valeur d'origine changent ; un lien modifié dans
-- l'admin est conservé tel quel.

update public.site_content
set sections = jsonb_set(
  sections,
  '{nav}',
  (
    select jsonb_agg(
      case item->>'href'
        when '#a-propos' then jsonb_set(item, '{href}', '"/a-propos"')
        when '#univers' then jsonb_set(item, '{href}', '"/univers"')
        when '#communaute' then jsonb_set(item, '{href}', '"/communaute"')
        when '#contact' then jsonb_set(item, '{href}', '"/collaborations"')
        else item
      end
      order by position
    )
    from jsonb_array_elements(sections->'nav') with ordinality as entries(item, position)
  )
)
-- Un menu vide donnerait null (jsonb_agg sur aucune ligne) : il est laissé tel quel.
where id = 1 and jsonb_typeof(sections->'nav') = 'array' and jsonb_array_length(sections->'nav') > 0;
