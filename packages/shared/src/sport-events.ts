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

/** Les médailles des rangs 1, 2 et 3 ; les rangs suivants n'en ont pas. */
export const MEDALS = ['gold', 'silver', 'bronze'] as const;
export const medalSchema = z.enum(MEDALS);
export type Medal = z.infer<typeof medalSchema>;

/** Une ligne du classement telle que le responsable la saisit. */
export const rankingLineSchema = z.object({
  rank: z.number().int().min(1),
  athlete: z.string().trim().min(1).max(SPORT_EVENT_TEXT_MAX_LENGTH),
  country: z.string().regex(/^[A-Z]{3}$/),
  performance: z.string().trim().min(1).max(50),
});
export type RankingLineInput = z.infer<typeof rankingLineSchema>;

/**
 * Corps de `POST /api/sport-events/:id/ranking`. La suite des rangs et l'unicité des athlètes
 * sont des règles métier, vérifiées par le domaine.
 */
export const publishRankingSchema = z.object({ lines: z.array(rankingLineSchema).min(1) });
export type PublishRankingInput = z.infer<typeof publishRankingSchema>;

/** Une épreuve telle que l'API la renvoie. */
export const sportEventSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  discipline: z.string(),
  site: sportEventSiteSchema,
  startsAt: z.iso.datetime(),
  status: sportEventStatusSchema,
  /** Trié par rang ; `null` tant que le classement n'est pas publié. */
  ranking: z.array(rankingLineSchema.extend({ medal: medalSchema.nullable() })).nullable(),
  createdAt: z.iso.datetime(),
});
export type SportEventResponse = z.infer<typeof sportEventSchema>;
