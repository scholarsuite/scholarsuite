# ScholarSuite design specification

ScholarSuite est basé sur [tailwindcss](https://tailwindcss.com), nous allons garder le design de base de Tailwind CSS.

## Design réactif

L'application va être pensée pour les écrans "desktop" et "mobile" en second temps.
La gestion des thèmes sombre et clair sera supportée.
## Typographie

Nous allons utiliser la police de caractères [`geist`](https://vercel.com/font) qui est un super police pour les applications web. Elle est très lisible et légère.
Cette police d'écriture sera bundlée avec l'application grâce à [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts).

## Couleurs

- Couleur neutre : `slate`
 - Utilisé pour le fond de l'application, les bordures et les textes.
- Couleur d'accent : `teal`
  - Utilisé pour les boutons, les liens et les éléments interactifs.
- Couleur de succès : `green`
  - Utilisé pour les messages de succès et les éléments positifs mais aussi assigné aux éléments liés à la "présence" dans la gestion des présences
  - Utilisé pour les messages de succès et les éléments positifs mais aussi assigné aux éléments liés à la "présence" dans la gestion des présences
- Couleur d'avertissement : `amber`
  - Utilisé pour les messages d'avertissement et les éléments d'attention mais aussi assigné aux éléments liés au "retard" dans la gestion des présences
- Couleur d'erreur : `red`
  - Utilisé pour les messages d'erreur et les éléments négatifs mais aussi assigné aux éléments liés à l'"absence" dans la gestion des présences
- Couleur d'information supplementaire : `blue`
  - Utilisé pour les messages d'information et les éléments informatifs mais aussi assigné aux éléments liés à la "justification" dans la gestion des présences

Il faut une bibliothèque d'icônes pour les icônes de l'application. Nous allons utiliser [heroicons](https://heroicons.com/) qui est la bibliothèque d'icônes de Tailwind CSS.

## Respect des standards

L'application sui le standards de [W3C](https://www.w3.org/) et [WCAG](https://www.w3.org/WAI/WCAG21/quickref/) pour l'accessibilité et le respect des normes du web.
