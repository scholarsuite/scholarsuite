# ScholarSuite design specification

ScholarSuite est basé sur [tailwindcss](https://tailwindcss.com), nous allons garder le design de base de Tailwind CSS.

## Design réactif

L'application vas être pensée pour les écran "desktop" et "mobile" en second temps.
La gestion des thèmes sombre et clair sera supporter.

## Typographie

Nous allons utiliser la police de caractères [`geist`](https://vercel.com/font) qui est un super police pour les applications web. Elle est très lisible et légère.
Cette police d'écriture sera bundlée avec l'application grâce à [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts).

## Couleurs

- Couleur neutre : `slate`
- Couleur d'accent : `teal`
- Couleur de succès : `green`
- Couleur d'avertissement : `amber`
- Couleur d'erreur : `red`

## Icônes

Il faut une bibliothèque d'icônes pour les icônes de l'application. Nous allons utiliser [heroicons](https://heroicons.com/) qui est la bibliothèque d'icônes de Tailwind CSS.
