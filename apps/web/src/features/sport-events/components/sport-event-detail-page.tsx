import type { SportEventResponse } from '@joj/shared';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSportEvent } from '../api/sport-events.queries';
import { errorMessage } from './error-message';
import { formatDateTime, MEDAL_LABELS, SITE_LABELS, STATUS_LABELS } from './labels';

export function SportEventDetailPage({ id }: { id: string }) {
  const sportEvent = useSportEvent(id);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/epreuves" className="text-sm text-muted-foreground hover:underline">
        <span aria-hidden="true">←</span> Toutes les épreuves
      </Link>
      {sportEvent.isPending && <p className="text-muted-foreground">Chargement…</p>}
      {sportEvent.isError && (
        <p role="alert" className="text-destructive">
          {errorMessage(sportEvent.error)}
        </p>
      )}
      {sportEvent.isSuccess && <SportEventCard sportEvent={sportEvent.data} />}
    </div>
  );
}

function SportEventCard({ sportEvent }: { sportEvent: SportEventResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold">{sportEvent.name}</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Statut</dt>
          <dd>{STATUS_LABELS[sportEvent.status]}</dd>
          <dt className="text-muted-foreground">Discipline</dt>
          <dd>{sportEvent.discipline}</dd>
          <dt className="text-muted-foreground">Site</dt>
          <dd>{SITE_LABELS[sportEvent.site]}</dd>
          <dt className="text-muted-foreground">Horaire</dt>
          <dd>{formatDateTime(sportEvent.startsAt)}</dd>
        </dl>
        {sportEvent.ranking === null ? (
          <p className="text-muted-foreground">Le classement n’est pas encore publié.</p>
        ) : (
          <Ranking lines={sportEvent.ranking} />
        )}
      </CardContent>
    </Card>
  );
}

type Lines = NonNullable<SportEventResponse['ranking']>;

function Ranking({ lines }: { lines: Lines }) {
  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Podium</h2>
        <ul aria-label="Podium" className="flex flex-col gap-1">
          {lines.map(({ rank, athlete, country, medal }) =>
            medal === null ? null : (
              <li key={rank} className="flex gap-2">
                <span className="w-16 font-medium">{MEDAL_LABELS[medal]}</span>
                <span>
                  {athlete} ({country})
                </span>
              </li>
            ),
          )}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2 id="ranking-title" className="text-lg font-semibold">
          Classement complet
        </h2>
        <table aria-labelledby="ranking-title" className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2">
                Rang
              </th>
              <th scope="col">Athlète</th>
              <th scope="col">Pays</th>
              <th scope="col">Performance</th>
              <th scope="col">Médaille</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(({ rank, athlete, country, performance, medal }) => (
              <tr key={rank} className="border-b last:border-0">
                <td className="py-2">{rank}</td>
                <td>{athlete}</td>
                <td>{country}</td>
                <td>{performance}</td>
                <td>{medal === null ? '' : MEDAL_LABELS[medal]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
