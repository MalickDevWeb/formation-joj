# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`. Règles communes : `specs/constitution.md`.

## Méthodologie

- Toute fonctionnalité suit `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge` ; on s'arrête à chaque validation humaine.
- Un test d'abord, vu en échec (`pnpm tdd:red <fichier>`), puis le code minimal, puis le refactor.
- `pnpm verify` avant chaque commit, `pnpm check` avant de déclarer une fonctionnalité finie. Jamais de `--no-verify`.
- Une tâche = un commit Conventional Commits : `feat(benevoles): T03 refuse a full slot (001-AS2)`.
- Le plus simple qui passe les tests : pas d'abstraction sans deuxième usage réel (YAGNI).

## Architecture

Architecture hexagonale légère ; le module `apps/api/src/modules/disciplines/` est le modèle à copier.

- Un module par domaine dans `apps/api/src/modules/<domaine>/` : `domain/`, `application/`, `infra/`, `http/`, `<domaine>.module.ts`.
- Les dépendances vont vers l'intérieur : `http` → `application` → `domain` ; `infra` implémente les ports de `application`.
- `domain/` : TypeScript pur (ni NestJS, ni Drizzle, ni HTTP). Entités, règles, erreurs du domaine.
- `application/` : un cas d'usage par fichier dans `use-cases/`, et les ports (`DisciplineRepository`, classe abstraite).
- `infra/` : adaptateurs (Drizzle, mapper `toDomain`/`toRow`). Le module Nest relie le port à l'adaptateur.
- `http/` : controller fin — valider (DTO Zod), appeler un cas d'usage, sérialiser. Aucune règle métier.
- Transverse dans `apps/api/src/core/` (config, base, erreurs, santé). Pas d'import entre modules de domaine.
- `packages/shared` : schémas Zod et types d'entrée/sortie, source unique pour l'API et le front.
- Front : `apps/web/src/features/<domaine>/` avec `api/` (appels HTTP purs), `*.queries.ts` (TanStack Query), `components/` ; routes dans `src/routes/`, UI générique dans `src/components/ui/`.

## Concepts appréciés (SOLID appliqué)

- **S** : une classe = une raison de changer. Un cas d'usage = une classe avec `execute()` (`CreateDiscipline`).
- **O** : on étend en ajoutant un cas d'usage ou un adaptateur, sans modifier les existants.
- **L** : `DrizzleDisciplineRepository` et `InMemoryDisciplineRepository` sont interchangeables ; même contrat, mêmes erreurs.
- **I** : un port ne déclare que ce dont les cas d'usage ont besoin, rien de plus.
- **D** : les cas d'usage dépendent du port abstrait, injecté par Nest ; jamais de `new` d'un adaptateur.
- Entités encapsulées : constructeur privé, `create()` valide, `restore()` relit la persistance, mutations par méthodes métier (`rename()`).
- Typage strict, pas de `any` ni de cast gratuit ; fonctions courtes, retour anticipé, pas de code mort.
- Un commentaire dit le pourquoi, pas le quoi.

## Bonnes pratiques

- Toute erreur métier est une `AppError` avec un code stable et une `ErrorKind` ; seul `ProblemDetailsFilter` la traduit en HTTP (RFC 9457).
- Une entrée est validée par un schéma Zod de `packages/shared`, jamais à la main dans le controller ; le domaine revérifie ses invariants.
- Aucun secret dans le code : les valeurs viennent de `.env` (modèle `apps/api/.env.example`), lues par `core/config`.
- Tests : domaine et cas d'usage avec le repository en mémoire ; adaptateurs en `*.int.spec.ts` ; API en e2e sur PGlite (`apps/api/test/`) ; front avec MSW et axe.
- Chaque scénario d'acceptation a un test dont le titre commence par son identifiant (`pnpm spec:check <spec> --trace`).

## Nommage

- Fichiers en kebab-case : `create-discipline.ts`, `drizzle-discipline.repository.ts`, `disciplines.controller.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines`.
- Codes d'erreur en SCREAMING_SNAKE préfixés par le domaine : `DISCIPLINE_NAME_TAKEN`.
- Tests : `*.spec.ts` (API, shared), `*.test.tsx` (web) ; titres en anglais préfixés par le scénario : `it('000-AS1: creates a discipline')`.
- Code et messages d'erreur en anglais ; documentation et commentaires en français.
