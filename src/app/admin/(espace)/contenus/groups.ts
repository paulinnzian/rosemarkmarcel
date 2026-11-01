// Formulaires de /admin/contenus : un groupe = un formulaire. Lu par le formulaire (affichage) et par l'action
// (lecture des champs) : l'action ne fait confiance qu'à cette liste, jamais à des noms de champs envoyés par le navigateur.

export type ContentField = {
  kind: "text" | "paragraph" | "paragraphs" | "lines" | "heading";
  path: string;
  label: string;
  hint?: string;
};

export type ContentGroup = { id: string; title: string; fields: ContentField[] };

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "identite",
    title: "Nom et accroche",
    fields: [
      { kind: "text", path: "creatorName", label: "Nom affiché" },
      { kind: "text", path: "tagline", label: "Accroche", hint: "Sous le nom, en haut de la page." },
      { kind: "text", path: "roleLine", label: "Ligne de présentation", hint: "Par exemple « Web humoriste · créateur du Repos »." },
      { kind: "text", path: "conceptName", label: "Nom du concept" },
    ],
  },
  {
    id: "accueil",
    title: "Accueil",
    fields: [
      { kind: "heading", path: "hero.heading", label: "Grand titre" },
      { kind: "paragraph", path: "hero.intro", label: "Texte d’introduction" },
      { kind: "text", path: "hero.primaryCta.label", label: "Texte du bouton principal" },
      { kind: "text", path: "photoLabel.kicker", label: "Étiquette de la photo, petit texte" },
      { kind: "text", path: "photoLabel.text", label: "Étiquette de la photo, grand texte" },
    ],
  },
  {
    id: "bandeau",
    title: "Bandeau et pied de page",
    fields: [
      { kind: "lines", path: "marquee", label: "Phrases du bandeau", hint: "Une phrase par ligne. Elles défilent entre les étoiles ✦." },
      { kind: "text", path: "footerLine", label: "Phrase du pied de page" },
    ],
  },
  {
    id: "a-propos",
    title: "À propos",
    fields: [
      { kind: "text", path: "about.kicker", label: "Petit titre" },
      { kind: "heading", path: "about.heading", label: "Titre" },
      { kind: "text", path: "about.subtitle", label: "Sous-titre" },
      { kind: "paragraphs", path: "about.paragraphs", label: "Texte", hint: "Laissez une ligne vide entre deux paragraphes." },
      { kind: "text", path: "about.cta.label", label: "Texte du bouton" },
    ],
  },
  {
    id: "communaute",
    title: "Communauté",
    fields: [
      { kind: "text", path: "community.kicker", label: "Petit titre" },
      { kind: "heading", path: "community.heading", label: "Titre" },
      { kind: "paragraph", path: "community.intro", label: "Texte d’introduction" },
      { kind: "text", path: "community.countersSourceLabel", label: "Mention sous les compteurs", hint: "Par exemple « Chiffres relevés sur chaque réseau »." },
    ],
  },
  {
    id: "univers",
    title: "Univers",
    fields: [
      { kind: "text", path: "universe.kicker", label: "Petit titre" },
      { kind: "heading", path: "universe.heading", label: "Titre" },
      { kind: "text", path: "universe.cardText.0", label: "Carte, 1re ligne" },
      { kind: "text", path: "universe.cardText.1", label: "Carte, 2e ligne" },
      { kind: "paragraphs", path: "universe.paragraphs", label: "Texte", hint: "Laissez une ligne vide entre deux paragraphes." },
      { kind: "text", path: "universe.cta.label", label: "Texte du bouton" },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    fields: [
      { kind: "text", path: "contact.kicker", label: "Petit titre" },
      { kind: "heading", path: "contact.heading", label: "Titre" },
      { kind: "paragraph", path: "contact.intro", label: "Texte d’introduction" },
      { kind: "paragraph", path: "contact.note", label: "Note sous les contacts" },
    ],
  },
  {
    id: "page-a-propos",
    title: "Page À propos",
    fields: [
      { kind: "text", path: "pages.about.kicker", label: "Petit titre" },
      { kind: "heading", path: "pages.about.heading", label: "Titre" },
      { kind: "paragraph", path: "pages.about.intro", label: "Introduction" },
      { kind: "paragraphs", path: "pages.about.story", label: "Mon histoire", hint: "Laissez une ligne vide entre deux paragraphes." },
      { kind: "text", path: "pages.about.valuesHeading", label: "Titre des valeurs" },
      ...blockFields("pages.about.values", 3, "Valeur"),
      { kind: "paragraph", path: "pages.about.closing", label: "Phrase de fin" },
      { kind: "text", path: "pages.about.closingCta.label", label: "Texte du bouton de fin" },
    ],
  },
  {
    id: "page-univers",
    title: "Page Mon univers",
    fields: [
      { kind: "text", path: "pages.universe.kicker", label: "Petit titre" },
      { kind: "heading", path: "pages.universe.heading", label: "Titre" },
      { kind: "paragraph", path: "pages.universe.intro", label: "Introduction" },
      { kind: "text", path: "pages.universe.conceptHeading", label: "Titre du concept" },
      { kind: "paragraphs", path: "pages.universe.concept", label: "Le concept", hint: "Laissez une ligne vide entre deux paragraphes." },
      { kind: "text", path: "pages.universe.episodesHeading", label: "Titre des épisodes" },
      { kind: "paragraph", path: "pages.universe.episodesIntro", label: "Texte au-dessus des épisodes" },
      { kind: "paragraph", path: "pages.universe.episodesEmpty", label: "Message si les épisodes ne s’affichent pas" },
      { kind: "text", path: "pages.universe.youtubeChannelId", label: "Identifiant de la chaîne YouTube", hint: "Commence par UC (24 caractères). Les épisodes viennent de cette chaîne." },
    ],
  },
  {
    id: "page-communaute",
    title: "Page La communauté",
    fields: [
      { kind: "text", path: "pages.community.kicker", label: "Petit titre" },
      { kind: "heading", path: "pages.community.heading", label: "Titre" },
      { kind: "paragraph", path: "pages.community.intro", label: "Introduction" },
      { kind: "text", path: "pages.community.totalLabel", label: "Texte sous le total des abonnés" },
      { kind: "text", path: "pages.community.supportHeading", label: "Titre « comment soutenir »" },
      { kind: "text", path: "pages.community.support.follow.title", label: "Suivre, titre" },
      { kind: "paragraph", path: "pages.community.support.follow.text", label: "Suivre, texte" },
      { kind: "text", path: "pages.community.support.share.title", label: "Partager, titre" },
      { kind: "paragraph", path: "pages.community.support.share.text", label: "Partager, texte" },
      { kind: "text", path: "pages.community.support.donate.title", label: "Faire un don, titre" },
      { kind: "paragraph", path: "pages.community.support.donate.text", label: "Faire un don, texte" },
      { kind: "text", path: "pages.community.shareLabel", label: "Texte du bouton de partage" },
      { kind: "paragraph", path: "pages.community.shareText", label: "Message partagé avec le lien" },
    ],
  },
  {
    id: "page-collaborations",
    title: "Page Collaborations",
    fields: [
      { kind: "text", path: "pages.collaborations.kicker", label: "Petit titre" },
      { kind: "heading", path: "pages.collaborations.heading", label: "Titre" },
      { kind: "paragraph", path: "pages.collaborations.intro", label: "Introduction" },
      { kind: "text", path: "pages.collaborations.audienceHeading", label: "Titre de l’audience" },
      { kind: "text", path: "pages.collaborations.audienceNote", label: "Mention sous les chiffres" },
      { kind: "text", path: "pages.collaborations.formatsHeading", label: "Titre des formats" },
      ...blockFields("pages.collaborations.formats", 4, "Format"),
      { kind: "text", path: "pages.collaborations.stepsHeading", label: "Titre des étapes" },
      ...blockFields("pages.collaborations.steps", 3, "Étape"),
      { kind: "text", path: "pages.collaborations.ctaHeading", label: "Titre de l’appel à écrire" },
      { kind: "paragraph", path: "pages.collaborations.ctaText", label: "Texte de l’appel à écrire" },
      { kind: "paragraph", path: "pages.collaborations.whatsappMessage", label: "Message WhatsApp pré-rempli" },
    ],
  },
];

/** Titre et texte de chaque bloc d'une liste de taille fixe (valeurs, formats, étapes). */
function blockFields(path: string, count: number, label: string): ContentField[] {
  return Array.from({ length: count }, (_, index) => [
    { kind: "text" as const, path: `${path}.${index}.title`, label: `${label} ${index + 1}, titre` },
    { kind: "paragraph" as const, path: `${path}.${index}.text`, label: `${label} ${index + 1}, texte` },
  ]).flat();
}

/** Valeur au chemin « a.b.0.c » (les segments numériques indexent les tableaux). */
export function valueAt(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (value == null ? undefined : (value as Record<string, unknown>)[key]), source);
}

/** Écrit la valeur au chemin, en place. Les objets intermédiaires doivent exister. */
export function setValueAt(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop() as string;
  const parent = keys.reduce<Record<string, unknown>>((node, key) => node[key] as Record<string, unknown>, target);
  parent[last] = value;
}
