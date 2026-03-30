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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore si headers ya fueron enviados
          }
        },
      },
    }
  );
}

/**
 * GET /api/spotify/token?localId=xxx
 * Retorna un access_token válido para el local especificado.
 * Usado por el Web Playback SDK (callback getOAuthToken).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localId = searchParams.get('localId');

  if (!localId) {
    return NextResponse.json({ error: 'Missing localId' }, { status: 400 });
  }

  // Autenticar usuario
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar ownership del local
  const { data: local, error: localErr } = await supabase
    .from('locals')
    .select('id')
    .eq('id', localId)
    .eq('owner_id', user.id)
    .single();

  if (localErr || !local) {
    return NextResponse.json({ error: 'Local not found or not owned by user' }, { status: 403 });
  }

  // Obtener token válido (con refresh automático si expiró)
  const token = await getValidToken(localId);

  if (!token) {
    return NextResponse.json({ error: 'No valid Spotify token. Please reconnect Spotify.' }, { status: 401 });
  }

  return NextResponse.json({ access_token: token });
}
