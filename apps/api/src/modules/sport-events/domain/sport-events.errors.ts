import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const SPORT_EVENT_ERROR_KINDS = {
  /** Site absent de SPORT_EVENT_SITES. */
  SPORT_EVENT_SITE_UNKNOWN: 'VALIDATION',
  /** Aucune épreuve n'a cet identifiant. */
  SPORT_EVENT_NOT_FOUND: 'NOT_FOUND',
  /** Une épreuve terminée n'a plus de statut suivant. */
  SPORT_EVENT_ALREADY_FINISHED: 'CONFLICT',
  /** Le classement d'une épreuve ne se publie qu'une fois terminée. */
  SPORT_EVENT_NOT_FINISHED: 'BUSINESS_RULE',
  /** Les rangs ne vont pas de 1 à n sans trou ni doublon. */
  SPORT_EVENT_RANKS_NOT_CONSECUTIVE: 'BUSINESS_RULE',
  /** Le même athlète du même pays est sur deux lignes. */
  SPORT_EVENT_DUPLICATE_ATHLETE: 'BUSINESS_RULE',
  /** L'épreuve a déjà un classement ; sa correction relève de la rectification. */
  SPORT_EVENT_RANKING_ALREADY_PUBLISHED: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type SportEventErrorCode = keyof typeof SPORT_EVENT_ERROR_KINDS;

export class SportEventError extends AppError<SportEventErrorCode> {
  constructor(code: SportEventErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, SPORT_EVENT_ERROR_KINDS[code], message, details);
  }
}

export function sportEventNotFound(id: string): SportEventError {
  return new SportEventError('SPORT_EVENT_NOT_FOUND', `No sport event with id ${id}`, { id });
}

export function rankingAlreadyPublished(id: string): SportEventError {
  return new SportEventError(
    'SPORT_EVENT_RANKING_ALREADY_PUBLISHED',
    `Sport event ${id} already has a ranking`,
    { id },
  );
}
