// Génère supabase/seed.sql depuis src/content.ts (valeurs initiales du site).
// Usage : pnpm db:seed   puis   pnpm exec supabase db reset (local) ou psql (production, une seule fois).
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { seedContent } from "@/content";

const sql = (value: string | null | undefined): string =>
  value === null || value === undefined ? "null" : `'${value.replaceAll("'", "''")}'`;
const json = (value: unknown): string => `${sql(JSON.stringify(value))}::jsonb`;
const num = (value: number | null | undefined): string => (value === null || value === undefined ? "null" : String(value));

const c = seedContent;

// Les textes des sections vivent dans site_content.sections (jsonb), validés par Zod à la lecture et à l'écriture.
const sections = {
  nav: c.nav,
  hero: c.hero,
  photoLabel: c.photoLabel,
  marquee: c.marquee,
  about: c.about,
  community: c.community,
  universe: c.universe,
  contact: c.contact,
  footerLine: c.footerLine,
};

const socialRows = c.socials.map(
  (link, position) =>
    `  (${sql(link.network)}, ${sql(link.handle)}, ${sql(link.url)}, ${num(link.followers)}, ${sql(link.updatedAt)}, ` +
    `${sql(link.actionLabel)}, ${sql(link.fallbackLabel)}, ${sql(link.fallbackSublabel)}, ${position}, ${link.visible})`,
);

const contactRows = c.contacts.map(
  (channel, position) =>
    `  (${sql(channel.type)}, ${sql(channel.value)}, ${sql(channel.display)}, ${sql(channel.label)}, ` +
    `${sql(channel.type === "whatsapp" ? channel.prefilledMessage : null)}, ${position})`,
);

const output = `-- Généré par scripts/generate-seed.ts depuis src/content.ts : ne pas modifier à la main.
-- Contenus actuels de Rosemark Marcel (repris avec son accord). Rejouable : remplace le contenu existant.

begin;

-- photo_path null = photo livrée avec le site (${c.photo.src}) ; l'admin la remplace par un envoi dans public-media.
insert into public.site_content (id, creator_name, tagline, role_line, concept_name, photo_path, photo_alt, photo_width, photo_height, sections)
values (1, ${sql(c.creatorName)}, ${sql(c.tagline)}, ${sql(c.roleLine)}, ${sql(c.conceptName)}, null, ${sql(c.photo.alt)}, ${c.photo.width}, ${c.photo.height},
        ${json(sections)})
on conflict (id) do update set
  creator_name = excluded.creator_name, tagline = excluded.tagline, role_line = excluded.role_line,
  concept_name = excluded.concept_name, photo_path = excluded.photo_path, photo_alt = excluded.photo_alt,
  photo_width = excluded.photo_width, photo_height = excluded.photo_height, sections = excluded.sections;

insert into public.donation_settings (id, enabled, payment_url, button_label, floating_label, texts, disabled_modal)
values (1, ${c.donation.enabled}, ${sql(c.donation.paymentUrl)}, ${sql(c.donation.buttonLabel)}, ${sql(c.donation.floatingLabel)},
        ${json(c.donation.texts)},
        ${json(c.donation.disabledModal)})
on conflict (id) do update set
  enabled = excluded.enabled, payment_url = excluded.payment_url, button_label = excluded.button_label,
  floating_label = excluded.floating_label, texts = excluded.texts, disabled_modal = excluded.disabled_modal;

delete from public.social_links;
insert into public.social_links (network, handle, url, followers, followers_updated_at, action_label, fallback_label, fallback_sublabel, position, visible)
values
${socialRows.join(",\n")};

delete from public.contact_channels;
insert into public.contact_channels (type, value, display, label, prefilled_message, position)
values
${contactRows.join(",\n")};

commit;
`;

const target = join(import.meta.dirname, "..", "supabase", "seed.sql");
writeFileSync(target, output);
console.log(`seed écrit : ${target}`);
