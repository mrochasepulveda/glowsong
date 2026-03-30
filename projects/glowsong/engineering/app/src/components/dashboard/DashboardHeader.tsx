'use client';

import Link from 'next/link';
import type { Local } from '@/types';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import styles from './DashboardHeader.module.css';

type SessionStatus = 'active' | 'paused' | 'no_device' | 'no_session';

interface DashboardHeaderProps {
  local: Pick<Local, 'name'>;
  sessionStatus: SessionStatus;
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; css: string }> = {
  active:    { label: 'En vivo',       css: styles.live },
  paused:    { label: 'Pausado',       css: styles.paused },
  no_device: { label: 'Desconectado',  css: styles.disconnected },
  no_session:{ label: 'Inactivo',      css: styles.inactive },
};

const SLOT_LABELS: Record<string, string> = {
  opening:     '🌤 Apertura',
  afternoon:   '🌆 Tarde',
  early_night: '🌙 Noche Temprana',
  peak_night:  '🔥 Peak Noche',
  closing:     '🌌 Cierre',
};

export function DashboardHeader({ local, sessionStatus }: DashboardHeaderProps) {
  const status = STATUS_CONFIG[sessionStatus];
  const slot = getCurrentTimeSlot();
  const slotLabel = SLOT_LABELS[slot] ?? slot;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <span className={`${styles.logo} font-display`}>Glowsong</span>

        {/* Divider + Local name */}
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.localName}>{local.name}</span>

        {/* Status */}
        <div className={styles.statusWrapper}>
          <span className={`${styles.dot} ${status.css}`} aria-hidden="true" />
          <span className={styles.statusLabel}>{status.label}</span>
        </div>

        {/* Spacer */}
        <span className={styles.spacer} />

        {/* Franja horaria */}
        <div className={styles.timeInfo}>
          <span className={styles.timeSlotBadge}>{slotLabel}</span>
        </div>

        {/* Config button */}
        <Link
          href="/dashboard/config"
          className={styles.configBtn}
          aria-label="Configuración"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Configuración</span>
        </Link>
      </div>
    </header>
  );
}
