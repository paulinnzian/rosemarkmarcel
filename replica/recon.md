# Recon map : vitrine de créateur « Rosemark Marcel — Le Repos » (web responsive, mobile d'abord)

Périmètre : la page entière (une seule page, 6 sections à ancres + en-tête, bandeau, pied de page, modale de don)
Pour : Rosemark Marcel, web humoriste, public en Afrique de l'Ouest (surtout sur téléphone, Côte d'Ivoire)
Date : 2026-10-31

> **Décision : cas B, confirmé le 2026-10-31.** Le site est pour Rosemark Marcel lui-même ; il a donné son accord et validé le template (structure, sections, identité visuelle). On reprend ses contenus : nom, textes, concept « Le Repos », liens, numéro, photo, palette bleu / blanc / orange de sa tenue. **Le code reste écrit de zéro.** Les images viennent des fichiers source fournis par Marcel, pas du site en ligne. Garder une trace écrite de l'accord (message WhatsApp ou e-mail) avec le projet.
>
> **Backend + tableau de bord admin** (Next.js + Supabase), décidé le 2026-10-31 : Marcel modifie depuis `/admin` le lien de paiement et les dons, les réseaux et compteurs, les textes et la photo, le contact, et consulte les statistiques de clics. Nouveau parcours F04 (voir `architecture.md`).
>
> **Paiement des dons : un lien de paiement collé dans l'admin** (`donation_settings.payment_url`). Aucun prestataire intégré au code (Jèko retiré, pas de Stripe). Lien vide ou dons désactivés = modale « Les dons arrivent bientôt ».
>
> **Photo** : fournie par l'utilisateur le 2026-10-31, `assets-source/marcel-detoure-source.png` (PNG transparent, 1024 × 1535).
>
> **Bouton de soutien épinglé** : il reste visible en bas de l'écran pendant tout le défilement, sur toutes les pages du site.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | la page publique (lecture à vitesse humaine, 1 chargement mobile + 1 desktop) | https://rosemark-marcel-le-repos.modernrice.chatgpt.site | arbre d'accessibilité lu, aucun bundle JS ni appel réseau enregistré |
| 2 | capture mobile 390 px, page entière | `replica/screens/original-mobile-390-full.webp` | référence de mise en page seulement |
| 3 | capture de la modale de don (mobile) | `replica/screens/original-mobile-modal-dons.webp` | état « dons bientôt disponibles » |
| 4 | capture desktop 1440 px, page entière | `replica/screens/original-desktop-1440-full.webp` | mise en page 2 colonnes |

Pas de centre d'aide, de grille tarifaire, de changelog ni d'API publique : c'est un site vitrine. La page elle-même est la seule source.

## Boucle principale

Un visiteur arrive depuis un réseau social ou un lien partagé, comprend en un écran qui est le créateur et son univers, puis **le suit sur un réseau** (F01). Deux objectifs secondaires : **une marque le contacte** (F02) et **un fan fait un don** (F03).

## Ordre réel de la page

L'ordre affiché diffère de l'ordre des ancres donné dans le brief :

```
En-tête (logo + nav)
S01 #accueil        Héros                       (pas d'id réel : le logo pointe sur « # »)
     Bandeau défilant ✦
S02 #a-propos       À propos
S04 #communaute     01 / La communauté          (cartes réseaux + compteurs)
S03 #univers        02 / Mon univers
S06 #soutenir       03 / Un geste qui compte    (don)
S05 #contact        04 / Collaborations
Pied de page
Bouton flottant « Me soutenir ♡ » (toujours visible)
Modale « Les dons arrivent bientôt »
```

Les identifiants d'écran suivent les ancres du brief (S01 = #accueil … S06 = #soutenir), pas l'ordre d'affichage.

## Écrans

| ID | écran | route / accès | rôle | composants clés | états vus |
| --- | --- | --- | --- | --- | --- |
| S00 | En-tête + navigation | haut de page, non collant à 390 px (à confirmer) | identité + accès aux sections | logo texte (nom + point coloré + accroche en petites capitales espacées), 4 liens d'ancre | mobile : liens sur une ligne sous le logo, **pas de menu burger** ; desktop : logo à gauche, liens à droite |
| S01 | Accueil (héros) | `/` ou `#accueil` (logo → `#`) | dire qui est le créateur en 5 s | sur-titre avec pastille, H1 sur 3 lignes (2e partie en couleur d'accent), paragraphe, bouton principal « Entrez dans l'univers ↗ » (→ #communaute), lien secondaire « Soutenir … ♡ » (→ #soutenir), **photo détourée** sur fond pâle à coin arrondi, étiquette inclinée « Le concept signé … / Le Repos ✦ » | rempli ; mobile : photo sous le texte ; desktop : 2 colonnes |
| — | Bandeau défilant | sous le héros | rythme, signature | fond couleur principale, 4 phrases en majuscules séparées par ✦ | défilement horizontal (supposé, à confirmer en /replica-design) |
| S02 | À propos | `#a-propos` | présentation en 3 paragraphes | sur-titre, H2 sur 2 lignes (nom en accent), sous-titre coloré, 3 paragraphes, lien « Retrouvez-moi sur les réseaux ↗ » (→ #communaute) | mobile empilé ; desktop titre à gauche, texte à droite |
| S03 | Mon univers | `#univers` | raconter le concept / la signature visuelle | carte visuelle « Ça, c'est / Le Repos. » (fond principal, cercle décoratif), numéro « 02 / », H2 sur 2 lignes, 2 paragraphes, lien « Retrouvez mes contenus ↗ » (→ un réseau, externe) | fond de section teinté |
| S04 | La communauté | `#communaute` | convertir en abonné | « 01 / », H2, phrase d'appel, **4 cartes réseaux** (nom, ↗, compteur grand format, libellé « abonnés · action »), mention « Chiffres communiqués par … · Synchronisation automatique non activée. » | carte **avec compteur** (Facebook 340 K, Instagram 55,6 K, TikTok 393,4 K) ; carte **sans compteur** (YouTube affiche « Mes vidéos » + « Découvrir la chaîne officielle ») ; mobile 2 × 2, desktop 4 en ligne |
| S05 | Collaborations | `#contact` | contact pro des marques | « 04 / », H2 sur 2 lignes, phrase, bouton « Discuter sur WhatsApp ↗ » (wa.me + message pré-rempli), numéro en gros (`tel:`), mention « Contact professionnel · Collaborations » | rempli ; desktop 2 colonnes |
| S06 | Soutenir | `#soutenir` | don libre | grand bloc fond principal : « 03 / », H2 avec ♡, texte ; carte blanche intérieure « Un peu de soutien, beaucoup de motivation. », « Un don libre, selon votre envie et vos moyens. », bouton « Soutenir … ♡ », « Merci de faire partie de l'aventure. » | **dons désactivés** : le bouton ouvre la modale M01 au lieu d'un paiement |
| M01 | Modale « bientôt disponible » | clic sur le bouton de don de S06 (et probablement sur le bouton flottant) | prévenir que le paiement n'est pas encore en place | `dialog` modal : sur-titre « MERCI POUR VOTRE SOUTIEN ♡ », H2 « Les dons arrivent bientôt. », texte « Le lien de paiement sera ajouté prochainement. En attendant, retrouvez … sur ses réseaux. », bouton « Fermer » (reçoit le focus) | ouverte / fermée ; focus sur Fermer à l'ouverture |
| — | Bouton flottant « Me soutenir ♡ » | fixé en bas à droite, toutes largeurs | accès au don depuis n'importe où | pilule couleur principale, bordure claire | visible pendant tout le défilement ; c'est le 5e lien de la nav, sorti du flux |
| — | Pied de page | bas de page | signature | nom, accroche « Le Repos · L'humour, tout simplement. », © année + nom | — |

États **non vus** mais à construire (brief) : compteur absent pour **tous** les réseaux, réseau sans URL (carte masquée), don **activé** (lien de paiement réel), WhatsApp absent (téléphone seul), image qui ne charge pas, `prefers-reduced-motion` (bandeau arrêté).

## Parcours

```
F01 Un visiteur découvre le créateur puis le suit sur un réseau
    S01 héros -> « Entrez dans l'univers ↗ » -> S04 communauté -> carte réseau -> app / site du réseau (nouvel onglet)
    clics sur le chemin heureux : 2
    variantes : S02 « Retrouvez-moi sur les réseaux ↗ » -> S04 ; S03 « Retrouvez mes contenus ↗ » -> réseau direct (1 clic) ; lien de nav « La communauté »
    cas limites : compteur absent (YouTube) ; réseau non installé sur le téléphone (le lien web doit marcher) ; ouverture dans le navigateur intégré d'Instagram / TikTok / Facebook

F02 Une marque contacte le créateur pour une collaboration
    nav « Collaborations » -> S05 -> « Discuter sur WhatsApp ↗ » -> WhatsApp ouvert avec « Bonjour …, je souhaite vous contacter pour une collaboration. »
    ou  S05 -> numéro (tel:) -> appel
    clics sur le chemin heureux : 2 (+ envoyer dans WhatsApp)
    cas limites : WhatsApp absent sur desktop (wa.me ouvre WhatsApp Web) ; tel: sans effet sur desktop ; message pré-rempli à encoder en URL ; pas de formulaire ni d'e-mail

F03 Un fan fait un don libre
    S01 « Soutenir … ♡ » ou bouton flottant ou nav -> S06 -> « Soutenir … ♡ » -> [dons désactivés] M01 « Les dons arrivent bientôt » -> Fermer
                                                                     [dons activés, à construire] -> le bouton ouvre directement le lien de paiement saisi dans l'admin (nouvel onglet)
    clics sur le chemin heureux : 2 (aujourd'hui sans aboutir)
    cas limites : montant libre (pas de montant imposé) ; paiement abandonné ; retour sur la page après paiement ; double clic
```

## Composants

| composant | variantes | états | utilisé sur |
| --- | --- | --- | --- |
| Bouton | principal (fond accent chaud, texte foncé, flèche ↗), lien-texte (gras + ↗ ou ♡), bouton pleine largeur dans carte, pilule flottante | défaut, survol, focus, actif ; désactivé non vu | S01, S02, S03, S05, S06, flottant |
| Logo texte | en-tête (nom + accroche), pied de page (nom seul) | — | S00, pied |
| Lien de nav | texte simple | défaut, survol, focus ; actif non vu | S00 |
| Sur-titre | « LABEL » en petites capitales espacées, variante numérotée « 01 / LABEL », variante avec pastille ronde | — | toutes les sections |
| Titre de section (H1 / H2) | 2 tons : 1re partie foncée, 2e partie en couleur d'accent ; sur 2–3 lignes | — | S01–S06 |
| Séparateur ✦ | dans le bandeau entre les phrases, après « Le Repos » dans l'étiquette du héros | — | bandeau, S01 |
| Bandeau défilant | une seule variante | défilement / arrêté (reduced motion) | sous S01 |
| Photo détourée | fond pâle, grand rayon sur un coin, étiquette inclinée par-dessus | chargée ; erreur non vue | S01 |
| Étiquette inclinée | sur-titre + texte + ✦, ombre portée | — | S01 |
| Carte réseau | avec compteur (valeur grand format + « abonnés · action ») ; sans compteur (texte de remplacement + action) | défaut, survol (supposé), focus | S04 |
| Mention de source des chiffres | petite ligne grise | sync activée / non activée | S04 |
| Carte visuelle de concept | fond principal, texte 2 tons, forme décorative | — | S03 |
| Bloc de don | grand bloc couleur + carte blanche intérieure | dons activés / désactivés | S06 |
| Modale | une variante (information) | ouverte, fermée, focus piégé (à vérifier), fermeture par Échap (à vérifier) | M01 |
| Contact | bouton WhatsApp + numéro grand format + mention | avec / sans WhatsApp | S05 |

## Modèle de données déduit

Pas de base de données : tout va dans un fichier de configuration (`content.ts`). Les « entités » ci-dessous sont des types TypeScript.

```
Creator     name, accent_name_part (partie du nom en couleur), tagline (« Humour & bonne humeur »),
            role_line (« Web humoriste · créateur du … »), concept_name (« Le Repos »),
            hero { title_lines[], highlight_from, intro, primary_cta, secondary_cta },
            photo { src (WebP), alt, width, height }, photo_label { kicker, text },
            marquee_phrases[], about { title, subtitle, paragraphs[] },
            universe { title, paragraphs[], card_text, cta { label, url } },
            footer_line, copyright_year
            preuve : S00, S01, S02, S03, pied de page
            confiance : haute

SocialLink  network (facebook | instagram | tiktok | youtube | snapchat | x | …), handle, url,
            followers (nombre | null), followers_display (« 340 K », calculé en fr-FR si absent),
            action_label (« Rejoindre la communauté »), fallback_label (« Mes vidéos », si followers null),
            fallback_sublabel, sync_mode (manual | auto), updated_at, order, visible
            preuve : S04 (4 cartes, YouTube sans compteur), mention « Synchronisation automatique non activée »
            confiance : haute pour les champs affichés ; sync_mode / updated_at = déduits de la mention

CountersMeta  source_label (« Chiffres communiqués par … »), sync_enabled (bool)
            preuve : S04 ; confiance : haute

ContactChannel  type (whatsapp | phone | email), value (E.164 : +2250…), display (« +225 07 06 40 06 90 »),
            prefilled_message (WhatsApp seulement), label, note (« Contact professionnel · Collaborations »)
            preuve : S05 (wa.me?text=…, tel:)
            confiance : haute ; email = supposition (absent de l'original)

DonationLink  payment_url (https | vide), title, text, card_title, card_text, button_label,
            floating_label, thanks_line, disabled_modal { kicker, title, text, close_label }
            lien vide = dons désactivés (modale) ; lien rempli = tous les boutons de soutien l'ouvrent
            preuve : S06, M01 ; décision du 2026-10-31 (lien saisi dans l'admin, pas de prestataire intégré)
            confiance : haute
```

Relations : Creator 1-n SocialLink, Creator 1-n ContactChannel, Creator 0-1 DonationLink, Creator 1-1 CountersMeta.

## Matrice de fonctionnalités

Voir `features.csv`. Must : 49, should : 9, could : 8, skip : 2 (68 lignes).

## Hors périmètre (à ne pas copier ou impossible à copier)

- Le code de l'original : rien n'est lu, copié ni réutilisé ; tout est écrit de zéro.
- Le fichier `marcel-detoure.png` servi par le site : on ne le télécharge pas. Marcel fournit la photo source (haute définition), convertie en WebP pour le nouveau site.
- Les captures restent dans `replica/screens/` et ne vont pas dans le site.
- Repris avec l'accord de Marcel (cas B, plus hors périmètre) : nom, textes, concept « Le Repos », liens des réseaux, numéro, palette bleu / blanc / orange. /replica-design reconstruit cette palette en tokens vérifiés WCAG AA, au lieu d'en inventer une nouvelle.
- Les audiences et compteurs des réseaux (ils appartiennent aux plateformes) ; une synchronisation automatique passerait par les API officielles de chaque réseau, pas par du scraping.
- Le paiement lui-même : le site ne fait qu'ouvrir le lien de paiement fourni par Marcel ; aucun prestataire n'est intégré au code.

## Taille

Écrans 6 sections + en-tête, bandeau, modale, bouton flottant, pied ; parcours 3 ; entités 5 (types de config). Parties difficiles : (1) le bouton de soutien épinglé sur toutes les pages sans masquer le contenu ni gêner la lecture sur petit écran ; (2) des compteurs d'abonnés crédibles et à jour sans scraping (saisie manuelle d'abord, synchro par API officielles plus tard, limitée par les accès de chaque plateforme) ; (3) Lighthouse mobile ≥ 90 avec une grande photo détourée au-dessus de la ligne de flottaison et un bandeau animé. Taille : **M** (deux à trois semaines) : vitrine + admin Supabase (6 tables, RLS, connexion par e-mail, envoi de photo, statistiques), dons par lien de paiement externe.
