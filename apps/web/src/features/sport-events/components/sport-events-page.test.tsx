/**
 * La page /epreuves, montée par sa vraie route sur la fausse API (`mocks/handlers.ts`) :
 * les épreuves d'un jour, filtrées par site et par statut, et le lien vers leur fiche.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockControl } from '@/mocks/control';
import { centMetres, fixture, longueur } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

async function open(search = '?day=2026-11-08') {
  const user = userEvent.setup();
  const rendered = await renderRoute({ initialEntries: [`/epreuves${search}`] });
  return { user, ...rendered };
}

const names = () =>
  within(screen.getByRole('list', { name: 'Épreuves' }))
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('aria-label'));

describe('SportEventsPage', () => {
  it('003-AS1: shows the events of the day, earliest first, with their details', async () => {
    await open();

    await screen.findByRole('list', { name: 'Épreuves' });
    expect(names()).toEqual([centMetres.name, longueur.name]);
    const first = screen.getByRole('listitem', { name: centMetres.name });
    expect(first).toHaveTextContent('Athlétisme');
    expect(first).toHaveTextContent('Diamniadio');
    expect(first).toHaveTextContent('10:40');
    expect(first).toHaveTextContent('Terminée');
  });

  it('003-AS1: shows today when no day is chosen', async () => {
    await open('');
    expect(await screen.findByLabelText('Jour')).toHaveValue(new Date().toISOString().slice(0, 10));
  });

  it('003-AS1: says when there is no event that day', async () => {
    await open('?day=2026-11-13');
    expect(await screen.findByText('Aucune épreuve pour ces critères.')).toBeInTheDocument();
  });

  it('003-AS1: shows a loading state, then an error when the list cannot be loaded', async () => {
    mockControl.setLatency(50);
    mockControl.failNext('GET /api/sport-events');
    await open();

    expect(screen.getByText('Chargement…')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de charger les épreuves.',
    );
  });

  it('003-AS2: filters the events by site', async () => {
    fixture.sportEvents.push({
      ...longueur,
      id: '0199f5c2-0000-7000-8000-000000000021',
      name: 'Lutte libre −57 kg filles',
      site: 'dakar',
      startsAt: '2026-11-08T11:30:00.000Z',
    });
    const { user, router } = await open();
    await screen.findByRole('list', { name: 'Épreuves' });

    await user.selectOptions(screen.getByLabelText('Site'), 'dakar');

    await waitFor(() => expect(names()).toEqual(['Lutte libre −57 kg filles']));
    expect(router.state.location.search).toMatchObject({ day: '2026-11-08', site: 'dakar' });
  });

  it('003-AS3: filters the events by status', async () => {
    const { user } = await open();
    await screen.findByRole('list', { name: 'Épreuves' });

    await user.selectOptions(screen.getByLabelText('Statut'), 'finished');

    await waitFor(() => expect(names()).toEqual([centMetres.name]));
  });

  it('003-AS4: opens the detail page of an event from the list', async () => {
    const { user } = await open();

    await user.click(await screen.findByRole('link', { name: centMetres.name }));

    expect(
      await screen.findByRole('heading', { level: 1, name: centMetres.name }),
    ).toBeInTheDocument();
  });
});
