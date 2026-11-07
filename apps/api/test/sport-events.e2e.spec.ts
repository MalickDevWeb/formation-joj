import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { sportEventSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const BODY = {
  name: '100 m garçons — finale',
  discipline: 'Athlétisme',
  site: 'diamniadio',
  startsAt: '2026-11-08T10:40:00.000Z',
};

describe('/api/sport-events (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());
  const create = async () =>
    sportEventSchema.parse((await api().post('/api/sport-events').send(BODY).expect(201)).body);
  const advance = (id: string) => api().post(`/api/sport-events/${id}/advance`);

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('001-AS1: creates an upcoming sport event (201) and returns it', async () => {
    expect(await create()).toMatchObject({ ...BODY, status: 'upcoming' });
  });

  it('001-AS1: rejects an unknown site (400)', async () => {
    const response = await api()
      .post('/api/sport-events')
      .send({ ...BODY, site: 'thies' })
      .expect(400);
    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'site' })]);
  });

  it('001-AS2: advances an upcoming event to in progress (200)', async () => {
    const { id } = await create();
    const response = await advance(id).expect(200);
    expect(sportEventSchema.parse(response.body).status).toBe('in-progress');
  });

  it('001-AS3: advances an in-progress event to finished (200)', async () => {
    const { id } = await create();
    await advance(id).expect(200);
    const response = await advance(id).expect(200);
    expect(sportEventSchema.parse(response.body).status).toBe('finished');
  });

  it('001-AS4: answers 409 SPORT_EVENT_ALREADY_FINISHED when advancing a finished event', async () => {
    const { id } = await create();
    await advance(id).expect(200);
    await advance(id).expect(200);

    const response = await advance(id).expect(409);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 409, code: 'SPORT_EVENT_ALREADY_FINISHED' });
  });

  it('answers 404 when advancing an unknown sport event', async () => {
    const response = await advance(randomUUID()).expect(404);
    expect(response.body).toMatchObject({ code: 'SPORT_EVENT_NOT_FOUND' });
  });
});
