import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemorySportEventRepository } from './testing/in-memory-sport-event.repository';
import { AdvanceSportEvent } from './use-cases/advance-sport-event';
import { CreateSportEvent } from './use-cases/create-sport-event';

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
