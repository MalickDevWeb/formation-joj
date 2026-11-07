import type { ListSportEventsQuery } from '@joj/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, inArray, lt, type SQL } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SportEventRepository } from '../application/sport-event.repository';
import type { SportEvent } from '../domain/sport-event';
import { isUniqueViolation } from '../../../core/database/pg-errors';
import { rankingAlreadyPublished } from '../domain/sport-events.errors';
import { toDomain, toRankingRows, toRow } from './sport-event.mapper';
import { RANKING_LINES_PK, rankingLines, sportEvents } from './sport-events.schema';

@Injectable()
export class DrizzleSportEventRepository extends SportEventRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<SportEvent | null> {
    const [row] = await this.db.select().from(sportEvents).where(eq(sportEvents.id, id)).limit(1);
    if (!row) return null;
    const lines = await this.db
      .select()
      .from(rankingLines)
      .where(eq(rankingLines.sportEventId, id));
    return toDomain(row, lines);
  }

  async list({ day, site, status }: ListSportEventsQuery): Promise<SportEvent[]> {
    // Dakar est à GMT toute l'année : le jour va de minuit GMT à minuit GMT.
    const start = new Date(`${day}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const conditions: SQL[] = [gte(sportEvents.startsAt, start), lt(sportEvents.startsAt, end)];
    if (site !== undefined) conditions.push(eq(sportEvents.site, site));
    if (status !== undefined) conditions.push(eq(sportEvents.status, status));

    const rows = await this.db
      .select()
      .from(sportEvents)
      .where(and(...conditions))
      .orderBy(asc(sportEvents.startsAt));
    if (rows.length === 0) return [];
    // Une seule requête pour les classements de toutes les épreuves trouvées.
    const lines = await this.db
      .select()
      .from(rankingLines)
      .where(
        inArray(
          rankingLines.sportEventId,
          rows.map((row) => row.id),
        ),
      );
    return rows.map((row) =>
      toDomain(
        row,
        lines.filter((line) => line.sportEventId === row.id),
      ),
    );
  }

  async insert(sportEvent: SportEvent): Promise<void> {
    await this.db.insert(sportEvents).values(toRow(sportEvent));
  }

  async update(sportEvent: SportEvent): Promise<void> {
    await this.db
      .update(sportEvents)
      .set({ status: sportEvent.status })
      .where(eq(sportEvents.id, sportEvent.id));
  }

  /** Un seul INSERT de toutes les lignes : le classement s'écrit entier ou pas du tout. */
  async saveRanking(sportEvent: SportEvent): Promise<void> {
    try {
      await this.db.insert(rankingLines).values(toRankingRows(sportEvent));
    } catch (error) {
      if (isUniqueViolation(error, RANKING_LINES_PK)) throw rankingAlreadyPublished(sportEvent.id);
      throw error;
    }
  }
}
