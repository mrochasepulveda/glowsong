-- =========================================================================
-- GLOWSONG - Migración 05: Catálogo de tracks propio
-- Tabla para almacenar tracks libres de derechos (CC0, CC-BY, etc.)
-- Reemplaza la dependencia de Spotify como fuente de música.
-- =========================================================================

-- Tabla principal de tracks del catálogo
CREATE TABLE IF NOT EXISTS public.catalog_tracks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Metadata básica
    title           TEXT NOT NULL,
    artist_name     TEXT NOT NULL,
    album           TEXT,
    album_art_url   TEXT,

    -- Clasificación musical (alineada con el algoritmo existente)
    genre           TEXT NOT NULL,                          -- Uno de los 25 géneros de GENRES_CATALOG
    energy          REAL NOT NULL CHECK (energy >= 0 AND energy <= 1),  -- 0.0 a 1.0
    energy_level    TEXT NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
    tempo_bpm       INTEGER NOT NULL CHECK (tempo_bpm > 0 AND tempo_bpm < 300),
    mood_tags       TEXT[] NOT NULL DEFAULT '{}',           -- ['smooth', 'chill', 'relaxed', ...]

    -- Audio
    file_url        TEXT NOT NULL,                          -- URL en Supabase Storage o CDN
    duration_ms     INTEGER NOT NULL CHECK (duration_ms > 0),
    file_size_bytes INTEGER,

    -- Licencia
    license_type    TEXT NOT NULL CHECK (license_type IN ('cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'royalty-free', 'custom')),
    license_attribution TEXT,                               -- Texto de atribución si la licencia lo requiere
    source_url      TEXT,                                   -- URL original de descarga
    source_platform TEXT,                                   -- 'pixabay', 'fma', 'chosic', 'incompetech', etc.

    -- Estado
    is_active       BOOLEAN NOT NULL DEFAULT true,          -- Para desactivar sin borrar

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para las queries del algoritmo
CREATE INDEX IF NOT EXISTS idx_catalog_tracks_genre ON public.catalog_tracks (genre) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_catalog_tracks_energy ON public.catalog_tracks (energy_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_catalog_tracks_mood ON public.catalog_tracks USING GIN (mood_tags) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_catalog_tracks_active ON public.catalog_tracks (is_active, genre, energy_level);

-- RLS: lectura pública (los tracks son del catálogo global, no de un usuario)
ALTER TABLE public.catalog_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_tracks_read_all" ON public.catalog_tracks
    FOR SELECT USING (true);

-- Solo admins pueden insertar/actualizar (via service_role key en API routes)
CREATE POLICY "catalog_tracks_admin_insert" ON public.catalog_tracks
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "catalog_tracks_admin_update" ON public.catalog_tracks
    FOR UPDATE USING (auth.role() = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_catalog_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catalog_tracks_updated_at
    BEFORE UPDATE ON public.catalog_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_catalog_tracks_updated_at();
