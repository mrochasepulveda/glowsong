// ============================================================
// Spotify Web Playback SDK — TypeScript Declarations
// Docs: https://developer.spotify.com/documentation/web-playback-sdk
// ============================================================

declare namespace Spotify {
  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void;
    addListener(event: 'initialization_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'authentication_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'account_error', callback: (error: { message: string }) => void): void;
    addListener(event: 'playback_error', callback: (error: { message: string }) => void): void;
    removeListener(event: string, callback?: (...args: unknown[]) => void): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
  }

  interface PlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }

  interface PlaybackState {
    context: {
      uri: string | null;
      metadata: Record<string, string> | null;
    };
    disallows: {
      pausing?: boolean;
      peeking_next?: boolean;
      peeking_prev?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      skipping_prev?: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: 0 | 1 | 2;
    shuffle: boolean;
    track_window: TrackWindow;
  }

  interface TrackWindow {
    current_track: Track;
    previous_tracks: Track[];
    next_tracks: Track[];
  }

  interface Track {
    uri: string;
    id: string | null;
    type: 'track' | 'episode' | 'ad';
    media_type: 'audio' | 'video';
    name: string;
    is_playable: boolean;
    album: {
      uri: string;
      name: string;
      images: Array<{ url: string; height: number; width: number }>;
    };
    artists: Array<{
      uri: string;
      name: string;
    }>;
    duration_ms: number;
  }
}

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: {
    Player: new (options: Spotify.PlayerOptions) => Spotify.Player;
  };
}
