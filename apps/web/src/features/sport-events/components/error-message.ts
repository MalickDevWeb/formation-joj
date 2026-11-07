import { ApiError } from '@/lib/api';

/** Messages affichés pour les codes d'erreur de l'API ; les autres gardent un message générique. */
const ERROR_MESSAGES: Record<string, string> = {
  SPORT_EVENT_NOT_FOUND: 'Cette épreuve est introuvable.',
};

export function errorMessage(error: unknown): string {
  return (
    (error instanceof ApiError && ERROR_MESSAGES[error.code]) ||
    'Une erreur est survenue. Réessayez.'
  );
}
