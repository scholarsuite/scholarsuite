# ScholarSuite technical specification

Cette spécification technique décrit les choix techniques et les standards de code pour le projet ScholarSuite. Elle est destinée aux développeurs et aux contributeurs qui souhaitent travailler sur le projet.

## Stack

- [React](https://reactjs.org/) - Bibliothèque JavaScript pour la création d'interfaces utilisateur
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire pour la création d'interfaces utilisateur
- [Next.js](https://nextjs.org/) - Framework React pour le développement d'applications web
- [Typescript](https://www.typescriptlang.org/) - Superset de JavaScript qui ajoute des types statiques
- [Node.js](https://nodejs.org/) - Environnement d'exécution JavaScript côté serveur
- [Better-auth](https://www.better-auth.com) - Bibliothèque d'authentification
- [Prisma](https://www.prisma.io/) - ORM pour Node.js et TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Système de gestion de base de données relationnelle
- [react-pdf](https://react-pdf.org/) - Librairie pour générer des PDF à partir de composants React
- [react-email](https://react.email/) - Librairie pour générer des emails à partir de composants React
- [storybook](https://storybook.js.org/) - Outil de développement pour créer des composants d'interface utilisateur isolés
- [nodejs-loader](https://nodejs-loaders.github.io) - Suites de loaders pour Node.js afin de charger des fichiers "frontend" dans Node.js. Uniquement pour le test

## Architecture

- **Client & Serveur** : Next.js gère à la fois l'application client (React) et la logique serveur, offrant une base de code unifiée pour pages, composants et API.
- **Pages et rendu** : Utiliser le router de Next.js (App Router) pour SSR ou CSR selon les besoins des pages.
- **API** : Routes API de Next.js (/api) pour exposer des endpoints RESTful; ces routes exécutent la logique serveur et appellent Prisma pour accéder à PostgreSQL.
- **Base de données** : PostgreSQL, accessible depuis le runtime serveur de Next.js (API routes / server actions).
- **API** : Prisma pour interagir avec la base de données. Et Next.js pour créer des API RESTful
- **Authentification** : better-auth pour gérer l'authentification des utilisateurs
- **Déploiement** : Service no-serverless pour héberger l'application (docker ou process node + postgresql)
- **Testing** : Node native test runner pour les tests unitaires et d'intégration. Et storybook pour les tests d'interface utilisateur
- **CI/CD** : Github actions pour l'intégration continue et le déploiement continu
- **Documentation** : Markdown pour la documentation technique

## Gestion des variables d'environnement

Toutes les variables d'environnement doivent être définies dans des fichiers `.env` à la racine du projet.
Next.js lit automatiquement les fichiers `.env` et injecte les variables d'environnement dans le runtime serveur et client.

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

**Tout** le code doit utiliser de l'anglais, même les commentaires et les noms de variables. Mais les hooks git ne seront pas utilisés pour permettre de pousser des commits malgré des erreurs de linting.

Outils utilisés pour le standard de code :
- [Biomejs](https://biomejs.dev/) - Outil de formatage et de linting pour JavaScript et TypeScript
- [Prisma](https://www.prisma.io/docs/) - Formatage et linting pour le schema Prisma

## Prisma

- Toutes les modèles doivent avoir un champ `id`, `createdAt` et `updatedAt`
- Les champs `createdAt` et `updatedAt` doivent être de type `DateTime`
- Les enums doivent être écrits en "uppercase" et en "snake_case" ex: `USER_ROLE`
- L'utilisation du générateur de client [`prisma-erd-generator`](https://github.com/keonik/prisma-erd-generator) vas être encouragée pour générer des diagrammes ERD

### Example de modèle Prisma

```prisma
enum USER_ROLE {
    ADMIN
    TEACHER
    STUDENT
    USER
}

model User {
    id        String   @id @default(cuid())
    email     String   @unique
    name      String?
    role      USER_ROLE @default(USER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

### Gestion des migrations

Prisma Migrate sera utilisé pour gérer les migrations de la base de données.
Les migrations seront stockées dans le dossier `prisma/migrations`.

Pour créer une nouvelle migration, la commande suivante sera utilisée :

```bash
npx prisma migrate dev --name <migration_name>
```

Il est préférable que `migration_name` soit descriptif de la modification apportée (ex: `add_user_role` ou `feature_x_initial_setup`).

Si une migration nécessite des modifications de données (ex: transformation de données existantes), un script de migration de données doit être créé dans le dossier `scripts/migrations` voir [section dédiée](#gestions-des-mise-à-jour-sur-un-instance-déjà-déployée).

Dans ce cas, la migration prisma dois avoir le préfix `pre` et `post`. `pre` pour indiquer une modification de schéma avant la migration de données, et `post` pour indiquer une modification de schéma après la migration de données.

Par exemple: en `pre`, copier des données dans une nouvelle colonne, puis en `post`, supprimer l'ancienne colonne.

## Tests

- Les tests unitaires et d'intégration doivent être écrits pour toutes les fonctionnalités critiques
- Les tests visuels doivent prendre en charge les composants React via Storybook
- La couverture de code minimale doit être de 80%
- Les tests seront exécutés automatiquement via des workflows GitHub Actions à chaque pull request
- Le test runner natif de Node.js sera utilisé pour les tests unitaires et d'intégration

## Observabilité

Cette section décrit une solution d'observabilité simple, "maison", conçue pour être légère, facile à déployer et respectueuse des données personnelles des élèves. L'objectif est d'avoir un observatoire suffisant pour le debug, le fonctionnement quotidien et les incidents mineurs sans dépendances externes lourdes ni services tiers.

Les logs seront collectés et stockés localement dans la base de données, avec un système de nétoyage automatique pour supprimer les logs anciens après une période définie (par exemple, 30 jours).

Un log est une entrée structurée contenant les informations suivantes :
- id: Identifiant unique du log
- Timestamp : Date et heure de l'événement
- userId : Identifiant de l'utilisateur (si applicable)
- Niveau : Niveau de gravité (DEBUG, INFO, WARN, ERROR)
- Message : Description de l'événement, en anglais
- Metadata : Données supplémentaires pertinentes (JSON)

## Metriques

Les métriques seront collectées et stockées localement dans la base de données.

Une métrique est une entrée structurée contenant les informations suivantes :
- id: Identifiant unique de la métrique
- Timestamp : Date et heure de la collecte
- Nom : Nom de la métrique (par exemple, "quantity_of_present_students")
- Valeur : Valeur numérique de la métrique

## Internationalisation

L'application doit être conçue pour supporter facilement plusieurs langues et formats régionaux.
Cela inclut :
- Les textes de l'interface utilisateur doivent être extraits dans des fichiers de ressources séparés.
- Support des formats régionaux pour les nombres, les dates et les heures.

La mise a jour des ressources ou l'ajout de nouvelles langues n'impacte que le patch du versionning sémantique.

## Gestions des mise à jour sur un instance déjà déployée

Les mises à jour de l'application doivent être gérées de manière à minimiser les interruptions de service.

Pour cela, un ensemble de scripts de migration et de mise à jour doit être développé pour automatiser le processus de mise à jour en cas de besoin. Un changement de l'interface graphique ne nécessite pas de script de mise à jour, mais tout changement de la base de données ou de la logique métier en nécessite un.
Ils seront stockés dans le dossier `scripts/update/<tag>to<new_tag>`.

Chaque script de mise à jour peut inclure :
- une migration prisma
- une migration de données (ex: transformer des données existantes pour qu'elles correspondent au nouveau schéma)

