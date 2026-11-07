# PRD — Résultats des épreuves

**Statut** : Validé

## Problème

Les JOJ Dakar 2026 se déroulent du 31 octobre au 13 novembre à Dakar, Diamniadio et Saly. Le public ne sait pas quelles épreuves sont à venir, en cours ou terminées, ni qui a gagné. Les journalistes recoupent les classements à la main, et une erreur publiée se corrige mal : l'ancienne valeur est écrasée sans trace.

## Utilisateurs

- Responsable résultats d'un site : créer les épreuves, faire avancer leur statut, publier leur classement.
- Public et journalistes : savoir où en est une épreuve et qui l'a gagnée, depuis une source sûre.

## Proposition

Une source unique des résultats. Une épreuve appartient à une discipline, a un nom, un site, une date et une heure, et un statut à venir, en cours ou terminée qui n'avance que dans cet ordre. Son classement ne se publie qu'une fois terminée, et ne peut pas être incohérent : les médailles en découlent seules, sans recopie à la main d'une source à l'autre.

## Mesure du succès

Pendant la démo, on crée une épreuve à venir et on la passe en cours ; la publication de son classement est refusée. On la termine, on publie un classement de cinq athlètes, et sa fiche affiche le podium avec les médailles et le classement complet avec les pays.

## Tranches

### TR1 — Créer une épreuve et faire avancer son statut

Le responsable crée une épreuve (discipline, nom, site, date et heure), puis la fait passer en cours, puis terminée. Règles : une épreuve naît à venir ; son statut n'avance que dans l'ordre à venir, en cours, terminée, jamais en arrière ni en sautant une étape.

### TR2 — Publier le classement d'une épreuve terminée

Le responsable publie le classement complet : rang, athlète, pays, performance. Règles : seulement si l'épreuve est terminée ; rangs à partir de 1, sans trou ni doublon, chaque athlète une seule fois ; or, argent et bronze aux rangs 1, 2 et 3.

### TR3 — Consulter les épreuves, avec un écran public

Liste des épreuves filtrée par jour, site et statut ; fiche d'une épreuve avec son statut, son site, son horaire et, si elle est terminée, son podium et son classement.

### TR4 — Tableau des médailles par pays

Calculé à partir des classements publiés.

### TR5 — Rectifier un classement avec historique

Une rectification exige un motif ; l'ancienne version reste consultable.

## Hors périmètre

- Les ex æquo, le direct point par point, les qualifications et tableaux à élimination, les épreuves par équipes, les comptes des responsables, la suppression d'une épreuve, les notifications.

## Hypothèses et risques

- Supposé : les disciplines existent déjà. La base de l'atelier n'en contient aucune ; sans elles, TR1 ne peut rattacher l'épreuve à rien. Supposé aussi : le site est l'un des trois (Dakar, Diamniadio, Saly) et la date tombe entre le 31 octobre et le 13 novembre. Sinon, n'importe quel lieu ou jour est accepté. La performance est un texte libre (« 10,52 s », « 6,80 m ») ; on ne vérifie pas qu'elle suit l'ordre des rangs. Risque : sans comptes, n'importe qui peut faire avancer un statut ou publier un classement ; et avant TR5, un classement faux ne se corrige pas.
