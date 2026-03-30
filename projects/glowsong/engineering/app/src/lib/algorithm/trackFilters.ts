/**
 * F2 — Track Filters
 * Lógica de filtrado para candidatos de tracks antes de encolar:
 * 1. Filtro de Blocks (track, artist, genre)
 * 2. Ventana de no-repetición de 4 horas
 */

import type { Block, SessionEvent, Genre } from '@/types';

export interface TrackCandidate {
  spotify_track_id: string;
  name: string;
  artist: string;
  genre?: Genre;
}

/**
 * Filtra tracks candidatos por los Blocks activos del local.
 * Aplica filtros de tipo: track, artist, genre.
 *
 * @param candidates - Tracks candidatos de Spotify
 * @param blocks - Blocks activos del local
 * @returns Solo los candidatos que pasan todos los filtros
 */
export function filterByBlocks(
  candidates: TrackCandidate[],
  blocks: Block[]
): TrackCandidate[] {
  const now = Date.now();

  // Solo blocks vigentes (sin expirar, o sin fecha de expiración)
  const activeBlocks = blocks.filter((b) => {
    if (!b.expires_at) return true;
    return new Date(b.expires_at).getTime() > now;
  });

  if (activeBlocks.length === 0) return candidates;

  const blockedTrackIds = new Set<string>();
  const blockedArtists  = new Set<string>();
  const blockedGenres   = new Set<string>();

  for (const block of activeBlocks) {
    if (block.block_type === 'track')  blockedTrackIds.add(block.value.toLowerCase());
    if (block.block_type === 'artist') blockedArtists.add(block.value.toLowerCase());
    if (block.block_type === 'genre')  blockedGenres.add(block.value.toLowerCase());
  }

  return candidates.filter((track) => {
    if (blockedTrackIds.has(track.spotify_track_id.toLowerCase())) return false;
    if (blockedArtists.has(track.artist.toLowerCase())) return false;
    if (track.genre && blockedGenres.has(track.genre.toLowerCase())) return false;
    return true;
  });
}

/**
 * Filtra tracks que ya sonaron en las últimas 4 horas.
 *
 * @param candidates - Tracks candidatos
 * @param recentEvents - SessionEvents de las últimas 4 horas del local
 * @returns Tracks que NO aparecen en los eventos recientes
 */
export function filterByNoRepeatWindow(
  candidates: TrackCandidate[],
  recentEvents: SessionEvent[]
): TrackCandidate[] {
  if (recentEvents.length === 0) return candidates;

  const NO_REPEAT_WINDOW_MS = 4 * 60 * 60 * 1000;
  const cutoff = Date.now() - NO_REPEAT_WINDOW_MS;

  // Tracks reproducidos dentro de la ventana de 4h
  const recentTrackIds = new Set<string>(
    recentEvents
      .filter((e) => new Date(e.played_at).getTime() >= cutoff)
      .map((e) => e.spotify_track_id)
  );

  return candidates.filter(
    (track) => !recentTrackIds.has(track.spotify_track_id)
  );
}

/**
 * Selecciona aleatoriamente N tracks de la lista de candidatos.
 * Usa Fisher-Yates shuffle para distribución uniforme.
 */
export function selectRandomTracks<T>(candidates: T[], count: number): T[] {
  if (candidates.length <= count) return [...candidates];

  const arr = [...candidates];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count);
}

/**
 * Verifica si todos los géneros permitidos están bloqueados.
 * Si es así, el Owner debe ser notificado.
 */
export function areAllGenresBlocked(
  allowedGenres: Genre[],
  blocks: Block[]
): boolean {
  const now = Date.now();
  const activeGenreBlocks = new Set<string>(
    blocks
      .filter((b) => {
        if (b.block_type !== 'genre') return false;
        if (!b.expires_at) return true;
        return new Date(b.expires_at).getTime() > now;
      })
      .map((b) => b.value.toLowerCase())
  );

  return (
    allowedGenres.length > 0 &&
    allowedGenres.every((g) => activeGenreBlocks.has(g.toLowerCase()))
  );
}
