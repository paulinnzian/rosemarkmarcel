-- Règles d'accès (RLS) : visiteur anonyme, compte connecté non admin, admin.
-- Lancer : pnpm exec supabase test db   (base locale démarrée). Tout est annulé en fin de test.
begin;
select plan(29);

-- Comptes de test (adresses fictives)
insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'rls-admin@exemple.test', 'authenticated', 'authenticated'),
       ('22222222-2222-2222-2222-222222222222', 'rls-visiteur@exemple.test', 'authenticated', 'authenticated');
insert into public.admin_users (user_id, email, role)
values ('11111111-1111-1111-1111-111111111111', 'rls-admin@exemple.test', 'owner');
insert into public.social_links (network, handle, url, action_label, fallback_label, visible, position)
values ('x', 'compte-masque', 'https://x.com/compte-masque', 'Suivre', 'Me suivre', false, 9);
-- Point de départ connu (la base locale garde les événements des tests e2e ; tout est annulé par le rollback final).
delete from public.click_events;
delete from public.link_checks;
insert into public.click_events (kind, target) values ('social', 'facebook');
insert into storage.objects (bucket_id, name) values ('public-media', 'photo/rls-test.png');
insert into public.link_checks (url, label, status) values ('https://exemple.test/rls', 'Lien de test', 'broken');

-- ---------------------------------------------------------------------------
-- Visiteur anonyme : lit le contenu public, n'écrit rien.
-- ---------------------------------------------------------------------------
set local role anon;
select results_eq('select count(*)::int from public.site_content', array[1], 'anon lit le contenu du site');
select results_eq('select count(*)::int from public.donation_settings', array[1], 'anon lit les réglages de dons');
select is_empty($$ select 1 from public.social_links where not visible $$, 'anon ne voit pas un réseau masqué');
select is_empty($$ select 1 from public.admin_users $$, 'anon ne voit pas la liste des admins');
select is_empty($$ select 1 from public.click_events $$, 'anon ne lit pas les statistiques');
select is_empty($$ select 1 from public.click_daily_detail $$, 'anon ne lit pas le détail des statistiques');
select is_empty($$ select 1 from storage.objects where bucket_id = 'public-media' $$, 'anon ne liste pas les fichiers du bucket');
select is_empty($$ select 1 from public.link_checks $$, 'anon ne lit pas la vérification des liens');
select lives_ok($$ update public.site_content set tagline = 'modifié par anon' where id = 1 $$, 'la mise à jour anonyme ne touche aucune ligne');
select throws_ok($$ insert into public.click_events (kind) values ('page_view') $$, '42501', null, 'anon n''écrit pas de statistiques directement');
select throws_ok($$ insert into public.social_links (network, handle, url, action_label) values ('x', 'h', 'https://x.com/h', 'a') $$,
  '42501', null, 'anon n''ajoute pas de réseau');
reset role;
select isnt((select tagline from public.site_content where id = 1), 'modifié par anon', 'le contenu est intact après la tentative anonyme');

-- ---------------------------------------------------------------------------
-- Compte connecté mais absent de la liste blanche.
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
select lives_ok($$ update public.donation_settings set payment_url = 'https://pirate.exemple' where id = 1 $$, 'la mise à jour non admin ne touche aucune ligne');
select throws_ok($$ insert into public.admin_users (user_id, email, role) values ('22222222-2222-2222-2222-222222222222', 'visiteur@exemple.test', 'owner') $$,
  '42501', null, 'un non-admin ne s''ajoute pas à la liste blanche');
select is_empty($$ select 1 from public.click_events $$, 'un non-admin ne lit pas les statistiques');
select is_empty($$ select 1 from public.click_daily_detail $$, 'un non-admin ne lit pas le détail des statistiques');
select is_empty($$ select 1 from storage.objects where bucket_id = 'public-media' $$, 'un non-admin ne liste pas les fichiers du bucket');
select is_empty($$ select 1 from public.social_links where not visible $$, 'un non-admin ne voit pas un réseau masqué');
select throws_ok($$ insert into public.link_checks (url, label, status) values ('https://x.test', 'x', 'ok') $$, '42501', null, 'un non-admin n''écrit pas de vérification de lien');
reset role;
select is((select payment_url from public.donation_settings where id = 1), null, 'le lien de paiement est intact');

-- ---------------------------------------------------------------------------
-- Admin (owner)
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select results_eq($$ select count(*)::int from public.social_links where not visible $$, array[1], 'un admin voit les réseaux masqués');
select results_eq($$ select count(*)::int from public.click_events $$, array[1], 'un admin lit les statistiques');
select results_eq($$ select sum(total)::int from public.click_daily_detail $$, array[1], 'un admin lit le détail des statistiques');
select results_eq($$ select count(*)::int from storage.objects where name = 'photo/rls-test.png' $$, array[1], 'un admin liste les fichiers du bucket (suppression des anciennes photos)');
select lives_ok($$ update public.social_links set followers = 400000 where network = 'facebook' $$, 'un admin modifie un compteur');
select results_eq($$ select count(*)::int from public.link_checks $$, array[1], 'un admin lit la vérification des liens');
select lives_ok($$ insert into public.link_checks (url, label, status, http_status) values ('https://exemple.test/autre', 'Autre', 'ok', 200) $$, 'un admin enregistre une vérification de lien');
select throws_ok($$ update public.donation_settings set enabled = true, payment_url = null where id = 1 $$,
  '23514', null, 'les dons ne s''activent pas sans lien de paiement');
reset role;
select results_eq($$ select followers, updated_by from public.social_links where network = 'facebook' $$,
  $$ values (400000::bigint, '11111111-1111-1111-1111-111111111111'::uuid) $$, 'le compteur est enregistré, avec l''auteur de la modification');

select * from finish();
rollback;
