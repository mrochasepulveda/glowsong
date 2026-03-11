'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================
// useWebPlayback — Hook para Spotify Web Playback SDK
// Convierte el browser en un dispositivo Spotify.
// ============================================================

export interface WebPlaybackTrack {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  durationMs: number;
}

export interface WebPlaybackState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: WebPlaybackTrack | null;
  nextTracks: WebPlaybackTrack[];
  position: number;
  duration: number;
  deviceId: string | null;
}

type PlayerError = 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error';

export interface UseWebPlaybackOptions {
  localId: string | null;
  enabled: boolean;
  playerName?: string;
  volume?: number;
  onTrackChange?: (track: WebPlaybackTrack) => void;
  onError?: (type: PlayerError, message: string) => void;
}

export interface UseWebPlaybackReturn {
  state: WebPlaybackState;
  player: Spotify.Player | null;
  needsInteraction: boolean;
  error: { type: PlayerError; message: string } | null;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipNext: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  transferPlayback: () => Promise<void>;
  playTrackUri: (uri: string) => Promise<void>;
}

const INITIAL_STATE: WebPlaybackState = {
  isReady: false,
  isPlaying: false,
  currentTrack: null,
  nextTracks: [],
  position: 0,
  duration: 0,
  deviceId: null,
};

function mapTrack(track: Spotify.Track): WebPlaybackTrack {
  return {
    id: track.id || track.uri,
    uri: track.uri,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArtUrl: track.album.images[0]?.url || '',
    durationMs: track.duration_ms,
  };
}

let sdkLoadPromise: Promise<void> | null = null;

function loadSpotifySDK(): Promise<void> {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  });

  return sdkLoadPromise;
}

export function useWebPlayback(options: UseWebPlaybackOptions): UseWebPlaybackReturn {
  const { localId, enabled, playerName = 'Glowsong', volume = 0.8, onTrackChange, onError } = options;

  const [state, setState] = useState<WebPlaybackState>(INITIAL_STATE);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [error, setError] = useState<{ type: PlayerError; message: string } | null>(null);

  const playerRef = useRef<Spotify.Player | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);
  const onTrackChangeRef = useRef(onTrackChange);
  const onErrorRef = useRef(onError);

  // Mantener refs actualizadas
  useEffect(() => { onTrackChangeRef.current = onTrackChange; }, [onTrackChange]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const fetchToken = useCallback(async (): Promise<string> => {
    const res = await fetch(`/api/spotify/token?localId=${localId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch Spotify token');
    }
    const data = await res.json();
    return data.access_token;
  }, [localId]);

  // Inicializar el SDK y crear el Player
  const initPlayer = useCallback(async () => {
    if (!localId || !enabled) return;

    await loadSpotifySDK();

    // Si ya hay un player, desconectar primero
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }

    const player = new window.Spotify.Player({
      name: playerName,
      getOAuthToken: (cb) => {
        fetchToken().then(cb).catch(() => {
          setError({ type: 'authentication_error', message: 'Failed to get token' });
          onErrorRef.current?.('authentication_error', 'Failed to get token');
        });
      },
      volume,
    });

    // --- Event Listeners ---

    player.addListener('ready', ({ device_id }) => {
      console.log('[WebPlayback] Ready with device ID:', device_id);
      setState(prev => ({ ...prev, isReady: true, deviceId: device_id }));
      setError(null);
    });

    player.addListener('not_ready', ({ device_id }) => {
      console.log('[WebPlayback] Device not ready:', device_id);
      setState(prev => ({ ...prev, isReady: false }));
    });

    player.addListener('player_state_changed', (sdkState) => {
      if (!sdkState) {
        setState(prev => ({ ...prev, isPlaying: false, currentTrack: null, nextTracks: [], position: 0, duration: 0 }));
        return;
      }

      const current = sdkState.track_window.current_track;
      const currentTrack = mapTrack(current);
      const nextTracks = sdkState.track_window.next_tracks.map(mapTrack);

      // Detectar cambio de track
      const prevTrackId = currentTrackIdRef.current;
      const newTrackId = current.id || current.uri;

      if (prevTrackId !== null && prevTrackId !== newTrackId) {
        onTrackChangeRef.current?.(currentTrack);
      }
      currentTrackIdRef.current = newTrackId;

      setState(prev => ({
        ...prev,
        isPlaying: !sdkState.paused,
        currentTrack,
        nextTracks,
        position: sdkState.position,
        duration: sdkState.duration,
      }));
    });

    // Errores críticos (auth, account) no deben ser sobreescritos por playback_error
    const CRITICAL_ERRORS: PlayerError[] = ['authentication_error', 'account_error', 'initialization_error'];

    const handleError = (type: PlayerError) => (e: { message: string }) => {
      console.error(`[WebPlayback] ${type}:`, e.message);
      setError((prev) => {
        // No sobreescribir un error crítico con uno menos importante
        if (prev && CRITICAL_ERRORS.includes(prev.type) && !CRITICAL_ERRORS.includes(type)) {
          return prev;
        }
        return { type, message: e.message };
      });
      onErrorRef.current?.(type, e.message);
    };

    player.addListener('initialization_error', handleError('initialization_error'));
    player.addListener('authentication_error', handleError('authentication_error'));
    player.addListener('account_error', handleError('account_error'));
    player.addListener('playback_error', handleError('playback_error'));

    playerRef.current = player;

    // Handle browser autoplay policy
    if (typeof (player as any).activateElement === 'function') {
      (player as any).activateElement();
    }

    const connected = await player.connect();
    if (connected) {
      console.log('[WebPlayback] Connected successfully');
    }
  }, [localId, enabled, playerName, volume, fetchToken]);

  // Efecto principal: inicializar cuando enabled y localId están presentes
  useEffect(() => {
    if (!enabled || !localId) {
      setState(INITIAL_STATE);
      return;
    }

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      setState(INITIAL_STATE);
      currentTrackIdRef.current = null;
    };
  }, [enabled, localId, initPlayer]);

  // --- Controls ---

  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.togglePlay();
  }, []);

  const pause = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.pause();
  }, []);

  const resume = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.resume();
  }, []);

  const skipNext = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.nextTrack();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    if (!playerRef.current) return;
    await playerRef.current.seek(positionMs);
  }, []);

  const setVolumeControl = useCallback(async (vol: number) => {
    if (!playerRef.current) return;
    await playerRef.current.setVolume(vol);
  }, []);

  const connect = useCallback(async () => {
    await initPlayer();
  }, [initPlayer]);

  const disconnect = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
      setState(INITIAL_STATE);
      currentTrackIdRef.current = null;
    }
  }, []);

  const transferPlayback = useCallback(async () => {
    if (!state.deviceId || !localId) return;
    try {
      const token = await fetchToken();
      const doTransfer = () =>
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [state.deviceId],
            play: true,
          }),
        });

      const delays = [500, 1000, 2000];
      let res = await doTransfer();
      for (const delay of delays) {
        if (res.status !== 404) break;
        console.warn(`[WebPlayback] Transfer got 404, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        res = await doTransfer();
      }
    } catch (err) {
      console.error('[WebPlayback] Transfer playback error:', err);
    }
  }, [state.deviceId, localId, fetchToken]);

  const playTrackUri = useCallback(async (uri: string) => {
    if (!state.deviceId || !localId) return;
    try {
      const token = await fetchToken();
      const doPlay = () =>
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        });

      const delays = [500, 1000, 2000];
      let res = await doPlay();
      for (const delay of delays) {
        if (res.status !== 404) break;
        console.warn(`[WebPlayback] Play got 404, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        res = await doPlay();
      }
    } catch (err) {
      console.error('[WebPlayback] Play track error:', err);
    }
  }, [state.deviceId, localId, fetchToken]);

  return {
    state,
    player: playerRef.current,
    needsInteraction,
    error,
    togglePlay,
    pause,
    resume,
    skipNext,
    seek,
    setVolume: setVolumeControl,
    connect,
    disconnect,
    transferPlayback,
    playTrackUri,
  };
}
