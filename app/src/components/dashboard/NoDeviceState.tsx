'use client';

import styles from './NoDeviceState.module.css';

interface NoDeviceStateProps {
  authError: boolean;
  accountError: boolean;
  onReconnect: () => void;
}

export function NoDeviceState({
  authError,
  accountError,
  onReconnect,
}: NoDeviceStateProps) {
  // Estado 1: Error de autenticación — token revocado o expirado
  if (authError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.iconWrapper}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className={styles.textGroup}>
          <h2 className={styles.title}>Sesión de Spotify expirada</h2>
          <p className={styles.description}>
            Tu conexión con Spotify necesita renovarse. Esto puede pasar si cambiaste tu contraseña o revocaste el acceso.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onReconnect}>
            Reconectar Spotify
          </button>
        </div>
      </div>
    );
  }

  // Estado 2: Error de cuenta — no es Premium
  if (accountError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.iconWrapper}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        <div className={styles.textGroup}>
          <h2 className={styles.title}>Spotify Premium requerido</h2>
          <p className={styles.description}>
            Para reproducir música desde Glowsong, tu cuenta necesita ser <strong style={{ color: 'var(--color-text-primary)' }}>Premium</strong>. Puedes actualizar en spotify.com.
          </p>
        </div>

        <div className={styles.actions}>
          <a
            href="https://www.spotify.com/premium/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryBtn}
          >
            Ver planes Premium
          </a>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here, but safe)
  return null;
}
