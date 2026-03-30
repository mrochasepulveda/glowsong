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
 * POST /api/algorithm/enqueue-batch
 * Encola MÚLTIPLES tracks con UNA sola autenticación.
 * Body: { localId, trackIds: string[], deviceId?: string }
 * Response: { results: Array<{ trackId, success, error? }> }
 */
export async function POST(request: Request) {
  const routeStart = Date.now();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { localId, trackIds, deviceId } = body;

  if (!localId || !Array.isArray(trackIds) || trackIds.length === 0) {
    return NextResponse.json({ error: 'Missing localId or trackIds' }, { status: 400 });
  }

  // ── Auth (1 sola vez para todo el batch) ──
  const authStart = Date.now();
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error(`[BatchEnqueue] Auth failed (${Date.now() - authStart}ms)`);
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
  console.log(`[BatchEnqueue] Auth OK (${authMs}ms) — ${trackIds.length} tracks a encolar`);

  // ── Encolar tracks en paralelo (todas con el mismo token) ──
  const enqueueStart = Date.now();

  const results = await Promise.allSettled(
    trackIds.map(async (trackId: string) => {
      const uri = trackId.startsWith('spotify:') ? trackId : `spotify:track:${trackId}`;
      const params = new URLSearchParams({ uri });
      if (deviceId) params.set('device_id', deviceId);

      const callStart = Date.now();
      const res = await fetch(`https://api.spotify.com/v1/me/player/queue?${params}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const callMs = Date.now() - callStart;

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '5';
        console.warn(`[BatchEnqueue] 429 Rate Limited (${callMs}ms) → ${uri}`);
        return { trackId, success: false, error: `rate_limited:${retryAfter}` };
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[BatchEnqueue] Spotify ${res.status} (${callMs}ms) → ${uri}: ${errorText.substring(0, 100)}`);
        return { trackId, success: false, error: `spotify:${res.status}` };
      }

      console.log(`[BatchEnqueue] OK (${callMs}ms) → ${uri}`);
      return { trackId, success: true };
    })
  );

  // ── Compilar resultados ──
  const output = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { trackId: trackIds[i], success: false, error: 'network_error' };
  });

  const successCount = output.filter(r => r.success).length;
  const failCount = output.length - successCount;
  const totalMs = Date.now() - routeStart;
  const enqueueMs = Date.now() - enqueueStart;

  console.log(`[BatchEnqueue] ── Completado ── ${successCount}/${output.length} OK, ${failCount} failed (auth: ${authMs}ms, enqueue: ${enqueueMs}ms, total: ${totalMs}ms)`);

  return NextResponse.json({ results: output });
}
