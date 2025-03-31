# Scholarsuite app specification

Scholarsuite est une application de gestion de vie scolaire et de gestion de la scolarité. Elle est destinée aux enseignants et aux administrateurs d'établissements scolaires.

## Objectif

L'objectif de cette application est de permettre aux enseignants et aux administrateurs d'établissements scolaires de gérer la vie scolaire et la scolarité des élèves. L'application doit permettre de gérer les notes, les absences, les bulletins scolaires, les relevés de notes, etc.

## Profils utilisateur

- **Gestionaire**: Iels sont responsable de la gestion des utilisateurs, des travaux, des classes, des groupes, des années scolaires, des périodes de cotes, des tranches horaires.
- **Direction**: Iels peuvent gérer les utilisateurs, les élèves, les classes, les groupes, les années scolaires, les périodes de cotes, les tranches horaires. Iels sont également responsables de la gestion des rapports disciplinaires et de la gestion des justifications d'absence.
- **Administration**: Iels peuvent gérer les utilisateurs, les élèves, les classes, les groupes, les années scolaires, les périodes de cotes, les tranches horaires.
- **Educateur•es**: Iels peuvent prendre le pointage des élèves. Iels peuvent également crée un rapport disciplinaire pour un élève. Mais aussi iels peuvent introduire les justificatifs d'absence.
- **Enseignants**: Iels sont responsables de prendre le pointage des élèves, et d'introduire les notes des élèves. Iels peuvent également crée un rapport disciplinaire pour un élève.

## "User stories"

### Gestionnaire

1. En tant que gestionnaire, je veux pouvoir inscrire de nouveaux utilisateurs afin qu'ils puissent accéder à l'application.

2. **En tant que gestionnaire, je veux pouvoir attribuer des rôles et des permissions aux utilisateurs pour qu'ils aient les accès nécessaires à leurs tâches.

### Direction

3. En tant que membre de la direction, je veux pouvoir consulter et gérer les rapports disciplinaires afin de suivre les comportements des élèves.

4. En tant que membre de la direction, je veux pouvoir justifier les absences des élèves pour assurer un suivi précis des présences.

### Administration

5. En tant qu'administrateur, je veux pouvoir inscrire de nouveaux élèves afin de les intégrer dans le système.

6. En tant qu'administrateur, je veux pouvoir gérer les informations personnelles des élèves pour les tenir à jour.

### Éducateur

7. En tant qu'éducateur, je veux pouvoir prendre le pointage des élèves pour suivre leur présence en classe.

8. En tant qu'éducateur, je veux pouvoir créer un rapport disciplinaire pour signaler un comportement inapproprié.

### Enseignant

9. En tant qu'enseignant, je veux pouvoir introduire les notes des élèves pour évaluer leur performance.

10. *En tant qu'enseignant, je veux pouvoir générer des bulletins scolaires pour communiquer les résultats aux élèves et à leurs parents.

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
