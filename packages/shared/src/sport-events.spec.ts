import { describe, expect, it } from 'vitest';
import {
  createSportEventSchema,
  listSportEventsQuerySchema,
  publishRankingSchema,
} from './sport-events.ts';

const VALID = {
  name: ' 100 m garçons — finale ',
  discipline: ' Athlétisme ',
  site: 'diamniadio',
  startsAt: '2026-11-08T10:40:00.000Z',
};

describe('createSportEventSchema', () => {
  it('001-AS1: accepts a valid sport event and trims its texts', () => {
    expect(createSportEventSchema.parse(VALID)).toEqual({
      name: '100 m garçons — finale',
      discipline: 'Athlétisme',
      site: 'diamniadio',
      startsAt: '2026-11-08T10:40:00.000Z',
    });
  });

  it('001-AS1: rejects an unknown site', () => {
    expect(createSportEventSchema.safeParse({ ...VALID, site: 'thies' }).success).toBe(false);
  });

  it.each([{ name: ' ' }, { discipline: '' }, { startsAt: 'demain' }])(
    '001-AS1: rejects a missing name, discipline or date (%j)',
    (patch) => {
      expect(createSportEventSchema.safeParse({ ...VALID, ...patch }).success).toBe(false);
    },
  );
});

const LINE = { rank: 1, athlete: ' Amadou Diallo ', country: 'SEN', performance: ' 10.38 s ' };

describe('publishRankingSchema', () => {
  it('002-AS1: accepts a ranking of lines with rank, athlete, country and performance', () => {
    expect(publishRankingSchema.parse({ lines: [LINE] })).toEqual({
      lines: [{ rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' }],
    });
  });

  it.each([
    { lines: [] },
    { lines: [{ ...LINE, rank: 0 }] },
    { lines: [{ ...LINE, rank: 1.5 }] },
    { lines: [{ ...LINE, country: 'sn' }] },
    { lines: [{ ...LINE, athlete: ' ' }] },
    { lines: [{ ...LINE, performance: '' }] },
  ])('002-AS1: rejects an empty ranking or a malformed line (%j)', (body) => {
    expect(publishRankingSchema.safeParse(body).success).toBe(false);
  });
});

describe('listSportEventsQuerySchema', () => {
  it('003-AS1: accepts a day alone', () => {
    expect(listSportEventsQuerySchema.parse({ day: '2026-11-08' })).toEqual({ day: '2026-11-08' });
  });

  it('003-AS2: accepts a site filter', () => {
    expect(listSportEventsQuerySchema.parse({ day: '2026-11-08', site: 'saly' })).toEqual({
      day: '2026-11-08',
      site: 'saly',
    });
  });

  it('003-AS3: accepts a status filter', () => {
    expect(listSportEventsQuerySchema.parse({ day: '2026-11-08', status: 'finished' })).toEqual({
      day: '2026-11-08',
      status: 'finished',
    });
  });

  it.each([
    {},
    { day: '08/11/2026' },
    { day: '2026-11-08', site: 'thies' },
    { day: '2026-11-08', status: 'live' },
  ])('003-AS1: rejects a missing or malformed day, or an unknown filter value (%j)', (query) => {
    expect(listSportEventsQuerySchema.safeParse(query).success).toBe(false);
  });
});
