import { pgTable, pgSchema, uuid, varchar, text, integer, boolean, timestamp, real, pgEnum, jsonb, type AnyPgColumn } from 'drizzle-orm/pg-core';

// ---- Riff Schema ----
export const riffSchema = pgSchema('riff');

// ---- Enums ----
export const eventStatusEnum = riffSchema.enum('event_status', [
  'confirmed', 'tentative', 'cancelled', 'sold_out', 'past'
]);

export const notificationChannelEnum = riffSchema.enum('notification_channel', [
  'push', 'email', 'whatsapp'
]);

export const notificationStatusEnum = riffSchema.enum('notification_status', [
  'pending', 'sent', 'failed', 'opened'
]);

export const scrapingSourceTypeEnum = riffSchema.enum('scraping_source_type', [
  'puntoticket', 'ticketmaster', 'instagram', 'facebook', 'website', 'passline', 'ticketplus'
]);

export const scrapingLogStatusEnum = riffSchema.enum('scraping_log_status', [
  'success', 'error', 'partial'
]);

export const signalTypeEnum = riffSchema.enum('signal_type', [
  'view_details', 'save', 'unsave', 'voy', 'skip', 'dismiss'
]);

// ---- Profiles (linked to auth.users in Riff's own Supabase project) ----
export const profiles = riffSchema.table('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id) — Riff-dedicated auth
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  city: varchar('city', { length: 100 }),
  notifyPush: boolean('notify_push').notNull().default(true),
  notifyEmail: boolean('notify_email').notNull().default(true),
  notifyWhatsapp: boolean('notify_whatsapp').notNull().default(false),
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Genres ----
export const genres = riffSchema.table('genres', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  parentId: uuid('parent_id').references((): AnyPgColumn => genres.id),
});

// ---- Artists ----
export const artists = riffSchema.table('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  imageUrl: text('image_url'),
  popularity: integer('popularity'),
  country: varchar('country', { length: 100 }),
  isLocal: boolean('is_local').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Artist Genres (many-to-many) ----
export const artistGenres = riffSchema.table('artist_genres', {
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  genreId: uuid('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
});

// ---- Venues ----
export const venues = riffSchema.table('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  address: text('address'),
  capacity: integer('capacity'),
  imageUrl: text('image_url'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  instagramHandle: varchar('instagram_handle', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Events ----
export const events = riffSchema.table('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  artistId: uuid('artist_id').notNull().references(() => artists.id),
  venueId: uuid('venue_id').notNull().references(() => venues.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  doorsOpen: timestamp('doors_open', { withTimezone: true }),
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  currency: varchar('currency', { length: 3 }).notNull().default('CLP'),
  ticketUrl: text('ticket_url'),
  imageUrl: text('image_url'),
  description: text('description'),
  status: eventStatusEnum('status').notNull().default('confirmed'),
  source: varchar('source', { length: 100 }).notNull(),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- User Artist Follows ----
export const userArtistFollows = riffSchema.table('user_artist_follows', {
  userId: uuid('user_id').notNull(), // References auth.users(id) — Riff-dedicated auth
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- User Genre Preferences ----
export const userGenrePreferences = riffSchema.table('user_genre_preferences', {
  userId: uuid('user_id').notNull(), // References auth.users(id) — Riff-dedicated auth
  genreId: uuid('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Event Interests (user marks interest) ----
export const eventInterests = riffSchema.table('event_interests', {
  userId: uuid('user_id').notNull(), // References auth.users(id) — Riff-dedicated auth
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Notifications ----
export const notifications = riffSchema.table('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users(id) — Riff-dedicated auth
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  channel: notificationChannelEnum('channel').notNull(),
  status: notificationStatusEnum('status').notNull().default('pending'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- User Event Signals (behavioral tracking) ----
export const userEventSignals = riffSchema.table('user_event_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  signalType: signalTypeEnum('signal_type').notNull(),
  value: real('value').notNull().default(1.0),
  context: jsonb('context'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- User Genre Affinity (learned weights) ----
export const userGenreAffinity = riffSchema.table('user_genre_affinity', {
  userId: uuid('user_id').notNull(),
  genreId: uuid('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull().default(1.0),
  signalCount: integer('signal_count').notNull().default(0),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
});

// ---- User Artist Affinity (learned weights) ----
export const userArtistAffinity = riffSchema.table('user_artist_affinity', {
  userId: uuid('user_id').notNull(),
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull().default(0.0),
  signalCount: integer('signal_count').notNull().default(0),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Scraping Sources ----
export const scrapingSources = riffSchema.table('scraping_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: scrapingSourceTypeEnum('type').notNull(),
  url: text('url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  scrapeIntervalMinutes: integer('scrape_interval_minutes').notNull().default(360),
});

// ---- Scraping Logs ----
export const scrapingLogs = riffSchema.table('scraping_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').notNull().references(() => scrapingSources.id, { onDelete: 'cascade' }),
  status: scrapingLogStatusEnum('status').notNull(),
  eventsFound: integer('events_found').notNull().default(0),
  eventsNew: integer('events_new').notNull().default(0),
  errorMessage: text('error_message'),
  durationMs: integer('duration_ms').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
