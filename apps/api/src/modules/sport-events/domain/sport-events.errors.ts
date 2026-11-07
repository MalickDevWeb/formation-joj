import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const SPORT_EVENT_ERROR_KINDS = {
  /** Site absent de SPORT_EVENT_SITES. */
  SPORT_EVENT_SITE_UNKNOWN: 'VALIDATION',
  /** Aucune épreuve n'a cet identifiant. */
  SPORT_EVENT_NOT_FOUND: 'NOT_FOUND',
  /** Une épreuve terminée n'a plus de statut suivant. */
  SPORT_EVENT_ALREADY_FINISHED: 'CONFLICT',
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
