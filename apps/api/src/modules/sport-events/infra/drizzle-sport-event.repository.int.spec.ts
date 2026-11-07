import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { SportEvent } from '../domain/sport-event';
import { DrizzleSportEventRepository } from './drizzle-sport-event.repository';

const newEvent = () =>
  SportEvent.create({
    id: randomUUID(),
    name: '100 m garçons — finale',
    discipline: 'Athlétisme',
    site: 'diamniadio',
    startsAt: new Date('2026-11-08T10:40:00.000Z'),
    now: new Date('2026-11-07T09:00:00.123Z'),
  });

describe('DrizzleSportEventRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSportEventRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSportEventRepository(connection.db);
  });

  afterAll(() => connection?.close());

  it('001-AS1: reads back exactly the upcoming event it wrote', async () => {
    const sportEvent = newEvent();
    await repository.insert(sportEvent);

    expect(await repository.findById(sportEvent.id)).toEqual(sportEvent);
    expect(await repository.findById(randomUUID())).toBeNull();
  });

  it('001-AS3: persists the advanced status', async () => {
    const sportEvent = newEvent();
    await repository.insert(sportEvent);
    sportEvent.advance();
    sportEvent.advance();
    await repository.update(sportEvent);

    expect((await repository.findById(sportEvent.id))?.status).toBe('finished');
  });
});
