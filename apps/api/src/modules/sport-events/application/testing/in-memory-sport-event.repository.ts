import { SportEvent } from '../../domain/sport-event';
import { SportEventRepository } from '../sport-event.repository';

/** Fake fidèle au contrat du port, pour tester l'application sans base. */
export class InMemorySportEventRepository extends SportEventRepository {
  private readonly rows = new Map<string, SportEvent>();

  async findById(id: string): Promise<SportEvent | null> {
    const found = this.rows.get(id);
    return found ? clone(found) : null;
  }

  async insert(sportEvent: SportEvent): Promise<void> {
    this.rows.set(sportEvent.id, clone(sportEvent));
  }

  async update(sportEvent: SportEvent): Promise<void> {
    if (!this.rows.has(sportEvent.id)) return;
    this.rows.set(sportEvent.id, clone(sportEvent));
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function clone(sportEvent: SportEvent): SportEvent {
  return SportEvent.restore({
    id: sportEvent.id,
    name: sportEvent.name,
    discipline: sportEvent.discipline,
    site: sportEvent.site,
    startsAt: sportEvent.startsAt,
    status: sportEvent.status,
    ranking: sportEvent.ranking?.map(({ medal: _medal, ...line }) => line) ?? null,
    createdAt: sportEvent.createdAt,
  });
}
