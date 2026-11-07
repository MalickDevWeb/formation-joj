import { z } from 'zod';

/** Les sites des JOJ Dakar 2026 : liste fermée. */
export const SPORT_EVENT_SITES = ['dakar', 'diamniadio', 'saly'] as const;
export const sportEventSiteSchema = z.enum(SPORT_EVENT_SITES);
export type SportEventSite = z.infer<typeof sportEventSiteSchema>;

/** Dans l'ordre où une épreuve les traverse ; on ne revient jamais en arrière. */
export const SPORT_EVENT_STATUSES = ['upcoming', 'in-progress', 'finished'] as const;
export const sportEventStatusSchema = z.enum(SPORT_EVENT_STATUSES);
export type SportEventStatus = z.infer<typeof sportEventStatusSchema>;

export const SPORT_EVENT_TEXT_MAX_LENGTH = 100;

/** Corps de `POST /api/sport-events`. */
export const createSportEventSchema = z.object({
  name: z.string().trim().min(1).max(SPORT_EVENT_TEXT_MAX_LENGTH),
  discipline: z.string().trim().min(1).max(SPORT_EVENT_TEXT_MAX_LENGTH),
  site: sportEventSiteSchema,
  startsAt: z.iso.datetime(),
});
export type CreateSportEventInput = z.infer<typeof createSportEventSchema>;

/** Paramètre `:id` des routes d'une épreuve. */
export const sportEventIdParamsSchema = z.object({ id: z.uuid() });

/** Une épreuve telle que l'API la renvoie. */
export const sportEventSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  discipline: z.string(),
  site: sportEventSiteSchema,
  startsAt: z.iso.datetime(),
  status: sportEventStatusSchema,
  createdAt: z.iso.datetime(),
});
export type SportEventResponse = z.infer<typeof sportEventSchema>;
