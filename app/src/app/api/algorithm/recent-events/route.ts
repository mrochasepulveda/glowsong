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
 * GET /api/algorithm/recent-events?localId=xxx
 * Retorna los session_events de las últimas 4 horas para la ventana de no-repetición.
 */
export async function GET(request: Request) {
  const routeStart = Date.now();
  const { searchParams } = new URL(request.url);
  const localId = searchParams.get('localId');

  if (!localId) {
    return NextResponse.json({ error: 'Missing localId' }, { status: 400 });
  }

  const authStart = Date.now();
  const supabase = await getSupabase();

  // Autenticar
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error(`[RecentEvents] Auth failed (${Date.now() - authStart}ms)`);
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

  const authMs = Date.now() - authStart;

  // Query: últimas 4 horas (ventana de no-repetición)
  const queryStart = Date.now();
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: events, error: queryErr } = await supabase
    .from('session_events')
    .select('*')
    .eq('local_id', localId)
    .gte('played_at', fourHoursAgo)
    .order('played_at', { ascending: false });

  if (queryErr) {
    console.error(`[RecentEvents] Query error (${Date.now() - queryStart}ms):`, queryErr);
    return NextResponse.json({ events: [] });
  }

  const count = events?.length || 0;
  console.log(`[RecentEvents] ${count} events (auth: ${authMs}ms, query: ${Date.now() - queryStart}ms, total: ${Date.now() - routeStart}ms)`);

  return NextResponse.json({ events: events || [] });
}
