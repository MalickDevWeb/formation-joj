import {
  MEDALS,
  SPORT_EVENT_SITES,
  SPORT_EVENT_STATUSES,
  type Medal,
  type SportEventSite,
  type SportEventStatus,
} from '@joj/shared';
import { rankingAlreadyPublished, SportEventError } from './sport-events.errors';

export interface NewRankingLine {
  rank: number;
  athlete: string;
  country: string;
  performance: string;
}

export interface RankingLine extends NewRankingLine {
  medal: Medal | null;
}

export interface SportEventProps {
  id: string;
  name: string;
  discipline: string;
  site: SportEventSite;
  startsAt: Date;
  status: SportEventStatus;
  /** Trié par rang ; `null` tant que le classement n'est pas publié. */
  ranking: NewRankingLine[] | null;
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
      ranking: null,
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

  /** La médaille se déduit du rang : elle n'est jamais saisie. */
  get ranking(): RankingLine[] | null {
    return this.props.ranking?.map((line) => ({ ...line, medal: medalOf(line.rank) })) ?? null;
  }

  /** Un classement ne sort que complet et cohérent, une seule fois, pour une épreuve terminée. */
  publishRanking(lines: NewRankingLine[]): void {
    if (this.props.ranking !== null) throw rankingAlreadyPublished(this.props.id);
    if (this.props.status !== 'finished') {
      throw new SportEventError(
        'SPORT_EVENT_NOT_FINISHED',
        `Sport event ${this.props.id} is not finished yet`,
        { id: this.props.id, status: this.props.status },
      );
    }
    const sorted = [...lines].sort((a, b) => a.rank - b.rank);
    assertConsecutiveRanks(sorted);
    assertDistinctAthletes(sorted);
    this.props = { ...this.props, ranking: sorted };
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

/** Rangs 1, 2 et 3 : or, argent, bronze ; aucune médaille au-delà. */
export function medalOf(rank: number): Medal | null {
  return MEDALS[rank - 1] ?? null;
}

function assertConsecutiveRanks(sorted: NewRankingLine[]): void {
  const ranks = sorted.map((line) => line.rank);
  if (ranks.some((rank, index) => rank !== index + 1)) {
    throw new SportEventError(
      'SPORT_EVENT_RANKS_NOT_CONSECUTIVE',
      'Ranks must follow each other from 1, without gap or duplicate',
      { ranks },
    );
  }
}

function assertDistinctAthletes(lines: NewRankingLine[]): void {
  const seen = new Set<string>();
  for (const { athlete, country } of lines) {
    const key = `${athlete}|${country}`;
    if (seen.has(key)) {
      throw new SportEventError(
        'SPORT_EVENT_DUPLICATE_ATHLETE',
        `${athlete} (${country}) appears twice in the ranking`,
        { athlete, country },
      );
    }
    seen.add(key);
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
