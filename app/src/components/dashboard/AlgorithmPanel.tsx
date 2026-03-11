'use client';

import type { AlgorithmState } from '@/lib/algorithm/engine';
import styles from './AlgorithmPanel.module.css';

interface AlgorithmPanelProps {
  state: AlgorithmState;
  moodDescription?: string;
}

/** Mensaje amigable según el estado del motor */
function getStatusMessage(status: AlgorithmState['status'], queueCount: number): {
  text: string;
  color: string;
} {
  switch (status) {
    case 'running':
      return queueCount >= 5
        ? { text: 'Todo fluye bien', color: 'var(--color-success)' }
        : { text: 'Preparando canciones...', color: 'var(--color-accent-gold)' };
    case 'enqueueing':
      return { text: 'Buscando canciones...', color: 'var(--color-accent-gold)' };
    case 'idle':
      return { text: 'Motor en pausa', color: 'var(--color-text-tertiary)' };
    case 'waiting_device':
      return { text: 'Esperando conexión', color: 'var(--color-warning)' };
    case 'all_genres_blocked':
      return { text: 'Todos los géneros bloqueados', color: 'var(--color-error)' };
    case 'empty_catalog':
      return { text: 'Sin canciones disponibles', color: 'var(--color-warning)' };
    case 'rate_limited':
      return { text: 'Spotify necesita un momento...', color: 'var(--color-warning)' };
    case 'error':
      return { text: 'Algo salió mal', color: 'var(--color-error)' };
    default:
      return { text: 'Conectando...', color: 'var(--color-text-tertiary)' };
  }
}

export function AlgorithmPanel({ state, moodDescription }: AlgorithmPanelProps) {
  const { text: statusText, color: statusColor } = getStatusMessage(state.status, state.queueCount);

  const isInitialLoad = state.status === 'idle' && !moodDescription;

  return (
    <div className={styles.panel}>
      {isInitialLoad ? (
        <div className={styles.row}>
          <div className={`skeleton ${styles.skeletonBadge}`} />
        </div>
      ) : (
        <>
          <div className={styles.row}>
            <div className={styles.statusBadge} style={{ '--status-color': statusColor } as React.CSSProperties}>
              <span className={styles.statusDot} />
              <span className={styles.statusLabel}>{statusText}</span>
            </div>
            {state.queueCount > 0 && (
              <>
                <span className={styles.divider} />
                <span className={styles.countBadge}>{state.queueCount} en cola</span>
              </>
            )}
          </div>

          {moodDescription && (
            <p className={styles.moodHint}>{moodDescription}</p>
          )}

          {state.warningMessage && (
            <p className={styles.warning}>{state.warningMessage}</p>
          )}
        </>
      )}
    </div>
  );
}
