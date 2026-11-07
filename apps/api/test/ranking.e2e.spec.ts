import type { INestApplication } from '@nestjs/common';
import { sportEventSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const EVENT = {
  name: '100 m garçons — finale',
  discipline: 'Athlétisme',
  site: 'diamniadio',
  startsAt: '2026-11-08T10:40:00.000Z',
};

const FIVE = [
  { rank: 3, athlete: 'Lucas Silva', country: 'BRA', performance: '10.47 s' },
  { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s' },
  { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s' },
  { rank: 5, athlete: 'Kenji Sato', country: 'JPN', performance: '10.55 s' },
  { rank: 4, athlete: 'Youssef Ben Ali', country: 'TUN', performance: '10.52 s' },
];

describe('/api/sport-events/:id/ranking (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());
  const publish = (id: string, lines: unknown) =>
    api().post(`/api/sport-events/${id}/ranking`).send({ lines });

  /** Crée une épreuve et la fait avancer du nombre d'étapes demandé (2 = terminée). */
  const eventAfter = async (steps: number) => {
    const { id } = sportEventSchema.parse(
      (await api().post('/api/sport-events').send(EVENT).expect(201)).body,
    );
    for (let i = 0; i < steps; i++) {
      await api().post(`/api/sport-events/${id}/advance`).expect(200);
    }
    return id;
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app?.close());

  it('002-AS1: publishes a ranking of five athletes with medals (201)', async () => {
    const id = await eventAfter(2);
    const response = await publish(id, FIVE).expect(201);

    const { ranking } = sportEventSchema.parse(response.body);
    expect(ranking?.map((line) => [line.rank, line.athlete, line.country, line.medal])).toEqual([
      [1, 'Amadou Diallo', 'SEN', 'gold'],
      [2, 'Brian Kiptoo', 'KEN', 'silver'],
      [3, 'Lucas Silva', 'BRA', 'bronze'],
      [4, 'Youssef Ben Ali', 'TUN', null],
      [5, 'Kenji Sato', 'JPN', null],
    ]);
  });

  it.each([0, 1])(
    '002-AS2: answers 422 SPORT_EVENT_NOT_FINISHED for an event not finished (%i steps)',
    async (steps) => {
      const id = await eventAfter(steps);
      const response = await publish(id, FIVE).expect(422);
      expect(response.body).toMatchObject({ status: 422, code: 'SPORT_EVENT_NOT_FINISHED' });
    },
  );

  it('002-AS3: answers 422 SPORT_EVENT_RANKS_NOT_CONSECUTIVE for a gap in the ranks', async () => {
    const id = await eventAfter(2);
    const lines = FIVE.filter((line) => line.rank !== 3);
    const response = await publish(id, lines).expect(422);
    expect(response.body).toMatchObject({ code: 'SPORT_EVENT_RANKS_NOT_CONSECUTIVE' });
  });

  it('002-AS4: answers 422 SPORT_EVENT_DUPLICATE_ATHLETE and names the athlete', async () => {
    const id = await eventAfter(2);
    const lines = [FIVE[1], { ...FIVE[1], rank: 2 }];
    const response = await publish(id, lines).expect(422);
    expect(response.body).toMatchObject({
      code: 'SPORT_EVENT_DUPLICATE_ATHLETE',
      details: { athlete: 'Amadou Diallo', country: 'SEN' },
    });
  });

  // Que le premier classement reste inchangé est prouvé par les tests d'application et
  // d'intégration : la tranche n'a pas encore de route de lecture.
  it('002-AS5: answers 409 SPORT_EVENT_RANKING_ALREADY_PUBLISHED on a second publication', async () => {
    const id = await eventAfter(2);
    await publish(id, FIVE).expect(201);

    const response = await publish(id, [FIVE[3]]).expect(409);
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({
      status: 409,
      code: 'SPORT_EVENT_RANKING_ALREADY_PUBLISHED',
    });
  });
});
