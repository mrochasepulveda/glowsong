'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { DashboardState, SessionStatus, MusicProfile, Genre, TrackInfo } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocal } from '@/hooks/useLocal';
import { useBlocks } from '@/hooks/useBlocks';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentTimeSlot, getEnergyParamsForSlot } from '@/lib/algorithm/timeSlots';
import { getMoodForSlot } from '@/lib/algorithm/moodPresets';
import { getRecommendations } from '@/lib/algorithm/spotifyClient';
import { genresToSpotifySeeds } from '@/lib/algorithm/genreMapping';
import { NowPlayingCard, NowPlayingSkeleton } from '@/components/dashboard/NowPlayingCard';
import { ControlButtons } from '@/components/dashboard/ControlButtons';
import { QueueList } from '@/components/dashboard/QueueList';
import { NoDeviceState } from '@/components/dashboard/NoDeviceState';
import { AlgorithmPanel } from '@/components/dashboard/AlgorithmPanel';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import styles from './DashboardView.module.css';

const SLOT_LABELS: Record<string, string> = {
  opening:     '🌤 Apertura',
  afternoon:   '🌆 Tarde',
  early_night: '🌙 Noche temprana',
  peak_night:  '🔥 Peak noche',
  closing:     '🌌 Cierre',
};

const SLOT_LABELS_CLEAN: Record<string, string> = {
  opening:     'Apertura',
  afternoon:   'Tarde',
  early_night: 'Noche',
  peak_night:  'Peak',
  closing:     'Cierre',
};

/** Saludo contextual basado en hora chilena */
function getGreeting(): string {
  const h = parseInt(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Santiago',
      hour: 'numeric',
      hour12: false,
    }),
    10,
  );
  if (h >= 6 && h < 13) return 'Buenos días';
  if (h >= 13 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

const STATUS_CONFIG = {
  active:     { label: 'En vivo',       dotCss: styles.live },
  paused:     { label: 'Pausado',       dotCss: styles.paused },
  no_device:  { label: 'Desconectado',  dotCss: styles.disconnected },
  no_session: { label: 'Inactivo',      dotCss: styles.inactive },
} as const;

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function DashboardView() {
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Datos de Supabase
  const { local, musicProfile: musicProfileRow, loading: isLocalLoading } = useLocal();
  const { blocks: blockRows } = useBlocks(local?.id ?? null);
  const { signOut } = useAuth();
  const localName = local?.name ?? 'Mi Local';

  // Player del contexto persistente (layout)
  const {
    sdkState,
    sdkError,
    pause: sdkPause,
    resume: sdkResume,
    skipNext: sdkSkipNext,
    playTrackUri,
    algorithmState,
    localQueue,
  } = usePlayer();

  // Convertir musicProfile para bootstrap
  const musicProfile: MusicProfile | null = useMemo(
    () => musicProfileRow ? {
      id: musicProfileRow.id,
      local_id: musicProfileRow.local_id,
      name: 'Perfil Local',
      allowed_genres: musicProfileRow.genres as Genre[],
      seed_artists: musicProfileRow.seed_artists || [],
      energy_level: musicProfileRow.energy_level,
      is_default: true,
      created_at: musicProfileRow.created_at,
    } : null,
    [musicProfileRow]
  );

  // Redirigir al onboarding si el local existe pero no está activo
  useEffect(() => {
    if (!isLocalLoading && local && local.status !== 'active') {
      window.location.href = '/onboarding';
    }
  }, [local, isLocalLoading]);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // Fallback: polling cada 60s para datos complementarios
  useQuery<DashboardState>({
    queryKey: ['dashboard-state'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/state');
      if (res.status === 404) {
        window.location.href = '/onboarding';
        throw new Error('Local no configurado');
      }
      if (!res.ok) throw new Error('Failed to fetch state');
      return res.json();
    },
    refetchInterval: 60_000, // 60s (ya no 5s — el SDK da datos en tiempo real)
    enabled: !!local,
  });

  // — Controles vía SDK (directos, sin /api/dashboard/control) —

  const handleSkip = useCallback(async () => {
    if (isSkipLoading || !sdkState.isPlaying) return;
    setIsSkipLoading(true);
    try {
      await sdkSkipNext();
    } catch {
      showToast('Error al saltar', 'error');
    }
    setIsSkipLoading(false);
  }, [isSkipLoading, sdkState.isPlaying, sdkSkipNext, showToast]);

  const handleTogglePause = useCallback(async () => {
    if (isPauseLoading) return;
    setIsPauseLoading(true);
    try {
      if (sdkState.isPlaying) {
        await sdkPause();
      } else {
        await sdkResume();
      }
    } catch {
      showToast('Error en control de reproducción', 'error');
    }
    setIsPauseLoading(false);
  }, [isPauseLoading, sdkState.isPlaying, sdkPause, sdkResume, showToast]);

  const handleBlock = useCallback(async (type: 'track' | 'artist') => {
    if (!sdkState.currentTrack) return;
    const target = type === 'track'
      ? sdkState.currentTrack.name
      : sdkState.currentTrack.artist;
    showToast(`"${target}" bloqueado`, 'success');
  }, [sdkState.currentTrack, showToast]);

  const handlePlayQueueTrack = useCallback(async (trackId: string) => {
    const uri = trackId.startsWith('spotify:') ? trackId : `spotify:track:${trackId}`;
    try {
      await playTrackUri(uri);
    } catch {
      showToast('Error al reproducir', 'error');
    }
  }, [playTrackUri, showToast]);

  // — Auto-bootstrap: SDK listo → buscar y reproducir primer track —
  // Usa state (no ref) para que React re-ejecute el effect tras cada intento fallido.
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const MAX_BOOTSTRAP = 3;

  useEffect(() => {
    if (!sdkState.isReady || sdkState.currentTrack || bootstrapAttempt >= MAX_BOOTSTRAP || !musicProfile || !local) {
      return;
    }

    let cancelled = false;
    // 1s la primera vez (device registration), 2s en retries
    const delay = bootstrapAttempt === 0 ? 1000 : 2000;

    const timer = setTimeout(async () => {
      if (cancelled) return;

      try {
        console.log(`[Dashboard] Auto-bootstrap intento ${bootstrapAttempt + 1}/${MAX_BOOTSTRAP}...`);
        const slot = getCurrentTimeSlot();
        const moodData = getMoodForSlot(local.type ?? 'otro', slot);
        const energyParams = getEnergyParamsForSlot(slot, musicProfile.energy_level);
        const seedGenres = genresToSpotifySeeds(musicProfile.allowed_genres);

        const candidates = await getRecommendations(seedGenres, energyParams, 20, local.id, moodData.keywords);

        if (cancelled) return;

        if (candidates.length > 0) {
          const first = candidates[0];
          console.log(`[Dashboard] Auto-bootstrap: reproduciendo "${first.name}" de ${first.artist}`);
          await playTrackUri(`spotify:track:${first.spotify_track_id}`);
        } else {
          console.warn('[Dashboard] Auto-bootstrap: no se encontraron candidatos');
        }
      } catch (err) {
        console.error('[Dashboard] Auto-bootstrap error:', err);
      }

      // Incrementar intento → re-render → si currentTrack sigue null, reintenta
      if (!cancelled) {
        setBootstrapAttempt(prev => prev + 1);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sdkState.isReady, sdkState.currentTrack, bootstrapAttempt, musicProfile, local, playTrackUri]);

  // — Derivar estado para la UI —

  const isPlaying = sdkState.isPlaying;
  const isDeviceActive = sdkState.isReady;

  // Mapear track del SDK → TrackInfo del componente NowPlayingCard
  const currentTrackInfo: TrackInfo | null = sdkState.currentTrack ? {
    spotify_track_id: sdkState.currentTrack.id,
    name: sdkState.currentTrack.name,
    artist: sdkState.currentTrack.artist,
    album: sdkState.currentTrack.album,
    album_art_url: sdkState.currentTrack.albumArtUrl,
    duration_ms: sdkState.currentTrack.durationMs,
    progress_ms: sdkState.position,
    is_playing: sdkState.isPlaying,
  } : null;

  // Cola: usar nuestra lista local (más completa que el SDK que solo da 1-2 tracks).
  // Si la lista local está vacía, fallback al SDK.
  const queueItems = localQueue.length > 0
    ? localQueue.map((t) => ({
        spotify_track_id: t.spotify_track_id,
        name: t.name,
        artist: t.artist,
        album: t.album,
        album_art_url: t.album_art_url,
      }))
    : sdkState.nextTracks.map((t) => ({
        spotify_track_id: t.id,
        name: t.name,
        artist: t.artist,
        album: t.album,
        album_art_url: t.albumArtUrl,
      }));

  // Determinar session status
  // Solo errores críticos (auth, account, init) bloquean la UI.
  // playback_error es normal cuando el SDK conecta sin nada sonando.
  const hasCriticalError = sdkError && sdkError.type !== 'playback_error';
  const sessionStatus: SessionStatus = hasCriticalError
    ? 'no_device'
    : !sdkState.isReady
      ? 'no_session'
      : (sdkState.isPlaying ? 'active' : 'paused');

  // Solo mostrar NoDeviceState para errores críticos (auth/account)
  const showErrorState = hasCriticalError;
  const status = STATUS_CONFIG[sessionStatus] || STATUS_CONFIG['no_session'];
  const slot = getCurrentTimeSlot();
  const slotLabel = SLOT_LABELS[slot] ?? slot;
  const greeting = getGreeting();
  const mood = getMoodForSlot(local?.type ?? 'otro', slot);


  if (!mounted || isLocalLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <div className={`skeleton ${styles.skeletonGreeting}`} />
            <div className={`skeleton ${styles.skeletonMood}`} />
          </div>
        </div>
        <div className={styles.heroSection}>
          <NowPlayingSkeleton />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarGreeting}>{greeting}, {localName}</span>
            <div className={styles.topBarMoodBadge}>
              <span className={styles.moodDot} />
              <span>{slotLabel} · {mood.description}</span>
            </div>
          </div>
          <span className={styles.topBarSpacer} />
        </div>

        {/* Hero area */}
        {showErrorState ? (
          <div className={styles.noDeviceArea}>
            <NoDeviceState
              authError={sdkError?.type === 'authentication_error'}
              accountError={sdkError?.type === 'account_error'}
              onReconnect={() => {
                if (local?.id) {
                  window.location.href = `/api/spotify/login?localId=${local.id}`;
                }
              }}
            />
          </div>
        ) : (
          <div className={styles.heroSection}>
            {currentTrackInfo ? (
              <>
                <NowPlayingCard
                  track={currentTrackInfo}
                  polledAt={new Date().toISOString()}
                  onBlock={handleBlock}
                  slotLabel={SLOT_LABELS_CLEAN[slot]}
                />
                <ControlButtons
                  isPlaying={isPlaying}
                  isDeviceActive={isDeviceActive}
                  isSkipLoading={isSkipLoading}
                  isPauseLoading={isPauseLoading}
                  onSkip={handleSkip}
                  onTogglePause={handleTogglePause}
                />
              </>
            ) : (
              <div className={styles.preparingMusic}>
                <div className={styles.preparingGlow} aria-hidden="true" />
                <GlowsongIsotipo size={48} className={styles.preparingIcon} />
                <p className={styles.preparingText}>Preparando tu música...</p>
                <p className={styles.preparingSubtext}>Conectando con Spotify y buscando el track perfecto</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Toast stack ── */}
      <div className={styles.toastContainer} role="alert" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
