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
  - Paramètrage de l'application: périodes de cours, unité de comptabilisation des absences...
  - Gestion des utilisateurs et des rôles
- **Gestionaire**: Corespond à la direction, au personnel administratif, aux éducateurs...
  - Mise en place des années scolaires
  - Suivis des rapports diciplinaires
  - Introduction de justificatifs d'absence
  - Gestion des conseils de classe
- **Enseignants**:
  - Pointage des élèves par groupe ou classe sur une période de cours
  - Introduction des notes pour une matière, pour tous les élèves de la classe ou du groupe durant une période d'évaluation
  - Création de rapports diciplinaires pour un élève
  - Introduction de commentaires à destination du bulletin sur la période d'évaluation par matière par élève
- **Elèves**: n'ont pas accès au système dans un premier temps

## "User stories"

### Administrateur système

En tant qu'administrateur système, je veux:
- créer, modifier et archiver les utilisateurs
- réinitialiser le mot de passe d'un utilisateur s'il n'y a pas SSO en place
- gérer les rôles et permissions des utilisateurs
- mettre en place les paramètres initiaux de l'application qui définissent l'organisation de l'établissement scolaire
  - définir les périodes de cours (8h25 - 9h15, 9h15 - 10h05, ...)
  - définir les unités de comptabilisation des absences (matins, après-midi ...)
  - définir le nom de l'établissement scolaire
  - définir les niveaux d'étude (1ère année, 2ème année, 3ème année ...)
  - définir les matières (mathématiques, français, néerlandais ...)

### Gestionaire

En tant que gestionaire, je veux:
- mettre en place les années scolaires
  - définir le "nom" de l'année scolaire (2023-2024)
  - définir la période de l'année scolaire (date de début et de fin)
  - définir les périodes d'évaluation (1er trimestre, 2ème trimestre, 3ème trimestre ...)
  - introduire les nouvaux élèves et mettre à jour ceux qui sont déjà dans le système. En lui assignat un niveau d'étude, une classe et dans un ou plusieurs groupes
  - constituer les classes avec des élèves avec un ou plusieurs utilisateurs titulaires
  - constituer les groupes avec 0 ou une matière, un ou plusieurs utilisateurs titulaires et un ensemble d'élèves pouvant ête importer depuis une classe ou selection par mis les élèves d'un niveau d'étude
- faire le suivis des rapports disciplinaires par élève
  - changer le statut d'un rapport disciplinaire
  - émettre un commentaire sur un rapport disciplinaire
  - notifier un utilisateur concerne par un rapport disciplinaire ou un contact de l'élève
- avoir un aperçu des de chaque élève l'un à la suite de l'autre pour le conseil de classe
- générer un bulletin par élève pour une période d'évaluation en pdf
- introduire un commentaire pour chaque élève lors du conseil de classe
- gerer les présences
  - introduire ou corriger des pointages
  - introduire ou modifier des justifications d'absence
  - suvis des absences non justifiées par élève sur une année scolaire
    - notifier un contact l'ors d'une absence non justifiée
    - génerer un rapport disciplinaire pour une série d'absences non justifiées
  - avoir un rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation

### Enseignant•e

En tant qu'enseignant•e, je veux:
- faire les pointages de mes élèves le plus rapidement possible tout en voyant correctement la photo de l'élève. Je retrouve mes élèves par un groupe
- créer un rapport disciplinaire pour un élève
- gerer les périodes d'évaluation
  - introduire un commentaire chaque période de cote
  - crée une évaluation pour une matière, pour une période d'évaluation et la quote maximale
  - introduire les notes de mes élèves

### Elève

Les élèves n'ont pas accès au système dans un premier temps.


## Fonctionnalités

### Gestion des utilisateurs
- Inscription des utilisateurs
- Connexion des utilisateurs
- Gestion des rôles (enseignant, administrateur, gestionnaire)
- Gestion des permissions
- Archivage des utilisateurs
- Réinitialisation du mot de passe
- Création, modification et archivage des utilisateurs

### Gestion des années scolaires
- Définition des périodes d'évaluation
- Gestion des classes et des groupes
- Introduction de nouveaux élèves
- Mise en place des années scolaires
  - Définir le "nom" de l'année scolaire (ex: 2023-2024)
  - Définir la période de l'année scolaire (date de début et de fin)
  - Définir les périodes d'évaluation (1er trimestre, 2ème trimestre, 3ème trimestre, etc.)
  - Introduire les nouveaux élèves et mettre à jour ceux qui sont déjà dans le système
  - Assigner un niveau d'étude, une classe et un ou plusieurs groupes aux élèves
  - Constituer les classes avec des élèves et un ou plusieurs utilisateurs titulaires
  - Constituer les groupes avec 0 ou une matière, un ou plusieurs utilisateurs titulaires et un ensemble d'élèves

### Gestion des élèves
- Gestion des informations personnelles des élèves

### Gestion des périodes de cours
- Définir les périodes de cours (ex: 8h25 - 9h15, 9h15 - 10h05, etc.)
- Définir les unités de comptabilisation des absences (matins, après-midi, etc.)

### Gestion des présences
- Pointage: présence, retard, absence
- Création de justification pour les périodes d'absences
- Synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation
- Possibilité de notification en cas d'absence (Email, SMS)
- Pointage par groupe et par classe
- Introduction ou correction des pointages
- Introduction ou modification des justifications d'absence
- Suivi des absences non justifiées par élève sur une année scolaire
  - Notification d'un contact en cas d'absence non justifiée
  - Génération d'un rapport disciplinaire pour une série d'absences non justifiées
- Rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation

### Gestion des rapports disciplinaires
- Création de rapports disciplinaires
- Suivi des rapports disciplinaires (ouvert, fermé, traité)
- Notification par email
- Changement du statut d'un rapport disciplinaire
- Émission de commentaires sur un rapport disciplinaire
- Notification d'un utilisateur concerné par un rapport disciplinaire ou un contact de l'élève

### Gestion des périodes d'évaluation
- Introduction de notes d'évaluation pour une matière par l'enseignant
- Introduction de commentaires sur la période d'évaluation par matière par l'enseignant
- Gestion du conseil de classe
  - Récapitulatif par élève avec ses notes par matière, son nombre d'absences justifiées/injustifiées, de retards et de rapports disciplinaires
  - Synthèse des notes par classe par période
  - Introduction de commentaires du conseil privé ou public
- Génération de bulletins par élève par classe pour une période d'évaluation
- Création d'évaluations pour une matière, pour une période d'évaluation et la cote maximale

### Gestion des bulletins
- Génération des bulletins (PDF)
- Possibilité d'ajouter un commentaire par cours
- Introduction de commentaires pour chaque élève lors du conseil de classe

### Dashboard pour les conseils de classe
- Aperçu des élèves l'un à la suite de l'autre pour le conseil de classe

### Paramétrage de l'application
- Définir le nom de l'établissement scolaire
- Définir les niveaux d'étude (1ère année, 2ème année, 3ème année, etc.)
- Définir les matières (mathématiques, français, néerlandais, etc.)

## Lexique/concepts

- utilisateur: un configurateur système, un enseignant, un éducateru, un agant administratif mais pas un élève
- niveau d'étude: 1ère année, 2ème année, 3ème année ...
- classe: unité de gestion adminstratif des élèves à visé de bulletin et consiel de classe. Possède un ou plusieurs titulaire et 0 ou plusieur éducateur.(1ère année A, 1ère année B, 2ème année A, 2ème année B, 3ème année A, 3ème année B)
- groupe: unité de gestion adminstratif des élèves à visé du pointage (étude lundi premiere heure, science de base 1, science de base 2, science économique, latin, langue moderne anglais 1 groupe 1)
- période de cours: 8h25 - 9h15, 9h15 - 10h05, 10h05 - 10h55, 10h55 - 11h45, 11h45 - 12h35, 12h35 - 13h25, 13h25 - 14h15, 14h15 - 15h05, 15h05 - 15h55
- matière: mathématiques, français, néerlandais, anglais, histoire, géographie, éducation physique, éducation musicale
- unités de comptabilisation des absences: plusieur ensemble de périodes de cours. (ex: matin, après-midi, journée)
- période d'évaluation: une période de temps regroupent les évaluation pour un ensemble de niveau d'étude
- justificatif d'absence: document justifiant l'absence d'un élève sur une période de temps
- pointage: fait de prendre constater la présence, le retard ou l'absence d'un élève sur une période de cours dans un groupe ou une classe
- évaluation: évenment pour un matière, pour une période d'évaluation et la quote maximale
- note: la valeur pour un élève pour une évaluation, peut etre null sous entendus non évalué
- rapport disciplinaire: un évenment rapporter par utilisateur (enseigant, éducateur ...) pour un élève une date voir période de cours
