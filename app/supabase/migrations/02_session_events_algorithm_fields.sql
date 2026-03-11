-- ============================================================
-- Migración: Agregar campos del algoritmo a session_events
-- Estos campos permiten persistir metadata del algoritmo
-- para analytics y la ventana de no-repetición.
-- ============================================================

ALTER TABLE public.session_events
  ADD COLUMN IF NOT EXISTS genre TEXT,
  ADD COLUMN IF NOT EXISTS energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'algorithm' CHECK (source IN ('algorithm', 'consumer_vote', 'consumer_paid'));
