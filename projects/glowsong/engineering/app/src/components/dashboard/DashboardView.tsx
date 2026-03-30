'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TrackInfo } from '@/types';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLocal } from '@/hooks/useLocal';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import { getMoodForSlot } from '@/lib/algorithm/moodPresets';
import { NowPlayingCard, NowPlayingSkeleton } from '@/components/dashboard/NowPlayingCard';
import { ControlButtons } from '@/components/dashboard/ControlButtons';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import styles from './DashboardView.module.css';

const SLOT_LABELS: Record<string, string> = {
  opening:     'Apertura',
  afternoon:   'Tarde',
  early_night: 'Noche temprana',
  peak_night:  'Peak noche',
  closing:     'Cierre',
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
  const { local, loading: isLocalLoading } = useLocal();
  const localName = local?.name ?? 'Mi Local';

  // Player del contexto persistente (layout)
  const {
    playerState,
    pause,
    resume,
    skipNext,
    algorithmState,
  } = usePlayer();

  // Redirigir al onboarding si el local no está listo
  useEffect(() => {
    if (!isLocalLoading && local && local.status !== 'active' && local.status !== 'configured') {
      window.location.href = '/onboarding';
    }
  }, [local, isLocalLoading]);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // — Controles —

  const handleSkip = useCallback(async () => {
    if (isSkipLoading || !playerState.isPlaying) return;
    setIsSkipLoading(true);
    try {
      await skipNext();
    } catch {
      showToast('Error al saltar', 'error');
    }
    setIsSkipLoading(false);
  }, [isSkipLoading, playerState.isPlaying, skipNext, showToast]);

  const handleTogglePause = useCallback(async () => {
    if (isPauseLoading) return;
    setIsPauseLoading(true);
    try {
      if (playerState.isPlaying) {
        await pause();
      } else {
        await resume();
      }
    } catch {
      showToast('Error en control de reproducción', 'error');
    }
    setIsPauseLoading(false);
  }, [isPauseLoading, playerState.isPlaying, pause, resume, showToast]);

  const handleBlock = useCallback(async (type: 'track' | 'artist') => {
    if (!playerState.currentTrack) return;
    const target = type === 'track'
      ? playerState.currentTrack.name
      : playerState.currentTrack.artist;
    showToast(`"${target}" bloqueado`, 'success');
  }, [playerState.currentTrack, showToast]);

  // — Derivar estado para la UI —

  const isPlaying = playerState.isPlaying;
  const isDeviceActive = playerState.isReady;

  // Mapear track del player → TrackInfo del componente NowPlayingCard
  const currentTrackInfo: TrackInfo | null = playerState.currentTrack ? {
    spotify_track_id: playerState.currentTrack.id,
    name: playerState.currentTrack.name,
    artist: playerState.currentTrack.artist,
    album: playerState.currentTrack.album,
    album_art_url: playerState.currentTrack.albumArtUrl,
    duration_ms: playerState.currentTrack.durationMs,
    progress_ms: playerState.position,
    is_playing: playerState.isPlaying,
  } : null;

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
              <p className={styles.preparingSubtext}>Buscando el track perfecto para tu local</p>
            </div>
          )}
        </div>
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
