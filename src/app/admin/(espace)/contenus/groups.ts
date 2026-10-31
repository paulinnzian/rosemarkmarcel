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
];

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
