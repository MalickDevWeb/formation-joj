# 001 — Créer une épreuve et faire avancer son statut : plan

**Statut** : Validé

## 1. Résumé

On construit le module d'API `sport-events`, qui permet de créer une épreuve et de faire avancer son statut. À la fin, le responsable résultats crée une épreuve, qui naît « à venir », la passe « en cours » puis « terminée », et l'API refuse d'avancer une épreuve déjà terminée. Le travail tient en cinq tâches, dans l'ordre des couches : schémas partagés, domaine, cas d'usage, persistance, puis routes HTTP avec leur test e2e. L'écran, la liste des épreuves et le rattachement à une discipline existante sont laissés de côté.

Les mots de la spec et leur nom dans le code :

| Dans la spec                       | Dans le code                                | Ce que c'est                                                      |
| ---------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| épreuve                            | `SportEvent`                                | L'entité du domaine ; `Event` est évité car déjà pris par le DOM. |
| statut à venir, en cours, terminée | `'upcoming'`, `'in-progress'`, `'finished'` | Les trois valeurs de `SportEventStatus`, dans cet ordre.          |
| site                               | `'dakar'`, `'diamniadio'`, `'saly'`         | Les trois valeurs de `SportEventSite`, liste fermée.              |
| date et heure                      | `startsAt`                                  | L'instant de début de l'épreuve, en ISO 8601.                     |
| discipline                         | `discipline`                                | Le nom de la discipline, saisi en texte libre.                    |
| faire avancer                      | `advance()`                                 | Passe au statut suivant, ou refuse si l'épreuve est terminée.     |

## 2. Fichiers par couche

On crée le module `sport-events`, organisé comme le module de référence `disciplines` de la branche `main` : un dossier par couche, sans importer d'autre module de domaine.

- **shared** : `packages/shared/src/sport-events.ts` contient les schémas Zod de création (`createSportEventSchema`), du paramètre `:id` et de la réponse (`sportEventSchema`), ainsi que les listes `SPORT_EVENT_SITES` et `SPORT_EVENT_STATUSES`. Il est exporté depuis `packages/shared/src/index.ts`.
- **domain** : `apps/api/src/modules/sport-events/domain/sport-event.ts` contient l'entité `SportEvent`, avec `create()` qui fixe le statut à `upcoming`, `restore()` et la méthode métier `advance()`. `domain/sport-events.errors.ts` déclare `SportEventError` et ses codes.
- **application** : `application/sport-event.repository.ts` est le port `SportEventRepository` (`findById`, `insert`, `update`). `application/use-cases/create-sport-event.ts` crée l'épreuve ; `application/use-cases/advance-sport-event.ts` la relit, appelle `advance()` et l'enregistre. `application/testing/in-memory-sport-event.repository.ts` sert aux tests.
- **infra** : `infra/sport-events.schema.ts` décrit la table Drizzle ; `infra/sport-event.mapper.ts` traduit entre ligne et entité ; `infra/drizzle-sport-event.repository.ts` implémente le port.
- **http** : `http/sport-events.controller.ts` expose deux routes. `POST /api/sport-events` crée une épreuve et renvoie 201 avec l'épreuve au statut `upcoming`. `POST /api/sport-events/:id/advance` fait avancer le statut et renvoie 200 avec l'épreuve mise à jour. `sport-events.module.ts` relie le port à l'adaptateur Drizzle ; il est importé dans `apps/api/src/app.module.ts`.
- **web** : rien, l'écran est hors périmètre.

## 3. Données

On stocke chaque épreuve dans une seule table, `sport_events`. Migration : `pnpm db:generate --name=create-sport-events`.

- `id` : uuid, clé primaire.
- `name` : varchar(100), non nul.
- `discipline` : varchar(100), non nul ; texte libre, sans clé étrangère, tant qu'il n'y a pas de disciplines.
- `site` : varchar(20), non nul ; la liste fermée est vérifiée par le domaine.
- `starts_at` : timestamp avec fuseau, précision 3, non nul.
- `status` : varchar(20), non nul ; l'ordre des statuts est vérifié par le domaine.
- `created_at` : timestamp avec fuseau, précision 3, non nul.

## 4. Erreurs

Chaque refus de la spec devient une erreur métier (`AppError`), avec un code stable et un statut HTTP.

| Code AppError                  | Catégorie  | HTTP | Quand                                              | Scénario |
| ------------------------------ | ---------- | ---- | -------------------------------------------------- | -------- |
| `SPORT_EVENT_ALREADY_FINISHED` | CONFLICT   | 409  | On fait avancer une épreuve déjà terminée.         | AS4      |
| `SPORT_EVENT_NOT_FOUND`        | NOT_FOUND  | 404  | On fait avancer une épreuve qui n'existe pas.      | —        |
| `SPORT_EVENT_SITE_UNKNOWN`     | VALIDATION | 400  | Le domaine reçoit un site hors de la liste fermée. | —        |

## 5. Tests par scénario

Chaque scénario de la spec est prouvé par au moins un test, au niveau le plus bas qui suffit, et l'e2e prouve les réponses HTTP.

| Scénario | Fichier de test                                                | Niveau   | Ce que le test vérifie                                                         |
| -------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| AS1      | `apps/api/test/sport-events.e2e.spec.ts`                       | e2e      | La création renvoie 201 avec les informations saisies et le statut `upcoming`. |
| AS2      | `apps/api/src/modules/sport-events/domain/sport-event.spec.ts` | unitaire | `advance()` fait passer une épreuve `upcoming` à `in-progress`.                |
| AS3      | `apps/api/src/modules/sport-events/domain/sport-event.spec.ts` | unitaire | `advance()` fait passer une épreuve `in-progress` à `finished`.                |
| AS4      | `apps/api/test/sport-events.e2e.spec.ts`                       | e2e      | Avancer une épreuve terminée renvoie 409 `SPORT_EVENT_ALREADY_FINISHED`.       |

## 6. Tâches

Cinq tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [x] T01 [001-AS1] Écrire d'abord `packages/shared/src/sport-events.spec.ts` (« 001-AS1: accepts a valid sport event and rejects an unknown site »), puis `packages/shared/src/sport-events.ts` et son export
- [x] T02 [001-AS1, AS2, AS3, AS4] Écrire d'abord `domain/sport-event.spec.ts` (« 001-AS2: advances an upcoming event to in progress », etc.), puis `domain/sport-event.ts` et `domain/sport-events.errors.ts`
- [x] T03 [001-AS1, AS4] Écrire d'abord `application/sport-events.application.spec.ts` (« 001-AS4: refuses to advance a finished event »), puis le port, le dépôt en mémoire, `CreateSportEvent` et `AdvanceSportEvent`
- [x] T04 [001-AS1, AS3] Écrire d'abord `infra/drizzle-sport-event.repository.int.spec.ts` (« 001-AS3: persists the advanced status »), puis le schéma Drizzle, la migration, le mapper et le dépôt Drizzle
- [ ] T05 [001-AS1, AS2, AS3, AS4] Écrire d'abord `apps/api/test/sport-events.e2e.spec.ts` (« 001-AS1: creates an upcoming sport event », « 001-AS4: answers 409 when advancing a finished event »), puis le controller, le module et son import dans `app.module.ts`
