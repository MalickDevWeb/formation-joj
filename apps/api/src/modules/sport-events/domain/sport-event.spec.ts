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
