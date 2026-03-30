'use client';

import { useState, useEffect, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import type { TrackInfo } from '@/types';
import styles from './NowPlayingCard.module.css';

interface NowPlayingCardProps {
  track: TrackInfo;
  polledAt: string; // ISO timestamp del último poll
  onBlock: (type: 'track' | 'artist') => void;
  isChanging?: boolean;
  slotLabel?: string; // ej: "Tarde", "Noche", "Peak"
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const fac = new FastAverageColor();
const FALLBACK_COLOR = '200, 169, 110'; // gold

export function NowPlayingCard({
  track,
  polledAt,
  onBlock,
  isChanging = false,
  slotLabel,
}: NowPlayingCardProps) {
  const [progress, setProgress] = useState(track.progress_ms);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ambientColor, setAmbientColor] = useState(FALLBACK_COLOR);
  const rafRef = useRef<number | null>(null);
  const baseTimeRef = useRef({ progress_ms: track.progress_ms, ts: Date.now() });
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Extraer color dominante del album art
  useEffect(() => {
    if (!track.album_art_url) { setAmbientColor(FALLBACK_COLOR); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = track.album_art_url;
    img.onload = () => {
      try {
        const result = fac.getColor(img, { algorithm: 'dominant' });
        const [r, g, b] = result.value;
        setAmbientColor(`${r}, ${g}, ${b}`);
      } catch {
        setAmbientColor(FALLBACK_COLOR);
      }
    };
    img.onerror = () => setAmbientColor(FALLBACK_COLOR);
  }, [track.album_art_url]);

  // Cuando llegan datos nuevos del poll, resetear la base de tiempo
  useEffect(() => {
    baseTimeRef.current = {
      progress_ms: track.progress_ms,
      ts: Date.now(),
    };
  }, [polledAt, track.progress_ms]);

  // Animación suave del progreso usando requestAnimationFrame
  useEffect(() => {
    if (!track.is_playing) {
      setProgress(track.progress_ms);
      return;
    }

    function tick() {
      const elapsed = Date.now() - baseTimeRef.current.ts;
      const current = baseTimeRef.current.progress_ms + elapsed;
      setProgress(Math.min(current, track.duration_ms));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [track.is_playing, track.duration_ms, polledAt]);

  const progressPercent = Math.min(100, (progress / track.duration_ms) * 100);
  const isPaused = !track.is_playing;

  return (
    <div
      className={`${styles.card} ${isChanging ? styles.changing : ''} ${isPaused ? styles.paused : ''}`}
      style={{ '--ambient-rgb': ambientColor } as React.CSSProperties}
      role="region"
      aria-label="Canción en reproducción"
    >
      {/* Ambient glow from album art color */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Header con label y menú */}
      <div className={styles.header}>
        <span className={`${styles.label} label-uppercase`}>
          {isPaused ? 'Pausado' : slotLabel ? `Sonando en tu ${slotLabel}` : 'Sonando Ahora'}
        </span>
        <div className={styles.menuWrapper}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Opciones de la canción"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className={styles.menuScrim} onClick={() => setMenuOpen(false)} />
              <div className={styles.menu} role="menu">
                <button
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => { onBlock('track'); setMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Bloquear esta canción
                </button>
                <button
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => { onBlock('artist'); setMenuOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Bloquear a {track.artist}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Álbum art + info */}
      <div className={styles.trackInfo}>
        <div className={styles.artWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={track.album_art_url}
            alt={`Portada de ${track.album}`}
            width={280}
            height={280}
            className={styles.art}
          />
          {isPaused && (
            <div className={styles.pauseOverlay} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
          )}
        </div>

        <div className={styles.textInfo}>
          <p className={`${styles.trackName} font-display text-2line`}>{track.name}</p>
          <p className={styles.artistName}>{track.artist}</p>
          <p className={styles.albumName}>{track.album}</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className={styles.progressSection}>
        <span className={styles.timeElapsed}>
          {isPaused ? '—' : formatTime(progress)}
        </span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de la canción"
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className={styles.progressKnob}
            style={{ left: `${progressPercent}%` }}
          />
        </div>
        <span className={styles.timeDuration}>
          {isPaused ? '—' : formatTime(track.duration_ms)}
        </span>
      </div>

      {/* Aria live para el estado */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isPaused
          ? `Pausado en ${track.name} de ${track.artist}`
          : `Reproduciendo ${track.name} de ${track.artist}`}
      </span>
    </div>
  );
}

export function NowPlayingSkeleton() {
  return (
    <div className={styles.card} role="status" aria-label="Cargando reproductor">
      <div className={styles.header}>
        <div className={`skeleton ${styles.skeletonLabel}`} />
      </div>
      <div className={styles.trackInfo}>
        <div className={`skeleton ${styles.skeletonArt}`} />
        <div className={styles.textInfo}>
          <div className={`skeleton ${styles.skeletonTitle}`} />
          <div className={`skeleton ${styles.skeletonArtist}`} />
        </div>
      </div>
      <div className={styles.progressSection}>
        <span className={`skeleton ${styles.skeletonTime}`} />
        <div className={`skeleton ${styles.skeletonProgress}`} />
        <span className={`skeleton ${styles.skeletonTime}`} />
      </div>
    </div>
  );
}
