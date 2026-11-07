# 002 — Publier le classement d'une épreuve terminée : plan

**Statut** : Validé

## 1. Résumé

On ajoute au module `sport-events` la publication du classement complet d'une épreuve terminée. À la fin, le responsable résultats publie un classement, l'API renvoie l'épreuve avec ses lignes triées par rang et la médaille des trois premiers, et refuse un classement incohérent, une épreuve non terminée ou une seconde publication. Le travail tient en cinq tâches, dans l'ordre des couches : schémas partagés, domaine, cas d'usage, persistance, puis route HTTP avec son test e2e. La consultation, l'écran et la rectification sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec          | Dans le code                  | Ce que c'est                                                           |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| classement            | `ranking`                     | La liste des lignes d'une épreuve, `null` tant qu'il n'est pas publié. |
| ligne du classement   | `RankingLine`                 | Un rang, un athlète, son pays et sa performance.                       |
| pays                  | `country`                     | Un code de trois lettres majuscules, par exemple `SEN`.                |
| médaille              | `medal`                       | `'gold'`, `'silver'`, `'bronze'` pour les rangs 1 à 3, sinon `null`.   |
| publier un classement | `SportEvent.publishRanking()` | La méthode métier qui applique les règles de la tranche.               |

## 2. Fichiers par couche

On étend le module `sport-events`, créé par la spec 001, qui sert de modèle : le classement fait partie de l'épreuve, car ses règles dépendent du statut de celle-ci.

- **shared** : `packages/shared/src/sport-events.ts` gagne `publishRankingSchema` (corps de la requête : une liste non vide de lignes au bon format), `rankingLineSchema` et le champ `ranking` de `sportEventSchema`, avec la médaille de chaque ligne.
- **domain** : `domain/sport-event.ts` gagne la propriété `ranking`, la méthode `publishRanking()` et la fonction `medalOf(rank)` ; `domain/sport-events.errors.ts` gagne les quatre codes de la section 4.
- **application** : `application/sport-event.repository.ts` gagne `saveRanking()` ; `application/use-cases/publish-ranking.ts` relit l'épreuve, appelle `publishRanking()` et enregistre le classement. Le dépôt en mémoire implémente `saveRanking()`.
- **infra** : `infra/sport-events.schema.ts` gagne la table `ranking_lines` ; le mapper et `drizzle-sport-event.repository.ts` lisent et écrivent les lignes.
- **http** : `http/sport-events.controller.ts` gagne `POST /api/sport-events/:id/ranking`, qui publie le classement et renvoie 201 avec l'épreuve et son classement ; les autres routes renvoient aussi `ranking`.
- **web** : rien, l'écran est hors périmètre.

## 3. Données

On stocke chaque ligne du classement dans la table `ranking_lines`. Migration : `pnpm db:generate --name=create-ranking-lines`.

- `sport_event_id` : uuid, non nul, clé étrangère vers `sport_events.id`.
- `rank` : entier, non nul.
- `athlete` : varchar(100), non nul.
- `country` : varchar(3), non nul.
- `performance` : varchar(50), non nul.
- Clé primaire `(sport_event_id, rank)` : un rang n'existe qu'une fois par épreuve, ce qui empêche aussi deux publications simultanées de réussir toutes les deux.
- Index unique `ranking_lines_athlete_key` sur `(sport_event_id, athlete, country)` : un athlète n'apparaît qu'une fois.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP.

| Code AppError                           | Catégorie     | HTTP | Quand                                                | Scénario |
| --------------------------------------- | ------------- | ---- | ---------------------------------------------------- | -------- |
| `SPORT_EVENT_NOT_FINISHED`              | BUSINESS_RULE | 422  | On publie le classement d'une épreuve non terminée.  | AS2      |
| `SPORT_EVENT_RANKS_NOT_CONSECUTIVE`     | BUSINESS_RULE | 422  | Les rangs ne vont pas de 1 à n sans trou ni doublon. | AS3      |
| `SPORT_EVENT_DUPLICATE_ATHLETE`         | BUSINESS_RULE | 422  | Le même athlète du même pays est sur deux lignes.    | AS4      |
| `SPORT_EVENT_RANKING_ALREADY_PUBLISHED` | CONFLICT      | 409  | L'épreuve a déjà un classement.                      | AS5      |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit, et l'e2e prouve les réponses HTTP.

| Scénario | Fichier de test                                                | Niveau   | Ce que le test vérifie                                                 |
| -------- | -------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| AS1      | `apps/api/test/ranking.e2e.spec.ts`                            | e2e      | 201, cinq lignes triées, or, argent, bronze puis aucune médaille.      |
| AS2      | `apps/api/src/modules/sport-events/domain/sport-event.spec.ts` | unitaire | `SPORT_EVENT_NOT_FINISHED`, et l'épreuve reste sans classement.        |
| AS3      | `apps/api/src/modules/sport-events/domain/sport-event.spec.ts` | unitaire | `SPORT_EVENT_RANKS_NOT_CONSECUTIVE` pour 2-3, 1-2-4 et 1-2-2.          |
| AS4      | `apps/api/src/modules/sport-events/domain/sport-event.spec.ts` | unitaire | `SPORT_EVENT_DUPLICATE_ATHLETE`, avec l'athlète dans les détails.      |
| AS5      | `apps/api/test/ranking.e2e.spec.ts`                            | e2e      | 409 `SPORT_EVENT_RANKING_ALREADY_PUBLISHED`, premier classement gardé. |

## 6. Tâches

Cinq tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [ ] T01 [002-AS1] Écrire d'abord `packages/shared/src/sport-events.spec.ts` (« 002-AS1: accepts a ranking of lines with rank, athlete, country and performance »), puis `publishRankingSchema`, `rankingLineSchema` et le champ `ranking`
- [ ] T02 [002-AS1, AS2, AS3, AS4, AS5] Écrire d'abord `domain/sport-event.spec.ts` (« 002-AS3: refuses ranks that do not follow from 1 », etc.), puis `publishRanking()`, `medalOf()` et les codes d'erreur
- [ ] T03 [002-AS1, AS5] Écrire d'abord `application/sport-events.application.spec.ts` (« 002-AS1: publishes and stores the ranking of a finished event »), puis `saveRanking()` dans le port et le dépôt en mémoire, et `PublishRanking`
- [ ] T04 [002-AS1, AS5] Écrire d'abord `infra/drizzle-sport-event.repository.int.spec.ts` (« 002-AS1: reads back the ranking it wrote »), puis la table `ranking_lines`, la migration, le mapper et `saveRanking()` en Drizzle
- [ ] T05 [002-AS1, AS2, AS3, AS4, AS5] Écrire d'abord `apps/api/test/ranking.e2e.spec.ts` (« 002-AS1: publishes a ranking of five athletes with medals », « 002-AS5: answers 409 on a second publication »), puis la route du controller
