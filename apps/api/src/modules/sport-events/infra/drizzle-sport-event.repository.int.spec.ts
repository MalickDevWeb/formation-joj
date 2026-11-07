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

describe('DrizzleSportEventRepository rankings (in-memory PGlite)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSportEventRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSportEventRepository(connection.db);
  });

  afterAll(() => connection?.close());

  const finishedEvent = async () => {
    const sportEvent = newEvent();
    sportEvent.advance();
    sportEvent.advance();
    await repository.insert(sportEvent);
    await repository.update(sportEvent);
    return sportEvent;
  };

  it('002-AS1: reads back the ranking it wrote, sorted by rank', async () => {
    const sportEvent = await finishedEvent();
    sportEvent.publishRanking([
      { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s' },
      { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
    ]);
    await repository.saveRanking(sportEvent);

    const stored = await repository.findById(sportEvent.id);
    expect(stored).toEqual(sportEvent);
    expect(stored?.ranking?.map((line) => line.medal)).toEqual(['gold', 'silver']);
  });

  it('002-AS5: refuses to write a second ranking for the same event', async () => {
    const sportEvent = await finishedEvent();
    sportEvent.publishRanking([
      { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
    ]);
    await repository.saveRanking(sportEvent);

    await expect(repository.saveRanking(sportEvent)).rejects.toMatchObject({
      code: 'SPORT_EVENT_RANKING_ALREADY_PUBLISHED',
    });
    expect((await repository.findById(sportEvent.id))?.ranking).toHaveLength(1);
  });
});

describe('DrizzleSportEventRepository.list (in-memory PGlite)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSportEventRepository;

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSportEventRepository(connection.db);
  });

  afterAll(() => connection?.close());

  const insertAt = async (startsAt: string, site = 'diamniadio', finished = false) => {
    const sportEvent = SportEvent.create({
      id: randomUUID(),
      name: `Épreuve ${startsAt}`,
      discipline: 'Athlétisme',
      site,
      startsAt: new Date(startsAt),
      now: new Date('2026-11-07T09:00:00.000Z'),
    });
    await repository.insert(sportEvent);
    if (finished) {
      sportEvent.advance();
      sportEvent.advance();
      await repository.update(sportEvent);
      sportEvent.publishRanking([
        { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
      ]);
      await repository.saveRanking(sportEvent);
    }
    return sportEvent;
  };

  it('003-AS1: lists the events of a day sorted by time, with their ranking', async () => {
    const late = await insertAt('2026-11-10T23:59:59.999Z', 'diamniadio', true);
    const early = await insertAt('2026-11-10T00:00:00.000Z');
    await insertAt('2026-11-11T00:00:00.000Z');
    await insertAt('2026-11-09T23:59:59.999Z');

    const listed = await repository.list({ day: '2026-11-10' });
    expect(listed).toEqual([early, late]);
    expect(listed[1]?.ranking?.[0]?.medal).toBe('gold');
  });

  it('003-AS2: filters by site', async () => {
    const saly = await insertAt('2026-11-12T09:00:00.000Z', 'saly');
    await insertAt('2026-11-12T10:00:00.000Z', 'dakar');

    expect(await repository.list({ day: '2026-11-12', site: 'saly' })).toEqual([saly]);
  });

  it('003-AS3: filters by status', async () => {
    const done = await insertAt('2026-11-13T09:00:00.000Z', 'dakar', true);
    await insertAt('2026-11-13T10:00:00.000Z', 'dakar');

    expect(await repository.list({ day: '2026-11-13', status: 'finished' })).toEqual([done]);
  });
});
