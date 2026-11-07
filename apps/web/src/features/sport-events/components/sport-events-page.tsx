import {
  type ListSportEventsQuery,
  SPORT_EVENT_SITES,
  SPORT_EVENT_STATUSES,
  sportEventSiteSchema,
  sportEventStatusSchema,
} from '@joj/shared';
import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useSportEvents } from '../api/sport-events.queries';
import { formatTime, SITE_LABELS, STATUS_LABELS } from './labels';

interface Props {
  filter: ListSportEventsQuery;
  /** Les filtres vivent dans l'adresse : une vue filtrée se partage par un lien. */
  onFilterChange: (filter: ListSportEventsQuery) => void;
}

export function SportEventsPage({ filter, onFilterChange }: Props) {
  const sportEvents = useSportEvents(filter);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Épreuves</h1>
      <form className="grid gap-4 sm:grid-cols-3" onSubmit={(event) => event.preventDefault()}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="day">Jour</Label>
          <Input
            id="day"
            type="date"
            value={filter.day}
            onChange={(event) => {
              if (event.target.value) onFilterChange({ ...filter, day: event.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="site">Site</Label>
          <NativeSelect
            id="site"
            value={filter.site ?? ''}
            onChange={(event) => {
              const site = sportEventSiteSchema.safeParse(event.target.value);
              const { site: _site, ...rest } = filter;
              onFilterChange(site.success ? { ...rest, site: site.data } : rest);
            }}
          >
            <option value="">Tous les sites</option>
            {SPORT_EVENT_SITES.map((site) => (
              <option key={site} value={site}>
                {SITE_LABELS[site]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Statut</Label>
          <NativeSelect
            id="status"
            value={filter.status ?? ''}
            onChange={(event) => {
              const status = sportEventStatusSchema.safeParse(event.target.value);
              const { status: _status, ...rest } = filter;
              onFilterChange(status.success ? { ...rest, status: status.data } : rest);
            }}
          >
            <option value="">Tous les statuts</option>
            {SPORT_EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </form>
      {sportEvents.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {sportEvents.isError && (
        <p role="alert" className="text-destructive">
          Impossible de charger les épreuves.
        </p>
      )}
      {sportEvents.isSuccess &&
        (sportEvents.data.length === 0 ? (
          <p className="text-muted-foreground">Aucune épreuve pour ces critères.</p>
        ) : (
          <ul aria-label="Épreuves" className="divide-y rounded-md border">
            {sportEvents.data.map((sportEvent) => (
              <li key={sportEvent.id} aria-label={sportEvent.name} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/epreuves/$sportEventId"
                      params={{ sportEventId: sportEvent.id }}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {sportEvent.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {sportEvent.discipline} · {SITE_LABELS[sportEvent.site]} ·{' '}
                      {formatTime(sportEvent.startsAt)}
                    </span>
                  </div>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                    {STATUS_LABELS[sportEvent.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
