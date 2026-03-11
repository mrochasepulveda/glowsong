import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidToken, getCurrentPlayback, getPlaybackQueue } from '@/lib/spotifyClient';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import type { DashboardState, TrackInfo, DeviceInfo, SessionStatus } from '@/types';

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
            // Ignore
          }
        },
      },
      // Bypass RLS server side using service role might be needed if cookies aren't enough
      // but in this GET we expect the owner's session so cookies logic is perfect.
    }
  );
}

export async function GET() {
  const supabase = await getSupabase();

  // 1. Validar Sesión
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Obtener local del usuario
  const { data: local, error: localErr } = await supabase
    .from('locals')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (localErr || !local) {
    return NextResponse.json({ error: 'Local not found' }, { status: 404 });
  }

  const localId = local.id;

  // Estado default (Desconectado)
  const defaultState: DashboardState = {
    current_track: null,
    queue: [],
    device: { is_active: false, name: '' },
    session_status: 'no_session',
    time_slot: getCurrentTimeSlot(),
    polled_at: new Date().toISOString(),
  };

  if (local.status !== 'active') {
    return NextResponse.json(defaultState);
  }

  // 3. Obtener token de Spotify válido
  const token = await getValidToken(localId);

  if (!token) {
    // Si no hay token válido pero status es active => el token fue revocado
    return NextResponse.json({ ...defaultState, session_status: 'no_session' });
  }

  // 4. Leer estado desde Spotify
  try {
    const playback = await getCurrentPlayback(token);

    if (!playback) {
      // 204 No Content => No hay dispositivo activo
      return NextResponse.json({ ...defaultState, session_status: 'no_device' });
    }

    // Mapear info vital del dispositivo
    const device: DeviceInfo = {
      is_active: playback.device?.is_active || false,
      name: playback.device?.name || 'Spotify Device',
      id: playback.device?.id,
    };

    // Mapear info de la canción (solo si el "item" es una canción)
    let current_track: TrackInfo | null = null;
    const item = playback.item;

    if (item && item.type === 'track') {
      current_track = {
        spotify_track_id: item.id,
        name: item.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
        album: item.album?.name || 'Unknown Album',
        album_art_url: item.album?.images?.[0]?.url || '',
        duration_ms: item.duration_ms || 0,
        progress_ms: playback.progress_ms || 0,
        is_playing: playback.is_playing || false,
      };
    }

    const session_status: SessionStatus = device.is_active 
      ? (playback.is_playing ? 'active' : 'paused')
      : 'no_device';

    // 5. Construir la Cola (Queue)
    const queueData = await getPlaybackQueue(token);
    let queue: TrackInfo[] = [];
    
    if (queueData && queueData.queue) {
      queue = queueData.queue.slice(0, 5).map((item: any) => ({
        spotify_track_id: item.id,
        name: item.name,
        artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
        album: item.album?.name || 'Unknown Album',
        album_art_url: item.album?.images?.[0]?.url || '',
        duration_ms: item.duration_ms || 0,
        progress_ms: 0,
        is_playing: false
      }));
    }

    // 6. Construir el estado final y devolver
    const state: DashboardState = {
      current_track,
      queue, 
      device,
      session_status,
      time_slot: getCurrentTimeSlot(),
      polled_at: new Date().toISOString()
    };

    return NextResponse.json(state);
  } catch (err: unknown) {
    console.error('API /dashboard/state error:', err);
    // En caso de error de red, devolvemos desconectado
    return NextResponse.json({ ...defaultState, session_status: 'no_device' });
  }
}
