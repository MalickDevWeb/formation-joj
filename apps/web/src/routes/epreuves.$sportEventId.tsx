import { createFileRoute } from '@tanstack/react-router';
import { SportEventDetailPage } from '@/features/sport-events/components/sport-event-detail-page';

function SportEventRoute() {
  const { sportEventId } = Route.useParams();
  return <SportEventDetailPage id={sportEventId} />;
}

export const Route = createFileRoute('/epreuves/$sportEventId')({ component: SportEventRoute });
