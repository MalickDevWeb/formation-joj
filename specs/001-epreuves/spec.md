# 001 — Créer une épreuve et faire avancer son statut

**Statut** : Validée
**PRD** : specs/prd-resultats.md, TR1

## Contexte

Pendant les JOJ Dakar 2026, le public et les journalistes ne savent pas si une épreuve est à venir, en cours ou terminée. Le responsable résultats d'un site doit pouvoir déclarer ses épreuves et en tenir le statut à jour, sans qu'un statut puisse revenir en arrière.

## User stories

- En tant que responsable résultats d'un site, je veux créer une épreuve avec sa discipline, son nom, son site, sa date et son heure, afin qu'elle existe dans la source unique des résultats.
- En tant que responsable résultats d'un site, je veux faire avancer le statut d'une épreuve, afin que tout le monde sache si elle est à venir, en cours ou terminée.

## Scénarios d'acceptation

### AS1 — Créer une épreuve à venir

- **Étant donné** aucune épreuve « 100 m garçons — finale »
- **Quand** le responsable crée l'épreuve « 100 m garçons — finale », discipline Athlétisme, site Diamniadio, le 8 novembre 2026 à 10 h 40
- **Alors** l'épreuve est créée avec ces informations et le statut « à venir »

### AS2 — Passer une épreuve à venir en cours

- **Étant donné** une épreuve au statut « à venir »
- **Quand** le responsable fait avancer son statut
- **Alors** l'épreuve est au statut « en cours »

### AS3 — Passer une épreuve en cours à terminée

- **Étant donné** une épreuve au statut « en cours »
- **Quand** le responsable fait avancer son statut
- **Alors** l'épreuve est au statut « terminée »

### AS4 — Refuser d'avancer une épreuve terminée

- **Étant donné** une épreuve au statut « terminée »
- **Quand** le responsable fait avancer son statut
- **Alors** c'est refusé, avec un message de conflit qui dit que l'épreuve est déjà terminée, et l'épreuve reste « terminée »

## Hors périmètre

- Publier un classement (TR2), lister ou filtrer les épreuves et l'écran public (TR3).
- Modifier ou supprimer une épreuve, revenir à un statut précédent.

## Questions ouvertes

- La base de l'atelier ne contient aucune discipline. Hypothèse : la discipline est un nom saisi, non vérifié ; le rattachement à une discipline existante viendra plus tard.
- Hypothèse : le site est l'un des trois (Dakar, Diamniadio, Saly) ; un autre site est refusé comme une saisie invalide.
- Hypothèse : le seul geste est « faire avancer » d'une étape ; sauter une étape ou revenir en arrière n'est donc pas possible, et seul le cas de l'épreuve terminée est refusé.
