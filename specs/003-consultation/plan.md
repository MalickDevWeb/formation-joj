# 003 — Consulter les épreuves, avec un écran public : plan

**Statut** : Validé

## 1. Résumé

On ajoute à l'API deux routes de lecture des épreuves, et au front un écran public : la liste des épreuves d'un jour, filtrable par site et par statut, et la fiche d'une épreuve avec son podium et son classement. À la fin, n'importe qui ouvre `/epreuves`, choisit un jour, un site, un statut, puis clique sur une épreuve pour lire sa fiche. Le travail tient en six tâches : schémas partagés, cas d'usage, persistance, routes HTTP, fausse API du front, puis écrans. Les gestes du responsable restent dans l'API, sans écran.

Les mots de la spec et leur nom dans le code :

| Dans la spec        | Dans le code                 | Ce que c'est                                                         |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- |
| consulter un jour   | `ListSportEvents`            | Le cas d'usage qui renvoie les épreuves d'un jour, triées par heure. |
| filtres             | `SportEventFilter`           | Le jour (obligatoire), le site et le statut (facultatifs).           |
| jour                | `day`                        | Une date `AAAA-MM-JJ`, lue à l'heure de Dakar, qui est GMT.          |
| fiche d'une épreuve | `GetSportEvent`              | Le cas d'usage qui renvoie une épreuve et son classement.            |
| écran public        | `/epreuves`, `/epreuves/$id` | Les deux pages du front.                                             |

## 2. Fichiers par couche

On étend le module `sport-events` de l'API et on crée la fonctionnalité `sport-events` du front, organisée comme `disciplines` sur la branche `main`.

- **shared** : `packages/shared/src/sport-events.ts` gagne `listSportEventsQuerySchema` (paramètres `day`, `site`, `status`) et `sportEventListSchema`.
- **domain** : rien ; la lecture n'ajoute aucune règle.
- **application** : `application/sport-event.repository.ts` gagne `list(filter)` ; `application/use-cases/list-sport-events.ts` et `application/use-cases/get-sport-event.ts` sont les deux cas d'usage ; le dépôt en mémoire implémente `list()`.
- **infra** : `infra/drizzle-sport-event.repository.ts` implémente `list()` : début dans le jour, site et statut s'ils sont donnés, tri par heure de début, classements lus en une seule requête.
- **http** : `GET /api/sport-events?day=&site=&status=` renvoie 200 et la liste ; `GET /api/sport-events/:id` renvoie 200 et l'épreuve, ou 404.
- **web** : `apps/web/src/mocks/fixture.ts` et `handlers.ts` gagnent les épreuves et les deux routes de lecture, testées dans `mocks/handlers.test.ts`. `features/sport-events/api/sport-events.api.ts` (appels HTTP), `features/sport-events/api/sport-events.queries.ts` (TanStack Query), `features/sport-events/components/labels.ts` (libellés français des sites, statuts et médailles), `components/sport-events-page.tsx` (filtres et liste), `components/sport-event-detail-page.tsx` (fiche, podium, classement), `components/error-message.ts`. Routes `routes/epreuves.index.tsx` (filtres dans l'adresse) et `routes/epreuves.$sportEventId.tsx`, et un lien depuis l'accueil.

## 3. Données

Aucune table nouvelle : la lecture filtre `sport_events` sur `starts_at` dans `[jour 00:00 GMT, jour suivant 00:00 GMT[`, puis lit `ranking_lines` des épreuves trouvées.

## 4. Erreurs

Le seul refus de la spec existe déjà depuis la spec 001.

| Code AppError           | Catégorie | HTTP | Quand                                     | Scénario |
| ----------------------- | --------- | ---- | ----------------------------------------- | -------- |
| `SPORT_EVENT_NOT_FOUND` | NOT_FOUND | 404  | On ouvre la fiche d'une épreuve inconnue. | AS6      |

## 5. Tests par scénario

Chaque scénario est prouvé côté API au niveau le plus bas qui suffit, puis à l'écran sur la fausse API.

| Scénario | Fichier de test                                                                      | Niveau      | Ce que le test vérifie                                            |
| -------- | ------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------- |
| AS1      | `apps/api/src/modules/sport-events/infra/drizzle-sport-event.repository.int.spec.ts` | intégration | Seules les épreuves du jour, triées par heure.                    |
| AS2      | `apps/api/test/sport-events-read.e2e.spec.ts`                                        | e2e         | `site=saly` ne renvoie que l'épreuve de Saly.                     |
| AS3      | `apps/api/test/sport-events-read.e2e.spec.ts`                                        | e2e         | `status=finished` ne renvoie que l'épreuve terminée.              |
| AS4      | `apps/web/src/features/sport-events/components/sport-event-detail-page.test.tsx`     | écran       | Podium or, argent, bronze et classement avec pays et performance. |
| AS5      | `apps/web/src/features/sport-events/components/sport-event-detail-page.test.tsx`     | écran       | Statut, site, horaire et « Classement pas encore publié ».        |
| AS6      | `apps/api/test/sport-events-read.e2e.spec.ts`                                        | e2e         | 404 `SPORT_EVENT_NOT_FOUND`, et le message à l'écran.             |

## 6. Tâches

Six tâches, dans l'ordre des couches ; chacune tient dans un commit.

- [x] T01 [003-AS1, AS2, AS3] Écrire d'abord `packages/shared/src/sport-events.spec.ts` (« 003-AS1: accepts a day, and an optional site and status »), puis `listSportEventsQuerySchema` et `sportEventListSchema`
- [x] T02 [003-AS1, AS2, AS3, AS6] Écrire d'abord `application/sport-events.application.spec.ts` (« 003-AS2: lists only the events of the chosen site »), puis `list()` dans le port et le dépôt en mémoire, `ListSportEvents` et `GetSportEvent`
- [x] T03 [003-AS1, AS2, AS3] Écrire d'abord `infra/drizzle-sport-event.repository.int.spec.ts` (« 003-AS1: lists the events of a day sorted by time »), puis `list()` en Drizzle
- [x] T04 [003-AS1, AS2, AS3, AS4, AS6] Écrire d'abord `apps/api/test/sport-events-read.e2e.spec.ts` (« 003-AS6: answers 404 for an unknown event »), puis les deux routes `GET` du controller
- [x] T05 [003-AS1, AS4, AS6] Écrire d'abord `apps/web/src/mocks/handlers.test.ts` (« 003-AS1: the mock lists the events of a day »), puis les épreuves de `fixture.ts` et les deux routes de `handlers.ts`
- [x] T06 [003-AS1, AS2, AS3, AS4, AS5, AS6] Écrire d'abord `features/sport-events/components/sport-events-page.test.tsx` et `sport-event-detail-page.test.tsx` (« 003-AS4: shows the podium and the full ranking »), puis les appels, les requêtes, les deux pages, leurs routes, le lien de l'accueil et l'audit axe `routes/epreuves.a11y.test.tsx`

## 7. Corrections

### Passage 1

- [x] T07 [003-AS5] Compléter d'abord `features/sport-events/components/sport-event-detail-page.test.tsx` (« 003-AS5: shows the status, site and time, and says the ranking is not published yet ») avec le site « Diamniadio » : le relecteur note qu'aucun test ne vérifie le site d'une épreuve sans classement (sport-event-detail-page.test.tsx:35-44)
- [x] T08 [003-AS6] Écrire d'abord `apps/web/src/mocks/handlers.test.ts` (« 003-AS6: the mock answers 400 VALIDATION_FAILED for a malformed id, like the API »), puis valider `:id` avec `sportEventIdParamsSchema` dans `handlers.ts` : la fausse API répondait 404 là où l'API répond 400 (handlers.ts:72-78, controller:47)
- [ ] T09 [003-AS6] Écrire d'abord `features/sport-events/components/sport-event-detail-page.test.tsx` (« 003-AS6: says the event cannot be found for a malformed id »), puis, dans `sport-event-detail-page.tsx`, vérifier l'identifiant avec `sportEventIdParamsSchema` avant d'appeler l'API : `/epreuves/abc` affichait « Une erreur est survenue. Réessayez. » (error-message.ts:10)
