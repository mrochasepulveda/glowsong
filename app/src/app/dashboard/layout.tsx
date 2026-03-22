'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWebPlayback } from '@/hooks/useWebPlayback';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useLocal, type MusicProfileRow } from '@/hooks/useLocal';
import { useBlocks, type BlockRow } from '@/hooks/useBlocks';
import { useAuth } from '@/hooks/useAuth';
import { PlayerProvider, type PlayerContextValue } from '@/contexts/PlayerContext';
import { MiniPlayer } from '@/components/dashboard/MiniPlayer';
import { QueueList } from '@/components/dashboard/QueueList';
import { AlgorithmPanel } from '@/components/dashboard/AlgorithmPanel';
import { GlobalSearch } from '@/components/dashboard/GlobalSearch';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import { getMoodForSlot } from '@/lib/algorithm/moodPresets';
import type { MusicProfile, Genre, Block } from '@/types';
import styles from './DashboardLayout.module.css';

// ============================================================
// Dashboard Layout — Persistente entre /dashboard y /dashboard/config
// Inicializa el Web Playback SDK y el algoritmo UNA sola vez.
// ============================================================

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

const STATUS_CONFIG = {
  active:     { label: 'En vivo',       dotCss: styles.live },
  paused:     { label: 'Pausado',       dotCss: styles.paused },
  no_device:  { label: 'Desconectado',  dotCss: styles.disconnected },
  no_session: { label: 'Inactivo',      dotCss: styles.inactive },
} as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { local, musicProfile: musicProfileRow, dayStatuses, slotOverrides, loading: isLocalLoading, refetch } = useLocal();
  const { blocks: blockRows } = useBlocks(local?.id ?? null);
  const { signOut } = useAuth();
  const pathname = usePathname();

  // Refetch data when navigating back from settings
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname && prevPathRef.current === '/dashboard/config') {
      console.log('[Layout] Navigated back from config — refetching profile');
      refetch();
    }
    prevPathRef.current = pathname;
  }, [pathname, refetch]);

  const [isSkipLoading, setIsSkipLoading] = useState(false);
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const musicProfile = useMemo(
    () => musicProfileRow ? toMusicProfile(musicProfileRow) : null,
    [musicProfileRow]
  );
  const blocks = useMemo(() => blockRows.map(toBlock), [blockRows]);

  // Web Playback SDK — persiste entre navegaciones
  const {
    state: sdkState,
    error: sdkError,
    pause,
    resume,
    skipNext,
    playTrackUri,
    setVolume,
  } = useWebPlayback({
    localId: local?.id ?? null,
    enabled: !!local && local.status === 'active',
    onTrackChange: (track) => {
      console.log('[Layout] Track changed:', track.name);
    },
    onError: (type, message) => {
      console.error(`[Layout] SDK error (${type}):`, message);
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
    dayStatuses,
    slotOverrides,
  });

  const playerValue: PlayerContextValue = useMemo(() => ({
    sdkState,
    sdkError,
    pause,
    resume,
    skipNext,
    playTrackUri,
    setVolume,
    algorithmState,
    localQueue,
    isQueueVisible,
    setIsQueueVisible,
    isSearchOpen,
    setIsSearchOpen,
  }), [sdkState, sdkError, pause, resume, skipNext, playTrackUri, setVolume, algorithmState, localQueue, isQueueVisible, isSearchOpen]);

  const handleSkip = useCallback(async () => {
    if (isSkipLoading || !sdkState.isPlaying) return;
    setIsSkipLoading(true);
    try { await skipNext(); } catch { /* silent */ }
    setIsSkipLoading(false);
  }, [isSkipLoading, sdkState.isPlaying, skipNext]);

  const handleTogglePause = useCallback(async () => {
    if (isPauseLoading) return;
    setIsPauseLoading(true);
    try {
      if (sdkState.isPlaying) { await pause(); } else { await resume(); }
    } catch { /* silent */ }
    setIsPauseLoading(false);
  }, [isPauseLoading, sdkState.isPlaying, pause, resume]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when typing in inputs/textareas
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePause();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleTogglePause]);

  const handlePlayQueueTrack = useCallback(async (trackId: string) => {
    const uri = trackId.startsWith('spotify:') ? trackId : `spotify:track:${trackId}`;
    try {
      await playTrackUri(uri);
    } catch {
      // toast is better but layout doesn't have it yet? or uses the one in DashboardView?
    }
  }, [playTrackUri]);

  // Determinar session status
  const hasCriticalError = sdkError && sdkError.type !== 'playback_error';
  const sessionStatus = hasCriticalError
    ? 'no_device'
    : !sdkState.isReady
      ? 'no_session'
      : (sdkState.isPlaying ? 'active' : 'paused');
  
  const status = STATUS_CONFIG[sessionStatus] || STATUS_CONFIG['no_session'];
  const slot = getCurrentTimeSlot();
  const mood = getMoodForSlot(local?.type ?? 'otro', slot);

  // Solo mostrar MiniPlayer si hay track sonando o pausado
  const showMiniPlayer = sdkState.isReady && sdkState.currentTrack !== null;

  // Formatear items de cola para QueueList
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

  return (
    <PlayerProvider value={playerValue}>
      <div className={styles.shell}>
        <div className={styles.contentWrapper}>
          
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

            <Link 
              href="/dashboard" 
              className={`${styles.sidebarIconBtn} ${pathname === '/dashboard' ? styles.sidebarIconBtnActive : ''}`} 
              aria-label="Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>

            <button
              onClick={() => setIsSearchOpen(true)}
              className={`${styles.sidebarIconBtn} ${isSearchOpen ? styles.sidebarIconBtnActive : ''}`}
              aria-label="Buscar canción"
              title="Buscar (S)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <Link 
              href="/dashboard/config" 
              className={`${styles.sidebarIconBtn} ${pathname === '/dashboard/config' ? styles.sidebarIconBtnActive : ''}`} 
              aria-label="Configuración"
            >
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
              MAIN CONTENT (scrollable)
          ════════════════════════════════ */}
          {children}

          {/* ════════════════════════════════
              RIGHT PANEL (toggleable queue)
          ════════════════════════════════ */}
          <aside className={`${styles.rightPanel} ${!isQueueVisible ? styles.rightPanelHidden : ''}`}>
            <QueueList 
              queue={queueItems} 
              onPlayTrack={handlePlayQueueTrack} 
              isLoading={sdkState.isReady && queueItems.length === 0 && algorithmState.status === 'enqueueing'} 
            />
            <div className={styles.rightPanelFooter}>
              <AlgorithmPanel
                state={algorithmState}
                moodDescription={mood.description}
              />
            </div>
          </aside>
        </div>

        {/* ════════════════════════════════
            MINI PLAYER (bottom)
        ════════════════════════════════ */}
        {showMiniPlayer && (
          <MiniPlayer
            track={sdkState.currentTrack!}
            isPlaying={sdkState.isPlaying}
            position={sdkState.position}
            duration={sdkState.duration}
            isDeviceActive={sdkState.isReady}
            isSkipLoading={isSkipLoading}
            isPauseLoading={isPauseLoading}
            isQueueVisible={isQueueVisible}
            onSkip={handleSkip}
            onTogglePause={handleTogglePause}
            onToggleQueue={() => setIsQueueVisible(!isQueueVisible)}
          />
        )}
      </div>

      <GlobalSearch />
    </PlayerProvider>
  );
}
