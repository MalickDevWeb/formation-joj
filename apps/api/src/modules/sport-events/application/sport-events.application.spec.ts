import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemorySportEventRepository } from './testing/in-memory-sport-event.repository';
import { AdvanceSportEvent } from './use-cases/advance-sport-event';
import { CreateSportEvent } from './use-cases/create-sport-event';
import { GetSportEvent } from './use-cases/get-sport-event';
import { ListSportEvents } from './use-cases/list-sport-events';
import { PublishRanking } from './use-cases/publish-ranking';

const INPUT = {
  name: '100 m garçons — finale',
  discipline: 'Athlétisme',
  site: 'diamniadio',
  startsAt: '2026-11-08T10:40:00.000Z',
} as const;

function setup() {
  const sportEvents = new InMemorySportEventRepository();
  return {
    sportEvents,
    createSportEvent: new CreateSportEvent(sportEvents),
    advanceSportEvent: new AdvanceSportEvent(sportEvents),
    publishRanking: new PublishRanking(sportEvents),
    listSportEvents: new ListSportEvents(sportEvents),
    getSportEvent: new GetSportEvent(sportEvents),
  };
}

describe('sport events (application layer)', () => {
  it('001-AS1: creates an upcoming sport event and stores it', async () => {
    const { sportEvents, createSportEvent } = setup();
    const created = await createSportEvent.execute(INPUT);

    expect(created).toMatchObject({
      name: '100 m garçons — finale',
      discipline: 'Athlétisme',
      site: 'diamniadio',
      startsAt: new Date('2026-11-08T10:40:00.000Z'),
      status: 'upcoming',
    });
    expect(await sportEvents.findById(created.id)).toEqual(created);
  });

  it('001-AS3: stores each step until the event is finished', async () => {
    const { sportEvents, createSportEvent, advanceSportEvent } = setup();
    const { id } = await createSportEvent.execute(INPUT);

    expect((await advanceSportEvent.execute(id)).status).toBe('in-progress');
    expect((await advanceSportEvent.execute(id)).status).toBe('finished');
    expect((await sportEvents.findById(id))?.status).toBe('finished');
  });

  it('001-AS4: refuses to advance a finished event, which stays finished', async () => {
    const { sportEvents, createSportEvent, advanceSportEvent } = setup();
    const { id } = await createSportEvent.execute(INPUT);
    await advanceSportEvent.execute(id);
    await advanceSportEvent.execute(id);

    await expect(advanceSportEvent.execute(id)).rejects.toMatchObject({
      code: 'SPORT_EVENT_ALREADY_FINISHED',
    });
    expect((await sportEvents.findById(id))?.status).toBe('finished');
  });

  it('rejects advancing an unknown sport event', async () => {
    const { advanceSportEvent } = setup();
    await expect(advanceSportEvent.execute(randomUUID())).rejects.toMatchObject({
      code: 'SPORT_EVENT_NOT_FOUND',
    });
  });
});

const LINES = [
  { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s' },
  { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
];

describe('ranking publication (application layer)', () => {
  async function finishedEvent(app: ReturnType<typeof setup>) {
    const { id } = await app.createSportEvent.execute(INPUT);
    await app.advanceSportEvent.execute(id);
    await app.advanceSportEvent.execute(id);
    return id;
  }

  it('002-AS1: publishes and stores the ranking of a finished event', async () => {
    const app = setup();
    const id = await finishedEvent(app);

    const published = await app.publishRanking.execute(id, { lines: LINES });

    expect(published.ranking?.map((line) => [line.athlete, line.medal])).toEqual([
      ['Amadou Diallo', 'gold'],
      ['Brian Kiptoo', 'silver'],
    ]);
    expect((await app.sportEvents.findById(id))?.ranking).toEqual(published.ranking);
  });

  it('002-AS5: refuses a second publication and keeps the stored ranking', async () => {
    const app = setup();
    const id = await finishedEvent(app);
    await app.publishRanking.execute(id, { lines: LINES });

    await expect(
      app.publishRanking.execute(id, {
        lines: [{ rank: 1, athlete: 'Kenji Sato', country: 'JPN', performance: '10.50 s' }],
      }),
    ).rejects.toMatchObject({ code: 'SPORT_EVENT_RANKING_ALREADY_PUBLISHED' });
    expect((await app.sportEvents.findById(id))?.ranking?.[0]?.athlete).toBe('Amadou Diallo');
  });

  it('rejects publishing the ranking of an unknown sport event', async () => {
    const app = setup();
    await expect(app.publishRanking.execute(randomUUID(), { lines: LINES })).rejects.toMatchObject({
      code: 'SPORT_EVENT_NOT_FOUND',
    });
  });
});

describe('reading sport events (application layer)', () => {
  const at = (startsAt: string, site: 'dakar' | 'diamniadio' | 'saly' = 'diamniadio') => ({
    ...INPUT,
    name: `Épreuve ${startsAt} ${site}`,
    site,
    startsAt,
  });

  it('003-AS1: lists the events of a day, earliest first', async () => {
    const app = setup();
    const late = await app.createSportEvent.execute(at('2026-11-08T10:40:00.000Z'));
    const early = await app.createSportEvent.execute(at('2026-11-08T09:00:00.000Z'));
    await app.createSportEvent.execute(at('2026-11-09T09:00:00.000Z'));

    const listed = await app.listSportEvents.execute({ day: '2026-11-08' });
    expect(listed.map((event) => event.id)).toEqual([early.id, late.id]);
  });

  it('003-AS2: lists only the events of the chosen site', async () => {
    const app = setup();
    const saly = await app.createSportEvent.execute(at('2026-11-08T09:00:00.000Z', 'saly'));
    await app.createSportEvent.execute(at('2026-11-08T10:00:00.000Z', 'dakar'));

    const listed = await app.listSportEvents.execute({ day: '2026-11-08', site: 'saly' });
    expect(listed.map((event) => event.id)).toEqual([saly.id]);
  });

  it('003-AS3: lists only the events with the chosen status', async () => {
    const app = setup();
    const done = await app.createSportEvent.execute(at('2026-11-08T09:00:00.000Z'));
    await app.advanceSportEvent.execute(done.id);
    await app.advanceSportEvent.execute(done.id);
    await app.createSportEvent.execute(at('2026-11-08T10:00:00.000Z'));

    const listed = await app.listSportEvents.execute({ day: '2026-11-08', status: 'finished' });
    expect(listed.map((event) => event.id)).toEqual([done.id]);
  });

  it('003-AS4: gets an event with its ranking', async () => {
    const app = setup();
    const { id } = await app.createSportEvent.execute(INPUT);
    await app.advanceSportEvent.execute(id);
    await app.advanceSportEvent.execute(id);
    await app.publishRanking.execute(id, { lines: LINES });

    expect((await app.getSportEvent.execute(id)).ranking?.[0]?.medal).toBe('gold');
  });

  it('003-AS6: refuses to get an unknown event', async () => {
    const app = setup();
    await expect(app.getSportEvent.execute(randomUUID())).rejects.toMatchObject({
      code: 'SPORT_EVENT_NOT_FOUND',
    });
  });
});
