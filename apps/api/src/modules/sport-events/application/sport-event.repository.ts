import type { SportEvent } from '../domain/sport-event';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSportEventRepository (infra) et InMemorySportEventRepository (tests).
 */
export abstract class SportEventRepository {
  abstract findById(id: string): Promise<SportEvent | null>;
  abstract insert(sportEvent: SportEvent): Promise<void>;
  /** Écrit le statut de l'épreuve. */
  abstract update(sportEvent: SportEvent): Promise<void>;
  /** Écrit le classement ; lève SPORT_EVENT_RANKING_ALREADY_PUBLISHED s'il en existe déjà un. */
  abstract saveRanking(sportEvent: SportEvent): Promise<void>;
}
