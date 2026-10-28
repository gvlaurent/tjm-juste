# Calculateur TJM : le plan du projet

Ce que l'on construit et pourquoi, dans quel ordre, ce qui est fait et ce que l'on a appris.
L'agent de code lit aussi ce fichier : `AGENTS.md` y renvoie.

## 1. Le projet

**En une phrase.** Calculateur TJM aide un consultant indépendant à voir ce qui reste d'un taux journalier (TJM) et à trouver le taux journalier qu'exige un revenu visé, en appliquant un calcul simplifié et entièrement visible aux taux que l'utilisateur saisit.

**Qui l'utilise.**
- Un consultant indépendant, ou quelqu'un sur le point de le devenir, qui veut fixer ou vérifier un taux journalier avant de chiffrer une mission pour un client.

**Le scénario idéal.** Claire, consultante produit indépendante, veut 4 000 € nets par mois. Elle saisit 250 jours ouvrés dans l'année, 25 jours de congés, 20 % de temps non facturable (prospection, administratif, formation) et 6 000 € de frais annuels. Elle saisit les taux de cotisations et d'imposition qu'elle a vérifiés sur les sources officielles, et choisit l'assiette des cotisations qui correspond à son statut. L'app affiche 180 jours facturés et le TJM minimal pour son objectif, arrondi à l'euro supérieur. Elle passe à l'autre calcul, essaie 650 € et lit le détail ligne par ligne : chiffre d'affaires, frais, cotisations, impôt, revenu net par an et par mois.

**Dans le périmètre.**
- Deux calculs sur les mêmes saisies : TJM → revenu net (par an et par mois), et revenu net mensuel visé → TJM minimal.
- Un détail ligne par ligne de chaque montant.
- Une assiette des cotisations choisie par l'utilisateur : le chiffre d'affaires, ou le chiffre d'affaires moins les frais.
- Des messages clairs pour les saisies invalides et les objectifs inatteignables.
- Un avertissement permanent indiquant que le modèle est simplifié.

**Hors périmètre.**
- Les règles propres à un statut juridique (micro-entreprise, SASU, EURL, portage salarial).
- Tout taux réel de cotisations ou d'imposition intégré à l'app.
- Les tranches de l'impôt sur le revenu, la TVA, le calcul automatique des jours fériés.
- Graphiques, export, comptes, serveur, fonctions d'IA.

**L'IA doit**
- Sans objet : cette app n'utilise aucune IA à l'exécution. Chaque nombre vient des saisies de l'utilisateur et du code.

**L'IA ne doit jamais**
- Sans objet à l'exécution. Les règles propres à l'agent de code sont dans la section 2 et dans `AGENTS.md`.

**Où se trouve la vérité.**
- Taux de cotisations et d'imposition : saisis par l'utilisateur, qui les vérifie sur les sources officielles (Urssaf, impots.gouv.fr). Jamais le code, les tests, une valeur par défaut ou la mémoire du modèle.
- TJM, jours, part non facturable, frais, revenu visé : saisis par l'utilisateur.
- La façon de calculer chaque montant : le modèle de calcul de l'étape 1 et les règles des étapes 3 et 4. Jamais une règle que l'agent croit connaître sur un statut juridique.
- Les résultats attendus des tests : le cas de référence calculé par une personne à l'étape 0, et des taux fictifs ronds (10 %, 20 %) dans les autres tests.

**L'IA comprend, le code décide.**

| L'IA | Le code |
|---|---|
| Rien à l'exécution : l'utilisateur fournit chaque saisie | lit et valide les saisies, calcule chaque montant, n'arrondit qu'à l'affichage, décide si un résultat peut être affiché |

**Contraintes.**
- Public : une personne à la fois, interface en français, pas de compte, pas de serveur.
- Stack : React + TypeScript (strict) + Vite, tests avec Vitest. Aucune autre dépendance sans demander d'abord.
- Code, noms et commentaires en anglais ; textes de l'interface en français ; montants au format français (`12 345,67 €`).
- Toute la logique de lecture des saisies et de calcul dans `src/tjm.ts`, sous forme de fonctions pures sans import de React.
- Pas de secrets, pas de budget. Temps : un exercice rapide, environ une heure et demie.
- Un petit périmètre parfaitement fini vaut mieux qu'un grand fait approximativement.

**Questions ouvertes.**
- Faut-il accepter `1e3` comme 1 000 ? L'étape 2 tranche, et le Journal note la décision.
- Pour une situation réelle, à quelle distance ce modèle est-il du simulateur officiel de l'Urssaf, et quelles simplifications expliquent l'écart ? Une personne compare après l'étape 3.
- Garder les saisies après un rechargement en vaut-il la peine ? Décidé après l'étape 5 (l'étape 6 est facultative).


## 2. Comment on travaille

- Une étape à la fois. Chaque étape se termine par quelque chose que l'on peut voir et tester, et l'app fonctionne après chaque étape.
- L'agent de code ne construit que l'étape qu'on lui demande. « Pas encore » veut dire pas encore.
- Avant de coder une étape, l'agent de code dit en trois lignes ce qui va changer, ce qui ne doit pas bouger et comment on vérifiera, puis attend un feu vert.
- Après chaque étape, on lance ses tests « Terminé quand ». Une personne coche l'étape dans Avancement, jamais l'agent.
- L'agent de code ajoute une ligne par étape au Journal : ce qui a changé, quels fichiers, et pourquoi.
- L'agent de code propose un message de commit et s'arrête. Une personne relit le diff et commite.

## 3. Avancement

- [x] **Étape 0 : Mise en place.** L'app vide tourne, les tests tournent, et le cas de référence est écrit.
- [x] **Étape 1 : TJM → revenu net.** Saisir un TJM et les autres données, lire le détail complet.
- [ ] **Étape 2 : Saisies robustes.** Une saisie erronée donne un message clair au lieu d'un nombre faux.
- [ ] **Étape 3 : Assiette des cotisations et pertes.** Choisir sur quoi les cotisations sont calculées ; une perte s'affiche comme une perte.
- [ ] **Étape 4 : Revenu net → TJM.** Saisir un revenu mensuel visé, obtenir le TJM minimal.
- [ ] **Étape 5 : Accessibilité.** Tout fonctionne au clavier seul et avec un lecteur d'écran.
- [ ] **Étape 6 (facultative) : Garder les saisies.** Les saisies survivent à un rechargement de la page.

## 4. Les étapes

Commencer par la version la plus fine qui fonctionne de bout en bout, puis ajouter une capacité par étape.

### Étape 0 : Mise en place

- **Objectif :** l'app vide tourne, les tests tournent, et les résultats attendus existent avant tout code de calcul.
- **Pourquoi :** le cas de référence doit venir d'une personne, pas du code qu'il va tester.
- **Ce que l'on ajoute :** un projet Vite (modèle `react-ts`) avec Vitest, et un script `test` qui lance les tests une fois puis s'arrête (`vitest run`) ; un test provisoire. `PLAN.md` et `AGENTS.md` restent tels quels. Une personne remplit le cas de référence ci-dessous.
- **Terminé quand :**
  - `npm run dev` → la page s'ouvre dans le navigateur.
  - `npm test` → un test qui passe, et la commande s'arrête toute seule.
  - Le cas de référence ci-dessous → aucune case vide.
  - `PLAN.md` et `AGENTS.md` → toujours présents et inchangés.
- **Pas encore :** aucun calcul (étape 1).
- **Point d'attention :** l'outil de création du projet peut proposer de vider le dossier : `PLAN.md` et `AGENTS.md` doivent survivre. En plus de ce qu'installe le modèle Vite, seul Vitest est ajouté à `package.json`.

**Cas de référence.** Calculé à la main ou à la calculatrice, jamais avec l'app ni avec l'agent. Les taux sont des valeurs rondes et fictives : les vrais taux n'entrent jamais dans le dépôt.

| | Cas A (étape 1) | Cas B (étape 3) |
|---|---|---|
| TJM (€ HT) | 500 | comme A |
| Jours ouvrés dans l'année | 250 | comme A |
| Jours de congés | 25 | comme A |
| Part non facturable (%) | 15 | comme A |
| Frais annuels (€) | 6 000 | comme A |
| Taux de cotisations (%), fictif | 20 | comme A |
| Assiette des cotisations | chiffre d'affaires | chiffre d'affaires moins les frais |
| Taux d'imposition estimé (%), fictif | 10 | comme A |
| **Attendu :** jours facturés | 191,25 (affiché 191,3) | 191,25 (affiché 191,3) |
| **Attendu :** chiffre d'affaires | 95 625,00 € | 95 625,00 € |
| **Attendu :** cotisations | 19 125,00 € | 17 925,00 € |
| **Attendu :** impôt | 7 050,00 € | 7 170,00 € |
| **Attendu :** net par an | 63 450,00 € | 64 530,00 € |
| **Attendu :** net par mois | 5 287,50 € | 5 377,50 € |

### Étape 1 : TJM → revenu net

- **Objectif :** l'utilisateur saisit un TJM et les autres données et lit le détail complet.
- **Pourquoi :** c'est la question centrale (que reste-t-il de ce taux journalier ?) et la version la plus fine qui fonctionne de bout en bout.
- **Ce que l'on ajoute :**
  - Des champs, chacun avec une étiquette visible qui lui est liée : « TJM (€ HT) », « Jours ouvrés dans l'année », « Jours de congés », « Part de temps non facturable (%) », « Frais professionnels annuels (€) », « Taux de cotisations (%) », « Taux d'imposition estimé (%) ».
  - Le modèle :
    - jours facturés = (jours ouvrés − jours de congés) × (1 − part non facturable)
    - chiffre d'affaires = TJM × jours facturés
    - cotisations = taux de cotisations × chiffre d'affaires (l'assiette devient un choix à l'étape 3)
    - impôt = taux d'imposition × (chiffre d'affaires − frais − cotisations)
    - net par an = chiffre d'affaires − frais − cotisations − impôt ; net par mois = net par an / 12
  - Le détail : jours facturés (une décimale), chiffre d'affaires, frais, cotisations, impôt, net par an, net par mois.
  - Aucun arrondi dans le calcul : les montants sont arrondis au centime pour l'affichage seulement.
  - Les champs de taux démarrent vides ; aucun résultat n'est affiché tant que tous les champs ne sont pas remplis.
  - Un avertissement permanent : « Modèle simplifié. Les taux sont ceux que vous saisissez : vérifiez-les sur les sources officielles. Ce résultat ne remplace ni le simulateur officiel de l'Urssaf ni un expert-comptable. »
- **Terminé quand :**
  - Cas de référence A → chaque ligne du détail correspond au centime près.
  - Un champ de taux laissé vide → aucun résultat ; les autres champs gardent leurs valeurs.
  - `src/tjm.test.ts` couvre le cas A et un autre cas avec des taux fictifs → `npm test` passe.
  - Une recherche dans tout le dépôt → aucune valeur de taux nulle part, sauf les taux fictifs des tests.
- **Pas encore :** les décimales avec virgule et les saisies invalides (étape 2) ; le choix de l'assiette et des frais supérieurs au chiffre d'affaires (étape 3) ; le calcul inverse (étape 4).
- **Point d'attention :** l'arrondi se fait une seule fois, à l'affichage. Demande-toi ce qu'un arrondi intermédiaire changerait sur le cas A.

### Étape 2 : Saisies robustes

- **Objectif :** une saisie erronée donne un message clair à côté de son champ, jamais un nombre faux ni un plantage.
- **Pourquoi :** une saisie mal lue en silence (`24,6` lu comme rien, ou comme 24) donne un chiffre plausible mais faux, la pire erreur dans un outil qui parle d'argent.
- **Ce que l'on ajoute :** une fonction de lecture dans `src/tjm.ts` qui accepte une virgule ou un point comme séparateur décimal et rejette : un champ vide, une valeur négative ou non numérique, un pourcentage au-dessus de 100, un TJM ou un nombre de jours ouvrés égal à 0, plus de jours de congés que de jours ouvrés. Chaque rejet affiche un message en français à côté de son champ, et aucun résultat n'est affiché tant qu'un champ est invalide.
- **Terminé quand :**
  - `24,6` et `24.6` dans le même champ → le même résultat.
  - `""`, `-3`, `abc` → un message à côté du champ, aucun résultat, aucun plantage.
  - `150` dans un champ de pourcentage → un message.
  - 260 jours de congés pour 250 jours ouvrés → un message.
  - `1e3` → le comportement est décidé (accepté comme 1 000 ou rejeté) et noté dans le Journal.
  - Tests de lecture dans `src/tjm.test.ts` → `npm test` passe.
- **Pas encore :** l'annonce des messages par les lecteurs d'écran (étape 5).
- **Point d'attention :** selon le navigateur, un champ numérique peut afficher `24,6` alors que le code reçoit une chaîne vide. Vérifie ce que le composant reçoit vraiment, ou utilise un champ texte avec ta propre lecture.

### Étape 3 : Assiette des cotisations et pertes

- **Objectif :** l'utilisateur choisit sur quoi les cotisations sont calculées, et une perte s'affiche comme une perte.
- **Pourquoi :** l'assiette dépend du statut juridique, et en faire un choix visible vaut mieux que choisir un statut en silence. Avec des frais importants, les formules naïves donnent aussi des cotisations négatives ou un impôt négatif.
- **Ce que l'on ajoute :**
  - Un choix « Assiette des cotisations » avec deux options : « Chiffre d'affaires » (par défaut) ou « Chiffre d'affaires moins les frais ».
  - Règle : une assiette négative donne zéro, jamais un montant négatif. Cela vaut pour l'assiette des cotisations et pour celle de l'impôt.
  - Un revenu net négatif s'affiche « Perte : … » au lieu d'un montant négatif.
- **Terminé quand :**
  - Cas de référence A, assiette « Chiffre d'affaires » → inchangé.
  - Cas de référence B → chaque ligne correspond au centime près.
  - Frais supérieurs au chiffre d'affaires, assiette « Chiffre d'affaires moins les frais » → cotisations 0, impôt 0, une perte égale aux frais moins le chiffre d'affaires.
  - Frais supérieurs au chiffre d'affaires, assiette « Chiffre d'affaires » → impôt 0, une perte égale aux frais plus les cotisations moins le chiffre d'affaires.
  - Tests pour les deux assiettes et les deux cas de perte → `npm test` passe.
- **Pas encore :** les règles d'un statut juridique particulier (hors périmètre).
- **Point d'attention :** une formule peut être juste dans les cas normaux et fausse aux limites. Ramener à zéro est une règle métier écrite dans ce plan, pas un détail que l'agent décide.

### Étape 4 : Revenu net → TJM

- **Objectif :** l'utilisateur saisit un revenu net mensuel visé et obtient le TJM minimal, arrondi à l'euro supérieur.
- **Pourquoi :** c'est la question qu'un consultant se pose vraiment avant de chiffrer : de quel taux journalier ai-je besoin ?
- **Ce que l'on ajoute :**
  - Un second calcul, choisi avec un sélecteur entre « TJM → revenu » et « Revenu → TJM ». Il utilise les mêmes saisies, avec « Revenu net mensuel visé (€) » à la place du TJM.
  - Le résultat est arrondi à l'euro supérieur.
  - Un objectif inatteignable (aucun jour facturable, un taux de 100 % qui ne laisse rien) → un message qui nomme la cause, au lieu d'Infinity, de NaN ou d'un TJM négatif.
- **Terminé quand :**
  - Aller-retour, dans les tests : TJM 500 → revenu net mensuel exact (non arrondi) M dans le premier calcul ; objectif M → TJM 500 dans le second, et pas 501. Pareil avec plusieurs TJM ronds, sur les deux assiettes.
  - Propriété, sur plusieurs objectifs et les deux assiettes : avec le TJM renvoyé, net mensuel ≥ objectif ; avec le TJM renvoyé moins 1 €, net mensuel < objectif.
  - Part non facturable de 100 % → un message, aucun nombre.
  - Taux de cotisations ou taux d'imposition de 100 % → un message, aucun nombre.
  - `npm test` passe.
- **Pas encore :** la sauvegarde des saisies (étape 6, facultative).
- **Point d'attention :** l'arithmétique à virgule flottante. Arrondir 500.00000000000006 au-dessus donne 501 : le test d'aller-retour est là pour l'attraper. Demande à l'agent d'expliquer le mécanisme avant qu'il ne le corrige.

### Étape 5 : Accessibilité

- **Objectif :** tout fonctionne au clavier seul et avec un lecteur d'écran.
- **Pourquoi :** une étiquette ou un message d'erreur que seul un utilisateur voyant à la souris peut percevoir exclut des personnes et cache des erreurs.
- **Ce que l'on ajoute :** un focus visible sur chaque contrôle ; chaque message d'erreur lié à son champ et annoncé par les lecteurs d'écran ; pas de nouvelle annonce du résultat à chaque touche ; un contraste AA.
- **Terminé quand :**
  - Parcourir la page avec Tab → chaque champ et contrôle est atteignable dans un ordre logique, avec un focus visible.
  - VoiceOver (Mac) ou NVDA (Windows) → chaque champ lit son étiquette ; une saisie invalide lit son message.
  - Taper un nombre → pas d'annonce à chaque touche.
  - Audit d'accessibilité Lighthouse dans les DevTools de Chrome → score ≥ 90.
- **Pas encore :** la sauvegarde des saisies (étape 6, facultative).
- **Point d'attention :** il est facile d'abuser d'une zone d'annonce (`aria-live`) : annonce les erreurs et les changements d'état, pas chaque touche.

### Étape 6 (facultative) : Garder les saisies

- **Objectif :** les saisies survivent à un rechargement de la page.
- **Pourquoi :** comparer des scénarios sur plusieurs sessions sans tout ressaisir.
- **Ce que l'on ajoute :** les saisies enregistrées dans le navigateur (`localStorage`), chaque lecture et écriture entourée d'un `try/catch` ; l'app fonctionne normalement quand le stockage n'est pas disponible.
- **Terminé quand :**
  - Rechargement → mêmes saisies, même résultat.
  - Fenêtre privée ou stockage bloqué → l'app fonctionne et ne se souvient simplement de rien.
  - Une valeur enregistrée corrompue → ignorée, aucun plantage.
- **Pas encore :** rien : c'est la dernière étape.
- **Point d'attention :** les données enregistrées sont aussi des saisies : valide-les avec la même fonction de lecture qu'une saisie au clavier.

## 5. Carte des fichiers

Les fichiers attendus. L'agent de code met à jour ce tableau s'il ajoute un fichier.

| Fichier | Ce qu'il fait | Depuis |
|---|---|---|
| `PLAN.md` | ce plan | le début |
| `AGENTS.md` | les consignes pour l'agent de code | le début |
| Base Vite (`package.json`, `index.html`, `vite.config.ts`, `src/main.tsx`…) | la mise en place du projet | étape 0 |
| `src/tjm.test.ts` | tests unitaires de `tjm.ts` (un test provisoire à l'étape 0) | étape 0 |
| `src/tjm.ts` | lecture des saisies et calcul, fonctions pures, sans React | étape 1 |
| `.oxlintrc.json` | configuration du linter, apportée par le modèle Vite (`npm run lint`) | étape 0 |
| `src/index.css`, `src/App.css` | styles de la page, couleurs des thèmes clair et sombre | étape 1 |
| `src/App.tsx` | le formulaire, le détail et l'avertissement | étape 1 |

## 6. Journal

Une ligne par étape, écrite par l'agent de code : ce qui a changé, quels fichiers, et pourquoi.

- Étape 0 (2026-10-28) : base Vite `react-ts` générée dans un sous-dossier puis déplacée, pour que `PLAN.md` et `AGENTS.md` restent intacts (vérifié par sha256) ; ajout de Vitest comme seule dépendance supplémentaire, d'un script `test` (`vitest run`), de `"strict": true` explicite dans `tsconfig.app.json`, et d'un test provisoire dans `src/tjm.test.ts`. Le modèle apporte aussi `oxlint` (`npm run lint`) et `README.md`. Cas de référence encore à remplir par une personne.
- Étape 0, cas de référence (2026-10-28) : à la demande explicite de l'utilisateur, l'agent de code a rempli le tableau du cas de référence (écart avec « jamais avec l'app ni avec l'agent ») ; chaque valeur est calculée à la main dans la conversation pour qu'une personne puisse la revérifier à la calculatrice avant l'étape 1.
- Étape 1 (2026-10-28) : `src/tjm.ts` contient les types des saisies, un `parseInputs` minimal (null tant qu'un champ est vide ou non numérique) et `computeBreakdown` (modèle de l'étape 1, sans arrondi, taux saisis en pourcentages), plus des fonctions d'affichage `Intl.NumberFormat('fr-FR')` ; `src/App.tsx` remplace la démo Vite par les 7 champs texte étiquetés (`inputMode="decimal"`, lecture maison comme le suggère l'étape 2), le détail et l'avertissement permanent ; `src/index.css` et `src/App.css` réécrits avec des couleurs pour les thèmes clair et sombre ; les tests couvrent le cas A (valeurs et affichage), un second cas fictif et la règle du taux vide.
- Étapes 0 et 1 cochées dans Avancement par l'agent de code sur instruction explicite de l'utilisateur (2026-10-28) ; l'utilisateur les a validées après avoir vérifié l'app dans le navigateur.
- Étape 2 (2026-10-28) : `src/tjm.ts` remplace `parseInputs` par `parseNumber` (virgule ou point, au plus un séparateur, espaces retirées pour que `6 000` se lise 6000) et `validateInputs` (vide, négatif, non numérique, pourcentage au-dessus de 100, TJM ou jours ouvrés à 0, plus de jours de congés que de jours ouvrés, chacun avec un message en français) ; `src/App.tsx` affiche chaque message sous son champ (un champ vide seulement une fois quitté) et aucun résultat tant qu'un champ est invalide ; couleur d'erreur ajoutée à `src/index.css` et `src/App.css` ; tests dans `src/tjm.test.ts`. Décision, prise avec l'utilisateur : `1e3` est rejeté (probablement une faute de frappe, et le lire comme 1 000 donnerait un chiffre plausible mais faux) ; les espaces de milliers sont acceptées.
- Extra, à la demande de l'utilisateur (2026-10-28, hors plan) : les flèches Bas / Haut déplacent le focus vers le champ suivant / précédent dans `src/App.tsx`, sans boucler aux extrémités ; ordre de Tab inchangé.
- Étape 3 (2026-10-28) : `computeBreakdown` dans `src/tjm.ts` prend une `ContributionBase` ('revenue' ou 'revenueMinusExpenses') et ramène à zéro les assiettes de cotisations et d'impôt négatives ; `formatNet` affiche un net négatif sous la forme « Perte : … » ; `src/App.tsx` ajoute le groupe de boutons radio « Assiette des cotisations » (par défaut « Chiffre d'affaires »), en gardant les flèches natives à l'intérieur, et utilise des apostrophes droites dans les étiquettes pour correspondre exactement au plan ; styles dans `src/App.css` ; tests du cas B et des deux cas de perte dans `src/tjm.test.ts`.
- Étape 4 (2026-10-28) : `src/tjm.ts` ajoute un `Mode`, le champ « Revenu net mensuel visé (€) » (`fieldsFor` l'échange avec le TJM), `computeMinimalTjm` (inverse exact de la formule, puis `Math.ceil` corrigé par le calcul direct, car un résidu de virgule flottante comme 1350.0000000000002 faisait que `Math.ceil` seul se trompait d'un euro dans 5 allers-retours sur 696) avec un message qui nomme la cause quand aucun jour n'est facturable ou qu'un taux vaut 100 %, et `evaluate`, qui valide et lance l'un ou l'autre calcul ; `src/App.tsx` ajoute le sélecteur « TJM → revenu » / « Revenu → TJM » et affiche le TJM minimal avec son détail ; tests d'aller-retour et de propriété sur les deux assiettes dans `src/tjm.test.ts`. Décision, prise avec l'utilisateur : un objectif de 0 € est rejeté comme un TJM de 0.
- Étape 5 (2026-10-28) : `src/App.tsx` lie chaque message d'erreur à son champ (`aria-describedby`, `aria-invalid`) et ajoute une zone d'annonce polie dont le texte ne change que quand on quitte un champ (l'erreur du champ, ou le message « Objectif inatteignable »), jamais à chaque touche ; le résultat n'est pas annoncé. `src/App.css` ajoute un contour `:focus-visible` de 3 px sur chaque champ, une bordure rouge sur les champs invalides et une classe `.sr-only` ; `src/index.css` ajoute `--control-border` car la bordure des champs était à 1,69:1 contre le fond (le niveau AA hors texte exige 3:1, désormais 4,74:1 en clair et 5,01:1 en sombre) ; `index.html` reçoit `lang="fr"` et le titre « Calculateur TJM ». Les vérifications au lecteur d'écran et avec Lighthouse sont laissées à l'utilisateur (pas de VoiceOver/NVDA sur cette machine, pas d'installation de Lighthouse sans demander).
- Étape 6 (2026-10-28) : `src/tjm.ts` ajoute `readSavedState`, qui lit le JSON enregistré et ne garde un champ que s'il s'agit d'un texte accepté par `parseNumber` (un mode ou une assiette inconnus reviennent à la valeur par défaut, un JSON cassé ne donne rien) ; `src/App.tsx` charge les saisies, le mode et l'assiette depuis `localStorage` (clé `calculateur-tjm`) au premier affichage et les enregistre à chaque changement, chaque accès entouré d'un `try/catch` pour que la page fonctionne et oublie simplement quand le stockage est bloqué ; tests des données enregistrées dans `src/tjm.test.ts`. Ce qui est enregistré est le texte saisi, jamais un nombre déjà lu.
- Nettoyage, à la demande de l'utilisateur (2026-10-28, hors plan) : suppression des fichiers de démo Vite inutilisés `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` et `public/icons.svg` (rien ne les importait) ; `README.md` remplacé par une courte description du projet et de ses commandes. `public/favicon.svg` gardé, car `index.html` l'utilise.
- Extra, à la demande de l'utilisateur (2026-10-28, hors plan) : design visuel moderne. `src/App.tsx` place le formulaire et le résultat dans des cartes disposées en deux colonnes sur grand écran (résultat fixe à droite, une seule colonne sur téléphone), range les champs dans une grille à deux colonnes et dessine les deux groupes de boutons radio en boutons segmentés (toujours de vrais boutons radio, cachés visuellement, pour que le clavier et les lecteurs d'écran fonctionnent comme avant) ; `src/index.css` reçoit une nouvelle palette claire et sombre, chaque paire vérifiée au niveau AA (texte ≥ 4,5:1, bordures de champ et focus ≥ 3:1) ; `src/App.css` réécrit en conséquence. Aucun texte de l'interface, ordre du HTML, calcul ni test n'a changé.
- Extra, à la demande de l'utilisateur (2026-10-28, hors plan) : `public/favicon.svg` affiché à gauche du titre dans `src/App.tsx`, comme image décorative (`alt=""`, le titre nomme déjà l'app), dimensionné d'après la police du titre dans `src/App.css`.
- Traduction, à la demande explicite de l'utilisateur (2026-10-28) : `PLAN.md` et `AGENTS.md` traduits en français par l'agent de code (écart avec « ne jamais réécrire `PLAN.md` ni `AGENTS.md` », levé par l'utilisateur pour cette fois). Le sens est inchangé ; les textes de l'interface entre « », les noms de code, les cases d'Avancement et le cas de référence sont gardés tels quels.
