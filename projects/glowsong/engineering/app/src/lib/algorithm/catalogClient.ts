/**
 * F2 — Catalog Client
 * Consulta tracks del catálogo propio (Supabase) en vez de Spotify.
 *
 * Reemplaza spotifyClient.ts como fuente de música.
 * El algoritmo (engine.ts) usa la misma interfaz: getRecommendations() → TrackRecommendation[]
 */

import type { EnergyParams } from './timeSlots';
import type { Genre } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogTrack {
  id: string;
  title: string;
  artist_name: string;
  album: string | null;
  album_art_url: string | null;
  genre: string;
  energy: number;
  energy_level: 'low' | 'medium' | 'high';
  tempo_bpm: number;
  mood_tags: string[];
  file_url: string;
  duration_ms: number;
  license_type: string;
  license_attribution: string | null;
}

/**
 * Formato compatible con SpotifyRecommendation para que engine.ts
 * y trackFilters.ts funcionen sin cambios.
 */
export interface TrackRecommendation {
  track_id: string;           // catalog_tracks.id (antes spotify_track_id)
  name: string;
  artist: string;
  album: string;
  album_art_url: string;
  duration_ms: number;
  energy: number;
  tempo: number;
  file_url: string;           // URL para reproducir
  genre: string;
  mood_tags: string[];
  license_type: string;
  license_attribution: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES PÚBLICAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene tracks del catálogo propio que coincidan con los filtros del algoritmo.
 * Drop-in replacement para spotifyClient.getRecommendations()
 */
export async function getCatalogRecommendations(
  genres: string[],
  energyParams: EnergyParams,
  limit: number = 20,
  moodKeywords?: string[]
): Promise<TrackRecommendation[]> {
  const res = await fetch('/api/catalog/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genres, energyParams, moodKeywords, limit }),
  });

  if (!res.ok) {
    console.error(`[CatalogClient] Recommendations error: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.tracks || [];
}

/**
 * Obtiene eventos recientes (últimas 4 horas) para la ventana de no-repetición.
 */
export async function getRecentEvents(localId: string): Promise<Array<{
  track_id: string;
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
 * Persiste un SessionEvent en Supabase.
 */
export async function persistSessionEvent(event: {
  local_id: string;
  track_id: string;
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
    console.error('[CatalogClient] Failed to persist session event:', err);
    return false;
  }
}

/**
 * Convierte TrackRecommendation → TrackCandidate para los filtros
 */
export function toTrackCandidate(rec: TrackRecommendation) {
  return {
    spotify_track_id: rec.track_id,   // Compatible con trackFilters existente
    name: rec.name,
    artist: rec.artist,
    genre: rec.genre as Genre | undefined,
  };
}
