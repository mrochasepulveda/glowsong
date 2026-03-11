import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
 * POST /api/algorithm/session-event
 * Persiste un SessionEvent en Supabase. Append-only.
 * Nunca detiene la reproducción por un error de persistencia.
 */
export async function POST(request: Request) {
  const routeStart = Date.now();
  const body = await request.json();
  const {
    local_id,
    spotify_track_id,
    track_name,
    artist_name,
    album_art_url,
    duration_ms,
    genre,
    energy_level,
    time_slot,
    day_of_week,
    source = 'algorithm',
  } = body;

  if (!local_id || !spotify_track_id || !track_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const authStart = Date.now();
  const supabase = await getSupabase();

  // Autenticar
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error(`[SessionEvent] Auth failed (${Date.now() - authStart}ms)`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar ownership
  const { data: local } = await supabase
    .from('locals')
    .select('id')
    .eq('id', local_id)
    .eq('owner_id', user.id)
    .single();

  if (!local) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const authMs = Date.now() - authStart;

  // Retry con backoff (3 intentos)
  const MAX_RETRIES = 3;
  const insertStart = Date.now();
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const { error: insertErr } = await supabase
      .from('session_events')
      .insert({
        local_id,
        spotify_track_id,
        track_name,
        artist_name,
        album_art_url: album_art_url || null,
        duration_ms: duration_ms || null,
        genre: genre || null,
        energy_level: energy_level || null,
        source,
        time_slot: time_slot || null,
        day_of_week: day_of_week ?? null,
        played_at: new Date().toISOString(),
      });

    if (!insertErr) {
      console.log(`[SessionEvent] OK "${track_name}" — ${artist_name} (auth: ${authMs}ms, insert: ${Date.now() - insertStart}ms, total: ${Date.now() - routeStart}ms)`);
      return NextResponse.json({ success: true });
    }

    console.error(`[SessionEvent] Insert attempt ${attempt}/${MAX_RETRIES} failed (${Date.now() - insertStart}ms):`, insertErr);

    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }

  // Aún si falló, no detenemos la reproducción
  console.error(`[SessionEvent] All ${MAX_RETRIES} attempts failed (total: ${Date.now() - routeStart}ms)`);
  return NextResponse.json({ success: false, error: 'Failed to persist event' }, { status: 500 });
}
