import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidToken, pausePlayback, resumePlayback, skipToNext } from '@/lib/spotifyClient';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignore for Route Handlers
          }
        },
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = await getSupabase();

  // 1. Validar Sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Obtener local del usuario
  const { data: local } = await supabase
    .from('locals')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (!local || local.status !== 'active') {
    return NextResponse.json({ error: 'Local not ready' }, { status: 400 });
  }

  const token = await getValidToken(local.id);
  if (!token) {
    return NextResponse.json({ error: 'Spotify not linked' }, { status: 400 });
  }

  try {
    const { action } = await request.json();

    switch (action) {
      case 'play':
        await resumePlayback(token);
        break;
      case 'pause':
        await pausePlayback(token);
        break;
      case 'skip':
        await skipToNext(token);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Spotify control error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
