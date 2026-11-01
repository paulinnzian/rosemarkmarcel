import { z } from "zod";

// Contrat du contenu du site : le même schéma valide les valeurs initiales (content.ts),
// les formulaires de l'admin et les lignes lues dans Supabase.

// Messages écrits pour l'admin : ils s'affichent sous les champs des formulaires.
const text = z.string().trim().min(1, "Ce champ ne peut pas être vide.");
export const httpsUrl = z.url({ protocol: /^https$/, error: "Le lien doit commencer par https://" });
const paragraphs = z.array(text).min(1, "Écrivez au moins un paragraphe.");
const anchor = z.string().regex(/^#[a-z-]+$/);
// Page du site : « / », « /a-propos »…, éventuellement suivie d'une ancre.
const route = z.string().regex(/^\/[a-z-]*(#[a-z-]+)?$/);
const e164 = z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Numéro au format international : +225…");

export const headingSchema = z
  .object({
    lines: z.array(text).min(1, "Écrivez au moins une ligne.").max(4, "Quatre lignes au plus."),
    // Index de la première ligne en couleur d'accent ; null = titre d'une seule couleur.
    highlightFrom: z.number().int().min(1).nullable(),
  })
  .refine((heading) => heading.highlightFrom === null || heading.highlightFrom < heading.lines.length, {
    message: "Le titre n’a pas assez de lignes pour cette couleur.",
    path: ["highlightFrom"],
  });

const ctaSchema = z.object({ label: text, href: z.union([anchor, route, httpsUrl]) });

export const networkSchema = z.enum(["facebook", "instagram", "tiktok", "youtube", "snapchat", "x", "whatsapp_channel"]);

export const socialLinkSchema = z
  .object({
    network: networkSchema,
    name: text,
    handle: text,
    url: httpsUrl,
    followers: z.number().int().nonnegative().nullable(),
    actionLabel: text,
    fallbackLabel: text.optional(),
    fallbackSublabel: text.optional(),
    updatedAt: z.iso.date().optional(),
    visible: z.boolean(),
  })
  .refine((link) => link.followers !== null || link.fallbackLabel !== undefined, {
    message: "Un réseau sans compteur a besoin d’un texte de remplacement.",
    path: ["fallbackLabel"],
  });

export const contactChannelSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("whatsapp"), value: e164, display: text, label: text, prefilledMessage: z.string().max(500).optional() }),
  z.object({ type: z.literal("phone"), value: e164, display: text, label: text }),
  z.object({ type: z.literal("email"), value: z.email({ error: "Adresse e-mail invalide." }), display: text, label: text }),
]);

export const donationSchema = z
  .object({
    enabled: z.boolean(),
    paymentUrl: httpsUrl.nullable(),
    buttonLabel: text,
    floatingLabel: text,
    texts: z.object({ kicker: text, heading: headingSchema, text, cardTitle: z.tuple([text, text]), cardText: text, thanks: text, feeNote: text.optional() }),
    disabledModal: z.object({ kicker: text, title: text, text, close: text }),
  })
  .refine((donation) => !donation.enabled || donation.paymentUrl !== null, {
    message: "Collez un lien de paiement avant d’activer les dons.",
    path: ["paymentUrl"],
  });

// Un bloc de texte titré : une valeur, une façon de soutenir, un format de collaboration, une étape.
const blockSchema = z.object({ title: text, text });

// Pages À propos, Mon univers, La communauté et Collaborations. Lues page par page avec repli sur content.ts :
// une base qui n'a pas encore une page (ou un champ ajouté plus tard) reste valide.
export const pagesSchema = z.object({
  about: z.object({
    kicker: text,
    heading: headingSchema,
    intro: text,
    story: paragraphs,
    valuesHeading: text,
    values: z.array(blockSchema).min(1).max(4),
    closing: text,
    closingCta: ctaSchema,
  }),
  universe: z.object({
    kicker: text,
    heading: headingSchema,
    intro: text,
    conceptHeading: text,
    concept: paragraphs,
    episodesHeading: text,
    episodesIntro: text,
    episodesEmpty: text,
    youtubeChannelId: z.string().regex(/^UC[\w-]{22}$/, "Identifiant de chaîne YouTube : UC suivi de 22 caractères."),
  }),
  community: z.object({
    kicker: text,
    heading: headingSchema,
    intro: text,
    totalLabel: text,
    supportHeading: text,
    // Un bloc par geste, nommé : chaque bloc porte son bouton (réseaux, partage, don).
    support: z.object({ follow: blockSchema, share: blockSchema, donate: blockSchema }),
    shareLabel: text,
    shareText: text,
  }),
  collaborations: z.object({
    kicker: text,
    heading: headingSchema,
    intro: text,
    audienceHeading: text,
    audienceNote: text,
    formatsHeading: text,
    formats: z.array(blockSchema).min(1).max(6),
    stepsHeading: text,
    steps: z.array(blockSchema).min(2).max(5),
    ctaHeading: text,
    ctaText: text,
    whatsappMessage: text.max(500),
  }),
  contact: z.object({
    kicker: text,
    heading: headingSchema,
    intro: text,
    whatsappMessage: text.max(500),
    socialsHeading: text,
    socialsText: text,
    brandsHeading: text,
    brandsText: text,
    brandsCta: ctaSchema,
  }),
});

export const siteContentSchema = z.object({
  creatorName: text,
  tagline: text,
  roleLine: text,
  conceptName: text,
  nav: z.array(z.object({ label: text, href: z.union([anchor, route]) })).max(6),
  hero: z.object({ heading: headingSchema, intro: text, primaryCta: ctaSchema }),
  photo: z.object({ src: text, alt: text, width: z.number().int().positive(), height: z.number().int().positive() }),
  photoLabel: z.object({ kicker: text, text }),
  marquee: z.array(text),
  about: z.object({ kicker: text, heading: headingSchema, subtitle: text, paragraphs: paragraphs, cta: ctaSchema }),
  community: z.object({ kicker: text, heading: headingSchema, intro: text, countersSourceLabel: text }),
  universe: z.object({ kicker: text, heading: headingSchema, cardText: z.tuple([text, text]), paragraphs: paragraphs, cta: ctaSchema }),
  contact: z.object({ kicker: text, heading: headingSchema, intro: text, note: text }),
  footerLine: text,
  pages: pagesSchema,
  socials: z.array(socialLinkSchema),
  contacts: z.array(contactChannelSchema),
  donation: donationSchema,
});

export type Heading = z.infer<typeof headingSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type ContactChannel = z.infer<typeof contactChannelSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type Pages = z.infer<typeof pagesSchema>;
