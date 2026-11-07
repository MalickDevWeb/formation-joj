// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

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
