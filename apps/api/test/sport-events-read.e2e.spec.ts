import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { sportEventListSchema, sportEventSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('GET /api/sport-events (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  const create = async (startsAt: string, site = 'diamniadio') =>
    sportEventSchema.parse(
      (
        await api()
          .post('/api/sport-events')
          .send({ name: `Épreuve ${startsAt}`, discipline: 'Athlétisme', site, startsAt })
          .expect(201)
      ).body,
    );

  const finish = async (id: string) => {
    await api().post(`/api/sport-events/${id}/advance`).expect(200);
    await api().post(`/api/sport-events/${id}/advance`).expect(200);
  };

  const list = async (query: Record<string, string>) =>
    sportEventListSchema
      .parse((await api().get('/api/sport-events').query(query).expect(200)).body)
      .map((event) => event.id);

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('003-AS1: lists the events of a day, earliest first', async () => {
    const late = await create('2026-11-08T10:40:00.000Z');
    const early = await create('2026-11-08T09:00:00.000Z');
    await create('2026-11-09T09:00:00.000Z');

    expect(await list({ day: '2026-11-08' })).toEqual([early.id, late.id]);
  });

  it('003-AS1: rejects a missing day (400)', async () => {
    const response = await api().get('/api/sport-events').expect(400);
    expect(response.body).toMatchObject({ code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'day' })]);
  });

  it('003-AS2: lists only the events of the chosen site', async () => {
    const saly = await create('2026-11-10T09:00:00.000Z', 'saly');
    await create('2026-11-10T10:00:00.000Z', 'dakar');

    expect(await list({ day: '2026-11-10', site: 'saly' })).toEqual([saly.id]);
  });

  it('003-AS3: lists only the finished events', async () => {
    const done = await create('2026-11-11T09:00:00.000Z');
    await finish(done.id);
    await create('2026-11-11T10:00:00.000Z');

    expect(await list({ day: '2026-11-11', status: 'finished' })).toEqual([done.id]);
  });

  it('003-AS4: gets a finished event with its podium and full ranking', async () => {
    const { id } = await create('2026-11-12T09:00:00.000Z');
    await finish(id);
    await api()
      .post(`/api/sport-events/${id}/ranking`)
      .send({
        lines: [
          { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
          { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s' },
        ],
      })
      .expect(201);

    const event = sportEventSchema.parse(
      (await api().get(`/api/sport-events/${id}`).expect(200)).body,
    );
    expect(event).toMatchObject({ status: 'finished', site: 'diamniadio' });
    expect(event.ranking).toEqual([
      { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s', medal: 'gold' },
      { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s', medal: 'silver' },
    ]);
  });

  it('003-AS5: gets an upcoming event without ranking', async () => {
    const { id } = await create('2026-11-12T11:00:00.000Z');
    const response = await api().get(`/api/sport-events/${id}`).expect(200);
    expect(sportEventSchema.parse(response.body)).toMatchObject({
      status: 'upcoming',
      ranking: null,
    });
  });

  it('003-AS6: answers 404 SPORT_EVENT_NOT_FOUND for an unknown event', async () => {
    const response = await api().get(`/api/sport-events/${randomUUID()}`).expect(404);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 404, code: 'SPORT_EVENT_NOT_FOUND' });
  });
});
