# Composants : site de Rosemark Marcel + admin

Tokens : `tokens.json` / `tokens.css`. Classes Tailwind par rôle (`bg-canvas`, `text-ink`, `text-muted`, `bg-accent`, `border-line`…), jamais de hex dans un composant.
Police : Inter Tight (`next/font/google`, variable, sous-ensemble latin). Icônes : Lucide (MIT), seulement dans l'admin ; le site public garde les caractères ↗ ♡ ✦ du template.
Écrans : S00–S06, M01 (recon), A01–A08 (admin, `architecture.md`).

Mesures relevées sur le site actuel de Marcel le 2026-10-31 (390 px et 1440 px) ; écarts volontaires signalés par **≠**.

---

## Public

```text
Button
  variants  primary (fond highlight, texte on-highlight)
            accent (fond accent, texte on-accent ; dans le bloc don sur fond blanc : non utilisé)
            text (sans fond, texte ink, 700, suffixe ↗ ou ♡)
  sizes     md : hauteur 54px, padding 17px 24px (18px en mobile), radius sm (6px), text-sm (14/20, 700)
            block : pleine largeur (carte de don)
  states    default ; hover (fond highlight-hover / accent-hover, 120ms) ; active (translateY 1px) ;
            focus-visible (anneau 2px focus, décalage 3px ; blanc sur fond bleu) ; disabled (opacité 50 %, curseur interdit)
  tokens    bg highlight, text on-highlight 7,80:1, radius sm, font sm/700
  a11y      <a> pour une navigation (ancre, lien externe), <button> pour une action (ouvrir la modale) ;
            lien externe : target="_blank" rel="noopener noreferrer" + texte caché « (nouvel onglet) » ;
            cible tactile ≥ 44×44 ; les flèches ↗ ♡ sont aria-hidden
  used on   S01 (Entrez dans l'univers), S05 (WhatsApp), S06 (Soutenir)
```

```text
SupportButton                      (un seul composant pour tous les boutons de soutien)
  variants  hero (Button text), section (Button primary block), nav (lien de nav), floating (FloatingSupport)
  states    dons actifs + lien : <a href={paymentUrl} target=_blank> ; sinon : <button> qui ouvre M01
  tokens    ceux de la variante
  a11y      même libellé partout (« Soutenir Marcel ») ; aria-haspopup="dialog" quand il ouvre la modale
  events    envoie kind=donation, target=hero|section|nav|floating (sendBeacon, non bloquant)
  used on   S00, S01, S06, toutes les pages publiques
```

```text
FloatingSupport                    (bouton épinglé)
  variants  une seule
  size      hauteur 54px (mobile) / 58px (desktop), padding 15px 22px / 17px 24px, radius pill
  position  fixed ; right/bottom : 16px + env(safe-area-inset-right/bottom) ; z-index 40 (modale : 50)
  states    default ; hover (accent-hover) ; focus-visible (anneau focus sur fond canvas) ; caché à l'impression
  tokens    bg accent, text on-accent 10,36:1, bordure 2px surface, shadow float, font sm/700
  layout    visible dès le premier écran et pendant tout le défilement ; jamais masqué automatiquement ;
            body[data-floating-support] réserve 88px + safe-area en bas
  a11y      dernier dans l'ordre du DOM du <body> pour ne pas couper la lecture ; nom accessible « Soutenir Marcel »
  used on   layout (site) : toutes les pages publiques ; jamais dans /admin
```

```text
SiteHeader
  layout    mobile : logo puis rangée de liens sous le logo (gap 18px), padding 18px gutter, bordure basse line
            desktop (≥ 1024) : logo à gauche, liens à droite sur une ligne
  states    lien : default, hover (soulignement 2px accent), focus-visible ; ≠ lien actif selon la section (could)
  tokens    text ink ; liens 13px (≠ 12px mesuré en mobile, monté à 13px), hauteur de cible 44px
  a11y      <header> ; <nav aria-label="Navigation principale"> ; lien d'évitement « Aller au contenu » en premier
  note      ≠ pas de menu burger (comme l'original) ; si plus de 4 liens, la rangée défile horizontalement
            (overflow-x auto, scroll-snap, sans barre visible)
  used on   S00
```

```text
Logo
  variants  header (nom + point highlight + accroche en kicker à 0.32em), footer (nom seul, xs/700 uppercase)
  tokens    text-logo (18→23px, 900, -1px), point « . » en highlight (décoratif, aria-hidden)
  a11y      <a href="/#accueil"> ; nom accessible = nom du créateur
  used on   S00, pied de page
```

```text
Kicker                             (sur-titre)
  variants  plain (« À PROPOS »), numbered (« 01 / LA COMMUNAUTÉ »), dot (pastille 10px highlight + texte)
  tokens    text-kicker : 12px / 700 / uppercase / tracking 0.14em ; ink sur clair, highlight sur accent (4,78:1)
            ≠ 10px mesuré en mobile, monté à 12px
  a11y      <p>, jamais un titre ; la pastille est aria-hidden
  used on   S01–S06, M01
```

```text
Heading                            (titre à 2 tons)
  variants  h1 (text-h1 : 42→102px, 700, -0.055em, line 1.0), h2 (text-h2 : 30→58px, 700, -0.04em, line 1.05)
  parts     lignes 1..n en ink, puis à partir de highlightFrom en accent (9,74:1)
  a11y      un seul <h1> (héros) ; un <h2> par section ; chaque ligne est un <span class="block">, pas de <br>
  used on   S01 (h1), S02–S06 (h2), M01 (h2)
```

```text
SectionShell
  variants  default (canvas), tint (surface-tint, S03), accent-block (S06 : bloc accent radius lg, padding 24→58px)
  layout    container-site + section-y ; en desktop, grille 2 colonnes (titre | texte) pour S02, S05
  a11y      <section id="…" aria-labelledby="…-titre"> ; ancres : accueil, a-propos, univers, communaute, contact, soutenir
  used on   S01–S06
```

```text
HeroPhoto                          (photo détourée)
  layout    cadre surface-tint, radius-photo (96→140px en haut à gauche, 12px ailleurs), image alignée en bas
  image     next/image, WebP/AVIF, priority, sizes="(min-width:1024px) 604px, 92vw", width/height lus en base
  states    chargée ; erreur / absente : cadre tint vide avec le nom en grand (pas d'image cassée)
  a11y      alt depuis l'admin (obligatoire)
  used on   S01
```

```text
StickerLabel                       (étiquette inclinée)
  layout    position absolue en bas à gauche de la photo, rotate(-5deg), padding 15px 22px
  tokens    bg canvas, text ink, shadow label (6px 6px 0 highlight), kicker 12px + text-label (20px / 900) + ✦
  motion    aucune ; ≠ légère entrée (opacity + rotate) à l'apparition, coupée en reduced-motion
  a11y      texte réel, ✦ aria-hidden
  used on   S01
```

```text
Band                               (bandeau ✦)
  layout    pleine largeur, fond accent, padding 22px, phrases centrées séparées par ✦ highlight,
            qui passent à la ligne en mobile (écart assumé : l'original tient sur une ligne coupée au bord ;
            ici toutes les phrases restent lisibles sans défilement, vu par /replica-diff le 2026-10-31)
  tokens    text on-accent, sm/700 uppercase, tracking 1px
  motion    aucune : un défilement continu imposerait un bouton pause (WCAG 2.2.2) et du JS pour un élément décoratif
  a11y      <p> simple ; les ✦ sont aria-hidden
  used on   sous S01
```

```text
SocialCard
  variants  with-count (nom, ↗, compteur text-count, « abonnés · action » en xs muted)
            without-count (nom, ↗, fallbackLabel en h3 24px/700, fallbackSublabel en xs muted)
  layout    grille 2 colonnes (gap 12px) en mobile, 4 en ≥ 1024 ; padding 18px 14px → 28px ; radius md ; bordure 1px line
  states    default ; hover (bordure accent, shadow card-hover, ↗ translaté 2px) ; focus-visible ; ≠ cachée si visible=false
  tokens    text ink ; petit texte muted 6,13:1 (≠ #727282 mesuré, 4,44:1, refusé)
  format    Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }) → « 340 k » puis
            remplacement « k »→« K », « M » ; espace insécable avant l'unité
  a11y      toute la carte est un seul <a> (target _blank) ; nom accessible « Facebook, 340 000 abonnés, Rejoindre la communauté (nouvel onglet) »
  events    kind=social, target=network
  used on   S04
```

```text
CountersNote
  variants  manual (« Chiffres communiqués par Marcel · mis à jour le JJ mois AAAA »), auto (« Synchronisés automatiquement »)
  states    masquée si aucun compteur n'est affiché
  tokens    xs, muted
  used on   S04
```

```text
ConceptCard
  layout    fond accent, radius xl, padding 35px → 58px, texte « Ça, c'est » (on-accent) / « Le Repos. » (highlight),
            anneau décoratif sky en haut à droite (CSS, pas d'image ; aria-hidden)
  tokens    text-h2, on-accent 10,36:1, highlight sur accent 4,78:1 (texte ≥ 30px : large)
  used on   S03
```

```text
DonationBlock
  layout    SectionShell accent-block ; mobile : 1 colonne (gap 24px), desktop : texte | carte blanche
  parts     Kicker numbered (highlight), Heading h2 on-accent, paragraphe on-accent,
            carte surface radius md padding 28px : titre 20/700 ink, texte xs muted, SupportButton section (block), merci xs muted centré
  states    dons actifs / inactifs : seul le comportement du bouton change, pas la mise en page
  used on   S06
```

```text
ContactBlock
  parts     Kicker numbered, Heading h2, paragraphe muted, Button primary WhatsApp, numéro (text-tel, <a href="tel:"> en inline-flex min-h-11 : la ligne seule fait 22px), note xs muted
  states    avec WhatsApp ; sans WhatsApp (le téléphone seul) ; avec e-mail (lien mailto en Button text)
  events    kind=whatsapp | phone
  used on   S05
```

```text
Modal                              (M01 et modales de l'admin)
  base      Radix Dialog (ou <dialog> natif + polyfill du piège) : focus initial sur le bouton Fermer,
            Échap ferme, focus piégé, retour du focus sur le bouton déclencheur, défilement du fond bloqué
  layout    centrée, largeur min(92vw, 440px), fond surface, radius lg, padding 28px, shadow pop ; voile ink à 55 %
  parts     Kicker (« MERCI POUR VOTRE SOUTIEN ♡ »), h2 28px/700, texte muted, Button primary « Fermer »
  motion    fondu + montée 8px, 200ms ; rien en reduced-motion
  a11y      role=dialog aria-modal, aria-labelledby sur le h2, aria-describedby sur le texte
  used on   M01
```

```text
SiteFooter
  layout    bordure haute line, container-site, 3 zones (nom | accroche | ©) en desktop, empilées en mobile
  tokens    xs, muted (≠ #71717D mesuré, 4,53:1, remplacé par muted 6,13:1)
  used on   toutes les pages publiques
```

---

## Admin (A01–A08)

Même tokens. Fond canvas, cartes surface. Icônes Lucide 20px. Pensé pour le téléphone de Marcel d'abord.

```text
AdminShell
  layout    mobile : barre du haut (titre, voir le site, déconnexion) + barre d'onglets en bas (Accueil, Dons, Réseaux, Textes, Plus) ;
            « Plus » ouvre un popover natif (Photo, Contact, Statistiques, Accès) ; desktop : barre latérale 240px
            onglets en texte seul (pas d'icônes Lucide : aucune dépendance ajoutée)
  a11y      <nav aria-label="Administration"> ; page courante aria-current="page"
  used on   A02–A08
```

```text
Input / Textarea / Select
  size      hauteur 48px (16px de texte pour éviter le zoom iOS), radius sm, padding 12px 14px
  states    default (bordure line-input 3,85:1) ; hover ; focus-visible (anneau focus 2px) ; invalide (bordure danger + message danger sous le champ) ;
            disabled (fond tint, texte muted)
  a11y      <label> toujours visible (jamais un placeholder seul) ; message d'erreur relié par aria-describedby ; aria-invalid
  used on   A01, A03–A07
```

```text
Switch                             (activer les dons, afficher un réseau)
  base      Radix Switch ; piste 44×24, fond line-input / accent quand actif
  a11y      role=switch, libellé visible, état annoncé
  used on   A03, A04, A07
```

```text
FormActions                        (barre d'enregistrement)
  layout    collée en bas de l'écran sur mobile (au-dessus de la barre d'onglets), boutons Enregistrer (accent) et Annuler (text)
  states    inactive tant que rien n'a changé ; loading (« Enregistrement… », bouton désactivé, libellé conservé) ;
            succès (Toast) ; erreur (Toast danger + champs marqués)
  used on   A03–A07
```

```text
Toast
  variants  success, danger, info
  layout    en haut de l'écran mobile, en bas à droite en desktop ; 4 s, fermable
  a11y      role=status (succès, info) ou role=alert (erreur)
  used on   A03–A08
```

```text
SortableList                       (réseaux, contacts)
  base      boutons « monter / descendre » (accessibles au clavier et au pouce) ; ≠ pas de glisser-déposer seul
  used on   A04, A06
```

```text
ImageDrop                          (photo détourée)
  states    vide ; aperçu (sur fond tint, comme sur le site) ; envoi (barre de progression) ; erreur (format, > 5 Mo)
  a11y      vrai <input type=file accept="image/png,image/webp"> stylé ; aperçu avec l'alt saisi
  used on   A05
```

```text
StatTile / StatChart
  tiles     nombre (count) + libellé (xs muted) + variation sur la période précédente (success / danger avec signe, pas seulement la couleur)
  chart     barres par jour, une couleur par type (accent, highlight, sky, ink) ; tableau équivalent accessible sous le graphique
  used on   A02, A08
```

```text
EmptyState
  usage     aucune statistique encore, aucun réseau, dons non configurés : une phrase + une action
  used on   A02, A04, A08
```
