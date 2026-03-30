/**
 * F2 — Catalog Engine (Orchestrator)
 * Motor del algoritmo que usa el catálogo propio en vez de Spotify.
 *
 * Misma lógica que engine.ts pero:
 * - Busca en catalog_tracks (Supabase) en vez de Spotify Search
 * - No necesita deviceId ni tokens de Spotify
 * - Los tracks se reproducen con HTML5 Audio
 *
 * Coexiste con engine.ts — se elige uno u otro según la config del local.
 */

import type { MusicProfile, Block, SessionEvent, Genre } from '@/types';
import { getCurrentTimeSlot, getEnergyParamsForSlot, type TimeSlot } from './timeSlots';
import { genresToSpotifySeeds, RELATED_GENRES } from './genreMapping';
import { filterByBlocks, filterByNoRepeatWindow, selectRandomTracks, areAllGenresBlocked } from './trackFilters';
import { getCatalogRecommendations, toTrackCandidate, type TrackRecommendation } from './catalogClient';
import { getMoodForSlot } from './moodPresets';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export type CatalogAlgorithmStatus =
  | 'idle'
  | 'running'
  | 'enqueueing'
  | 'all_genres_blocked'
  | 'empty_catalog'
  | 'error';

export interface CatalogEnqueueResult {
  enqueuedCount: number;
  skippedCount: number;
  enqueuedTracks: TrackRecommendation[];
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
 * Ejecuta un ciclo de encolado usando el catálogo propio.
 * Retorna los tracks seleccionados — el caller se encarga de reproducirlos.
 */
export async function runCatalogEnqueueCycle(opts: {
  musicProfile: MusicProfile;
  blocks: Block[];
  recentEvents: SessionEvent[];
  currentQueueCount: number;
  localId: string;
  localType: string;
}): Promise<CatalogEnqueueResult> {
  const { musicProfile, blocks, recentEvents, currentQueueCount, localType } = opts;
  const cycleStart = Date.now();

  const needed = MAX_QUEUE_SIZE - currentQueueCount;
  if (needed <= 0) {
    console.log(`[CatalogEngine] Cola llena (${currentQueueCount}/${MAX_QUEUE_SIZE})`);
    return { enqueuedCount: 0, skippedCount: 0, enqueuedTracks: [], warning: null };
  }

  console.log(`[CatalogEngine] ── Ciclo iniciado ── necesita ${needed} tracks (cola: ${currentQueueCount}/${MAX_QUEUE_SIZE})`);

  const hasGenres = musicProfile.allowed_genres.length > 0;
  if (!hasGenres) {
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      enqueuedTracks: [],
      warning: 'Configura al menos un género en tu perfil.',
    };
  }

  if (areAllGenresBlocked(musicProfile.allowed_genres, blocks)) {
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      enqueuedTracks: [],
      warning: 'Todos los géneros de tu perfil están bloqueados.',
    };
  }

  // Franja horaria, mood y energía
  const slot = getCurrentTimeSlot();
  const energyParams = getEnergyParamsForSlot(slot, musicProfile.energy_level);
  const mood = getMoodForSlot(localType, slot);
  const seedGenres = genresToSpotifySeeds(musicProfile.allowed_genres);

  console.log(`[CatalogEngine] Slot: ${slot} | Mood: ${mood.keywords.join(', ')} | Genres: ${seedGenres.join(', ')}`);

  // Obtener candidatos del catálogo (con fallback)
  let candidates = await fetchCatalogWithFallback(
    seedGenres,
    energyParams,
    musicProfile.allowed_genres,
    mood.keywords
  );

  // Deduplicar
  const seenIds = new Set<string>();
  candidates = candidates.filter((c) => {
    if (seenIds.has(c.track_id)) return false;
    seenIds.add(c.track_id);
    return true;
  });

  // Filtrar por Blocks (usa spotify_track_id por compatibilidad con trackFilters)
  const preBlockCount = candidates.length;
  const candidatesForFilter = candidates.map(toTrackCandidate);
  const afterBlocks = filterByBlocks(candidatesForFilter, blocks);
  const afterBlocksIds = new Set(afterBlocks.map(tc => tc.spotify_track_id));
  candidates = candidates.filter(c => afterBlocksIds.has(c.track_id));

  // Filtrar por ventana de no-repetición
  const preRepeatCount = candidates.length;
  const afterRepeat = filterByNoRepeatWindow(
    candidates.map(toTrackCandidate),
    recentEvents
  );
  const afterRepeatIds = new Set(afterRepeat.map(tc => tc.spotify_track_id));
  candidates = candidates.filter(c => afterRepeatIds.has(c.track_id));

  console.log(`[CatalogEngine] Filtros: ${preBlockCount} → blocks: ${preRepeatCount} → no-repeat: ${candidates.length}`);

  if (candidates.length === 0) {
    console.warn(`[CatalogEngine] 0 candidatos (${Date.now() - cycleStart}ms)`);
    return {
      enqueuedCount: 0,
      skippedCount: 0,
      enqueuedTracks: [],
      warning: 'No encontramos canciones disponibles en el catálogo. Agrega más tracks o revisa tus bloqueos.',
    };
  }

  // Seleccionar aleatoriamente
  const selected = selectRandomTracks(candidates, needed);
  console.log(`[CatalogEngine] Seleccionados ${selected.length}: ${selected.map(t => `${t.name} - ${t.artist}`).join(' | ')}`);
  console.log(`[CatalogEngine] ── Ciclo completado ── ${selected.length} tracks (${Date.now() - cycleStart}ms)`);

  return {
    enqueuedCount: selected.length,
    skippedCount: candidates.length - selected.length,
    enqueuedTracks: selected,
    warning: null,
  };
}

/**
 * Estrategia de fallback para el catálogo propio:
 * 1. Géneros + energía + mood
 * 2. Géneros + energía (sin mood)
 * 3. Solo géneros (sin filtros de energía)
 * 4. Géneros relacionados
 */
async function fetchCatalogWithFallback(
  seedGenres: string[],
  energyParams: ReturnType<typeof getEnergyParamsForSlot>,
  allowedGenres: Genre[],
  moodKeywords: string[]
): Promise<TrackRecommendation[]> {
  // Intento 1: género + energía + mood
  let results = await getCatalogRecommendations(seedGenres, energyParams, RECOMMENDATIONS_LIMIT, moodKeywords);
  if (results.length > 0) return results;

  // Intento 2: género + energía (sin mood)
  results = await getCatalogRecommendations(seedGenres, energyParams, RECOMMENDATIONS_LIMIT);
  if (results.length > 0) return results;

  // Intento 3: solo género, energía relajada
  const relaxedParams = {
    ...energyParams,
    minEnergy: Math.max(0, energyParams.minEnergy - 0.3),
    maxEnergy: Math.min(1, energyParams.maxEnergy + 0.3),
    minTempo: Math.max(40, energyParams.minTempo - 30),
    maxTempo: Math.min(220, energyParams.maxTempo + 30),
  };
  results = await getCatalogRecommendations(seedGenres, relaxedParams, RECOMMENDATIONS_LIMIT);
  if (results.length > 0) return results;

  // Intento 4: géneros relacionados
  const relatedGenres = allowedGenres
    .flatMap((g) => RELATED_GENRES[g] ?? [])
    .slice(0, 5) as Genre[];

  if (relatedGenres.length > 0) {
    const relatedSeeds = genresToSpotifySeeds(relatedGenres);
    results = await getCatalogRecommendations(relatedSeeds, relaxedParams, RECOMMENDATIONS_LIMIT);
    if (results.length > 0) return results;
  }

  return [];
}

/**
 * Crea un SessionEvent para un track del catálogo.
 */
export function createCatalogSessionEvent(opts: {
  localId: string;
  track: TrackRecommendation;
  slot: TimeSlot;
  energyLevel: 'low' | 'medium' | 'high';
}): Omit<SessionEvent, 'id' | 'created_at'> {
  const now = new Date();
  return {
    local_id: opts.localId,
    spotify_track_id: opts.track.track_id,   // Reutiliza el campo — es el ID del track
    track_name: opts.track.name,
    artist_name: opts.track.artist,
    genre: opts.track.genre as Genre,
    energy_level: opts.energyLevel,
    played_at: now.toISOString(),
    time_slot: opts.slot,
    day_of_week: now.getDay(),
    source: 'algorithm',
  };
}
