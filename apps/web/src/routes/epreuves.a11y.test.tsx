/** Un audit axe-core de chaque état des écrans Épreuves : liste, liste vide, fiche, fiche sans classement, introuvable. */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { centMetres, longueur, UNKNOWN_ID } from '@/mocks/fixture';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('sport events accessibility', () => {
  it('003-AS1: the list is clean', async () => {
    await renderRoute({ initialEntries: ['/epreuves?day=2026-11-08'] });
    await screen.findByRole('list', { name: 'Épreuves' });
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS1: the empty list is clean', async () => {
    await renderRoute({ initialEntries: ['/epreuves?day=2026-11-13'] });
    await screen.findByText('Aucune épreuve pour ces critères.');
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS4: the detail page with a ranking is clean', async () => {
    await renderRoute({ initialEntries: [`/epreuves/${centMetres.id}`] });
    await screen.findByRole('table', { name: 'Classement complet' });
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS5: the detail page without ranking is clean', async () => {
    await renderRoute({ initialEntries: [`/epreuves/${longueur.id}`] });
    await screen.findByText('Le classement n’est pas encore publié.');
    expect(axeFindings(await runAxe())).toEqual([]);
  });

  it('003-AS6: the not-found detail page is clean', async () => {
    await renderRoute({ initialEntries: [`/epreuves/${UNKNOWN_ID}`] });
    await screen.findByRole('alert');
    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
