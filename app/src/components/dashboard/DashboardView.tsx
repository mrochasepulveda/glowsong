'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { DashboardState, SessionStatus, MusicProfile, Block, Genre, TrackInfo } from '@/types';
import { useWebPlayback } from '@/hooks/useWebPlayback';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useLocal, type MusicProfileRow } from '@/hooks/useLocal';
import { useBlocks, type BlockRow } from '@/hooks/useBlocks';
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

/** Mapea MusicProfileRow (Supabase) → MusicProfile (algoritmo) */
function toMusicProfile(row: MusicProfileRow): MusicProfile {
  return {
    id: row.id,
    local_id: row.local_id,
    name: 'Perfil Local',
    allowed_genres: row.genres as Genre[],
    seed_artists: row.seed_artists || [],
    energy_level: row.energy_level,
    is_default: true,
    created_at: row.created_at,
  };
}

/** Mapea BlockRow (Supabase) → Block (algoritmo) */
function toBlock(row: BlockRow): Block {
  return {
    id: row.id,
    local_id: row.local_id,
    block_type: row.type,
    value: row.value,
    display_name: row.display_name,
    scope: row.scope,
    created_at: row.created_at,
  };
}

const DEFAULT_MUSIC_PROFILE: MusicProfile = {
  id: '', local_id: '', name: '', allowed_genres: [], energy_level: 'auto', is_default: true, created_at: '',
};

export function DashboardView() {
  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Datos reales de Supabase
  const { local, musicProfile: musicProfileRow, loading: isLocalLoading } = useLocal();
  const { blocks: blockRows } = useBlocks(local?.id ?? null);
  const { signOut } = useAuth();
  const localName = local?.name ?? 'Mi Local';

  // Convertir datos Supabase → tipos del algoritmo
  const musicProfile = useMemo(
    () => musicProfileRow ? toMusicProfile(musicProfileRow) : null,
    [musicProfileRow]
  );
  const blocks = useMemo(() => blockRows.map(toBlock), [blockRows]);

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

  // Web Playback SDK — el browser ES el player
  const {
    state: sdkState,
    error: sdkError,
    pause: sdkPause,
    resume: sdkResume,
    skipNext: sdkSkipNext,
    playTrackUri,
  } = useWebPlayback({
    localId: local?.id ?? null,
    enabled: !!local && local.status === 'active',
    onTrackChange: (track) => {
      console.log('[Dashboard] Track changed:', track.name);
    },
    onError: (type, message) => {
      console.error(`[Dashboard] SDK error (${type}):`, message);
      if (type === 'authentication_error') {
        showToast('Error de autenticación con Spotify. Reconecta tu cuenta.', 'error');
      }
    },
  });

  // Algoritmo conectado al SDK
  const { algorithmState, localQueue } = useAlgorithm({
    musicProfile: musicProfile ?? DEFAULT_MUSIC_PROFILE,
    blocks,
    localId: local?.id ?? '',
    localType: local?.type ?? 'otro',
    deviceId: sdkState.deviceId,
    currentTrack: sdkState.currentTrack,
    queueCount: sdkState.nextTracks.length,
    enabled: sdkState.isReady && sdkState.isPlaying && !!musicProfile,
  });

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
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <GlowsongIsotipo size={36} className={styles.sidebarLogo} />
          <span className={styles.sidebarSpacer} />
        </aside>
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
        <aside className={styles.rightPanel}>
          <QueueList queue={[]} onPlayTrack={() => {}} isLoading={true} />
        </aside>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside className={styles.sidebar}>
        <GlowsongIsotipo size={36} className={styles.sidebarLogo} />

        <span className={styles.sidebarSpacer} />

        <div className={styles.sidebarStatus}>
          <span className={`${styles.sidebarDot} ${status.dotCss}`} />
          <span className={styles.sidebarStatusLabel}>{status.label}</span>
        </div>

        <Link href="/dashboard/config" className={styles.sidebarIconBtn} aria-label="Configuración">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>

        <button
          onClick={signOut}
          className={styles.sidebarIconBtn}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </aside>

      {/* ════════════════════════════════
          MAIN (top bar + hero)
      ════════════════════════════════ */}
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

      {/* ════════════════════════════════
          RIGHT PANEL (queue + engine status)
      ════════════════════════════════ */}
      <aside className={styles.rightPanel}>
        <QueueList queue={queueItems} onPlayTrack={handlePlayQueueTrack} isLoading={sdkState.isReady && queueItems.length === 0 && algorithmState.status === 'enqueueing'} />
        <div className={styles.rightPanelFooter}>
          <AlgorithmPanel
            state={algorithmState}
            moodDescription={mood.description}
          />
        </div>
      </aside>

      {/* ── Toast stack ── */}
      <div className={styles.toastContainer} role="alert" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
