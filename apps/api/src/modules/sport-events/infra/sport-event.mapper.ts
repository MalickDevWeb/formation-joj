import { sportEventSiteSchema, sportEventStatusSchema } from '@joj/shared';
import { SportEvent } from '../domain/sport-event';
import type { SportEventRow } from './sport-events.schema';

/** Ligne de la table → entité. Un site ou un statut inconnu en base est un bug : on échoue tôt. */
export function toDomain(row: SportEventRow): SportEvent {
  return SportEvent.restore({
    id: row.id,
    name: row.name,
    discipline: row.discipline,
    site: sportEventSiteSchema.parse(row.site),
    startsAt: row.startsAt,
    status: sportEventStatusSchema.parse(row.status),
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
