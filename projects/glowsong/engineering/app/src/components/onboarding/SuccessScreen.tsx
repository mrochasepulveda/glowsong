'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import styles from './SuccessScreen.module.css';

interface SuccessScreenProps {
  localName: string;
  onGoToDashboard: () => void;
}

export function SuccessScreen({ localName, onGoToDashboard }: SuccessScreenProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setShowConfetti(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
        />
      )}
      {/* Animación de check */}
      <div className={styles.checkWrapper}>
        <svg
          className={styles.checkIcon}
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Glow ambiental */}
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.textContent}>
        <h1 className={styles.title}>
          ¡{localName || 'Tu local'} está listo para sonar!
        </h1>
        <p className={styles.subtitle}>
          Glowsong comenzará a gestionar la música de tu local de forma inteligente.
          Siempre puedes ajustar la configuración desde el Dashboard.
        </p>
      </div>

      {/* Stats rápidos */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>&lt;15 min</span>
          <span className={styles.statLabel}>Onboarding completado</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>100M+</span>
          <span className={styles.statLabel}>Canciones disponibles</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>24/7</span>
          <span className={styles.statLabel}>Gestión automática</span>
        </div>
      </div>

      <button
        className={styles.ctaBtn}
        onClick={onGoToDashboard}
      >
        Ir al Dashboard →
      </button>
    </div>
  );
}
