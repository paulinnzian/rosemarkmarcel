-- Menu : une entrée « Contact » vers la page /contact, ajoutée en dernier. Rien ne change si un lien vers /contact
-- existe déjà (ajouté dans l'admin) ou si le menu est plein (6 entrées au plus, comme le schéma du site).

update public.site_content
set sections = jsonb_set(sections, '{nav}', (sections->'nav') || '[{"label": "Contact", "href": "/contact"}]'::jsonb)
where id = 1
  and jsonb_typeof(sections->'nav') = 'array'
  and jsonb_array_length(sections->'nav') < 6
  and not (sections->'nav') @> '[{"href": "/contact"}]'::jsonb;
