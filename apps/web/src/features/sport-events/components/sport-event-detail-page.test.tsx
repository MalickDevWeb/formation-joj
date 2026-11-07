/** La fiche d'une épreuve, montée par sa vraie route sur la fausse API. */
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { centMetres, longueur, UNKNOWN_ID } from '@/mocks/fixture';
import { renderRoute } from '@/test/utils';

const open = (id: string) => renderRoute({ initialEntries: [`/epreuves/${id}`] });

describe('SportEventDetailPage', () => {
  it('003-AS4: shows the status, site and time, the podium and the full ranking', async () => {
    await open(centMetres.id);

    expect(
      await screen.findByRole('heading', { level: 1, name: centMetres.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('Terminée')).toBeInTheDocument();
    expect(screen.getByText('Diamniadio')).toBeInTheDocument();
    expect(screen.getByText(/10:40/)).toBeInTheDocument();

    const podium = within(screen.getByRole('list', { name: 'Podium' })).getAllByRole('listitem');
    expect(podium.map((item) => item.textContent)).toEqual([
      'OrAmadou Diallo (SEN)',
      'ArgentBrian Kiptoo (KEN)',
      'BronzeLucas Silva (BRA)',
    ]);

    const rows = within(screen.getByRole('table', { name: 'Classement complet' })).getAllByRole(
      'row',
    );
    expect(rows).toHaveLength(6);
    expect(rows[1]).toHaveTextContent('1Amadou DialloSEN10.38 sOr');
    expect(rows[5]).toHaveTextContent('5Kenji SatoJPN10.55 s');
  });

  it('003-AS5: says the ranking is not published yet for an upcoming event', async () => {
    await open(longueur.id);

    expect(
      await screen.findByRole('heading', { level: 1, name: longueur.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('À venir')).toBeInTheDocument();
    expect(screen.getByText(/16:20/)).toBeInTheDocument();
    expect(screen.getByText('Le classement n’est pas encore publié.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('003-AS6: says the event cannot be found', async () => {
    await open(UNKNOWN_ID);
    expect(await screen.findByRole('alert')).toHaveTextContent('Cette épreuve est introuvable.');
  });
});
