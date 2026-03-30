'use client';

import styles from './ControlButtons.module.css';

interface ControlButtonsProps {
  isPlaying: boolean;
  isDeviceActive: boolean;
  isSkipLoading: boolean;
  isPauseLoading: boolean;
  onSkip: () => void;
  onTogglePause: () => void;
}

export function ControlButtons({
  isPlaying,
  isDeviceActive,
  isSkipLoading,
  isPauseLoading,
  onSkip,
  onTogglePause,
}: ControlButtonsProps) {
  return (
    <div className={styles.wrapper}>
      {/* SKIP */}
      <button
        className={`${styles.btn} ${styles.skipBtn}`}
        onClick={onSkip}
        disabled={!isDeviceActive || isSkipLoading}
        aria-label="Saltar canción"
        aria-busy={isSkipLoading}
      >
        {isSkipLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <SkipIcon />
        )}
      </button>

      {/* PAUSE / PLAY */}
      <button
        className={`${styles.btn} ${isPlaying ? styles.pauseBtn : styles.playBtn}`}
        onClick={onTogglePause}
        disabled={!isDeviceActive || isPauseLoading}
        aria-label={isPlaying ? 'Pausar reproducción' : 'Reanudar reproducción'}
        aria-pressed={!isPlaying}
        aria-busy={isPauseLoading}
      >
        {isPauseLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>
    </div>
  );
}

function SkipIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
