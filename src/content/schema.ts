import { z } from "zod";

// Contrat du contenu du site : le même schéma valide les valeurs initiales (content.ts),
// les formulaires de l'admin et les lignes lues dans Supabase.

const text = z.string().trim().min(1);
export const httpsUrl = z.url({ protocol: /^https$/, error: "Le lien doit commencer par https://" });
const anchor = z.string().regex(/^#[a-z-]+$/);
const e164 = z.string().regex(/^\+[1-9][0-9]{7,14}$/, "Numéro au format international : +225…");

export const headingSchema = z.object({
  lines: z.array(text).min(1).max(4),
  // Index de la première ligne en couleur d'accent ; null = titre d'une seule couleur.
  highlightFrom: z.number().int().min(1).nullable(),
});

const ctaSchema = z.object({ label: text, href: z.union([anchor, httpsUrl]) });

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
    message: "Un réseau sans compteur a besoin d'un texte de remplacement.",
    path: ["fallbackLabel"],
  });

export const contactChannelSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("whatsapp"), value: e164, display: text, label: text, prefilledMessage: z.string().max(500).optional() }),
  z.object({ type: z.literal("phone"), value: e164, display: text, label: text }),
  z.object({ type: z.literal("email"), value: z.email(), display: text, label: text }),
]);

export const donationSchema = z
  .object({
    enabled: z.boolean(),
    paymentUrl: httpsUrl.nullable(),
    buttonLabel: text,
    floatingLabel: text,
    texts: z.object({ kicker: text, heading: headingSchema, text, cardTitle: z.tuple([text, text]), cardText: text, thanks: text }),
    disabledModal: z.object({ kicker: text, title: text, text, close: text }),
  })
  .refine((donation) => !donation.enabled || donation.paymentUrl !== null, {
    message: "Collez un lien de paiement avant d'activer les dons.",
    path: ["paymentUrl"],
  });

export const siteContentSchema = z.object({
  creatorName: text,
  tagline: text,
  roleLine: text,
  conceptName: text,
  nav: z.array(z.object({ label: text, href: anchor })).max(6),
  hero: z.object({ heading: headingSchema, intro: text, primaryCta: ctaSchema }),
  photo: z.object({ src: text, alt: text, width: z.number().int().positive(), height: z.number().int().positive() }),
  photoLabel: z.object({ kicker: text, text }),
  marquee: z.array(text),
  about: z.object({ kicker: text, heading: headingSchema, subtitle: text, paragraphs: z.array(text).min(1), cta: ctaSchema }),
  community: z.object({ kicker: text, heading: headingSchema, intro: text, countersSourceLabel: text }),
  universe: z.object({ kicker: text, heading: headingSchema, cardText: z.tuple([text, text]), paragraphs: z.array(text).min(1), cta: ctaSchema }),
  contact: z.object({ kicker: text, heading: headingSchema, intro: text, note: text }),
  footerLine: text,
  socials: z.array(socialLinkSchema),
  contacts: z.array(contactChannelSchema),
  donation: donationSchema,
});

export type Heading = z.infer<typeof headingSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type ContactChannel = z.infer<typeof contactChannelSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
