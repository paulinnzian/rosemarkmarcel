# Bugs : site de Rosemark Marcel

Trouvés par /replica-test le 2026-10-31 (build de production local). Seuls les bugs reproduits sont listés.
Chacun a un test qui échouait avant la correction et passe après.

### BUG-001 : le nom accessible des cartes réseau ne contient pas le texte affiché

- Severity: S3
- Flow / case: F01 / F01-H1, F01-E3
- Screen: S04 communauté
- Build: build de production local  Browser / device: Chromium 1248, 390 et 1440 px

Steps
1. Ouvrir `/`.
2. Lancer un scan axe (WCAG 2.2 AA).

Expected: aucune violation.
Actual: `label-content-name-mismatch` sur les 4 cartes : le nom forcé (« Facebook, 340 000 abonnés… ») ne contient pas « 340 K » lu à l’écran (WCAG 2.5.3, une personne en commande vocale dit ce qu’elle voit).
Evidence: test F01-H1, sortie axe `label-content-name-mismatch : a[data-track-target="facebook"], …`
Suspected cause: `aria-label` posé à la main sur le lien.
Status: fixed in 3113d09 (test : 26155d2) : le nom vient du texte visible, plus « (nouvel onglet) » pour les lecteurs d’écran.

### BUG-002 : les anciennes photos ne sont jamais supprimées du stockage

- Severity: S3
- Flow / case: F04 / F04-H3
- Screen: /admin/photo
- Build: build de production local  Browser / device: Chromium 1248, 390 px

Steps
1. Envoyer une photo, puis une deuxième, puis « Revenir à la photo livrée avec le site ».
2. Lister le dossier `photo/` du bucket `public-media`.

Expected: dossier vide.
Actual: 2 fichiers restent, sans aucune erreur dans les journaux.
Evidence: test F04-H3 (`expect(objects).toHaveLength(0)`, reçu 2).
Suspected cause: Supabase Storage cherche les fichiers à supprimer avec un SELECT soumis à RLS ; aucune politique SELECT sur `storage.objects`, donc `remove()` ne trouve rien et répond « succès ».
Status: fixed in 3113d09 : migration `20261031150000_lecture_media_admins.sql` (lecture réservée aux admins) + 3 tests pgTAP.

### BUG-003 : une erreur de validation efface ce que l’admin vient de saisir

- Severity: S2
- Flow / case: F04 / F04-H1
- Screen: tous les formulaires de l’admin
- Build: build de production local  Browser / device: Chromium 1248, 390 px

Steps
1. `/admin/dons` : taper `http://paiement.exemple.test/marcel` dans « Lien de paiement », Enregistrer.
2. Ou : vider le lien, cocher « Dons ouverts », Enregistrer.

Expected: le message d’erreur s’affiche et les champs gardent ce qui a été tapé.
Actual: le message s’affiche mais tous les champs reviennent à la valeur enregistrée (lien vide, interrupteur décoché). Sur l’écran des textes, un long paragraphe retapé sur téléphone est perdu à la première erreur.
Evidence: test F04-H1 (`toHaveValue("http://paiement.exemple.test/marcel")`, reçu `""`) ; capture d’erreur Playwright : interrupteur décoché après l’envoi.
Suspected cause: React 19 réinitialise automatiquement un `<form action={…}>` après chaque action, réussie ou non.
Status: fixed in 3113d09 : `src/lib/admin/use-admin-form.ts` (envoi par onSubmit dans une transition, sans réinitialisation), utilisé par les 8 formulaires.

### BUG-004 : apostrophe droite dans deux messages d’erreur

- Severity: S4
- Flow / case: F04 / F04-H1
- Screen: /admin/dons, /admin/reseaux
- Build: build de production local  Browser / device: Chromium 1248

Steps
1. Cocher « Dons ouverts » sans lien, Enregistrer.

Expected: « Collez un lien de paiement avant d’activer les dons. » (apostrophe typographique, comme le reste du site).
Actual: « avant d'activer » (apostrophe droite) ; même chose pour « d'un texte de remplacement ».
Evidence: test F04-H1 (texte introuvable avec ’).
Status: fixed in 3113d09 (`src/content/schema.ts`).

### BUG-005 : le titre de l'onglet disparaît un instant après l'envoi du formulaire de connexion

- Severity: S4
- Flow / case: F04 / F04-E6
- Screen: /admin/connexion
- Build: build de production local (Next 16.4.3)  Browser / device: Chromium 1248

Steps
1. Ouvrir /admin/connexion, taper une adresse, toucher « Recevoir mon code ».
2. Lire `document.title` et le nombre de balises `<title>` toutes les 100 ms.

Expected: « Connexion · Administration » en permanence.
Actual: juste après la réponse de l'action, aucune balise `<title>` (titre vide), puis le titre revient en moins de 100 ms. Reproduit 2 fois sur 2, sans horloge factice. Trouvé par l'analyse axe de F04-E6 (« document-title »), qui tombait dans cet intervalle.
Evidence: sondage Playwright (`|0 ; Connexion · Administration|1 ; …`), échec intermittent de F04-E6.
Status: open, pas corrigé. Vient du rendu des métadonnées de Next après une action serveur, pas du code du site ; sans effet pour un visiteur au-delà d'un clignotement de l'onglet. Le test attend le titre avant l'analyse axe. À revoir à la prochaine version de Next.

## À vérifier (non reproduit)

- Limite de débit de `/api/evenements` : en mémoire, par processus de serveur. Chez Hostinger, un processus par domaine ; avec la redirection `www` vers le domaine nu, un seul reçoit les visites. Si l'hébergeur en lance plusieurs, la limite réelle dépasse 60 / minute. Suffisant contre une boucle, pas contre une attaque répartie (noté dans `backend.md`).
- Lien de paiement réel (Wave / Orange Money) : le comportement au retour après paiement dépend du service.
