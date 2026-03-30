'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================
// useAudioPlayer — Hook para reproductor HTML5 Audio
// Reemplaza useWebPlayback (Spotify SDK).
// Maneja cola interna, auto-advance, controles estándar.
// CROSSFADE: usa 2 Audio elements alternados con fade de 3s.
// ============================================================

export interface AudioTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  durationMs: number;
  fileUrl: string;
}

export interface AudioPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  nextTracks: AudioTrack[];
  position: number;       // ms
  duration: number;       // ms
  volume: number;         // 0-1
}

export interface UseAudioPlayerOptions {
  enabled: boolean;
  volume?: number;
  crossfadeDuration?: number; // ms, default 3000
  onTrackChange?: (track: AudioTrack) => void;
  onTrackEnd?: (track: AudioTrack) => void;
  onQueueLow?: (remaining: number) => void;
  queueLowThreshold?: number;
}

export interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  isReady: boolean;
  error: string | null;
  // Controls
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipNext: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  // Queue management
  enqueueTracks: (tracks: AudioTrack[]) => void;
  playTrack: (track: AudioTrack) => Promise<void>;
  clearQueue: () => void;
  getQueueLength: () => number;
}

const INITIAL_STATE: AudioPlayerState = {
  isReady: false,
  isPlaying: false,
  currentTrack: null,
  nextTracks: [],
  position: 0,
  duration: 0,
  volume: 0.8,
};

const FADE_INTERVAL_MS = 50; // Volume update frequency during fade

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const {
    enabled,
    volume = 0.8,
    crossfadeDuration = 3000,
    onTrackChange,
    onTrackEnd,
    onQueueLow,
    queueLowThreshold = 5,
  } = options;

  const [state, setState] = useState<AudioPlayerState>({ ...INITIAL_STATE, volume });
  const [error, setError] = useState<string | null>(null);

  // Two audio elements for crossfade (A/B deck pattern)
  const deckA = useRef<HTMLAudioElement | null>(null);
  const deckB = useRef<HTMLAudioElement | null>(null);
  const activeDeckRef = useRef<'A' | 'B'>('A');

  const queueRef = useRef<AudioTrack[]>([]);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crossfadeTriggeredRef = useRef(false);
  const masterVolumeRef = useRef(volume);
  const isPausedRef = useRef(false);

  // Callback refs
  const onTrackChangeRef = useRef(onTrackChange);
  const onTrackEndRef = useRef(onTrackEnd);
  const onQueueLowRef = useRef(onQueueLow);
  useEffect(() => { onTrackChangeRef.current = onTrackChange; }, [onTrackChange]);
  useEffect(() => { onTrackEndRef.current = onTrackEnd; }, [onTrackEnd]);
  useEffect(() => { onQueueLowRef.current = onQueueLow; }, [onQueueLow]);

  const getActiveDeck = useCallback(() => {
    return activeDeckRef.current === 'A' ? deckA.current : deckB.current;
  }, []);

  const getInactiveDeck = useCallback(() => {
    return activeDeckRef.current === 'A' ? deckB.current : deckA.current;
  }, []);

  // Initialize both Audio elements
  useEffect(() => {
    if (!enabled) {
      deckA.current?.pause();
      deckB.current?.pause();
      deckA.current = null;
      deckB.current = null;
      setState(prev => ({ ...INITIAL_STATE, volume: prev.volume }));
      return;
    }

    if (!deckA.current) {
      deckA.current = new Audio();
      deckA.current.preload = 'auto';
      deckA.current.volume = volume;
    }
    if (!deckB.current) {
      deckB.current = new Audio();
      deckB.current.preload = 'auto';
      deckB.current.volume = 0;
    }

    setState(prev => ({ ...prev, isReady: true }));

    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [enabled, volume]);

  // Position tracking + crossfade trigger
  useEffect(() => {
    if (state.isPlaying) {
      positionIntervalRef.current = setInterval(() => {
        const active = getActiveDeck();
        if (!active || !active.src) return;

        const posMs = Math.round(active.currentTime * 1000);
        const durMs = Math.round((active.duration || 0) * 1000);

        setState(prev => ({ ...prev, position: posMs, duration: durMs }));

        // Trigger crossfade when approaching end
        const timeLeftMs = durMs - posMs;
        if (
          timeLeftMs > 0 &&
          timeLeftMs <= crossfadeDuration &&
          !crossfadeTriggeredRef.current &&
          !isPausedRef.current &&
          queueRef.current.length > 0
        ) {
          crossfadeTriggeredRef.current = true;
          startCrossfade();
        }
      }, 500);
    } else {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    }

    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying, crossfadeDuration]);

  /**
   * Crossfade: fade out active deck, fade in inactive deck with next track.
   */
  const startCrossfade = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) return;

    const outgoing = getActiveDeck();
    const incoming = getInactiveDeck();
    if (!outgoing || !incoming) return;

    const endedTrack = currentTrackRef.current;

    // Preload next track on inactive deck
    incoming.src = next.fileUrl;
    incoming.volume = 0;

    const vol = masterVolumeRef.current;
    const steps = crossfadeDuration / FADE_INTERVAL_MS;
    const volumeStep = vol / steps;
    let step = 0;

    incoming.play().then(() => {
      // Update state to reflect new track
      currentTrackRef.current = next;
      activeDeckRef.current = activeDeckRef.current === 'A' ? 'B' : 'A';

      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrack: next,
        nextTracks: [...queueRef.current],
        position: 0,
        duration: next.durationMs,
      }));

      onTrackChangeRef.current?.(next);
      if (endedTrack) onTrackEndRef.current?.(endedTrack);

      // Check queue
      if (queueRef.current.length < queueLowThreshold) {
        onQueueLowRef.current?.(queueRef.current.length);
      }

      // Animate volume crossfade
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = setInterval(() => {
        step++;
        const outVol = Math.max(0, vol - volumeStep * step);
        const inVol = Math.min(vol, volumeStep * step);
        outgoing.volume = outVol;
        incoming.volume = inVol;

        if (step >= steps) {
          clearInterval(fadeIntervalRef.current!);
          fadeIntervalRef.current = null;
          outgoing.pause();
          outgoing.src = '';
          outgoing.volume = 0;
          crossfadeTriggeredRef.current = false;
        }
      }, FADE_INTERVAL_MS);
    }).catch(() => {
      // Crossfade failed — fallback to hard switch
      crossfadeTriggeredRef.current = false;
      hardSwitch(next);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossfadeDuration, queueLowThreshold]);

  /**
   * Hard switch (no crossfade) — for first track, skip, or crossfade failure.
   */
  const hardSwitch = useCallback(async (track: AudioTrack) => {
    const active = getActiveDeck();
    if (!active) return;

    // Stop any ongoing crossfade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // Stop inactive deck
    const inactive = getInactiveDeck();
    if (inactive) {
      inactive.pause();
      inactive.src = '';
      inactive.volume = 0;
    }

    crossfadeTriggeredRef.current = false;
    currentTrackRef.current = track;
    active.volume = masterVolumeRef.current;
    active.src = track.fileUrl;
    setError(null);

    try {
      await active.play();
      isPausedRef.current = false;
      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentTrack: track,
        nextTracks: [...queueRef.current],
        position: 0,
        duration: track.durationMs,
      }));
      onTrackChangeRef.current?.(track);
    } catch (err) {
      console.error('[AudioPlayer] Play failed:', err);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrack: track,
        nextTracks: [...queueRef.current],
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (next) {
      hardSwitch(next);
      if (queueRef.current.length < queueLowThreshold) {
        onQueueLowRef.current?.(queueRef.current.length);
      }
    } else {
      currentTrackRef.current = null;
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTrack: null,
        nextTracks: [],
        position: 0,
        duration: 0,
      }));
    }
  }, [hardSwitch, queueLowThreshold]);

  // Handle 'ended' event (if crossfade didn't trigger — short tracks, etc.)
  useEffect(() => {
    const handleEnded = () => {
      if (!crossfadeTriggeredRef.current) {
        const endedTrack = currentTrackRef.current;
        if (endedTrack) onTrackEndRef.current?.(endedTrack);
        playNext();
      }
    };

    const handleError = () => {
      const active = getActiveDeck();
      if (active) {
        console.error('[AudioPlayer] Playback error:', active.error?.message);
        setError(active.error?.message || 'Error de reproducción');
      }
      playNext();
    };

    const setupListeners = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
    };

    const cleanListeners = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };

    setupListeners(deckA.current);
    setupListeners(deckB.current);

    return () => {
      cleanListeners(deckA.current);
      cleanListeners(deckB.current);
    };
  }, [playNext, getActiveDeck]);

  // ── Controls ──

  const pause = useCallback(async () => {
    const active = getActiveDeck();
    if (active) {
      active.pause();
      isPausedRef.current = true;
    }
    // Also pause inactive deck if crossfading
    const inactive = getInactiveDeck();
    if (inactive && inactive.src && !inactive.paused) {
      inactive.pause();
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [getActiveDeck, getInactiveDeck]);

  const resume = useCallback(async () => {
    const active = getActiveDeck();
    if (active && currentTrackRef.current) {
      try {
        await active.play();
        isPausedRef.current = false;
        setState(prev => ({ ...prev, isPlaying: true }));
      } catch (err) {
        console.error('[AudioPlayer] Resume failed:', err);
      }
    }
  }, [getActiveDeck]);

  const skipNext = useCallback(async () => {
    // Cancel any in-progress crossfade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    crossfadeTriggeredRef.current = false;

    const active = getActiveDeck();
    if (active) active.pause();
    const inactive = getInactiveDeck();
    if (inactive) { inactive.pause(); inactive.src = ''; inactive.volume = 0; }

    const endedTrack = currentTrackRef.current;
    if (endedTrack) onTrackEndRef.current?.(endedTrack);

    playNext();
  }, [playNext, getActiveDeck, getInactiveDeck]);

  const seek = useCallback(async (positionMs: number) => {
    const active = getActiveDeck();
    if (active) {
      active.currentTime = positionMs / 1000;
      // Reset crossfade trigger if seeking backwards
      crossfadeTriggeredRef.current = false;
      setState(prev => ({ ...prev, position: positionMs }));
    }
  }, [getActiveDeck]);

  const setVolumeControl = useCallback(async (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    masterVolumeRef.current = clamped;
    const active = getActiveDeck();
    if (active && !fadeIntervalRef.current) {
      active.volume = clamped;
    }
    setState(prev => ({ ...prev, volume: clamped }));
  }, [getActiveDeck]);

  // ── Queue Management ──

  const enqueueTracks = useCallback((tracks: AudioTrack[]) => {
    queueRef.current.push(...tracks);
    setState(prev => ({ ...prev, nextTracks: [...queueRef.current] }));

    // If nothing is playing, start first track (hard switch, no crossfade)
    if (!currentTrackRef.current && tracks.length > 0) {
      const first = queueRef.current.shift()!;
      hardSwitch(first);
    }
  }, [hardSwitch]);

  const playTrack = useCallback(async (track: AudioTrack) => {
    await hardSwitch(track);
  }, [hardSwitch]);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setState(prev => ({ ...prev, nextTracks: [] }));
  }, []);

  const getQueueLength = useCallback(() => {
    return queueRef.current.length;
  }, []);

  return {
    state,
    isReady: state.isReady,
    error,
    pause,
    resume,
    skipNext,
    seek,
    setVolume: setVolumeControl,
    enqueueTracks,
    playTrack,
    clearQueue,
    getQueueLength,
  };
}
