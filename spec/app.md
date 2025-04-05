# ScholarSuite app specification

ScholarSuite est une application de gestion de vie scolaire. Elle est destinée aux enseignants et aux administrateurs d'établissements scolaires.

## Objectifs

- Gestion des présences
- Gestion des rapports diciplinaires
- Gestion des périodes d'évaluation

Ne sont pas pris comme nécéssaires pour une version viable:

- Gestion des sanction disciplinaire
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
- **Gestionaire**: Corespond à la direction, au personnel administratif...
  - Mise en place des années scolaires
  - Suivis des rapports diciplinaires
  - Introduction de justificatifs d'absence
  - Gestion des conseils de classe
- **Educateur**: Corespond à un éducateur, un surveillant...
  - Pointage des élèves par groupe ou classe sur une période de cours
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
- gérer les rôles et permissions des utilisateurs. Par example répartir les permission entre les rôles educateur, enseignant et gestionaire
- mettre en place les paramètres initiaux de l'application qui définissent l'organisation de l'établissement scolaire
  - définir les périodes de cours (8h25 - 9h15, 9h15 - 10h05, ...)
  - définir les unités de comptabilisation des absences (matins, après-midi ...)
  - définir le nom de l'établissement scolaire
  - définir les niveaux d'étude (1ère année, 2ème année, 3ème année ...)
  - définir les matières (mathématiques, français, néerlandais ...)

### Gestionaire

En tant que gestionaire, je veux:
- mettre en place les années scolaires
  - définir l'année scolaireet archiver l'ancienne
  - définir les périodes d'évaluation (1er trimestre, 2ème trimestre, 3ème trimestre ...) pour les niveaux d'étude
  - introduire les nouvaux élèves et mettre à jour ceux qui sont déjà dans le système. En leur assignant un niveau d'étude, une classe et un ou plusieurs groupes
  - constituer les classes avec des élèves avec un ou plusieurs utilisateurs titulaires
  - constituer les groupes avec 0 ou une matière, un ou plusieurs utilisateurs (enseignant ou éducateur) et un ensemble d'élèves, pouvant ête importer depuis une classe ou selection par mis les élèves d'un niveau d'étude
- faire le suivis des rapports disciplinaires par élève
  - changer le statut d'un rapport disciplinaire
  - émettre un commentaire sur un rapport disciplinaire
  - notifier un utilisateur concerné par un rapport disciplinaire ou un contact de l'élève
- avoir un aperçu des notes, absences, commentaires des enseignants de chaque élève l'un à la suite de l'autre pour le conseil de classe
- générer un bulletin par élève pour une période d'évaluation en pdf
- introduire un commentaire pour chaque élève lors du conseil de classe
- gerer les présences
  - introduire ou corriger des pointages, tout gardant une trace des modifications
  - introduire ou modifier des justifications d'absence
  - faire suvi des absences non justifiées par élève sur une année scolaire
    - notifier les contacts de l'élève lors d'une absence non justifiée
    - génerer un rapport disciplinaire pour une série d'absences non justifiées
  - avoir un rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation
  - consulter les informations liées à un élève : sa classe, ses grouoes, ses notes par matière, ses absences justifiées/injustifiées, ses retards et ses rapports disciplinaires...

### Educateur•trice

En tant qu'éducateur•trice, je veux:
- émettre un commentaire sur un rapport disciplinaire
- gerer les présences
  - introduire ou corriger des pointages à l'étude
  - introduire ou modifier des justifications d'absence
  - faire suvi des absences non justifiées par élève sur une année scolaire
    - notifier les contacts de l'élève lors d'une absence non justifiée
    - génerer un rapport disciplinaire pour une série d'absences non justifiées
  - avoir un rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation

### Enseignant•e

En tant qu'enseignant•e, je veux:
- faire les pointages de mes élèves le plus rapidement possible tout en voyant correctement la photo de l'élève. Je retrouve mes élèves par un groupe lié à ma matière.
- créer un rapport disciplinaire pour un élève
- gérer les périodes d'évaluation
  - introduire un commentaire pour chaque période d'évaluatin et chaque élève
  - crée une évaluation pour une matière, pour une période d'évaluation et la note maximale
  - introduire les notes de mes élèves

### Elève

Les élèves n'ont pas accès au système dans un premier temps.

## Fonctionnalités

## Authentification
- Connexion des utilisateurs (crentiels si pas de SSO)

### Gestion des utilisateurs
- Inscription, modification et archivage des utilisateurs
- Gestion des rôles (enseignant, administrateur, gestionnaire, éducateur...)
- Gestion des permissions
- Archivage des utilisateurs
- Réinitialisation du mot de passe d'un utilisateur (si pas de SSO)

### Gestion des années scolaires
- Créer une nouvelle année scolaire (ex: 2023-2024) et archive l'ancienne
- Définir les périodes d'évaluation (1er trimestre, 2ème trimestre, 3ème trimestre, etc.)
- Gestion des élèves
  - Introduire les nouveaux élèves et mettre à jour ceux qui sont déjà dans le système
  - Gestion des informations personnelles des élèves
  - Assigner pour une année scolaire, un niveau d'étude, une classe et un ou plusieurs groupes aux élèves
  - Gestion des contacts des élèves (parents, tuteur, etc.)
  - Archiver des élèves qui ne sont plus dans l'établissement scolaire à savoir dans une année scolaire en cours
- Constituer les classes avec des élèves et un ou plusieurs utilisateurs titulaires et éducateurs
- Constituer les groupes avec 0 ou une matière, un ou plusieurs enseignants et un ensemble d'élèves

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
- Création d'une évaluation par l'enseignant pour son groupe et pour une période d'évaluation et de sa note maximale
- Introduction de notes d'évaluation pour chaque de l'évaluation (du groupe et de la matière)
- Introduction de commentaires sur la période d'évaluation pour le groupe par l'enseignant pour chaque élève
- Gestion du conseil de classe par un gestionnaire
  - Récapitulatif par élève avec ses notes par matière et par période d'évaluation, son nombre d'absences justifiées/injustifiées, de retards et de rapports disciplinaires
  - Synthèse des notes par classe par période
  - Introduction de commentaires du conseil privé et ou public
- Génération de bulletins par élève et ou par classe pour une période d'évaluation au format PDF

### Paramétrage de l'application
- Définir le nom de l'établissement scolaire
- Définir les niveaux d'étude (1ère année, 2ème année, 3ème année, etc.)
- Définir les matières (mathématiques, français, néerlandais, etc.)

## Lexique/concepts

- année scolaire: période de temps regroupant les élèves d'un établissement scolaire en classes et groupes. Elle est définie par une date de début et de fin et un libéllé (ex: 2023-2024)
- utilisateur: un configurateur système, un enseignant, un éducateru, un agant administratif mais pas un élève
- niveau d'étude: 1ère année, 2ème année, 3ème année ...
- classe: unité de gestion adminstrative des élèves par année scolaire, afin de gérer les bulletins et le conseil de classe. Possède un ou plusieurs titulaires et 0 ou plusieurs éducateurs (1ère année A, 1ère année B, 2ème année A, 2ème année B, 3ème année A, 3ème année B...).
- groupe: unité de gestion adminstrative des élèves par année scolaire à visé du pointage (étude lundi premiere heure, science de base 1, science de base 2, science économique, latin, langue moderne anglais 1 groupe 1)
- période de cours: liste de libellé définis par une heure de début eg: 8h25 - 9h15, 9h15 - 10h05
- matière: mathématiques, français, néerlandais, anglais, histoire, géographie, éducation physique, éducation musicale
- unités de comptabilisation des absences: plusieur ensemble de périodes de cours. (ex: matin, après-midi, journée)
- période d'évaluation: une période de temps regroupent les évaluation pour un ensemble de niveaux d'étude pour une année scolaire (ex: 1er trimestre, 2ème trimestre, 3ème trimestre)
- évaluation: évenment pour un matière, pour une période d'évaluation et la note maximale
- pointage: fait de prendre constater la présence, le retard ou l'absence d'un élève sur une période de cours dans un groupe ou une classe
- justificatif d'absence: document justifiant l'absence d'un élève sur une période de temps
- note: la valeur pour un élève pour une évaluation, peut etre null sous entendus non évalué
- rapport disciplinaire: un évenment rapporter par utilisateur (enseigant, éducateur ...) pour un élève une date voir période de cours
- étude/permance: période de cours durant le quel les élève ne sont pas avec un enseignant gestion suppervier par un éducatuer
- conseil de classe
- bulletin
- elève :nom prénom; liste de contacts; genre; pronoms; photo; date de naissance; adresse de résidence; liste d'apartenace à des années scolaire + une note pour celle-ci
- contact: nom prénom; parent/tuteur; email(s); téléphone fixe/portable; adresse de résidence; demande de courier séparer

standards techniques
- tout objet a un id une date e creation et une date de modification
