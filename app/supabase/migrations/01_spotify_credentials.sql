-- =========================================================================
-- GLOWSONG - Migración 01: Spotify Credentials
-- Añade la tabla segura para almacenar los tokens de Spotify por local
-- =========================================================================

CREATE TABLE public.spotify_credentials (
    local_id UUID PRIMARY KEY REFERENCES public.locals(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_spotify_credentials_updated_at
    BEFORE UPDATE ON public.spotify_credentials
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.spotify_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
-- 1. EL owner puede LEER las credenciales de su local
CREATE POLICY "Owners can view their local's spotify credentials"
    ON public.spotify_credentials FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = spotify_credentials.local_id
            AND owner_id = auth.uid()
        )
    );

-- 2. El owner (a través del sistema) puede INSERTAR/ACTUALIZAR
CREATE POLICY "Owners can manage their local's spotify credentials"
    ON public.spotify_credentials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.locals
            WHERE id = spotify_credentials.local_id
            AND owner_id = auth.uid()
        )
    );
