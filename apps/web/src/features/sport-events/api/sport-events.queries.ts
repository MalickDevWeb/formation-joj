import type { ListSportEventsQuery } from '@joj/shared';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { sportEventsApi } from './sport-events.api';

/** Clés du cache TanStack Query pour cette fonctionnalité. */
export const sportEventKeys = {
  all: ['sport-events'] as const,
  list: (filter: ListSportEventsQuery) => [...sportEventKeys.all, 'list', filter] as const,
  detail: (id: string) => [...sportEventKeys.all, 'detail', id] as const,
};

export const sportEventsQueryOptions = (filter: ListSportEventsQuery) =>
  queryOptions({
    queryKey: sportEventKeys.list(filter),
    queryFn: ({ signal }) => sportEventsApi.list(filter, signal),
  });

export const sportEventQueryOptions = (id: string) =>
  queryOptions({
    queryKey: sportEventKeys.detail(id),
    queryFn: ({ signal }) => sportEventsApi.get(id, signal),
  });

export const useSportEvents = (filter: ListSportEventsQuery) =>
  useQuery(sportEventsQueryOptions(filter));

export const useSportEvent = (id: string) => useQuery(sportEventQueryOptions(id));
