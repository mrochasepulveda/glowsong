/**
 * F2 — Public API barrel
 * Exporta todo lo que el resto de la app necesita del módulo de algoritmo.
 */

export { getCurrentTimeSlot, getEnergyParamsForSlot, TIME_SLOT_PARAMS } from './timeSlots';
export type { TimeSlot, EnergyParams } from './timeSlots';

export { genresToSpotifySeeds, GENRE_TO_SPOTIFY_SEEDS, RELATED_GENRES } from './genreMapping';

export { filterByBlocks, filterByNoRepeatWindow, selectRandomTracks, areAllGenresBlocked } from './trackFilters';
export type { TrackCandidate } from './trackFilters';

export { runEnqueueCycle, createSessionEvent } from './engine';
export type { AlgorithmState, AlgorithmStatus, EnqueueCycleResult } from './engine';

export { getRecommendations, enqueueTrack, persistSessionEvent, getRecentEvents } from './spotifyClient';
export type { SpotifyRecommendation } from './spotifyClient';

// ── Catálogo propio (reemplazo de Spotify) ──
export { getCatalogRecommendations, persistSessionEvent as persistCatalogEvent } from './catalogClient';
export type { TrackRecommendation, CatalogTrack } from './catalogClient';

export { runCatalogEnqueueCycle, createCatalogSessionEvent } from './catalogEngine';
export type { CatalogAlgorithmStatus, CatalogEnqueueResult } from './catalogEngine';
