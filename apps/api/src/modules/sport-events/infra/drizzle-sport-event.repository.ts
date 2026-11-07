import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SportEventRepository } from '../application/sport-event.repository';
import type { SportEvent } from '../domain/sport-event';
import { toDomain, toRow } from './sport-event.mapper';
import { sportEvents } from './sport-events.schema';

@Injectable()
export class DrizzleSportEventRepository extends SportEventRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<SportEvent | null> {
    const [row] = await this.db.select().from(sportEvents).where(eq(sportEvents.id, id)).limit(1);
    return row ? toDomain(row) : null;
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
}
