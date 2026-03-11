'use client';

import { useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import styles from './Step.module.css';
import spotifyStyles from './Step4Spotify.module.css';

interface Step4Props {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  isSaving?: boolean;
  localId?: string;
}

export function Step4Spotify({ data, onChange, onNext, onPrev, isSaving = false, localId }: Step4Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(data.spotifyConnected);

  const handleConnect = async () => {
    if (!localId) return;
    setIsLoading(true);
    // Guardar un flag the onboaring en progreso para el regreso de oauth
    sessionStorage.setItem('glowsong_onboarding_in_progress', 'true');
    window.location.href = `/api/spotify/login?localId=${localId}`;
  };

  const handleActivate = () => {
    onNext();
  };

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.title}>Conecta tu Spotify</h1>
        <p className={styles.subtitle}>
          Glowsong usa tu cuenta Spotify para controlar la música de tu local en tiempo real.
        </p>
      </div>

      {/* Info card de permisos */}
      <div className={spotifyStyles.permissionsCard}>
        <div className={spotifyStyles.permissionSection}>
          <p className={spotifyStyles.permissionTitle}>¿Qué puede hacer Glowsong?</p>
          {[
            'Controlar qué canciones suenan en tu local',
            'Ver qué dispositivos Spotify tienes disponibles',
            'Encolar canciones automáticamente según el momento',
          ].map((item) => (
            <div key={item} className={spotifyStyles.permissionItem}>
              <span className={`${spotifyStyles.permIcon} ${spotifyStyles.permAllowed}`}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className={spotifyStyles.permissionDivider} />
        <div className={spotifyStyles.permissionSection}>
          <p className={spotifyStyles.permissionTitle}>¿Qué NO puede hacer?</p>
          {[
            'Ver tu historial de escucha personal',
            'Modificar tus playlists personales',
          ].map((item) => (
            <div key={item} className={spotifyStyles.permissionItem}>
              <span className={`${spotifyStyles.permIcon} ${spotifyStyles.permDenied}`}>✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.form}>
        {!isConnected ? (
          <>
            <div className={styles.buttonRow} style={{ marginTop: '24px' }}>
              {onPrev && (
                <button type="button" className={styles.secondaryBtn} onClick={onPrev} disabled={isLoading}>
                  ← Atrás
                </button>
              )}
              <button
                type="button"
                className={spotifyStyles.spotifyBtn}
                onClick={handleConnect}
                disabled={isLoading}
                style={{ flex: 1 }}
              >
                {isLoading ? (
                  <span className={styles.btnSpinner} style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                ) : (
                  <>
                    <SpotifyIcon />
                    Conectar con Spotify
                  </>
                )}
              </button>
            </div>
            <p className={spotifyStyles.premiumNote}>
              Necesitas una cuenta{' '}
              <a href="https://www.spotify.com/cl/premium/" target="_blank" rel="noopener noreferrer">
                Spotify Premium
              </a>{' '}
              para usar Glowsong.
            </p>
          </>
        ) : (
          <>
            <div className={spotifyStyles.connectedBadge}>
              <span className={spotifyStyles.connectedDot} />
              <SpotifyIcon />
              <span>Spotify conectado</span>
            </div>
            
            <div className={styles.buttonRow} style={{ marginTop: '24px' }}>
              {onPrev && (
                <button type="button" className={styles.secondaryBtn} onClick={onPrev} disabled={isLoading || isSaving}>
                  ← Atrás
                </button>
              )}
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleActivate}
                disabled={isLoading || isSaving}
                style={{ flex: 1 }}
              >
                {isSaving ? 'Guardando...' : isLoading ? <span className={styles.btnSpinner} /> : '¡Activar Glowsong! →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
