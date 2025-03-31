# Scholarsuite technical specification

## Stack

- [React](https://reactjs.org/) - Bibliothèque JavaScript pour la création d'interfaces utilisateur
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire pour la création d'interfaces utilisateur
- [Next.js](https://nextjs.org/) - Framework React pour le développement d'applications web
- [Typescript](https://www.typescriptlang.org/) - Superset de JavaScript qui ajoute des types statiques
- [Node.js](https://nodejs.org/) - Environnement d'exécution JavaScript côté serveur
- [Auth.js](https://authjs.dev/) - Bibliothèque d'authentification pour Next.js
- [Prisma](https://www.prisma.io/) - ORM pour Node.js et TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Système de gestion de base de données relationnelle

## Architecture

- **Client** : Application React qui s'exécute dans le navigateur de l'utilisateur
- **Serveur** : Application Node.js qui s'exécute sur le serveur
- **Base de données** : PostgreSQL pour stocker les données de l'application
- **API** : Prisma pour interagir avec la base de données
- **Authentification** : Auth.js pour gérer l'authentification des utilisateurs
- **Déploiement** : Service no-serverless pour héberger l'application (docker, kubernetes, etc.)
- **Testing** : Node test runner pour les tests unitaires et d'intégration
- **CI/CD** : Github actions pour l'intégration continue et le déploiement continu
- **Documentation** : Markdown pour la documentation technique

## Positionnement entre les clients side et server side components

Il faudrais idéalement utiliser que les composant client side, car l'application seras très interactive.

## Authentification provider supportés

- Google
- Github _peut être juste pour le dev_
- Microsoft
