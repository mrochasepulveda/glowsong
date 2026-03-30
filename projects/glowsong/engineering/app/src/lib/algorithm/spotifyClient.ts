/**
 * F2 — Spotify Client (App-side wrapper)
 * Llamadas reales a la API de Spotify via endpoints proxy del backend.
 *
 * Todas las funciones usan fetch() a /api/algorithm/* que a su vez
 * llaman a la API de Spotify con el token del local.
 */

import type { TrackCandidate } from './trackFilters';
import type { EnergyParams } from './timeSlots';

export interface SpotifyRecommendation {
  spotify_track_id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url: string;
  duration_ms: number;
  energy: number;
  tempo: number;
}

/**
 * Obtiene recomendaciones de Spotify via el proxy backend.
 * El backend maneja auth, token refresh, y rate limiting.
 */
export async function getRecommendations(
  seedGenres: string[],
  energyParams: EnergyParams,
  limit: number = 20,
  localId: string = '',
  moodKeywords?: string[]
): Promise<SpotifyRecommendation[]> {
  const res = await fetch('/api/algorithm/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId, seedGenres, energyParams, moodKeywords, limit }),
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '5');
    console.warn(`[SpotifyClient] Rate limited, retry after ${retryAfter}s`);
    throw new RateLimitError(retryAfter);
  }

  if (!res.ok) {
    console.error(`[SpotifyClient] Recommendations error: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.tracks || [];
}

/**
 * Encola un track en el player de Spotify via el proxy backend.
 */
export async function enqueueTrack(
  trackId: string,
  localId: string,
  deviceId: string | null
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/algorithm/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      localId,
      trackUri: trackId,
      deviceId,
    }),
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '5');
    return { success: false, error: `Rate limited. Retry after ${retryAfter}s` };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error || `HTTP ${res.status}` };
  }

  return { success: true };
}

export interface BatchEnqueueResult {
  trackId: string;
  success: boolean;
  error?: string;
}

/**
 * Encola MÚLTIPLES tracks con UNA sola llamada de auth/token.
 * Mucho más eficiente que llamar enqueueTrack() N veces.
 */
export async function enqueueBatch(
  trackIds: string[],
  localId: string,
  deviceId: string | null
): Promise<BatchEnqueueResult[]> {
  const start = Date.now();
  try {
    const res = await fetch('/api/algorithm/enqueue-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId, trackIds, deviceId }),
    });

    if (!res.ok) {
      console.error(`[SpotifyClient] Batch enqueue error: ${res.status} (${Date.now() - start}ms)`);
      return trackIds.map(id => ({ trackId: id, success: false, error: `HTTP ${res.status}` }));
    }

    const data = await res.json();
    console.log(`[SpotifyClient] Batch enqueue: ${data.results?.filter((r: BatchEnqueueResult) => r.success).length}/${trackIds.length} OK (${Date.now() - start}ms)`);
    return data.results || [];
  } catch (err) {
    console.error(`[SpotifyClient] Batch enqueue network error (${Date.now() - start}ms):`, err);
    return trackIds.map(id => ({ trackId: id, success: false, error: 'network_error' }));
  }
}

/**
 * Persiste un SessionEvent en Supabase via el proxy backend.
 * Nunca detiene la reproducción si falla.
 */
export async function persistSessionEvent(event: {
  local_id: string;
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  album_art_url?: string;
  duration_ms?: number;
  genre?: string;
  energy_level?: string;
  time_slot?: string;
  day_of_week?: number;
  source?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/algorithm/session-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.ok;
  } catch (err) {
    console.error('[SpotifyClient] Failed to persist session event:', err);
    return false;
  }
}

/**
 * Obtiene eventos recientes (últimas 4 horas) para la ventana de no-repetición.
 */
export async function getRecentEvents(localId: string): Promise<Array<{
  spotify_track_id: string;
  played_at: string;
  track_name: string;
  artist_name: string;
}>> {
  try {
    const res = await fetch(`/api/algorithm/recent-events?localId=${localId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch {
    return [];
  }
}

/**
 * Convierte SpotifyRecommendation → TrackCandidate para el filtro
 */
export function toTrackCandidate(rec: SpotifyRecommendation): TrackCandidate {
  return {
    spotify_track_id: rec.spotify_track_id,
    name: rec.name,
    artist: rec.artist,
  };
}

/**
 * Error específico para rate limiting de Spotify (429).
 */
export class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(retryAfter: number) {
    super(`Rate limited. Retry after ${retryAfter}s`);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfter;
  }
}
