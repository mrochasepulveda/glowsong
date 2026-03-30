import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidToken } from '@/lib/spotifyClient';

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
 * POST /api/algorithm/enqueue
 * Encola un track en el player de Spotify del usuario.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { localId, trackUri, deviceId } = body;

  if (!localId || !trackUri) {
    return NextResponse.json({ error: 'Missing localId or trackUri' }, { status: 400 });
  }

  // Autenticar
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar ownership
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

  // Construir URI si solo se pasó un track ID
  const uri = trackUri.startsWith('spotify:') ? trackUri : `spotify:track:${trackUri}`;

  const params = new URLSearchParams({ uri });
  if (deviceId) params.set('device_id', deviceId);

  const enqStart = Date.now();
  try {
    const res = await fetch(`https://api.spotify.com/v1/me/player/queue?${params}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '5';
      console.warn(`[Enqueue] 429 Rate Limited — retry after ${retryAfter}s (${uri})`);
      return NextResponse.json(
        { error: 'Rate limited', retryAfter: parseInt(retryAfter) },
        { status: 429, headers: { 'Retry-After': retryAfter } }
      );
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Enqueue] Spotify ${res.status} (${Date.now() - enqStart}ms): ${errorText.substring(0, 150)}`);
      return NextResponse.json({ error: 'Failed to enqueue' }, { status: res.status });
    }

    console.log(`[Enqueue] OK (${Date.now() - enqStart}ms) → ${uri}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[Enqueue] Network error (${Date.now() - enqStart}ms):`, err);
    return NextResponse.json({ error: 'Network error' }, { status: 502 });
  }
}
