'use client';

import type { DashboardState } from '@/types';
import styles from './QueueList.module.css';

interface QueueListProps {
  queue: DashboardState['queue'];
  isLoading?: boolean;
  onPlayTrack?: (trackId: string, index: number) => void;
}

export function QueueList({ queue, isLoading = false, onPlayTrack }: QueueListProps) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <p className={`${styles.label} label-uppercase`}>Siguiente en Cola</p>
        <div className={styles.list}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={`skeleton ${styles.skeletonArt}`} />
              <div className={styles.skeletonText}>
                <div className={`skeleton ${styles.skeletonTitle}`} />
                <div className={`skeleton ${styles.skeletonArtist}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.headerRow}>
          <p className={`${styles.label} label-uppercase`}>Siguiente</p>
          <span className={styles.queueCount}>0 tracks</span>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className={styles.emptyText}>
            Dale play para que Glowsong empiece a seleccionar canciones para tu local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <p className={`${styles.label} label-uppercase`}>Siguiente</p>
        <span className={styles.queueCount}>{queue.length} {queue.length === 1 ? 'track' : 'tracks'}</span>
      </div>
      <div className={styles.list} role="list">
        {queue.slice(0, 10).map((track, index) => (
          <button
            key={`${track.spotify_track_id}-${index}`}
            className={`${styles.item} ${index === 0 ? styles.itemNext : ''}`}
            role="listitem"
            onClick={() => onPlayTrack?.(track.spotify_track_id, index)}
            title={`Reproducir ${track.name}`}
          >
            {index === 0 ? (
              <span className={styles.nextLabel}>NEXT</span>
            ) : (
              <span className={styles.position}>{index + 1}</span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={track.album_art_url || 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=100'}
              alt={track.album}
              width={56}
              height={56}
              className={styles.art}
              loading="lazy"
            />
            <div className={styles.textInfo}>
              <p className={`${styles.trackName} text-truncate`}>{track.name}</p>
              <p className={`${styles.artistName} text-truncate`}>{track.artist}</p>
            </div>
            <span className={styles.playHint} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
