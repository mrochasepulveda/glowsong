import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/catalog/recommendations
 * Obtiene tracks del catálogo propio filtrados por género, energía y mood.
 * Reemplaza la búsqueda en Spotify con queries directas a Supabase.
 */
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { genres, energyParams, moodKeywords, limit } = body;
  const desired = typeof limit === 'number' && limit > 0 ? Math.min(limit, 50) : 20;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const start = Date.now();

  // Mapear genre seeds a los nombres de género del catálogo
  const catalogGenres = Array.isArray(genres) && genres.length > 0
    ? mapSeedsToCatalogGenres(genres as string[])
    : [];

  // Query base: activo (+ género si viene)
  let query = supabase
    .from('catalog_tracks')
    .select('*')
    .eq('is_active', true);

  if (catalogGenres.length > 0) {
    query = query.in('genre', catalogGenres);
  }

  // Filtrar por rango de energía si viene
  if (energyParams) {
    if (typeof energyParams.minEnergy === 'number') {
      query = query.gte('energy', energyParams.minEnergy);
    }
    if (typeof energyParams.maxEnergy === 'number') {
      query = query.lte('energy', energyParams.maxEnergy);
    }
    if (typeof energyParams.minTempo === 'number') {
      query = query.gte('tempo_bpm', energyParams.minTempo);
    }
    if (typeof energyParams.maxTempo === 'number') {
      query = query.lte('tempo_bpm', energyParams.maxTempo);
    }
  }

  // Pedir más de lo necesario para poder filtrar por mood y aleatorizar
  const fetchLimit = Math.min(desired * 3, 100);
  query = query.limit(fetchLimit);

  const { data: tracks, error } = await query;

  if (error) {
    console.error(`[CatalogRecs] DB error:`, error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!tracks || tracks.length === 0) {
    // Fallback: relajar filtros de energía, solo por género
    const { data: fallback } = await supabase
      .from('catalog_tracks')
      .select('*')
      .eq('is_active', true)
      .in('genre', catalogGenres)
      .limit(fetchLimit);

    if (!fallback || fallback.length === 0) {
      console.log(`[CatalogRecs] 0 tracks para géneros: ${catalogGenres.join(', ')} (${Date.now() - start}ms)`);
      return NextResponse.json({ tracks: [] });
    }

    const result = scoreAndShuffle(fallback, moodKeywords).slice(0, desired);
    console.log(`[CatalogRecs] ${result.length} tracks (fallback, ${Date.now() - start}ms)`);
    return NextResponse.json({ tracks: result.map(formatTrack) });
  }

  // Ordenar por relevancia de mood y aleatorizar
  const result = scoreAndShuffle(tracks, moodKeywords).slice(0, desired);
  console.log(`[CatalogRecs] ${result.length} tracks para ${catalogGenres.join(', ')} (${Date.now() - start}ms)`);

  return NextResponse.json({ tracks: result.map(formatTrack) });
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Puntúa tracks por coincidencia de mood tags y aleatoriza.
 * Tracks con más mood tags coincidentes tienen más probabilidad de aparecer primero,
 * pero se mezcla aleatoriedad para no repetir siempre los mismos.
 */
function scoreAndShuffle(tracks: any[], moodKeywords?: string[]): any[] {
  const keywords = Array.isArray(moodKeywords) ? moodKeywords.map(k => k.toLowerCase()) : [];

  const scored = tracks.map(track => {
    let moodScore = 0;
    if (keywords.length > 0 && Array.isArray(track.mood_tags)) {
      const tags = track.mood_tags.map((t: string) => t.toLowerCase());
      moodScore = keywords.filter(k => tags.includes(k)).length;
    }
    // Score = mood relevance + random factor para variedad
    const score = moodScore * 2 + Math.random();
    return { track, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.track);
}

/**
 * Formatea un track de Supabase al formato que espera catalogClient.ts
 */
function formatTrack(track: any) {
  return {
    track_id: track.id,
    name: track.title,
    artist: track.artist_name,
    album: track.album || '',
    album_art_url: track.album_art_url || '',
    duration_ms: track.duration_ms,
    energy: track.energy,
    tempo: track.tempo_bpm,
    file_url: track.file_url,
    genre: track.genre,
    mood_tags: track.mood_tags || [],
    license_type: track.license_type,
    license_attribution: track.license_attribution,
  };
}

/**
 * Mapea los seed strings (formato Spotify) a los nombres de género del catálogo.
 * Ej: 'jazz' → 'JAZZ', 'r-n-b' → 'R_AND_B', 'latin-pop' → 'LATIN_POP'
 */
const SEED_TO_CATALOG: Record<string, string> = {
  'jazz': 'JAZZ',
  'soul': 'SOUL',
  'funk': 'FUNK',
  'hip-hop': 'HIP_HOP',
  'r-n-b': 'R_AND_B',
  'latin': 'LATIN_POP',
  'latin-pop': 'LATIN_POP',
  'reggaeton': 'REGGAETON',
  'electronic': 'ELECTRONICA',
  'edm': 'ELECTRONICA',
  'pop': 'POP',
  'rock': 'ROCK',
  'indie': 'INDIE',
  'indie-pop': 'INDIE',
  'alternative': 'ALTERNATIVO',
  'classical': 'CLASICA',
  'bossanova': 'BOSSA_NOVA',
  'salsa': 'SALSA',
  'cumbia': 'CUMBIA',
  'flamenco': 'FLAMENCO',
  'spanish-flamenco': 'FLAMENCO',
  'folk': 'FOLK',
  'singer-songwriter': 'FOLK',
  'country': 'COUNTRY',
  'nueva-cancion': 'MUSICA_CHILENA',
  'bolero': 'BOLERO',
  'tango': 'TANGO',
  'argentina': 'TANGO',
  'bachata': 'BACHATA',
  'merengue': 'MERENGUE',
  'blues': 'BLUES',
  'lofi': 'LOFI',
  'lo-fi': 'LOFI',
  'ambient': 'AMBIENT',
  'acoustic': 'ACOUSTIC',
  'bossa-nova': 'BOSSA_NOVA',
  'disco': 'DISCO',
  'house': 'HOUSE',
  'techno': 'TECHNO',
  'reggae': 'REGGAE',
};

function mapSeedsToCatalogGenres(seeds: string[]): string[] {
  const genres = new Set<string>();
  for (const seed of seeds) {
    // Remove "genre:" prefix if present
    const clean = seed.replace(/^genre:/, '').toLowerCase();
    const mapped = SEED_TO_CATALOG[clean];
    if (mapped) {
      genres.add(mapped);
    } else {
      // Try uppercase as-is (might already be catalog format)
      genres.add(seed.toUpperCase());
    }
  }
  return [...genres];
}
