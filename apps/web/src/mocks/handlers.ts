import { listSportEventsQuerySchema, type ProblemDetails } from '@joj/shared';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import type { z } from 'zod';
import { mockControl } from './control';
import { fixture } from './fixture';

/**
 * La fausse API des tests du front : le même contrat que apps/api (mêmes schémas zod, mêmes
 * codes d'erreur, même format RFC 9457), sur les données de `fixture.ts`. Une nouvelle route
 * de l'API s'ajoute ici (un `http.get`, `http.post`… par route), avec son test dans `handlers.test.ts`.
 */

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

export function problem(
  status: number,
  code: string,
  detail: string,
  extra: Pick<ProblemDetails, 'errors' | 'details'> = {},
) {
  return HttpResponse.json(
    {
      type: `urn:problem-type:${code.toLowerCase().replaceAll('_', '-')}`,
      title: TITLES[status] ?? 'Error',
      status,
      code,
      detail,
      ...extra,
    } satisfies ProblemDetails,
    { status, headers: { 'content-type': 'application/problem+json' } },
  );
}

/** Latence, puis panne armée par `mockControl` : renvoie la réponse d'erreur, ou `null`. */
export async function gate(method: string, path: string): Promise<Response | null> {
  if (mockControl.latency > 0) await delay(mockControl.latency);
  const status = mockControl.takeFailure(`${method} ${path}`);
  return status === null ? null : problem(status, 'INTERNAL_ERROR', 'Mocked failure.');
}

export function validationFailed(error: z.ZodError) {
  return problem(400, 'VALIDATION_FAILED', 'The request is invalid.', {
    errors: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
  });
}

const sportEventNotFound = (id: string) =>
  problem(404, 'SPORT_EVENT_NOT_FOUND', `No sport event with id ${id}`, { details: { id } });

export const handlers: RequestHandler[] = [
  http.get('*/api/sport-events', async ({ request }) => {
    const failure = await gate('GET', '/api/sport-events');
    if (failure) return failure;
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = listSportEventsQuerySchema.safeParse(params);
    if (!parsed.success) return validationFailed(parsed.error);
    const { day, site, status } = parsed.data;
    // Même règle que l'API : le jour est celui de Dakar, donc la date GMT du début.
    const listed = fixture.sportEvents
      .filter((event) => event.startsAt.slice(0, 10) === day)
      .filter((event) => site === undefined || event.site === site)
      .filter((event) => status === undefined || event.status === status)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return HttpResponse.json(listed);
  }),

  http.get('*/api/sport-events/:id', async ({ params }) => {
    const failure = await gate('GET', '/api/sport-events/:id');
    if (failure) return failure;
    const id = String(params['id']);
    const found = fixture.sportEvents.find((event) => event.id === id);
    return found ? HttpResponse.json(found) : sportEventNotFound(id);
  }),
];
