import pg from 'pg';
import { config } from '../config/env.js';

/**
 * Database migration script
 * Creates the 'riff' schema and all tables needed for Riff
 * Uses a DEDICATED Supabase project (separate from Glowsong)
 * auth.users is Riff-only — no shared users across products
 * Run with: npm run db:migrate
 */
async function migrate() {
  const client = new pg.Client({ connectionString: config.database.url });

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // ---- Create schema ----
    await client.query(`CREATE SCHEMA IF NOT EXISTS riff;`);
    console.log('  ✅ Schema "riff" ready');

    await client.query(`
      -- Enums (created in riff schema)
      DO $$ BEGIN
        CREATE TYPE riff.event_status AS ENUM ('confirmed', 'tentative', 'cancelled', 'sold_out', 'past');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE riff.notification_channel AS ENUM ('push', 'email', 'whatsapp');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE riff.notification_status AS ENUM ('pending', 'sent', 'failed', 'opened');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE riff.scraping_source_type AS ENUM ('puntoticket', 'ticketmaster', 'instagram', 'facebook', 'website', 'passline', 'ticketplus');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE riff.scraping_log_status AS ENUM ('success', 'error', 'partial');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      -- ================================================================
      -- User Profiles (linked to auth.users from Supabase Auth)
      -- Riff has its own dedicated Supabase project and auth.users.
      -- No user data is shared with Glowsong.
      -- ================================================================
      CREATE TABLE IF NOT EXISTS riff.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        display_name VARCHAR(255),
        avatar_url TEXT,
        city VARCHAR(100),
        notify_push BOOLEAN NOT NULL DEFAULT true,
        notify_email BOOLEAN NOT NULL DEFAULT true,
        notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Genres
      CREATE TABLE IF NOT EXISTS riff.genres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        parent_id UUID REFERENCES riff.genres(id)
      );

      -- Artists
      CREATE TABLE IF NOT EXISTS riff.artists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        popularity INTEGER,
        country VARCHAR(100),
        is_local BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Artist Genres (many-to-many)
      CREATE TABLE IF NOT EXISTS riff.artist_genres (
        artist_id UUID NOT NULL REFERENCES riff.artists(id) ON DELETE CASCADE,
        genre_id UUID NOT NULL REFERENCES riff.genres(id) ON DELETE CASCADE,
        PRIMARY KEY (artist_id, genre_id)
      );

      -- Venues
      CREATE TABLE IF NOT EXISTS riff.venues (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT,
        capacity INTEGER,
        image_url TEXT,
        latitude REAL,
        longitude REAL,
        instagram_handle VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Events
      CREATE TABLE IF NOT EXISTS riff.events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        artist_id UUID NOT NULL REFERENCES riff.artists(id),
        venue_id UUID NOT NULL REFERENCES riff.venues(id),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        doors_open TIMESTAMP WITH TIME ZONE,
        price_min INTEGER,
        price_max INTEGER,
        currency VARCHAR(3) NOT NULL DEFAULT 'CLP',
        ticket_url TEXT,
        image_url TEXT,
        description TEXT,
        status riff.event_status NOT NULL DEFAULT 'confirmed',
        source VARCHAR(100) NOT NULL,
        source_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- User Artist Follows
      CREATE TABLE IF NOT EXISTS riff.user_artist_follows (
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        artist_id UUID NOT NULL REFERENCES riff.artists(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, artist_id)
      );

      -- User Genre Preferences
      CREATE TABLE IF NOT EXISTS riff.user_genre_preferences (
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        genre_id UUID NOT NULL REFERENCES riff.genres(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, genre_id)
      );

      -- Event Interests
      CREATE TABLE IF NOT EXISTS riff.event_interests (
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        event_id UUID NOT NULL REFERENCES riff.events(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, event_id)
      );

      -- Notifications
      CREATE TABLE IF NOT EXISTS riff.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        event_id UUID NOT NULL REFERENCES riff.events(id) ON DELETE CASCADE,
        channel riff.notification_channel NOT NULL,
        status riff.notification_status NOT NULL DEFAULT 'pending',
        sent_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Scraping Sources
      CREATE TABLE IF NOT EXISTS riff.scraping_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type riff.scraping_source_type NOT NULL,
        url TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_scraped_at TIMESTAMP WITH TIME ZONE,
        scrape_interval_minutes INTEGER NOT NULL DEFAULT 360
      );

      -- Scraping Logs
      CREATE TABLE IF NOT EXISTS riff.scraping_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id UUID NOT NULL REFERENCES riff.scraping_sources(id) ON DELETE CASCADE,
        status riff.scraping_log_status NOT NULL,
        events_found INTEGER NOT NULL DEFAULT 0,
        events_new INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- ================================================================
      -- Signal System (behavioral learning)
      -- ================================================================
      DO $$ BEGIN
        CREATE TYPE riff.signal_type AS ENUM ('view_details', 'save', 'unsave', 'voy', 'skip', 'dismiss');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      -- Raw signals: every user action on an event
      CREATE TABLE IF NOT EXISTS riff.user_event_signals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        event_id UUID NOT NULL REFERENCES riff.events(id) ON DELETE CASCADE,
        artist_id UUID NOT NULL REFERENCES riff.artists(id) ON DELETE CASCADE,
        signal_type riff.signal_type NOT NULL,
        value REAL NOT NULL DEFAULT 1.0,
        context JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Learned genre weights per user (recomputed on signal)
      CREATE TABLE IF NOT EXISTS riff.user_genre_affinity (
        user_id UUID NOT NULL,
        genre_id UUID NOT NULL REFERENCES riff.genres(id) ON DELETE CASCADE,
        weight REAL NOT NULL DEFAULT 1.0,
        signal_count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, genre_id)
      );

      -- Learned artist weights per user (recomputed on signal)
      CREATE TABLE IF NOT EXISTS riff.user_artist_affinity (
        user_id UUID NOT NULL,
        artist_id UUID NOT NULL REFERENCES riff.artists(id) ON DELETE CASCADE,
        weight REAL NOT NULL DEFAULT 0.0,
        signal_count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, artist_id)
      );

      -- ================================================================
      -- Indexes
      -- ================================================================
      CREATE INDEX IF NOT EXISTS idx_riff_events_date ON riff.events(date);
      CREATE INDEX IF NOT EXISTS idx_riff_events_artist ON riff.events(artist_id);
      CREATE INDEX IF NOT EXISTS idx_riff_events_venue ON riff.events(venue_id);
      CREATE INDEX IF NOT EXISTS idx_riff_events_status ON riff.events(status);
      CREATE INDEX IF NOT EXISTS idx_riff_notifications_user ON riff.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_riff_notifications_event ON riff.notifications(event_id);
      CREATE INDEX IF NOT EXISTS idx_riff_notifications_status ON riff.notifications(status);
      CREATE INDEX IF NOT EXISTS idx_riff_user_follows_user ON riff.user_artist_follows(user_id);
      CREATE INDEX IF NOT EXISTS idx_riff_user_follows_artist ON riff.user_artist_follows(artist_id);
      CREATE INDEX IF NOT EXISTS idx_riff_scraping_logs_source ON riff.scraping_logs(source_id);
      CREATE INDEX IF NOT EXISTS idx_riff_signals_user ON riff.user_event_signals(user_id);
      CREATE INDEX IF NOT EXISTS idx_riff_signals_user_artist ON riff.user_event_signals(user_id, artist_id);
      CREATE INDEX IF NOT EXISTS idx_riff_signals_user_type ON riff.user_event_signals(user_id, signal_type);
      CREATE INDEX IF NOT EXISTS idx_riff_genre_affinity_user ON riff.user_genre_affinity(user_id);
      CREATE INDEX IF NOT EXISTS idx_riff_artist_affinity_user ON riff.user_artist_affinity(user_id);

      -- ================================================================
      -- Auto-create Riff profile when a user signs up via Supabase Auth
      -- ================================================================
      CREATE OR REPLACE FUNCTION riff.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO riff.profiles (id, display_name, avatar_url)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
          NEW.raw_user_meta_data->>'avatar_url'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop trigger if exists, then recreate
      DROP TRIGGER IF EXISTS on_auth_user_created_riff ON auth.users;
      CREATE TRIGGER on_auth_user_created_riff
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION riff.handle_new_user();

      -- ================================================================
      -- RLS Policies (basic security)
      -- ================================================================
      ALTER TABLE riff.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE riff.user_artist_follows ENABLE ROW LEVEL SECURITY;
      ALTER TABLE riff.user_genre_preferences ENABLE ROW LEVEL SECURITY;
      ALTER TABLE riff.event_interests ENABLE ROW LEVEL SECURITY;
      ALTER TABLE riff.notifications ENABLE ROW LEVEL SECURITY;

      -- Profiles: users can read/update their own profile
      DROP POLICY IF EXISTS "Users can view own profile" ON riff.profiles;
      CREATE POLICY "Users can view own profile" ON riff.profiles
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update own profile" ON riff.profiles;
      CREATE POLICY "Users can update own profile" ON riff.profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Public read access for artists, venues, events, genres
      ALTER TABLE riff.artists ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read artists" ON riff.artists;
      CREATE POLICY "Public read artists" ON riff.artists
        FOR SELECT USING (true);

      ALTER TABLE riff.venues ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read venues" ON riff.venues;
      CREATE POLICY "Public read venues" ON riff.venues
        FOR SELECT USING (true);

      ALTER TABLE riff.events ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read events" ON riff.events;
      CREATE POLICY "Public read events" ON riff.events
        FOR SELECT USING (true);

      ALTER TABLE riff.genres ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read genres" ON riff.genres;
      CREATE POLICY "Public read genres" ON riff.genres
        FOR SELECT USING (true);

      ALTER TABLE riff.artist_genres ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public read artist_genres" ON riff.artist_genres;
      CREATE POLICY "Public read artist_genres" ON riff.artist_genres
        FOR SELECT USING (true);

      -- User follows: users manage their own follows
      DROP POLICY IF EXISTS "Users manage own follows" ON riff.user_artist_follows;
      CREATE POLICY "Users manage own follows" ON riff.user_artist_follows
        FOR ALL USING (auth.uid() = user_id);

      -- User genre prefs: users manage their own prefs
      DROP POLICY IF EXISTS "Users manage own genre prefs" ON riff.user_genre_preferences;
      CREATE POLICY "Users manage own genre prefs" ON riff.user_genre_preferences
        FOR ALL USING (auth.uid() = user_id);

      -- Event interests: users manage their own interests
      DROP POLICY IF EXISTS "Users manage own event interests" ON riff.event_interests;
      CREATE POLICY "Users manage own event interests" ON riff.event_interests
        FOR ALL USING (auth.uid() = user_id);

      -- Notifications: users see their own notifications
      DROP POLICY IF EXISTS "Users view own notifications" ON riff.notifications;
      CREATE POLICY "Users view own notifications" ON riff.notifications
        FOR SELECT USING (auth.uid() = user_id);
    `);

    console.log('✅ All tables, indexes, triggers, and RLS policies created successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
