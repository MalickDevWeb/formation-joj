import { sportEventSiteSchema, sportEventStatusSchema } from '@joj/shared';
import { SportEvent } from '../domain/sport-event';
import type { RankingLineRow, SportEventRow } from './sport-events.schema';

/**
 * Lignes des tables → entité. Un site ou un statut inconnu en base est un bug : on échoue tôt.
 * Sans ligne de classement, le classement n'est pas publié.
 */
export function toDomain(row: SportEventRow, lines: RankingLineRow[]): SportEvent {
  return SportEvent.restore({
    id: row.id,
    name: row.name,
    discipline: row.discipline,
    site: sportEventSiteSchema.parse(row.site),
    startsAt: row.startsAt,
    status: sportEventStatusSchema.parse(row.status),
    ranking:
      lines.length === 0
        ? null
        : [...lines]
            .sort((a, b) => a.rank - b.rank)
            .map(({ rank, athlete, country, performance }) => ({
              rank,
              athlete,
              country,
              performance,
            })),
    createdAt: row.createdAt,
  });
}

/** Entité → ligne de la table. */
export function toRow(sportEvent: SportEvent): SportEventRow {
  return {
    id: sportEvent.id,
    name: sportEvent.name,
    discipline: sportEvent.discipline,
    site: sportEvent.site,
    startsAt: sportEvent.startsAt,
    status: sportEvent.status,
    createdAt: sportEvent.createdAt,
  };
}

/** Classement de l'entité → lignes de la table `ranking_lines`. */
export function toRankingRows(sportEvent: SportEvent): RankingLineRow[] {
  return (sportEvent.ranking ?? []).map(({ rank, athlete, country, performance }) => ({
    sportEventId: sportEvent.id,
    rank,
    athlete,
    country,
    performance,
  }));
}
