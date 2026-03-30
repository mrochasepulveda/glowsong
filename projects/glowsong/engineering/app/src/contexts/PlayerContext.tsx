'use client';

import { createContext, useContext } from 'react';
import type { AudioPlayerState } from '@/hooks/useAudioPlayer';
import type { AlgorithmState } from '@/lib/algorithm/engine';
import type { CatalogQueuedTrack } from '@/hooks/useCatalogAlgorithm';

// ============================================================
// PlayerContext — Estado persistente del reproductor y algoritmo.
// Vive en el layout de /dashboard para sobrevivir navegación.
// ============================================================

export interface PlayerContextValue {
  // Player state
  playerState: AudioPlayerState;
  playerError: string | null;

  // Player controls
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipNext: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;

  // Algorithm
  algorithmState: AlgorithmState;
  localQueue: CatalogQueuedTrack[];

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
