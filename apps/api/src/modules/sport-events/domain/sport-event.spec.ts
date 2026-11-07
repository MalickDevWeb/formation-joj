import { describe, expect, it } from 'vitest';
import { SportEvent } from './sport-event';

const NOW = new Date('2026-11-07T09:00:00.000Z');
const STARTS_AT = new Date('2026-11-08T10:40:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000001';

const newEvent = (site = 'diamniadio') =>
  SportEvent.create({
    id: ID,
    name: ' 100 m garçons — finale ',
    discipline: ' Athlétisme ',
    site,
    startsAt: STARTS_AT,
    now: NOW,
  });

describe('SportEvent', () => {
  it('001-AS1: creates an upcoming sport event with its information', () => {
    expect(newEvent()).toMatchObject({
      id: ID,
      name: '100 m garçons — finale',
      discipline: 'Athlétisme',
      site: 'diamniadio',
      startsAt: STARTS_AT,
      status: 'upcoming',
      createdAt: NOW,
    });
  });

  it('001-AS1: rejects a site outside the list', () => {
    expect(() => newEvent('thies')).toThrow(
      expect.objectContaining({ code: 'SPORT_EVENT_SITE_UNKNOWN', kind: 'VALIDATION' }),
    );
  });

  it('001-AS2: advances an upcoming event to in progress', () => {
    const event = newEvent();
    event.advance();
    expect(event.status).toBe('in-progress');
  });

  it('001-AS3: advances an in-progress event to finished', () => {
    const event = newEvent();
    event.advance();
    event.advance();
    expect(event.status).toBe('finished');
  });

  it('001-AS4: refuses to advance a finished event, which stays finished', () => {
    const event = newEvent();
    event.advance();
    event.advance();
    expect(() => event.advance()).toThrow(
      expect.objectContaining({ code: 'SPORT_EVENT_ALREADY_FINISHED', kind: 'CONFLICT' }),
    );
    expect(event.status).toBe('finished');
  });
});

const line = (rank: number, athlete: string, country = 'SEN') => ({
  rank,
  athlete,
  country,
  performance: `10.${30 + rank} s`,
});

const FIVE = [
  line(3, 'Lucas Silva', 'BRA'),
  line(1, 'Amadou Diallo', 'SEN'),
  line(2, 'Brian Kiptoo', 'KEN'),
  line(5, 'Kenji Sato', 'JPN'),
  line(4, 'Youssef Ben Ali', 'TUN'),
];

const finishedEvent = () => {
  const event = newEvent();
  event.advance();
  event.advance();
  return event;
};

describe('SportEvent.publishRanking', () => {
  it('002-AS1: publishes the ranking sorted by rank, with medals for the top three', () => {
    const event = finishedEvent();
    event.publishRanking(FIVE);

    expect(event.ranking?.map((l) => [l.rank, l.athlete, l.medal])).toEqual([
      [1, 'Amadou Diallo', 'gold'],
      [2, 'Brian Kiptoo', 'silver'],
      [3, 'Lucas Silva', 'bronze'],
      [4, 'Youssef Ben Ali', null],
      [5, 'Kenji Sato', null],
    ]);
    expect(event.ranking?.[0]).toMatchObject({ country: 'SEN', performance: '10.31 s' });
  });

  it.each([0, 1])(
    '002-AS2: refuses the ranking of an event that is not finished (%i steps)',
    (steps) => {
      const event = newEvent();
      for (let i = 0; i < steps; i++) event.advance();

      expect(() => event.publishRanking(FIVE)).toThrow(
        expect.objectContaining({ code: 'SPORT_EVENT_NOT_FINISHED', kind: 'BUSINESS_RULE' }),
      );
      expect(event.ranking).toBeNull();
    },
  );

  it.each([[[2, 3]], [[1, 2, 4]], [[1, 2, 2]]])(
    '002-AS3: refuses ranks that do not follow from 1 (%j)',
    (ranks) => {
      const event = finishedEvent();
      const lines = ranks.map((rank, i) => line(rank, `Athlète ${i}`));

      expect(() => event.publishRanking(lines)).toThrow(
        expect.objectContaining({
          code: 'SPORT_EVENT_RANKS_NOT_CONSECUTIVE',
          kind: 'BUSINESS_RULE',
        }),
      );
      expect(event.ranking).toBeNull();
    },
  );

  it('002-AS4: refuses the same athlete of the same country twice, and names them', () => {
    const event = finishedEvent();

    expect(() =>
      event.publishRanking([line(1, 'Amadou Diallo'), line(2, 'Amadou Diallo')]),
    ).toThrow(
      expect.objectContaining({
        code: 'SPORT_EVENT_DUPLICATE_ATHLETE',
        kind: 'BUSINESS_RULE',
        details: { athlete: 'Amadou Diallo', country: 'SEN' },
      }),
    );
  });

  it('002-AS4: accepts two namesakes from different countries', () => {
    const event = finishedEvent();
    event.publishRanking([line(1, 'Ali Hassan', 'EGY'), line(2, 'Ali Hassan', 'MAR')]);
    expect(event.ranking).toHaveLength(2);
  });

  it('002-AS5: refuses a second publication and keeps the first ranking', () => {
    const event = finishedEvent();
    event.publishRanking(FIVE);

    expect(() => event.publishRanking([line(1, 'Kenji Sato', 'JPN')])).toThrow(
      expect.objectContaining({ code: 'SPORT_EVENT_RANKING_ALREADY_PUBLISHED', kind: 'CONFLICT' }),
    );
    expect(event.ranking?.[0]?.athlete).toBe('Amadou Diallo');
  });
});
