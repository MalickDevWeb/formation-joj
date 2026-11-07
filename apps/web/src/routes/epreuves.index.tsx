import { listSportEventsQuerySchema } from '@joj/shared';
import { createFileRoute } from '@tanstack/react-router';
import { today } from '@/features/sport-events/components/labels';
import { SportEventsPage } from '@/features/sport-events/components/sport-events-page';

/** Les filtres de l'adresse ; une valeur invalide est ignorée, et le jour vaut aujourd'hui par défaut. */
const searchSchema = listSportEventsQuerySchema.partial();

function SportEventsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SportEventsPage
      filter={{ ...search, day: search.day ?? today() }}
      onFilterChange={(filter) => navigate({ search: filter })}
    />
  );
}

export const Route = createFileRoute('/epreuves/')({
  validateSearch: (search) => {
    const parsed = searchSchema.safeParse(search);
    return parsed.success ? parsed.data : {};
  },
  component: SportEventsRoute,
});
