'use client';

import { useState, useEffect, useRef } from 'react';
import type { AudioTrack } from '@/hooks/useAudioPlayer';
import styles from './MiniPlayer.module.css';

interface MiniPlayerProps {
  track: AudioTrack;
  isPlaying: boolean;
  position: number;
  duration: number;
  isDeviceActive: boolean;
  isSkipLoading: boolean;
  isPauseLoading: boolean;
  isQueueVisible: boolean;
  onSkip: () => void;
  onTogglePause: () => void;
  onToggleQueue: () => void;
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MiniPlayer({
  track,
  isPlaying,
  position,
  duration,
  isDeviceActive,
  isSkipLoading,
  isPauseLoading,
  isQueueVisible,
  onSkip,
  onTogglePause,
  onToggleQueue,
}: MiniPlayerProps) {
  const [progress, setProgress] = useState(position);
  const baseTimeRef = useRef({ position, ts: Date.now() });
  const rafRef = useRef<number | null>(null);

  // Sync base time when SDK reports new position
  useEffect(() => {
    baseTimeRef.current = { position, ts: Date.now() };
  }, [position]);

  // Animate progress smoothly
  useEffect(() => {
    if (!isPlaying) {
      setProgress(position);
      return;
    }

    function tick() {
      const elapsed = Date.now() - baseTimeRef.current.ts;
      const current = baseTimeRef.current.position + elapsed;
      setProgress(Math.min(current, duration));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, duration, position]);

  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className={styles.bar} role="region" aria-label="Reproductor">
      {/* Progress line across the top */}
      <div className={styles.progressLine}>
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.inner}>
        {/* Track info */}
        <div className={styles.trackSection}>
          {track.albumArtUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={track.albumArtUrl}
              alt=""
              width={40}
              height={40}
              className={styles.art}
            />
          )}
          <div className={styles.trackText}>
            <span className={styles.trackName}>{track.name}</span>
            <span className={styles.artistName}>{track.artist}</span>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <span className={styles.time}>{formatTime(progress)}</span>

          <button
            className={`${styles.btn} ${styles.skipBtn}`}
            onClick={onSkip}
            disabled={!isDeviceActive || isSkipLoading}
            aria-label="Saltar canción"
          >
            {isSkipLoading ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            )}
          </button>

          <button
            className={`${styles.btn} ${isPlaying ? styles.pauseBtn : styles.playBtn}`}
            onClick={onTogglePause}
            disabled={!isDeviceActive || isPauseLoading}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPauseLoading ? (
              <span className={styles.spinner} />
            ) : isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            className={`${styles.btn} ${styles.queueBtn} ${isQueueVisible ? styles.queueBtnActive : ''}`}
            onClick={onToggleQueue}
            aria-label={isQueueVisible ? 'Ocultar cola' : 'Mostrar cola'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>

          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
