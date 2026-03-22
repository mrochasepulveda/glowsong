-- =========================================================================
-- GLOWSONG - Migración 03: Weekly Planner
-- Tablas para la planificación semanal de música por día y franja horaria
-- =========================================================================

-- ---------------------------------------------------------------------------
-- 1. weekly_day_status: estado de apertura/cierre por día de la semana
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_day_status (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    local_id    UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Lun, ..., 6=Sáb
    is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    UNIQUE(local_id, day_of_week)
);

ALTER TABLE public.weekly_day_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their weekly day status"
    ON public.weekly_day_status FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_day_status.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert their weekly day status"
    ON public.weekly_day_status FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_day_status.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their weekly day status"
    ON public.weekly_day_status FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_day_status.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete their weekly day status"
    ON public.weekly_day_status FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_day_status.local_id
            AND owner_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- 2. weekly_slot_overrides: overrides de géneros/energía por día + franja
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_slot_overrides (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    local_id     UUID NOT NULL REFERENCES public.locals(id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    time_slot    TEXT NOT NULL CHECK (time_slot IN ('opening', 'afternoon', 'early_night', 'peak_night', 'closing')),
    is_closed    BOOLEAN NOT NULL DEFAULT FALSE,
    genres       TEXT[],          -- NULL = usar perfil default del local
    energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high', 'auto')), -- NULL = usar default
    created_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    UNIQUE(local_id, day_of_week, time_slot)
);

-- Trigger para updated_at
CREATE TRIGGER update_weekly_slot_overrides_updated_at
    BEFORE UPDATE ON public.weekly_slot_overrides
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.weekly_slot_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their weekly slot overrides"
    ON public.weekly_slot_overrides FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_slot_overrides.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert their weekly slot overrides"
    ON public.weekly_slot_overrides FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_slot_overrides.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their weekly slot overrides"
    ON public.weekly_slot_overrides FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_slot_overrides.local_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete their weekly slot overrides"
    ON public.weekly_slot_overrides FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = weekly_slot_overrides.local_id
            AND owner_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- 3. Índices para queries frecuentes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_weekly_day_status_local
    ON public.weekly_day_status(local_id);

CREATE INDEX IF NOT EXISTS idx_weekly_slot_overrides_local
    ON public.weekly_slot_overrides(local_id);

CREATE INDEX IF NOT EXISTS idx_weekly_slot_overrides_local_day
    ON public.weekly_slot_overrides(local_id, day_of_week);
