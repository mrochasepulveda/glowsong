-- =========================================================================
-- GLOWSONG - Migración 04: Horario de operación
-- Agrega hora de apertura y cierre al local
-- =========================================================================

ALTER TABLE public.locals
    ADD COLUMN IF NOT EXISTS open_time  TEXT DEFAULT '12:00',
    ADD COLUMN IF NOT EXISTS close_time TEXT DEFAULT '02:00';
