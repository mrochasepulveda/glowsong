'use client';

import { createContext, useContext } from 'react';
import type { WebPlaybackState, UseWebPlaybackReturn } from '@/hooks/useWebPlayback';
import type { AlgorithmState } from '@/lib/algorithm/engine';
import type { QueuedTrack } from '@/hooks/useAlgorithm';

// ============================================================
// PlayerContext — Estado persistente del reproductor y algoritmo.
// Vive en el layout de /dashboard para sobrevivir navegación.
// ============================================================

export interface PlayerContextValue {
  // SDK state
  sdkState: WebPlaybackState;
  sdkError: { type: string; message: string } | null;

  // SDK controls
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipNext: () => Promise<void>;
  playTrackUri: (uri: string) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;

  // Algorithm
  algorithmState: AlgorithmState;
  localQueue: QueuedTrack[];

  // UI State
  isQueueVisible: boolean;
  setIsQueueVisible: (visible: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({
  value,
  children,
}: {
  value: PlayerContextValue;
  children: React.ReactNode;
}) {
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider (dashboard layout)');
  }
  return ctx;
}
