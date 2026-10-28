# AGENTS.md

Consignes pour l'agent de code. Ce que l'on construit, dans quel ordre et ce que « terminé » veut dire se trouvent dans `PLAN.md` : lis-le avant tout changement, et ne construis que l'étape demandée.

## Projet

Calculateur TJM : une seule page web qui transforme un taux journalier (TJM) en revenu net estimé, et un revenu visé en TJM minimal. Un utilisateur, pas de compte, pas de serveur, pas d'IA à l'exécution.

## Stack

- React + TypeScript (strict) + Vite. Tests avec Vitest.
- Aucune autre dépendance sans demander d'abord.

## Commandes

- `npm install`
- `npm run dev` : lance l'app.
- `npm test` : lance les tests une fois puis s'arrête (`vitest run`, jamais le mode surveillance).
- `npm run build` : vérifie les types et construit. Doit passer à la fin de chaque étape.

## Conventions

- Code, noms et commentaires en anglais. Textes de l'interface en français, exactement comme écrits dans `PLAN.md`.
- Toute la logique de lecture des saisies et de calcul se trouve dans `src/tjm.ts` : fonctions pures, sans import de React, sans accès à la page ni au navigateur.
- Les tests se trouvent dans `src/tjm.test.ts`.
- Aucun arrondi dans les calculs. Arrondir seulement pour l'affichage, avec `Intl.NumberFormat('fr-FR', …)`.

## Règles strictes

- Aucun taux réel de cotisations ou d'imposition nulle part : ni comme valeur par défaut, ni comme exemple, ni dans un commentaire, ni comme valeur de test. Les tests utilisent des taux fictifs ronds (10 %, 20 %). L'utilisateur saisit les vrais.
- Montrer les commandes avant de les lancer, et demander avant d'installer un paquet.
- Ne jamais supprimer ni réécrire `PLAN.md` ou `AGENTS.md`. Dans `PLAN.md`, on ajoute seulement des lignes au Journal et des lignes à la Carte des fichiers.
- Ne jamais annoncer qu'un test passe sans l'avoir lancé. En cas de doute sur le comportement d'un navigateur, le dire au lieu de l'affirmer.
- Si `PLAN.md` paraît faux ou incohérent, le dire et attendre. Ne pas changer le plan ni le contourner.
- Ne jamais cocher une étape dans Avancement : c'est une personne qui le fait.

## À chaque étape

Avant de coder : dire en trois lignes ce qui va changer, ce qui ne doit pas bouger et comment on vérifiera. Puis attendre un feu vert.

À la fin :
1. Lancer `npm test` et `npm run build`.
2. Pour chaque point « Terminé quand », indiquer comment il a été vérifié (lancé / lu dans le code / non vérifié), avec la vraie sortie des tests.
3. Ajouter une ligne au Journal dans `PLAN.md`, et mettre à jour sa Carte des fichiers si un fichier a été ajouté.
4. Proposer un message de commit, puis s'arrêter. Une personne relit le diff et commite.
