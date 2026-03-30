/**
 * F2 — Genre Mapping
 * Mapea los géneros del catálogo de Glowsong a los seeds que acepta
 * la API de Spotify /v1/recommendations.
 *
 * IMPORTANTE: Spotify acepta max 5 seeds en total (artists + tracks + genres).
 * Algunos géneros de Glowsong mapean a múltiples seeds de Spotify —
 * en esos casos se elige aleatoriamente uno para no exceder el límite.
 */

import type { Genre } from '@/types';

/**
 * Tabla de mapeo estática: Genre Glowsong → seed(s) válido(s) para Spotify.
 * Opcionalmente puede tener múltiples variantes para mayor cobertura.
 */
export const GENRE_TO_SPOTIFY_SEEDS: Record<Genre, string[]> = {
  JAZZ:           ['jazz'],
  SOUL:           ['soul'],
  FUNK:           ['funk'],
  HIP_HOP:        ['hip-hop'],
  R_AND_B:        ['r-n-b'],
  LATIN_POP:      ['latin', 'latin-pop'],
  REGGAETON:      ['reggaeton'],
  ELECTRONICA:    ['electronic', 'edm'],
  POP:            ['pop'],
  ROCK:           ['rock'],
  INDIE:          ['indie', 'indie-pop'],
  ALTERNATIVO:    ['alternative'],
  CLASICA:        ['classical'],
  BOSSA_NOVA:     ['bossanova'],
  SALSA:          ['salsa', 'latin'],
  CUMBIA:         ['cumbia', 'latin'],
  FLAMENCO:       ['flamenco', 'spanish-flamenco'],
  FOLK:           ['folk', 'singer-songwriter'],
  COUNTRY:        ['country'],
  MUSICA_CHILENA: ['latin', 'nueva-cancion'],
  BOLERO:         ['bolero', 'latin'],
  TANGO:          ['tango', 'argentina'],
  BACHATA:        ['bachata', 'latin'],
  MERENGUE:       ['merengue', 'latin'],
  BLUES:          ['blues'],
};

/**
 * Convierte una lista de géneros Glowsong a seeds de Spotify,
 * sin repetir seeds y respetando el máximo de 5.
 *
 * @param genres - Array de géneros del MusicProfile
 * @param maxSeeds - Límite de seeds (default: 5 por restricción de Spotify)
 */
export function genresToSpotifySeeds(genres: Genre[], maxSeeds = 5): string[] {
  // Recolectar todos los seeds posibles (uno por género para variedad)
  const candidates: string[] = genres.map((g) => {
    const options = GENRE_TO_SPOTIFY_SEEDS[g] ?? ['pop'];
    // Elegir aleatoriamente entre las opciones para variar
    return options[Math.floor(Math.random() * options.length)];
  });

  // Deduplicar
  const unique = [...new Set(candidates)];

  // Si hay más de maxSeeds, samplear aleatoriamente
  if (unique.length <= maxSeeds) return unique;

  const shuffled = unique.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxSeeds);
}

/**
 * Géneros relacionados para fallback cuando el catálogo del género
 * principal está agotado (todos sonaron en las últimas 2 horas).
 */
export const RELATED_GENRES: Partial<Record<Genre, Genre[]>> = {
  JAZZ:        ['SOUL', 'BLUES', 'BOSSA_NOVA'],
  SOUL:        ['JAZZ', 'R_AND_B', 'FUNK'],
  FUNK:        ['SOUL', 'R_AND_B', 'HIP_HOP'],
  BLUES:       ['JAZZ', 'SOUL', 'ROCK'],
  HIP_HOP:     ['R_AND_B', 'FUNK', 'POP'],
  R_AND_B:     ['SOUL', 'HIP_HOP', 'POP'],
  LATIN_POP:   ['POP', 'REGGAETON', 'SALSA'],
  REGGAETON:   ['LATIN_POP', 'BACHATA', 'CUMBIA'],
  INDIE:       ['ALTERNATIVO', 'FOLK', 'POP'],
  ALTERNATIVO: ['INDIE', 'ROCK', 'FOLK'],
  ROCK:        ['ALTERNATIVO', 'INDIE', 'FOLK'],
  POP:         ['LATIN_POP', 'INDIE', 'R_AND_B'],
  BOSSA_NOVA:  ['JAZZ', 'FOLK', 'CLASICA'],
  SALSA:       ['CUMBIA', 'MERENGUE', 'LATIN_POP'],
  CUMBIA:      ['SALSA', 'MERENGUE', 'LATIN_POP'],
  FLAMENCO:    ['FOLK', 'CLASICA'],
  FOLK:        ['INDIE', 'ALTERNATIVO', 'COUNTRY'],
};
