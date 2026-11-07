import { createFileRoute, Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

function Home() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-semibold">Jeux Olympiques de la Jeunesse, Dakar 2026</h1>
      <p className="text-muted-foreground">
        Les épreuves et leurs résultats, site par site : une seule source qui fait foi.
      </p>
      <Link to="/epreuves" className={buttonVariants()}>
        Voir les épreuves
      </Link>
    </div>
  );
}

export const Route = createFileRoute('/')({ component: Home });
