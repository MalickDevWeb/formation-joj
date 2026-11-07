// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const sportEvents = pgTable('sport_events', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  // Texte libre tant que les disciplines n'existent pas dans cette base.
  discipline: varchar('discipline', { length: 100 }).notNull(),
  // La liste des sites et l'ordre des statuts sont vérifiés par le domaine.
  site: varchar('site', { length: 20 }).notNull(),
  // Précision milliseconde = celle de Date en JavaScript.
  startsAt: timestamp('starts_at', { withTimezone: true, precision: 3 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
});

export type SportEventRow = typeof sportEvents.$inferSelect;

export const RANKING_LINES_PK = 'ranking_lines_pkey';
export const RANKING_LINES_ATHLETE_KEY = 'ranking_lines_athlete_key';

export const rankingLines = pgTable(
  'ranking_lines',
  {
    sportEventId: uuid('sport_event_id')
      .notNull()
      .references(() => sportEvents.id),
    rank: integer('rank').notNull(),
    athlete: varchar('athlete', { length: 100 }).notNull(),
    country: varchar('country', { length: 3 }).notNull(),
    performance: varchar('performance', { length: 50 }).notNull(),
  },
  (table) => [
    // Un rang par épreuve : protège aussi contre deux publications simultanées.
    primaryKey({ name: RANKING_LINES_PK, columns: [table.sportEventId, table.rank] }),
    uniqueIndex(RANKING_LINES_ATHLETE_KEY).on(table.sportEventId, table.athlete, table.country),
  ],
);

export type RankingLineRow = typeof rankingLines.$inferSelect;
