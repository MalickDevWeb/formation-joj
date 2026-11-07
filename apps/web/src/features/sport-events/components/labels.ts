import type { Medal, SportEventSite, SportEventStatus } from '@joj/shared';

export const SITE_LABELS: Record<SportEventSite, string> = {
  dakar: 'Dakar',
  diamniadio: 'Diamniadio',
  saly: 'Saly',
};

export const STATUS_LABELS: Record<SportEventStatus, string> = {
  upcoming: 'À venir',
  'in-progress': 'En cours',
  finished: 'Terminée',
};

export const MEDAL_LABELS: Record<Medal, string> = {
  gold: 'Or',
  silver: 'Argent',
  bronze: 'Bronze',
};

// Dakar est à GMT toute l'année : on affiche l'heure GMT, quel que soit le fuseau du visiteur.
const timeFormat = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short', timeZone: 'UTC' });
const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export const formatTime = (iso: string) => timeFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

/** Le jour courant à Dakar, au format `AAAA-MM-JJ`. */
export const today = () => new Date().toISOString().slice(0, 10);
