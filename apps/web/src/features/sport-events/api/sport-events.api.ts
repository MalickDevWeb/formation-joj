import {
  type ListSportEventsQuery,
  type SportEventResponse,
  sportEventListSchema,
  sportEventSchema,
} from '@joj/shared';
import { api } from '@/lib/api';

/**
 * Les appels HTTP de la fonctionnalité, sans React ni cache : un appel par route de l'API,
 * réponse validée par le schéma partagé. Le cache et les hooks sont dans `sport-events.queries.ts`.
 */
export const sportEventsApi = {
  list: (filter: ListSportEventsQuery, signal?: AbortSignal) => {
    const query = new URLSearchParams({ day: filter.day });
    if (filter.site) query.set('site', filter.site);
    if (filter.status) query.set('status', filter.status);
    return api.request<SportEventResponse[]>(`/sport-events?${query.toString()}`, {
      schema: sportEventListSchema,
      signal,
    });
  },

  get: (id: string, signal?: AbortSignal) =>
    api.request<SportEventResponse>(`/sport-events/${id}`, { schema: sportEventSchema, signal }),
};
