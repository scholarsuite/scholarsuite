# ScholarSuite app specification

ScholarSuite est une application de gestion de vie scolaire. Elle est destinée aux enseignants et aux gestionnaires d'établissements scolaires.

## Objectifs

- Gestion des présences
- Gestion des rapports disciplinaires
- Gestion des périodes d'évaluation

Ne sont pas pris comme nécessaires pour une version viable:

- Gestion des sanctions disciplinaires
- Gestion des locaux
- Gestion des horaires
  - Gestion des horaires enseignant
  - Gestion des horaires élèves
  - Gestion des licenciements d'élèves
  - Gestion des absences enseignants
  - Gestion des remplacements
- Gestion du matériel
- Gestion du "journal de classe"
- Consultation des notes par les élèves et du bulletin électronique
- Communication avec les parents

## Les grands rôles

- **Administrateur système**: Correspond au responsable informatique et de la configuration du système
  - Paramétrage de l'application : périodes de cours, unité de comptabilisation des absences...
  - Gestion des utilisateurs et des rôles
- **Gestionnaire**: Correspond à la direction, au personnel administratif...
  - Mise en place des années scolaires
  - Introduction de justificatifs d'absence
  - Suivis des rapports disciplinaires
  - Gestion des conseils de classe
- **Éducateur•trice**: Correspond à un éducateur, un surveillant...
  - Pointage des élèves par groupe sur une période d'étude
  - Introduction de justificatifs d'absence
  - Gestion des conseils de classe
- **Enseignants**:
  - Pointage des élèves par groupe sur une période de cours
  - Introduction des notes pour une matière, pour tous les élèves du groupe durant une période d'évaluation
  - Création de rapports disciplinaires pour un élève
  - Introduction de commentaires à destination du bulletin sur la période d'évaluation par matière et par élève
- **Élèves**: n'ont pas accès au système dans un premier temps

## "User stories"

### Administrateur système

En tant qu'administrateur système, je veux:
- créer, modifier et archiver les utilisateurs
- réinitialiser le mot de passe d'un utilisateur s'il n'y a pas SSO en place
- gérer les rôles et permissions des utilisateurs. Par exemple répartir les permissions entre les rôles éducateur, enseignant et gestionnaire
- mettre en place les paramètres initiaux de l'application qui définissent l'organisation de l'établissement scolaire
  - définir le nom de l'établissement scolaire
  - définir les niveaux d'étude (1ère année, 2ème année, 3ème année ...)
  - définir les périodes de cours (8h25 - 9h15, 9h15 - 10h05, ...)
  - définir les unités de comptabilisation des absences (matins, après-midi ...)
  - définir les matières (mathématiques 6h, français, néerlandais LM1, anglais LM2 ...)

### Gestionnaire

En tant que gestionnaire, je veux:
- mettre en place les années scolaires
  - définir l'année scolaire et archiver l'ancienne
  - définir les périodes d'évaluation (1er trimestre, 2ème trimestre, 3ème trimestre ...) pour les niveaux d'étude
  - introduire les nouveaux élèves et mettre à jour ceux qui sont déjà dans le système. En leur assignant un niveau d'étude, une classe et un ou plusieurs groupes
  - constituer les classes avec des élèves avec un ou plusieurs utilisateurs titulaires
  - constituer les groupes avec 0 ou une matière, un ou plusieurs utilisateurs (enseignant ou éducateur) et un ensemble d'élèves, pouvant être importé depuis une classe ou sélection parmi les élèves d'un niveau d'étude
- faire le suivis des rapports disciplinaires par élève
  - changer le statut d'un rapport disciplinaire
  - émettre un commentaire sur un rapport disciplinaire
  - notifier un utilisateur concerné par un rapport disciplinaire ou un contact de l'élève
- avoir un aperçu des notes, absences, commentaires des enseignants de chaque élève l'un à la suite de l'autre pour le conseil de classe
- générer un bulletin par élève pour une période d'évaluation en pdf
- introduire un commentaire pour chaque élève lors du conseil de classe
- gérer les présences
  - introduire ou corriger des pointages, tout gardant une trace des modifications
  - introduire ou modifier des justifications d'absence
  - faire suivi des absences non justifiées par élève sur une année scolaire
    - notifier les contacts de l'élève lors d'une absence non justifiée
    - générer un rapport disciplinaire pour une série d'absences non justifiées
  - avoir un rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation
  - consulter les informations liées à un élève : sa classe, ses groupes, ses notes par matière, ses absences justifiées/injustifiées, ses retards et ses rapports disciplinaires...

### Éducateur•trice

En tant qu'éducateur•trice, je veux:
- émettre un commentaire sur un rapport disciplinaire
- gérer les présences
  - introduire ou corriger des pointages à l'étude
  - introduire ou modifier des justifications d'absence
  - faire suivi des absences non justifiées par élève sur une année scolaire
    - notifier les contacts de l'élève lors d'une absence non justifiée
    - générer un rapport disciplinaire pour une série d'absences non justifiées
  - avoir un rapport de synthèse des absences non justifiées par élève sur une année scolaire, par unité de comptabilisation

### Enseignant•e

En tant qu'enseignant•e, je veux:
- faire les pointages de mes élèves le plus rapidement possible tout en voyant correctement la photo de l'élève. Je retrouve mes élèves par un groupe lié à ma matière.
- créer un rapport disciplinaire pour un élève
- gérer les périodes d'évaluation
  - introduire un commentaire pour chaque période d'évaluation et chaque élève
  - créer une évaluation pour une matière, pour une période d'évaluation et la note maximale
  - introduire la note de comportement pour un élève pour une période d'évaluation

### Élève

Les élèves n'ont pas accès au système dans un premier temps.

## Fonctionnalités

## Authentification

- Connexion des utilisateurs (credentials si pas de SSO)

### Paramétrage de l'application

- Définir le nom de l'établissement scolaire
- Définir les niveaux d'étude (1ère année, 2ème année, 3ème année, etc.)
- Définir les matières (mathématiques, français, néerlandais, etc.)

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

## Lexique/concepts

- année scolaire: période de temps regroupant les élèves d'un établissement scolaire en classes et groupes. Elle est définie par une date de début et de fin et un libellé (ex: 2023-2024)
- bulletin: synthèse de tous les moyennes arithmétiques des notes plus une note de comportement pour un élève de tous ses groupes pour les périodes d'évaluation passées pour l'année courante
- classe: unité de gestion administrative des élèves par année scolaire, afin de gérer les bulletins et le conseil de classe. Possède un ou plusieurs titulaires et 0 ou plusieurs éducateurs (1ère année A, 1ère année B, 2ème année A, 2ème année B, 3ème année A, 3ème année B...)
- contact: nom, prénom; parent/tuteur; email(s); téléphone fixe/portable; adresse de résidence; demande de courrier séparé
- conseil de classe: événement qui survient à la fin de chaque période d'évaluation afin d'offrir la possibilité au corps professoral de
- élève: individu inscrit dans l'établissement scolaire, identifié par son nom, prénom, genre, pronoms, photo, date de naissance, adresse de résidence, liste de contacts, autorisaiton de licensiment, et associé à des années scolaires avec une note spécifique pour chacune.
- étude/permanence: période de cours durant laquelle les élèves ne sont pas avec un enseignant, gestion supervisée par un éducateur
- évaluation: événement pour une matière, pour une période d'évaluation et la note maximale
- groupe: unité de gestion administrative des élèves par année scolaire à visée du pointage (étude lundi première heure, science de base 1, science de base 2, science économique, latin, langue moderne anglais 1 groupe 1)
- justificatif d'absence: document justifiant l'absence d'un élève sur une période de temps
- matière: un référentiel pour tous niveau scolaire confondus.
  - libellé: nom utilisé dans la navigation et dans le bulletin
  - catégorie de matière: une liste par exemple cours généraux et à options ou autre + leur ordre
  - poids: le poids de la matière qui détermine l'ordre de priorité dans le bulletin
  - système de notation
    - Numérique avec un minimum et un maximum et le nombre de décimal 0 ou 1. Eg: (de 0,0 à 10,0) (de 0 à 100) (de 0 à 20)
    - Littéral sous forme de liste ordonnée d'acronyme et libellé. Eg:  (A+ = très bien; A- = XXX;A = XXX; B+ = XXX; B- = XXX; B = XXX) (I = Insuffisant, S= Satisferait, B = Bien, TB = Très Bien)
  - eg: mathématiques, français, néerlandais
- niveau d'étude: 1ère année, 2ème année, 3ème année...
- note: la valeur pour un élève pour une évaluation, peut être null sous-entendu non évalué
- période de cours: liste de libellés définis par une heure de début, ex: 8h25 - 9h15, 9h15 - 10h05
- période d'évaluation: une période de temps regroupant les évaluations pour un ensemble de niveaux d'étude pour une année scolaire (ex: 1er trimestre, 2ème trimestre, 3ème trimestre)
- pointage: fait de constater la présence, le retard ou l'absence d'un élève sur une période de cours dans un groupe ou une classe
- rapport disciplinaire: un événement rapporté par un utilisateur (enseignant, éducateur...) pour un élève, une date voire une période de cours
- unités de comptabilisation des absences: plusieurs ensembles de périodes de cours (ex: matin, après-midi, journée)
- utilisateur: un configurateur système, un enseignant, un éducateur, un agent administratif mais pas un élève
