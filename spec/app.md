# Scholarsuite app specification

Scholarsuite est une application de gestion de vie scolaire. Elle est destinée aux enseignants et aux administrateurs d'établissements scolaires.

## Objectif

- Gestion des présence
  - Pointage: présence, retard, absence
  - Création de justification
  - Statistique corroboré entre pointage et justification
- Gestion des rapports diciplinaire
  - Création
  - Suivis: overt, fermer, traité
- Gestion des notes
  - Par période
  - Génération de bulletin
  - Gestion du conseil de classe

Ne sont pas pris comme nécéssaires pour une version viable:

- Gestion des horaires
- Gestion des locaux
- Gestion du matériel
- Gestion du "journal de classe"
- Consultation des notes par les élèves + bulettin électronique
- Communication avec les parents

## Les grands rôles

- **Administrateur système**: Corespond au responsable informatique, de la configuration du sytème
  - Paramètrage de l'application
  - Configuration et maintenance des données de base
- **Gestionaire**: Corespond à la direction, au personnel administratif, aux éducateurs...
  - Gestion des données de base de l'application
  - Introduction de nouveaux utilisateur
  - Suivis des rapports diciplinaire
  - Gestion des conseils de classe
  - Introduction de nouveaux élèves
- **Enseignants**:
  - Gestion des présences
  - Introduction des notes
  - Création de rapports diciplinaires
- **Elèves**: n'ont pas accès au système dans un premier temps

## "User stories"

<!--
"en tant que <role>, : e veux pouvoir
- <action> pour <but>"
-->

### Administrateur système

En tant qu'administrateur système, je veux pouvoir:

### Gestionaire

En tant que gestionaire, je veux pouvoir:

### Enseignant

En tant qu'enseignant, je veux pouvoir:

### Elève

Les élèves n'ont pas accès au système dans un premier temps.

## Fonctionnalités

Cette liste peut être amenée à évoluer au fur et à mesure de l'avancement du projet. Elle représente les conceptes de base de l'application.

- Gestion des utilisateurs
  - Inscription des utilisateurs
  - Connexion des utilisateurs
  - Gestion des rôles (enseignant, administrateur ...)
  - Gestion des permissions
- Gestion des élèves
  - Inscription des élèves
  - Gestion des informations personnelles des élèves
- Gestion des classes
- Gestion des groupes
- Gestion des années scolaires
- Gestion des périodes de cotes
- Gestion des tranches horaires
- Gestion des cotes
- Gestion des bulletins
  - Génération des bulletins (pdf)
  - Possibilité d'ajouter un commentaire par cours
- Pointage des élèves (présence/absence/retard)
  - Possibilité de notification en cas d'absence (Email, SMS)
  - Pointage par groupe et pas par classes
- Gestion des rapports disciplinaires
  - Plusieurs états "open" - "closed" - "processed"
  - Notification email
- Gestion de justification d'absence
  - Cela se représente par une période donnée qui est comparée à une période d'absence.

- I18n (internationalisation), sûrement l'anglais et le français.
- "Monitoring and logging"
- Système de notfication (SMS, push, email ...)
