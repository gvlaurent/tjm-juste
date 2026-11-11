<div align="center">

<img src="public/favicon.svg" alt="" width="64" />

# TJM Juste

**Ce qui vous reste vraiment d'un taux journalier, et le taux journalier qu'il vous faut vraiment.**

Pour les consultants et freelances qui veulent fixer leur TJM sur un calcul, pas au doigt mouillé.

### [▶ Essayer TJM Juste](https://gvlaurent.github.io/tjm-juste/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/tests-94%20passent-2EA44F)
[![Déploiement](https://github.com/gvlaurent/tjm-juste/actions/workflows/deploy.yml/badge.svg)](https://github.com/gvlaurent/tjm-juste/actions/workflows/deploy.yml)
![Sans serveur](https://img.shields.io/badge/serveur-aucun-555)

<img src="docs/apercu.png" alt="TJM Juste : un TJM de 500 € donne un revenu net de 5 287,50 € par mois, avec le détail ligne par ligne" width="820" />

</div>

---

## Le problème

« Je facture 500 € par jour, donc je gagne 10 000 € par mois. » Non.

Entre le TJM affiché et l'argent qui arrive vraiment sur votre compte, il y a les congés, le temps passé à prospecter et à faire de l'administratif, les frais, les cotisations et l'impôt. Beaucoup d'indépendants le découvrent après avoir signé leur première mission.

**TJM Juste rend ce trajet visible, dans les deux sens.**

## Ce que fait l'app

| | Vous saisissez | Vous obtenez |
|---|---|---|
| **TJM → revenu** | votre taux journalier | votre revenu net par an et par mois, ligne par ligne |
| **Revenu → TJM** | le revenu net mensuel que vous visez | le **TJM minimal** pour l'atteindre, arrondi à l'euro supérieur |

Les deux calculs partagent les mêmes hypothèses : jours ouvrés, congés, part de temps non facturable, frais annuels, taux de cotisations, taux d'imposition, et l'assiette des cotisations (chiffre d'affaires, ou chiffre d'affaires moins les frais).

### Pourquoi lui faire confiance

- **Aucune boîte noire.** Chaque montant s'affiche, et la formule complète est écrite ci-dessous.
- **Aucun taux inventé.** L'app ne contient aucun taux réel de cotisations ou d'imposition : c'est vous qui saisissez ceux de votre situation, vérifiés sur les sources officielles. Pas de valeur obsolète cachée dans le code.
- **Des cas limites traités.** Des frais supérieurs au chiffre d'affaires s'affichent comme une perte, un objectif impossible donne un message qui nomme la cause, et les saisies erronées (`abc`, `-3`, `150 %`) sont refusées au lieu de produire un chiffre plausible mais faux.
- **Vos données restent chez vous.** Pas de compte, pas de serveur : les saisies sont gardées dans votre navigateur, et nulle part ailleurs.
- **Accessible.** Utilisable entièrement au clavier, messages d'erreur annoncés aux lecteurs d'écran, contrastes au niveau AA, thème clair et sombre.

## Le calcul

```text
jours facturés     = (jours ouvrés − congés) × (1 − part non facturable)
chiffre d'affaires = TJM × jours facturés
cotisations        = taux de cotisations × assiette        (assiette = CA, ou CA − frais ; jamais négative)
impôt              = taux d'imposition × (CA − frais − cotisations)   (jamais négatif)
net par an         = CA − frais − cotisations − impôt
net par mois       = net par an ÷ 12
```

Le calcul inverse (revenu → TJM) applique la formule exacte à l'envers, puis vérifie le résultat avec le calcul direct. Sans cette vérification, une erreur d'arrondi des nombres à virgule (500,00000000000006) ferait afficher 501 € au lieu de 500 €. Rien n'est arrondi pendant le calcul : l'arrondi se fait seulement à l'affichage.

**Exemple** (taux fictifs) : TJM 500 €, 250 jours ouvrés, 25 jours de congés, 15 % de temps non facturable, 6 000 € de frais, 20 % de cotisations sur le CA, 10 % d'impôt → **191,25 jours facturés, 95 625 € de CA, 5 287,50 € nets par mois.** Et dans l'autre sens, 5 287,50 € visés → 500 € de TJM, pas 501.

> ⚠️ **Modèle volontairement simplifié.** Pas de règles propres à un statut (micro-entreprise, SASU, EURL, portage), pas de tranches d'impôt, pas de TVA. C'est un outil pour raisonner et comparer des scénarios. Il ne remplace ni le [simulateur officiel de l'Urssaf](https://mon-entreprise.urssaf.fr/) ni un expert-comptable.

## Lancer l'app

En ligne : **[gvlaurent.github.io/tjm-juste](https://gvlaurent.github.io/tjm-juste/)**, rien à installer.

En local (prérequis : Node.js) :

```bash
npm install
npm run dev        # puis ouvrir http://127.0.0.1:5173/
```

| Commande | Rôle |
|---|---|
| `npm test` | lance les 94 tests une fois (Vitest) |
| `npm run build` | vérifie les types et construit dans `dist/` |
| `npm run lint` | lance le linter (oxlint) |

## Sous le capot

- **React 19 + TypeScript strict + Vite**, aucune autre dépendance à l'exécution.
- `src/tjm.ts` : toute la logique (lecture des saisies, validation, calcul, calcul inverse) en fonctions pures, sans React. Elle se teste et se relit isolément.
- `src/tjm.test.ts` : cas de référence calculés à la main, allers-retours TJM ⇄ revenu sur les deux assiettes, propriétés (le TJM renvoyé atteint l'objectif, et ce TJM moins 1 € ne l'atteint pas), cas limites et données enregistrées corrompues.
- `src/App.tsx` : le formulaire, le détail et l'avertissement.
- `.github/workflows/deploy.yml` : à chaque push sur `main`, lance les tests, construit l'app et la publie sur GitHub Pages. Si un test échoue, rien n'est publié.

## Comment ce projet a été construit

TJM Juste a été construit pas à pas avec un agent de code, à partir d'un plan écrit avant la première ligne de code. Chaque étape avait ses critères de fin et ses tests, et une personne validait avant de passer à la suivante.

- [`PLAN.md`](PLAN.md) : le périmètre, les étapes, les critères « Terminé quand » et le journal des décisions.
- [`AGENTS.md`](AGENTS.md) : les consignes données à l'agent de code (aucun taux réel dans le dépôt, aucun arrondi intermédiaire, aucune étape cochée par l'agent).

---

<sub>Projet personnel de Gabriel Laurent. Les résultats sont des estimations ; vérifiez toujours vos taux sur [urssaf.fr](https://www.urssaf.fr/) et [impots.gouv.fr](https://www.impots.gouv.fr/).</sub>
