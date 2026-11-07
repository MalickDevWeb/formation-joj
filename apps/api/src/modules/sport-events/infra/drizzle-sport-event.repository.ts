import type { ListSportEventsQuery } from '@joj/shared';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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

  async list(_filter: ListSportEventsQuery): Promise<SportEvent[]> {
    throw new Error('non implémenté');
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
