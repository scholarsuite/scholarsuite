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
  - Utilisé pour les messages de succès et les éléments positifs mais aussi assigné aux éléments liés à la "présence" dans la gestion des présences.
- Couleur d'avertissement : `amber`
  - Utilisé pour les messages d'avertissement et les éléments d'attention mais aussi assigné aux éléments liés au "retard" dans la gestion des présences.
- Couleur d'erreur : `red`
  - Utilisé pour les messages d'erreur et les éléments négatifs mais aussi assigné aux éléments liés à l'"absence" dans la gestion des présences.
- Couleur d'information supplementaire : `blue`
  - Utilisé pour les messages d'information et les éléments informatifs mais aussi assigné aux éléments liés à la "justification" dans la gestion des présences.

L'application sera conçue avec le concept de de variantes tailwindcss afin de fournir différentes themes. [Adding custom variants](https://tailwindcss.com/docs/adding-custom-styles#adding-custom-variants)

Les themes suivants seront disponibles :
- Thème clair (par défaut)
- Thème sombre
- Thème haute-contraste clair
- Thème haute-contraste sombre

## Icônes

Il faut une bibliothèque d'icônes pour les icônes de l'application. Nous allons utiliser [heroicons](https://heroicons.com/) qui est la bibliothèque d'icônes de Tailwind CSS.

## Breakpoints

Nous allons utiliser les breakpoints par défaut de Tailwind CSS :
- `sm` : 640px
- `md` : 768px
- `lg` : 1024px
- `xl` : 1280px
- `2xl` : 1536px

## Respect des standards

L'application suit les standards de [W3C](https://www.w3.org/) et [WCAG](https://www.w3.org/WAI/WCAG21/quickref/) pour l'accessibilité et le respect des normes du web.

## Badges et tags

- Tag: pour de petites étiquettes descriptives (IDs, catégories, scopes). Utiliser `variant` pour la couleur sémantique, `size="sm"` pour les tables denses, `appearance="outline"` pour un style discret et `mono` pour les identifiants.
- StatusBadge: pour les statuts métier (success, warning, info, danger, neutral) qui nécessitent une emphase plus forte que `Tag`.
- LevelBadge: spécifique aux niveaux de logs (DEBUG/INFO/WARN/ERROR). À n'utiliser que dans le contexte journaux.

Règles de choix rapides:
- Métadonnée légère dans une cellule de tableau: `Tag` (`size="sm"`).
- État d’un enregistrement (p. ex. actif/suspendu): `StatusBadge`.
- Niveaux de logs: `LevelBadge`.
