/**
 * F2 — Algorithm Engine (Orchestrator)
 * Motor central del Algoritmo de Playlist Inteligente de Glowsong.
 *
 * Opera en ciclos: detecta cuándo quedan menos de 5 tracks en cola
 * y encola automáticamente hasta llegar a 10.
 *
 * Reglas críticas (del PRD F2):
 * - Máximo 10 tracks encolados adelantados
 * - Ventana de no-repetición: 4 horas
 * - Al menos 3 géneros pasando filtros o el sistema notifica al Owner
 * - Todo async, nunca bloquear hilo principal
 * - SessionEvents: SOLO INSERT, jamás UPDATE ni DELETE
 */

import type { MusicProfile, Block, SessionEvent, Genre } from '@/types';
import { getCurrentTimeSlot, getEnergyParamsForSlot, type TimeSlot } from './timeSlots';
import { genresToSpotifySeeds, RELATED_GENRES } from './genreMapping';
import { filterByBlocks, filterByNoRepeatWindow, selectRandomTracks, areAllGenresBlocked } from './trackFilters';
import {
  getRecommendations,
  enqueueBatch,
  toTrackCandidate,
  type SpotifyRecommendation,
} from './spotifyClient';
import { getMoodForSlot } from './moodPresets';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS INTERNOS DEL MOTOR
// ─────────────────────────────────────────────────────────────────────────────

export type AlgorithmStatus =
  | 'idle'
  | 'running'
  | 'enqueueing'
  | 'waiting_device'
  | 'all_genres_blocked'
  | 'empty_catalog'
  | 'rate_limited'
  | 'error';

export interface AlgorithmState {
  status: AlgorithmStatus;
  currentSlot: TimeSlot;
  queueCount: number;
  lastEnqueuedAt: Date | null;
  recentlyEnqueued: SpotifyRecommendation[];
  warningMessage: string | null;
  lastError: string | null;
}

export interface EnqueueCycleResult {
  enqueuedCount: number;
  skippedCount: number;
  failedCount: number;
  enqueuedTracks: SpotifyRecommendation[];
  warning: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const MAX_QUEUE_SIZE = 15;
const RECOMMENDATIONS_LIMIT = 20;

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ejecuta un ciclo completo de encolado:
 * 1. Determina cuántos tracks necesita encolar
 * 2. Obtiene candidatos de Spotify (con fallbacks)
 * 3. Filtra por Blocks y ventana de 2h
 * 4. Encola los tracks seleccionados
 * 5. Retorna métricas del ciclo
 */
export async function runEnqueueCycle(opts: {
  musicProfile: MusicProfile;
  blocks: Block[];
  recentEvents: SessionEvent[];
  currentQueueCount: number;
  localId: string;
  deviceId: string | null;
  localType: string;
}): Promise<EnqueueCycleResult> {
  const { musicProfile, blocks, recentEvents, currentQueueCount, localId, deviceId, localType } = opts;
  const cycleStart = Date.now();

  const needed = MAX_QUEUE_SIZE - currentQueueCount;
  if (needed <= 0) {
    console.log(`[Engine] Cola llena (${currentQueueCount}/${MAX_QUEUE_SIZE}), nada que hacer`);
    return { enqueuedCount: 0, skippedCount: 0, failedCount: 0, enqueuedTracks: [], warning: null };
  }

  console.log(`[Engine] ── Ciclo iniciado ── necesita ${needed} tracks (cola: ${currentQueueCount}/${MAX_QUEUE_SIZE})`);

  const hasGenres = musicProfile.allowed_genres.length > 0;
  const hasArtists = (musicProfile.seed_artists?.length ?? 0) > 0;

  // — Verificar que haya algo con qué buscar
  if (!hasGenres && !hasArtists) {
    console.warn('[Engine] Sin géneros ni artistas seed');
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      enqueuedTracks: [],
      warning: 'Configura al menos un género o un artista base en tu perfil.',
    };
  }

  // — Verificar que no todos los géneros estén bloqueados (solo si hay géneros)
  if (hasGenres && areAllGenresBlocked(musicProfile.allowed_genres, blocks)) {
    console.warn('[Engine] Todos los géneros bloqueados');
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      enqueuedTracks: [],
      warning: 'Todos los géneros de tu perfil están bloqueados. Revisa tus bloqueos.',
    };
  }

  // — Franja horaria, mood y parámetros de energía
  const slot = getCurrentTimeSlot();
  const energyParams = getEnergyParamsForSlot(slot, musicProfile.energy_level);
  const mood = getMoodForSlot(localType, slot);

  // — Seeds de Spotify: géneros + artistas
  const seedGenres = hasGenres ? genresToSpotifySeeds(musicProfile.allowed_genres) : [];
  const seedArtistNames = musicProfile.seed_artists?.map(a => a.name) ?? [];
  console.log(`[Engine] Slot: ${slot} | Mood: ${mood.keywords.join(', ')} | Genre seeds: ${seedGenres.join(', ')} | Artist seeds: ${seedArtistNames.join(', ')}`);

  // — Obtener recomendaciones (con fallback EC-F2-01)
  const recsStart = Date.now();
  let candidates = await fetchWithFallback(
    seedGenres,
    energyParams,
    musicProfile.allowed_genres,
    localId,
    mood.keywords,
    seedArtistNames
  );
  console.log(`[Engine] Recomendaciones: ${candidates.length} candidatos en ${Date.now() - recsStart}ms`);

  // — Deduplicar por spotify_track_id
  const seenIds = new Set<string>();
  candidates = candidates.filter((c) => {
    if (seenIds.has(c.spotify_track_id)) return false;
    seenIds.add(c.spotify_track_id);
    return true;
  });

  // — Filtrar por Blocks activos
  const preBlockCount = candidates.length;
  candidates = filterByBlocks(candidates.map(toTrackCandidate), blocks)
    .map((tc) => candidates.find((c) => c.spotify_track_id === tc.spotify_track_id)!)
    .filter(Boolean);

  // — Filtrar por ventana de no-repetición de 4h
  const preRepeatCount = candidates.length;
  candidates = filterByNoRepeatWindow(candidates.map(toTrackCandidate), recentEvents)
    .map((tc) => candidates.find((c) => c.spotify_track_id === tc.spotify_track_id)!)
    .filter(Boolean);

  console.log(`[Engine] Filtros: ${preBlockCount} → blocks: ${preRepeatCount} → no-repeat: ${candidates.length}`);

  if (candidates.length === 0) {
    console.warn(`[Engine] 0 candidatos después de filtros (${Date.now() - cycleStart}ms)`);
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      enqueuedTracks: [],
      warning: 'No encontramos canciones disponibles. Revisa tu perfil musical o bloqueos.',
    };
  }

  // — Seleccionar aleatoriamente los tracks necesarios
  const selected = selectRandomTracks(candidates, needed);
  console.log(`[Engine] Seleccionados ${selected.length}: ${selected.map(t => `${t.name} - ${t.artist}`).join(' | ')}`);

  // — Encolar tracks via BATCH (1 sola auth para todos los tracks)
  const enqueueStart = Date.now();
  const batchResults = await enqueueBatch(
    selected.map((t) => t.spotify_track_id),
    localId,
    deviceId
  );

  let enqueuedCount = 0;
  let failedCount = 0;
  const enqueuedTracks: SpotifyRecommendation[] = [];

  for (const result of batchResults) {
    if (result.success) {
      const track = selected.find((t) => t.spotify_track_id === result.trackId);
      if (track) enqueuedTracks.push(track);
      enqueuedCount++;
    } else {
      failedCount++;
    }
  }

  const totalMs = Date.now() - cycleStart;
  console.log(`[Engine] ── Ciclo completado ── ${enqueuedCount} encolados, ${failedCount} fallidos (enqueue: ${Date.now() - enqueueStart}ms, total: ${totalMs}ms)`);

  if (failedCount > 0) {
    const failedNames = batchResults
      .filter((r) => !r.success)
      .map((r) => selected.find((t) => t.spotify_track_id === r.trackId)?.name || r.trackId);
    console.error(`[Engine] Fallidos: ${failedNames.join(', ')}`);
  }

  return {
    enqueuedCount,
    skippedCount: selected.length - (enqueuedCount + failedCount),
    failedCount,
    enqueuedTracks,
    warning: failedCount > 0
      ? `No se pudieron encolar ${failedCount} canciones. Spotify puede estar no disponible.`
      : null,
  };
}

/**
 * Obtiene recomendaciones con estrategia de fallback (EC-F2-01):
 * 1. Seeds normales del MusicProfile (géneros + mood)
 * 2. Seeds por artista (si hay seed_artists)
 * 3. Solo el primer género + energía relajada
 * 4. Géneros relacionados
 */
async function fetchWithFallback(
  seedGenres: string[],
  energyParams: ReturnType<typeof getEnergyParamsForSlot>,
  allowedGenres: Genre[],
  localId: string,
  moodKeywords: string[],
  seedArtistNames: string[] = []
): Promise<SpotifyRecommendation[]> {
  // Intento 1: seeds por género + mood keywords (solo si hay géneros)
  if (seedGenres.length > 0) {
    let results = await getRecommendations(seedGenres, energyParams, RECOMMENDATIONS_LIMIT, localId, moodKeywords);
    if (results.length > 0) return results;
  }

  // Intento 2: buscar por artistas seed (si hay)
  if (seedArtistNames.length > 0) {
    const artistResults = await getRecommendations(
      seedArtistNames.map(name => `artist:${name}`),
      energyParams,
      RECOMMENDATIONS_LIMIT,
      localId
    );
    if (artistResults.length > 0) return artistResults;
  }

  // Intento 3: solo primer género, ±0.2 de energía, mismo mood
  if (allowedGenres.length > 0) {
    const relaxedParams = {
      ...energyParams,
      minEnergy: Math.max(0, energyParams.minEnergy - 0.2),
      maxEnergy: Math.min(1, energyParams.maxEnergy + 0.2),
    };
    const fallbackSeeds = genresToSpotifySeeds([allowedGenres[0]], 2);
    let results = await getRecommendations(fallbackSeeds, relaxedParams, RECOMMENDATIONS_LIMIT, localId, moodKeywords);
    if (results.length > 0) return results;

    // Intento 4: géneros relacionados (sin mood para ampliar resultados)
    const relatedGenres = allowedGenres
      .flatMap((g) => RELATED_GENRES[g] ?? [])
      .slice(0, 5) as Genre[];

    if (relatedGenres.length > 0) {
      const relatedSeeds = genresToSpotifySeeds(relatedGenres);
      results = await getRecommendations(relatedSeeds, relaxedParams, RECOMMENDATIONS_LIMIT, localId);
      if (results.length > 0) return results;
    }
  }

  return [];
}

/**
 * Crea un SessionEvent para el track que acaba de empezar a reproducirse.
 * SOLO INSERT — nunca UPDATE ni DELETE.
 */
export function createSessionEvent(opts: {
  localId: string;
  track: SpotifyRecommendation;
  slot: TimeSlot;
  energyLevel: 'low' | 'medium' | 'high';
  genre: Genre;
}): Omit<SessionEvent, 'id' | 'created_at'> {
  const now = new Date();
  return {
    local_id: opts.localId,
    spotify_track_id: opts.track.spotify_track_id,
    track_name: opts.track.name,
    artist_name: opts.track.artist,
    genre: opts.genre,
    energy_level: opts.energyLevel,
    played_at: now.toISOString(),
    time_slot: opts.slot,
    day_of_week: now.getDay(),
    source: 'algorithm',
  };
}

