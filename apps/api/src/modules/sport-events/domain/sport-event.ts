import {
  SPORT_EVENT_SITES,
  SPORT_EVENT_STATUSES,
  type SportEventSite,
  type SportEventStatus,
} from '@joj/shared';
import { SportEventError } from './sport-events.errors';

export interface SportEventProps {
  id: string;
  name: string;
  discipline: string;
  site: SportEventSite;
  startsAt: Date;
  status: SportEventStatus;
  createdAt: Date;
}

export interface NewSportEvent {
  id: string;
  name: string;
  discipline: string;
  /** Vérifié ici : le domaine ne fait pas confiance à la validation HTTP. */
  site: string;
  startsAt: Date;
  now: Date;
}

/** Une épreuve des JOJ : elle naît à venir, et son statut n'avance que d'une étape à la fois. */
export class SportEvent {
  private constructor(private props: SportEventProps) {}

  static create({ id, name, discipline, site, startsAt, now }: NewSportEvent): SportEvent {
    return new SportEvent({
      id,
      name: name.trim(),
      discipline: discipline.trim(),
      site: validSite(site),
      startsAt,
      status: 'upcoming',
      createdAt: now,
    });
  }

  /** Reconstruit une épreuve depuis la persistance, sans rejouer les règles de création. */
  static restore(props: SportEventProps): SportEvent {
    return new SportEvent({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get discipline(): string {
    return this.props.discipline;
  }

  get site(): SportEventSite {
    return this.props.site;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get status(): SportEventStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** Seul geste possible sur le statut : passer au suivant, ce qui exclut tout retour en arrière. */
  advance(): void {
    const next = SPORT_EVENT_STATUSES[SPORT_EVENT_STATUSES.indexOf(this.props.status) + 1];
    if (next === undefined) {
      throw new SportEventError(
        'SPORT_EVENT_ALREADY_FINISHED',
        `Sport event ${this.props.id} is already finished`,
        { id: this.props.id },
      );
    }
    this.props = { ...this.props, status: next };
  }
}

function validSite(site: string): SportEventSite {
  if (!(SPORT_EVENT_SITES as readonly string[]).includes(site)) {
    throw new SportEventError('SPORT_EVENT_SITE_UNKNOWN', `Unknown site ${site}`, {
      site,
      allowed: SPORT_EVENT_SITES,
    });
  }
  return site as SportEventSite;
}
