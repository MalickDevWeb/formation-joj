import type { SportEventResponse } from '@joj/shared';

/**
 * Les données de la fausse API, en mémoire. Les handlers les lisent et les modifient comme la
 * vraie base ; `resetFixture()` (appelé après chaque test par `mockControl.reset()`) les remet
 * dans cet état, pour qu'un test ne dépende jamais de ce qu'un autre a créé ou supprimé.
 * Chaque ressource de l'API y ajoute sa liste, avec ses valeurs de départ.
 */
export const centMetres: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000011',
  name: '100 m garçons — finale',
  discipline: 'Athlétisme',
  site: 'diamniadio',
  startsAt: '2026-11-08T10:40:00.000Z',
  status: 'finished',
  ranking: [
    { rank: 1, athlete: 'Amadou Diallo', country: 'SEN', performance: '10.38 s', medal: 'gold' },
    { rank: 2, athlete: 'Brian Kiptoo', country: 'KEN', performance: '10.41 s', medal: 'silver' },
    { rank: 3, athlete: 'Lucas Silva', country: 'BRA', performance: '10.47 s', medal: 'bronze' },
    { rank: 4, athlete: 'Youssef Ben Ali', country: 'TUN', performance: '10.52 s', medal: null },
    { rank: 5, athlete: 'Kenji Sato', country: 'JPN', performance: '10.55 s', medal: null },
  ],
  createdAt: '2026-11-01T08:00:00.000Z',
};

export const longueur: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000012',
  name: 'Saut en longueur filles',
  discipline: 'Athlétisme',
  site: 'diamniadio',
  startsAt: '2026-11-08T16:20:00.000Z',
  status: 'upcoming',
  ranking: null,
  createdAt: '2026-11-01T08:00:00.000Z',
};

export const relais: SportEventResponse = {
  id: '0199f5c2-0000-7000-8000-000000000013',
  name: 'Beach-volley filles — finale',
  discipline: 'Beach-volley',
  site: 'saly',
  startsAt: '2026-11-09T14:00:00.000Z',
  status: 'in-progress',
  ranking: null,
  createdAt: '2026-11-01T08:00:00.000Z',
};

/** Un identifiant au bon format qu'aucune épreuve ne porte. */
export const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

const initial = (): { sportEvents: SportEventResponse[] } => ({
  sportEvents: [{ ...centMetres }, { ...longueur }, { ...relais }],
});

export const fixture = initial();

export function resetFixture(): void {
  Object.assign(fixture, initial());
}
