// ============================================================
// GLOWSONG — TypeScript Types
// Derivados del modelo de datos del PRD-XL Sección 5
// ============================================================

// --- ENUMS ---

export type LocalType =
  | 'bar'
  | 'pub'
  | 'cocteleria'
  | 'cerveceria'
  | 'restaurante'
  | 'discoteca'
  | 'otro';

export type LocalStatus =
  | 'pending_spotify'
  | 'configured'
  | 'active'
  | 'inactive';

export type TimeSlot =
  | 'opening'       // 12:00–17:00
  | 'afternoon'     // 17:00–20:00
  | 'early_night'   // 20:00–23:00
  | 'peak_night'    // 23:00–02:00
  | 'closing';      // 02:00–06:00

export type EnergyLevel = 'low' | 'medium' | 'high' | 'auto';

export type BlockType = 'genre' | 'artist' | 'track';

export type BlockScope = 'permanent' | 'session';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SessionStatus =
  | 'active'
  | 'paused'
  | 'no_device'
  | 'no_session';

// --- GENRES CATALOG ---
export const GENRES_CATALOG = [
  'ROCK', 'POP', 'ELECTRONICA', 'REGGAETON', 'CUMBIA', 'SALSA',
  'JAZZ', 'BLUES', 'FUNK', 'SOUL', 'HIP_HOP', 'R_AND_B',
  'LATIN_POP', 'INDIE', 'ALTERNATIVO', 'CLASICA', 'BOSSA_NOVA',
  'FLAMENCO', 'FOLK', 'COUNTRY', 'MUSICA_CHILENA', 'BOLERO',
  'TANGO', 'BACHATA', 'MERENGUE',
] as const;

export type Genre = typeof GENRES_CATALOG[number];

export const GENRE_DISPLAY_NAMES: Record<Genre, string> = {
  ROCK:          'Rock',
  POP:           'Pop',
  ELECTRONICA:   'Electrónica',
  REGGAETON:     'Reggaetón',
  CUMBIA:        'Cumbia',
  SALSA:         'Salsa',
  JAZZ:          'Jazz',
  BLUES:         'Blues',
  FUNK:          'Funk',
  SOUL:          'Soul',
  HIP_HOP:       'Hip-Hop',
  R_AND_B:       'R&B',
  LATIN_POP:     'Pop Latino',
  INDIE:         'Indie',
  ALTERNATIVO:   'Alternativo',
  CLASICA:       'Clásica',
  BOSSA_NOVA:    'Bossa Nova',
  FLAMENCO:      'Flamenco',
  FOLK:          'Folk',
  COUNTRY:       'Country',
  MUSICA_CHILENA: 'Música Chilena',
  BOLERO:        'Bolero',
  TANGO:         'Tango',
  BACHATA:       'Bachata',
  MERENGUE:      'Merengue',
};

// --- ENTITIES ---

export interface SeedArtist {
  id: string;
  name: string;
  image_url: string;
}


export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  weekly_report_enabled: boolean;
  created_at: string;
}

export interface OperatingHours {
  [day: string]: { open: string; close: string } | null;
}

export interface Local {
  id: string;
  owner_id: string;
  name: string;
  type: LocalType;
  neighborhood: string;
  city: string;
  operating_hours: OperatingHours;
  spotify_account_id?: string;
  active_device_id?: string;
  status: LocalStatus;
  qr_token: string;
  created_at: string;
  updated_at: string;
}

export interface MusicProfile {
  id: string;
  local_id: string;
  name: string;
  allowed_genres: Genre[];
  seed_artists?: SeedArtist[];
  energy_level: EnergyLevel;
  is_default: boolean;
  created_at: string;
}

export interface Block {
  id: string;
  local_id: string;
  block_type: BlockType;
  value: string;
  display_name: string;
  scope: BlockScope;
  expires_at?: string;
  created_at: string;
}

export interface SessionEvent {
  id: string;
  local_id: string;
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  genre: Genre;
  energy_level: Exclude<EnergyLevel, 'auto'>;
  played_at: string;
  time_slot: TimeSlot;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  source: 'algorithm';
  created_at?: string;
}

// --- DASHBOARD STATE ---

export interface TrackInfo {
  spotify_track_id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url: string;
  duration_ms: number;
  progress_ms: number;
  is_playing: boolean;
}

export interface DeviceInfo {
  is_active: boolean;
  name: string;
  id?: string;
}

export interface DashboardState {
  current_track: TrackInfo | null;
  queue: Omit<TrackInfo, 'duration_ms' | 'progress_ms' | 'is_playing'>[];
  device: DeviceInfo;
  session_status: SessionStatus;
  time_slot: TimeSlot;
  polled_at: string;
}

// --- ONBOARDING STATE ---

export interface OnboardingState {
  step: 1 | 2 | 3 | 4;
  completed_steps: number[];
  user?: Partial<User>;
  local?: Partial<Local>;
  music_profile?: Partial<MusicProfile>;
  spotify_connected: boolean;
}
