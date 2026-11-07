/**
 * La fausse API tient le même contrat que apps/api : si elle s'en écarte, les tests du front
 * passent contre une API qui n'existe pas. Ces tests l'appellent avec `fetch`, sans React.
 */
import { sportEventListSchema, sportEventSchema } from '@joj/shared';
import { describe, expect, it } from 'vitest';
import { centMetres, longueur, relais, UNKNOWN_ID } from './fixture';

const call = (path: string) => fetch(`http://localhost${path}`);

describe('mock sport events API', () => {
  it('003-AS1: lists the events of a day, earliest first', async () => {
    const response = await call('/api/sport-events?day=2026-11-08');
    expect(response.status).toBe(200);
    const ids = sportEventListSchema.parse(await response.json()).map((event) => event.id);
    expect(ids).toEqual([centMetres.id, longueur.id]);
  });

  it('003-AS2: filters by site', async () => {
    const response = await call('/api/sport-events?day=2026-11-08&site=saly');
    expect(sportEventListSchema.parse(await response.json())).toEqual([]);
    const other = await call('/api/sport-events?day=2026-11-09&site=saly');
    expect(sportEventListSchema.parse(await other.json()).map((e) => e.id)).toEqual([relais.id]);
  });

  it('003-AS3: filters by status', async () => {
    const response = await call('/api/sport-events?day=2026-11-08&status=finished');
    expect(sportEventListSchema.parse(await response.json()).map((e) => e.id)).toEqual([
      centMetres.id,
    ]);
  });

  it('003-AS1: rejects a missing day with a 400 VALIDATION_FAILED problem', async () => {
    const response = await call('/api/sport-events');
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('003-AS4: gets a finished event with its ranking', async () => {
    const response = await call(`/api/sport-events/${centMetres.id}`);
    expect(response.status).toBe(200);
    expect(sportEventSchema.parse(await response.json()).ranking).toHaveLength(5);
  });

  it('003-AS6: answers 404 SPORT_EVENT_NOT_FOUND for an unknown event', async () => {
    const response = await call(`/api/sport-events/${UNKNOWN_ID}`);
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(await response.json()).toMatchObject({ code: 'SPORT_EVENT_NOT_FOUND' });
  });
});
