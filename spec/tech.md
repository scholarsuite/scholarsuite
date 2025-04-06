# ScholarSuite technical specification

Cette spécification technique décrit les choix techniques et les standards de code pour le projet ScholarSuite. Elle est destinée aux développeurs et aux contributeurs qui souhaitent travailler sur le projet.

## Stack

- [React](https://reactjs.org/) - Bibliothèque JavaScript pour la création d'interfaces utilisateur
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire pour la création d'interfaces utilisateur
- [Next.js](https://nextjs.org/) - Framework React pour le développement d'applications web
- [Typescript](https://www.typescriptlang.org/) - Superset de JavaScript qui ajoute des types statiques
- [Node.js](https://nodejs.org/) - Environnement d'exécution JavaScript côté serveur
- [Auth.js](https://authjs.dev/) - Bibliothèque d'authentification pour Next.js
- [Prisma](https://www.prisma.io/) - ORM pour Node.js et TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Système de gestion de base de données relationnelle
- [react-pdf](https://react-pdf.org/) - Librairie pour générer des PDF à partir de composants React
- [react-email](https://react.email/) - Librairie pour générer des emails à partir de composants React
- [storybook](https://storybook.js.org/) - Outil de développement pour créer des composants d'interface utilisateur isolés
- [nodejs-loader](https://nodejs-loaders.github.io) - Suites de loaders pour Node.js afin de charger des fichiers "frontend" dans Node.js. Uniquement pour le test

## Architecture

- **Client** : Application React qui s'exécute dans le navigateur de l'utilisateur
- **Serveur** : Application Node.js qui s'exécute sur le serveur
- **Base de données** : PostgreSQL pour stocker les données de l'application
- **API** : Prisma pour interagir avec la base de données. Et Next.js pour créer des API RESTful
- **Authentification** : Auth.js pour gérer l'authentification des utilisateurs
- **Déploiement** : Service no-serverless pour héberger l'application (docker, kubernetes, etc.)
- **Testing** : Node native test runner pour les tests unitaires et d'intégration. Et storybook pour les tests d'interface utilisateur
- **CI/CD** : Github actions pour l'intégration continue et le déploiement continu
- **Documentation** : Markdown pour la documentation technique

## Positionnement entre les clients side et server side components

Il faudrait idéalement utiliser que les composant client side, car l'application seras très interactive.

## Authentification provider supportés

- Google
- Github _peut être juste pour le dev_
- Microsoft

## Déploiement/environnement

- Dev : Environnement de développement local
  - Base de données locale, mockée à l'aide d'un script
  - Pas d’utilisation d'https
- Staging : Environnement de pré-production
  - Base de données de pré-production, potentiellement mockée
  - Utilisation d'https
  - Peut-être utiliser pour les tests de charge, test d'integration, etc.
- Production : Environnement de production
  - Base de données de production
  - Utilisation d'https

## Standard de code

**TOUTS** le code doit utiliser de l'anglais, même les commentaires et les noms de variables.

Outils utilisés pour le standard de code :
- [Biomejs](https://biomejs.dev/) - Outil de formatage et de linting pour JavaScript et TypeScript
- [Prisma](https://www.prisma.io/docs/) - Formatage et linting pour le schema Prisma

### Prisma

- Toutes les modèles doivent avoir un champ `id`, `createdAt` et `updatedAt`
- Les champs `createdAt` et `updatedAt` doivent être de type `DateTime`
- Les enums doivent être écrits en "uppercase" et en "snake_case"
