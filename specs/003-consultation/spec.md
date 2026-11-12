# 003 — Consulter les épreuves, avec un écran public

**Statut** : Implémentée
**PRD** : specs/prd-resultats.md, TR3

## Contexte

Le public ne sait pas quelles épreuves sont à venir, en cours ou terminées, ni qui a gagné, et les journalistes recoupent les résultats d'une source à l'autre. Les épreuves et leurs classements existent désormais : il faut une liste filtrable et une fiche par épreuve, sur un écran ouvert à tous.

## User stories

- En tant que spectateur, je veux voir les épreuves d'un jour, filtrées par site et par statut, afin de savoir ce qui se passe et où.
- En tant que journaliste, je veux ouvrir la fiche d'une épreuve terminée et y lire le podium et le classement complet, afin de citer un résultat sûr.

## Scénarios d'acceptation

### AS1 — Lister les épreuves d'un jour

- **Étant donné** deux épreuves le 8 novembre (10 h 40 et 9 h 00) et une le 9 novembre
- **Quand** on consulte les épreuves du 8 novembre
- **Alors** on voit les deux épreuves du 8 novembre, celle de 9 h 00 en premier, avec leur nom, leur discipline, leur site, leur heure et leur statut

### AS2 — Filtrer par site

- **Étant donné** une épreuve à Saly et une à Dakar le même jour
- **Quand** on consulte les épreuves de ce jour à Saly
- **Alors** on ne voit que l'épreuve de Saly

### AS3 — Filtrer par statut

- **Étant donné** une épreuve terminée et une à venir le même jour
- **Quand** on consulte les épreuves terminées de ce jour
- **Alors** on ne voit que l'épreuve terminée

### AS4 — Lire la fiche d'une épreuve terminée

- **Étant donné** une épreuve terminée dont le classement de cinq athlètes est publié
- **Quand** on ouvre sa fiche
- **Alors** on voit son statut, son site et son horaire, son podium avec l'or, l'argent et le bronze, et le classement complet avec le pays et la performance de chaque athlète

### AS5 — Lire la fiche d'une épreuve sans classement

- **Étant donné** une épreuve à venir
- **Quand** on ouvre sa fiche
- **Alors** on voit son statut, son site et son horaire, et un message qui dit que le classement n'est pas encore publié

### AS6 — Ouvrir une épreuve qui n'existe pas

- **Étant donné** aucune épreuve avec cet identifiant
- **Quand** on ouvre sa fiche
- **Alors** c'est refusé, avec un message qui dit que l'épreuve est introuvable

## Hors périmètre

- Créer une épreuve, faire avancer son statut ou publier un classement depuis l'écran : ces gestes restent dans l'API.
- Le tableau des médailles (TR4), la rectification (TR5), le direct.

## Questions ouvertes

- Hypothèse : le jour d'une épreuve est la date de son début à l'heure de Dakar (GMT, sans heure d'été).
- Hypothèse : sans jour choisi, l'écran montre le jour courant ; le site et le statut sont facultatifs.
- Hypothèse : l'écran est public, sans compte, et se lit aussi bien sur téléphone que sur ordinateur.
