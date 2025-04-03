# ScholarSuite app specification

ScholarSuite est une application de gestion de vie scolaire. Elle est destinée aux enseignants et aux administrateurs d'établissements scolaires.

## Objectifs

- Gestion des présences
- Gestion des rapports diciplinaires
- Gestion des périodes d'évaluation

Ne sont pas pris comme nécéssaires pour une version viable:

- Gestion des horaires
- Gestion des locaux
- Gestion du matériel
- Gestion du "journal de classe"
- Consultation des notes par les élèves + bulettin électronique
- Communication avec les parents

## Les grands rôles

- **Administrateur système**: Corespond au responsable informatique, de la configuration du sytème
  - Paramètrage de l'application: périodes de cours, créneaux horaires
  - Gestion des utilisateurs et des rôles
- **Gestionaire**: Corespond à la direction, au personnel administratif, aux éducateurs...
  - Gestion des années scolaires
  - Suivis des rapports diciplinaire
  - Introduction de justificatifs d'absence
  - Gestion des conseils de classe
- **Enseignants**:
  - Pointage des élèves par groupe ou classe sur une période de cours
  - Introduction des notes pour une matière, pour tous les élèves de la classe ou du groupe durant une période d'évaluation
  - Création de rapports diciplinaires pour un élève
  - Introduction de commentaire sur la période d'évaluation par matière
- **Elèves**: n'ont pas accès au système dans un premier temps

## "User stories"

### Administrateur système

En tant qu'administrateur système, je veux:
- créer un utilisateur
- archiver un utilisateur
- réinitialiser le mot de passe d'un utilisateur
- gérer les rôles et permissions des utilisateurs
- mettre en place les périodes de cours
- mettre en place les unités de comptabilisation des absences

### Gestionaire

En tant que gestionaire, je veux:
- faire le suivis des rapports disciplinaires par élève
  - fermer un rapport disciplinaire
  - émettre un commentaire sur un rapport disciplinaire
  - marquer un rapport disciplinaire comme traité
  - notifier l'enseignant ou le contact de l'élève
- avoir un aperçu des de chaque élève l'un à la suite de l'autre pour le conseil de classe
- introduire un commentaire pour chaque élève lors du conseil de classe
- introduire des justifications d'absence

### Enseignant•e

En tant qu'enseignant•e, je veux:
- accéder à la liste des élèves de mon cours
- faire les pointages de mes élèves le plus rapidement possible
- crée un rapport disciplinaire pour un élève
- introduire les notes de mes élèves
- introduire un commentaire chaque période de cote

### Elève

Les élèves n'ont pas accès au système dans un premier temps.

## Fonctionnalités

Cette liste peut être amenée à évoluer au fur et à mesure de l'avancement du projet. Elle représente les conceptes de base de l'application.

- Gestion des utilisateurs
  - Inscription des utilisateurs
  - Connexion des utilisateurs
  - Gestion des rôles (enseignant, administrateur ...)
  - Gestion des permissions
  - Archivage des utilisateurs
  - Réinitialisation du mot de passe
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
- "Dashboard" pour les conseil de classes

- Gestion des présences
  - Pointage: présence, retard, absence
  - Création de justification pour les périodes d'absences
  - Synthèse des absences non justifiées par élève sur une années scolaire, par unité de comptabilisaiton
- Gestion des rapports diciplinaires
  - Création
  - Suivi: ouvert, fermé, traité
- Gestion des périodes d'évaluation
  - Introduction de notes d'évaluation pour une matière par l'enseignant
  - Introduction de commentaire sur la période d'évaluation par matière par l'enseignant
  - Gestion du conseil de classe
    - Récapitulatif par élèves avec ses notes par matière, son nombre d'absences justfiées/injustifieés, de retards et de rapports disciplinaire
    - Synthèse des notes par classe par période
    - Introduction de commentaire du conseile privé ou publique
  - Génération de bulletins par élève par classe pour une période d'évaluation
- Gestion des années scolaires
    - Introduction de nouveaux élèves
    - Gestion des classes et des groupes
    - Définition des périodes d'évaluation
