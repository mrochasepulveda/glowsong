import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidToken } from '@/lib/spotifyClient';

const SPOTIFY_MAX_LIMIT = 10; // Spotify redujo el max limit del Search API

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options); }); }
          catch { /* ignore */ }
        },
      },
    }
  );
}

/**
 * POST /api/algorithm/recommendations
 * Obtiene tracks usando Spotify Search API con limit max de 10.
 * Hace multiples requests con offset aleatorio para variedad.
 */
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { localId, seedGenres, moodKeywords, limit } = body;
  const desired = typeof limit === 'number' && limit > 0 ? Math.min(limit, 30) : 20;

  if (!localId || !seedGenres?.length) {
    return NextResponse.json({ error: 'Missing localId or seedGenres' }, { status: 400 });
  }

  const authStart = Date.now();
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error(`[Recs] Auth failed (${Date.now() - authStart}ms)`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: local } = await supabase
    .from('locals')
    .select('id')
    .eq('id', localId)
    .eq('owner_id', user.id)
    .single();

  if (!local) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = await getValidToken(localId);
  if (!token) {
    return NextResponse.json({ error: 'No valid Spotify token' }, { status: 401 });
  }

  const authMs = Date.now() - authStart;
  const allSeeds = (seedGenres as string[]).slice(0, 5);
  const reqStart = Date.now();

  // Separate genre seeds from artist seeds
  const genreSeeds = allSeeds.filter(s => !s.startsWith('artist:'));
  const artistSeeds = allSeeds.filter(s => s.startsWith('artist:'));

  // Mood keywords del preset (ej: "lounge smooth chill" para bar en opening)
  const moodSuffix = Array.isArray(moodKeywords) && moodKeywords.length > 0
    ? ' ' + moodKeywords.join(' ')
    : '';

  // Build search query combining genres and artists
  const parts: string[] = [];
  if (genreSeeds.length > 0) {
    parts.push(genreSeeds.map(g => `genre:${g}`).join(' OR '));
  }
  if (artistSeeds.length > 0) {
    // artistSeeds already have 'artist:' prefix
    parts.push(artistSeeds.join(' OR '));
  }

  const fullQuery = (parts.length > 0 ? parts.join(' ') : 'music') + moodSuffix;
  console.log(`[Recs] Buscando: "${fullQuery}" (desired: ${desired})`);
  let tracks = await searchTracks(token, fullQuery, desired);

  // Fallback: keywords de género + mood si no devuelve resultados
  if (tracks.length === 0 && genreSeeds.length > 0) {
    const keywords = genreSeeds.map(g => KEYWORD_MAP[g] || g).join(' ') + moodSuffix;
    console.log(`[Recs] Fallback keywords: "${keywords}"`);
    tracks = await searchTracks(token, keywords, desired);
  }

  // Fallback: buscar solo por nombres de artista sin prefix
  if (tracks.length === 0 && artistSeeds.length > 0) {
    const artistNames = artistSeeds.map(s => s.replace('artist:', '')).join(' ');
    console.log(`[Recs] Fallback artist names: "${artistNames}"`);
    tracks = await searchTracks(token, artistNames, desired);
  }

  // Deduplicar por spotify_track_id
  const seen = new Set<string>();
  tracks = tracks.filter((t: { spotify_track_id: string }) => {
    if (seen.has(t.spotify_track_id)) return false;
    seen.add(t.spotify_track_id);
    return true;
  });

  console.log(`[Recs] ${tracks.length} tracks únicos (auth: ${authMs}ms, search: ${Date.now() - reqStart}ms, total: ${Date.now() - authStart}ms) para: ${allSeeds.join(', ')}`);
  return NextResponse.json({ tracks });
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Busca tracks con multiples requests EN PARALELO (limit=10, offsets variados)
 * para obtener la cantidad deseada con variedad.
 */
async function searchTracks(
  token: string,
  query: string,
  desired: number
): Promise<any[]> {
  const batchCount = Math.ceil(desired / SPOTIFY_MAX_LIMIT);

  // Offset aleatorio para variedad (max 100 para no ir tan lejos)
  const baseOffset = Math.floor(Math.random() * 50);

  // Lanzar todas las búsquedas en paralelo
  const fetchBatch = async (batchIndex: number): Promise<any[]> => {
    const offset = baseOffset + (batchIndex * SPOTIFY_MAX_LIMIT);
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${SPOTIFY_MAX_LIMIT}&offset=${offset}`;
    const batchStart = Date.now();

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[Recs] Spotify ${res.status} (offset=${offset}, ${Date.now() - batchStart}ms):`, err.substring(0, 120));
        return [];
      }

      const data = await res.json();
      const items = data.tracks?.items || [];
      console.log(`[Recs] Batch offset=${offset}: ${items.length} tracks (${Date.now() - batchStart}ms)`);
      return mapTracks(items);
    } catch (err) {
      console.error(`[Recs] Network error (offset=${offset}):`, err);
      return [];
    }
  };

  const results = await Promise.all(
    Array.from({ length: batchCount }, (_, i) => fetchBatch(i))
  );

  return results.flat().slice(0, desired);
}

const KEYWORD_MAP: Record<string, string> = {
  'jazz': 'jazz',
  'soul': 'soul music',
  'funk': 'funk groove',
  'blues': 'blues',
  'hip-hop': 'hip hop',
  'r-n-b': 'r&b rnb',
  'latin': 'latin music',
  'latin-pop': 'latin pop',
  'reggaeton': 'reggaeton',
  'electronic': 'electronic music',
  'edm': 'edm dance',
  'pop': 'pop hits',
  'rock': 'rock',
  'indie': 'indie',
  'indie-pop': 'indie pop',
  'alternative': 'alternative rock',
  'classical': 'classical',
  'bossanova': 'bossa nova',
  'salsa': 'salsa',
  'cumbia': 'cumbia',
  'flamenco': 'flamenco',
  'spanish-flamenco': 'flamenco',
  'folk': 'folk',
  'singer-songwriter': 'singer songwriter',
  'country': 'country',
  'nueva-cancion': 'nueva cancion chilena',
  'bolero': 'bolero',
  'tango': 'tango',
  'argentina': 'tango argentino',
  'bachata': 'bachata',
  'merengue': 'merengue',
};

function mapTracks(tracks: any[]): any[] {
  return tracks.map((t: any) => ({
    spotify_track_id: t.id,
    name: t.name,
    artist: t.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
    album: t.album?.name || 'Unknown',
    album_art_url: t.album?.images?.[0]?.url || '',
    duration_ms: t.duration_ms || 0,
    energy: 0,
    tempo: 0,
  }));
}
