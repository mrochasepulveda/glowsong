import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

/**
 * Helper para obtener el cliente de Supabase del lado del servidor.
 * Se espera ser llamado dentro de Route Handlers o Server Actions donde las cookies del User (Owner) existen.
 */
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Se ignora en Route Handlers si ya se enviaron headers
          }
        },
      },
    }
  );
}

/**
 * Obtiene un Access Token válido para el local especificado.
 * Si el token ha expirado o está por expirar en < 5 mins, usa el refresh_token
 * para renovarlo y actualiza la base de datos de manera opaca.
 */
export async function getValidToken(localId: string): Promise<string | null> {
  const supabase = await getSupabase();
  
  const { data: creds, error } = await supabase
    .from('spotify_credentials')
    .select('*')
    .eq('local_id', localId)
    .single();

  if (error || !creds) {
    console.error(`[SpotifyClient] No credentials found for local ${localId}`);
    return null;
  }

  // Verificamos expiración dejando 5 minutos de margen pre-emptive
  const expiresAt = new Date(creds.expires_at).getTime();
  const now = Date.now();
  const margin = 5 * 60 * 1000; // 5 minutos

  if (now > expiresAt - margin) {
    if (!creds.refresh_token) {
      console.error(`[SpotifyClient] No refresh_token for local ${localId}`);
      return null;
    }

    console.log(`[SpotifyClient] Token expired/expiring for local ${localId}, refreshing...`);

    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    try {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: creds.refresh_token,
        }),
      });

      if (!tokenResponse.ok) {
        console.error(`[SpotifyClient] Refresh token failed: ${await tokenResponse.text()}`);
        return null; // El usuario probablemente revocó el acceso desde su cuenta de Spotify
      }

      const tokenData = await tokenResponse.json();
      const newAccessToken = tokenData.access_token;
      // Algunas veces Spotify no devuelve un nuevo refresh_token si el viejo sigue vigente
      const newRefreshToken = tokenData.refresh_token || creds.refresh_token; 
      const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Guardar de vuelta a Supabase
      const { error: updateErr } = await supabase
        .from('spotify_credentials')
        .update({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_at: newExpiresAt,
        })
        .eq('local_id', localId);

      if (updateErr) {
        console.error(`[SpotifyClient] Failed to save updated tokens:`, updateErr);
      }

      return newAccessToken;
    } catch (err) {
      console.error(`[SpotifyClient] Network error during token refresh:`, err);
      return null;
    }
  }

  return creds.access_token;
}

// =========================================================================
// MÉTODOS DE LA API WEB DE SPOTIFY
// Oficial Docs: https://developer.spotify.com/documentation/web-api
// =========================================================================

export async function getCurrentPlayback(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    headers: { Authorization: `Bearer ${token}` },
    // Queremos la data fresh, no cachearla agresivamente
    cache: 'no-store'
  });
  
  if (res.status === 204) {
    // 204 significa que Spotify no tiene ningún dispositivo activo reproduciendo o pausado la cuenta
    return null; 
  }
  
  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }
  
  return res.json();
}

export async function pausePlayback(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // 403 Forbidden a veces se dispara si ya está pausado o el usuario no es Premium
  if (!res.ok && res.status !== 403) { 
    throw new Error(`Spotify pause error: ${res.status}`);
  }
}

export async function resumePlayback(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok && res.status !== 403) {
    throw new Error(`Spotify resume error: ${res.status}`);
  }
}

export async function skipToNext(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/next', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 403) {
    throw new Error(`Spotify skip error: ${res.status}`);
  }
}

export async function getPlaybackQueue(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/queue', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (res.status === 204) {
    return { queue: [] };
  }

  if (!res.ok) {
    console.error(`Spotify queue api error: ${res.status}`);
    return { queue: [] };
  }

  return res.json();
}
