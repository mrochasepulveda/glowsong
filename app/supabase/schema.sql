-- ============================================================
-- GLOWSONG — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: locals
-- Un local por owner. El owner es el auth.user de Supabase.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.locals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('bar','pub','cocteleria','cerveceria','restaurante','discoteca','otro')),
  address           TEXT,
  city              TEXT DEFAULT 'Santiago',
  capacity          INT,
  status            TEXT NOT NULL DEFAULT 'pending_spotify'
                    CHECK (status IN ('pending_spotify','configured','active','inactive')),
  spotify_device_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cada owner puede tener solo un local en MVP 1
CREATE UNIQUE INDEX IF NOT EXISTS locals_owner_id_idx ON public.locals(owner_id);

-- RLS: Solo el owner puede ver y modificar su local
ALTER TABLE public.locals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner puede ver su local"
  ON public.locals FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner puede crear su local"
  ON public.locals FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner puede actualizar su local"
  ON public.locals FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================================
-- TABLA: music_profiles
-- Un perfil musical por local. Géneros, restricciones, horarios.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.music_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id          UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  genres            TEXT[] NOT NULL DEFAULT '{}',
  energy_level      TEXT NOT NULL DEFAULT 'auto'
                    CHECK (energy_level IN ('low','medium','high','auto')),
  bpm_min           INT DEFAULT 80,
  bpm_max           INT DEFAULT 160,
  popularity_min    INT DEFAULT 30 CHECK (popularity_min BETWEEN 0 AND 100),
  explicit_allowed  BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS music_profiles_local_id_idx ON public.music_profiles(local_id);

ALTER TABLE public.music_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner puede ver su music_profile"
  ON public.music_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = music_profiles.local_id
        AND locals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner puede insertar su music_profile"
  ON public.music_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = music_profiles.local_id
        AND locals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner puede actualizar su music_profile"
  ON public.music_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = music_profiles.local_id
        AND locals.owner_id = auth.uid()
    )
  );

-- ============================================================
-- TABLA: blocks
-- Canciones, artistas o géneros bloqueados por el owner.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id      UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('genre','artist','track')),
  scope         TEXT NOT NULL DEFAULT 'permanent' CHECK (scope IN ('permanent','session')),
  value         TEXT NOT NULL,          -- spotify_id para track/artist, genre string para genre
  display_name  TEXT NOT NULL,          -- Nombre legible para mostrar en UI
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS blocks_local_type_value_idx
  ON public.blocks(local_id, type, value);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner puede ver sus blocks"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = blocks.local_id
        AND locals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner puede crear blocks"
  ON public.blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = blocks.local_id
        AND locals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner puede eliminar sus blocks"
  ON public.blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = blocks.local_id
        AND locals.owner_id = auth.uid()
    )
  );

-- ============================================================
-- TABLA: session_events
-- Log append-only de lo que sonó. No se modifica, solo INSERT.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  local_id        UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
  spotify_track_id TEXT NOT NULL,
  track_name      TEXT NOT NULL,
  artist_name     TEXT NOT NULL,
  album_art_url   TEXT,
  duration_ms     INT,
  time_slot       TEXT CHECK (time_slot IN ('opening','afternoon','early_night','peak_night','closing')),
  day_of_week     SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Domingo, 1=Lunes...
  played_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para queries de historial
CREATE INDEX IF NOT EXISTS session_events_local_played_at_idx
  ON public.session_events(local_id, played_at DESC);

ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner puede ver sus session_events"
  ON public.session_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = session_events.local_id
        AND locals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner puede insertar session_events"
  ON public.session_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locals
      WHERE locals.id = session_events.local_id
        AND locals.owner_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locals_updated_at
  BEFORE UPDATE ON public.locals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER music_profiles_updated_at
  BEFORE UPDATE ON public.music_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- VISTA: dashboard_state
-- Datos agregados que necesita el Dashboard en una sola query
-- ============================================================
CREATE OR REPLACE VIEW public.dashboard_state AS
SELECT
  l.id           AS local_id,
  l.name         AS local_name,
  l.status       AS local_status,
  l.owner_id,
  mp.genres,
  mp.energy_level,
  mp.explicit_allowed,
  (SELECT COUNT(*) FROM public.blocks b WHERE b.local_id = l.id) AS blocks_count
FROM public.locals l
LEFT JOIN public.music_profiles mp ON mp.local_id = l.id;
