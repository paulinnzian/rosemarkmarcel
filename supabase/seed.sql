-- Généré par scripts/generate-seed.ts depuis src/content.ts : ne pas modifier à la main.
-- Contenus actuels de Rosemark Marcel (repris avec son accord). Rejouable : remplace le contenu existant.

begin;

-- photo_path null = photo livrée avec le site (/images/marcel-detoure.webp) ; l'admin la remplace par un envoi dans public-media.
insert into public.site_content (id, creator_name, tagline, role_line, concept_name, photo_path, photo_alt, photo_width, photo_height, sections)
values (1, 'Rosemark Marcel', 'Humour & bonne humeur', 'Web humoriste · Créateur du Repos', 'Le Repos', null, 'Rosemark Marcel dans sa tenue bleue, blanche et orange du concept Le Repos', 1024, 1535,
        '{"nav":[{"label":"À propos","href":"#a-propos"},{"label":"Mon univers","href":"#univers"},{"label":"La communauté","href":"#communaute"},{"label":"Collaborations","href":"#contact"}],"hero":{"heading":{"lines":["Un peu de rire.","Beaucoup","de Repos."],"highlightFrom":1},"intro":"Moi, c’est Rosemark Marcel. Bienvenue dans mon univers, là où l’humour prend toute sa place.","primaryCta":{"label":"Entrez dans l’univers ↗","href":"#communaute"}},"photoLabel":{"kicker":"Le concept signé Marcel","text":"Le Repos ✦"},"marquee":["On se retrouve pour rire","Le Repos","La bonne humeur se partage","Rosemark Marcel"],"about":{"kicker":"À propos","heading":{"lines":["Moi, c’est","Rosemark Marcel."],"highlightFrom":1},"subtitle":"Web humoriste & créateur du concept « Le Repos »","paragraphs":["Bienvenue dans mon univers ! Je suis Rosemark Marcel, web humoriste et créateur du concept « Le Repos ». À travers mes contenus, je vous invite à partager des moments de rire et de bonne humeur.","Ma tenue bleue, blanche et orange fait partie de l’identité du « Repos ». Vous pouvez retrouver mon univers sur Facebook, Instagram, TikTok et YouTube.","Merci à toutes celles et à tous ceux qui suivent mes contenus et soutiennent cette aventure."],"cta":{"label":"Retrouvez-moi sur les réseaux ↗","href":"#communaute"}},"community":{"kicker":"01 / La communauté","heading":{"lines":["Le rire nous rassemble."],"highlightFrom":null},"intro":"Rejoignez-moi sur les réseaux pour retrouver mes contenus et suivre l’aventure.","countersSourceLabel":"Chiffres communiqués par Marcel"},"universe":{"kicker":"02 / Mon univers","heading":{"lines":["Une tenue.","Tout un concept."],"highlightFrom":null},"cardText":["Ça, c’est","Le Repos."],"paragraphs":["« Le Repos », c’est le concept que j’ai créé. Une identité à retrouver jusque dans ma tenue : du bleu, du blanc et une touche d’orange.","Un univers à découvrir, des moments à partager et toujours une place pour la bonne humeur."],"cta":{"label":"Retrouvez mes contenus ↗","href":"https://www.facebook.com/profile.php?id=100064043561730"}},"contact":{"kicker":"04 / Collaborations","heading":{"lines":["Et si on créait","quelque chose ensemble ?"],"highlightFrom":null},"intro":"Une marque, un projet, une idée ? Contactez-moi pour discuter de votre collaboration.","note":"Contact professionnel · Collaborations"},"footerLine":"Le Repos · L’humour, tout simplement."}'::jsonb)
on conflict (id) do update set
  creator_name = excluded.creator_name, tagline = excluded.tagline, role_line = excluded.role_line,
  concept_name = excluded.concept_name, photo_path = excluded.photo_path, photo_alt = excluded.photo_alt,
  photo_width = excluded.photo_width, photo_height = excluded.photo_height, sections = excluded.sections;

insert into public.donation_settings (id, enabled, payment_url, button_label, floating_label, texts, disabled_modal)
values (1, false, null, 'Soutenir Marcel ♡', 'Me soutenir ♡',
        '{"kicker":"03 / Un geste qui compte","heading":{"lines":["Vous aimez rire","avec moi ? ♡"],"highlightFrom":null},"text":"Vous pouvez soutenir mon travail avec un don libre. Chaque geste m’encourage à continuer cette aventure avec vous. Merci pour la force !","cardTitle":["Un peu de soutien,","beaucoup de motivation."],"cardText":"Un don libre, selon votre envie et vos moyens.","thanks":"Merci de faire partie de l’aventure.","feeNote":"Le site ne prend rien sur votre don : seuls les frais de votre service de paiement s’appliquent."}'::jsonb,
        '{"kicker":"Merci pour votre soutien ♡","title":"Les dons arrivent bientôt.","text":"Le lien de paiement sera ajouté prochainement. En attendant, retrouvez Marcel sur ses réseaux.","close":"Fermer"}'::jsonb)
on conflict (id) do update set
  enabled = excluded.enabled, payment_url = excluded.payment_url, button_label = excluded.button_label,
  floating_label = excluded.floating_label, texts = excluded.texts, disabled_modal = excluded.disabled_modal;

delete from public.social_links;
insert into public.social_links (network, handle, url, followers, followers_updated_at, action_label, fallback_label, fallback_sublabel, position, visible)
values
  ('facebook', 'Rosemark Marcel', 'https://www.facebook.com/profile.php?id=100064043561730', 340000, null, 'Rejoindre la communauté', null, null, 0, true),
  ('instagram', 'marcel_rosemark_officiel', 'https://www.instagram.com/marcel_rosemark_officiel', 55600, null, 'Suivre mon univers', null, null, 1, true),
  ('tiktok', 'rosemarkmarcel', 'https://www.tiktok.com/@rosemarkmarcel', 393400, null, 'Rejoindre mon TikTok', null, null, 2, true),
  ('youtube', 'RosemarkMarcelOfficiel', 'https://www.youtube.com/@RosemarkMarcelOfficiel/videos', null, null, 'Découvrir la chaîne officielle', 'Mes vidéos', 'Découvrir la chaîne officielle', 3, true);

delete from public.contact_channels;
insert into public.contact_channels (type, value, display, label, prefilled_message, position)
values
  ('whatsapp', '+2250706400690', '+225 07 06 40 06 90', 'Discuter sur WhatsApp ↗', 'Bonjour Marcel, je souhaite vous contacter pour une collaboration.', 0),
  ('phone', '+2250706400690', '+225 07 06 40 06 90', 'Appeler Marcel', null, 1);

commit;
