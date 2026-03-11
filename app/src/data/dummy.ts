// ============================================================
// GLOWSONG — Dummy Data for Development
// Reemplazar con datos reales de Supabase en Fase 3
// ============================================================

import type {
  DashboardState,
  MusicProfile,
  Block,
  Local,
  User,
} from '@/types';

// --- DUMMY USER ---
export const DUMMY_USER: User = {
  id: 'user-001',
  email: 'mauro@barelcopihue.cl',
  name: 'Mauro Rocha',
  email_verified: true,
  onboarding_completed: true,
  weekly_report_enabled: true,
  created_at: '2026-03-01T10:00:00Z',
};

// --- DUMMY LOCAL ---
export const DUMMY_LOCAL: Local = {
  id: 'local-001',
  owner_id: 'user-001',
  name: 'Bar El Copihue',
  type: 'bar',
  neighborhood: 'Barrio Italia',
  city: 'Santiago',
  operating_hours: {
    monday: null,
    tuesday: { open: '18:00', close: '01:00' },
    wednesday: { open: '18:00', close: '01:00' },
    thursday: { open: '18:00', close: '02:00' },
    friday: { open: '18:00', close: '03:00' },
    saturday: { open: '16:00', close: '03:00' },
    sunday: { open: '16:00', close: '01:00' },
  },
  status: 'active',
  qr_token: 'qr-abc-123-def',
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-07T20:00:00Z',
};

// --- DUMMY MUSIC PROFILE ---
export const DUMMY_MUSIC_PROFILE: MusicProfile = {
  id: 'profile-001',
  local_id: 'local-001',
  name: 'Perfil Principal',
  allowed_genres: ['JAZZ', 'SOUL', 'FUNK', 'BLUES', 'INDIE'],
  energy_level: 'auto',
  is_default: true,
  created_at: '2026-03-01T10:00:00Z',
};

// --- DUMMY BLOCKS ---
export const DUMMY_BLOCKS: Block[] = [
  {
    id: 'block-001',
    local_id: 'local-001',
    block_type: 'artist',
    value: 'artist-bad-bunny',
    display_name: 'Bad Bunny',
    scope: 'permanent',
    created_at: '2026-03-05T22:30:00Z',
  },
  {
    id: 'block-002',
    local_id: 'local-001',
    block_type: 'genre',
    value: 'REGGAETON',
    display_name: 'Reggaetón',
    scope: 'permanent',
    created_at: '2026-03-02T18:00:00Z',
  },
  {
    id: 'block-003',
    local_id: 'local-001',
    block_type: 'track',
    value: 'spotify:track:3n3Ppam7vgaVa1iaRUIOKE',
    display_name: 'Gangnam Style',
    scope: 'permanent',
    created_at: '2026-03-06T21:15:00Z',
  },
];

// --- DUMMY DASHBOARD STATE (sonando actualmente) ---
export const DUMMY_DASHBOARD_PLAYING: DashboardState = {
  current_track: {
    spotify_track_id: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
    name: 'Feel Good Inc.',
    artist: 'Gorillaz',
    album: 'Demon Days',
    album_art_url: 'https://i.scdn.co/image/ab67616d0000b273f49e340c0e8bdb16a0a69db8',
    duration_ms: 224093,
    progress_ms: 67000,
    is_playing: true,
  },
  queue: [
    {
      spotify_track_id: 'spotify:track:5ghIJDpPoe3CfHMGu71E6T',
      name: 'Superstition',
      artist: 'Stevie Wonder',
      album: 'Talking Book',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b273b08c9e5e0bcbe4b9f9f7ba5b',
    },
    {
      spotify_track_id: 'spotify:track:3cfOd4QKFk7mTiQjMHTqpq',
      name: 'Come Together',
      artist: 'The Beatles',
      album: 'Abbey Road',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
    },
    {
      spotify_track_id: 'spotify:track:7qiZfU4dY1lWllzX7mPBI3',
      name: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷ (Divide)',
      album_art_url: 'https://i.scdn.co/image/ab67616d0000b2734821f7c6dde790f70f879aab',
    },
  ],
  device: {
    is_active: true,
    name: 'MacBook del Bar',
    id: 'device-001',
  },
  session_status: 'active',
  time_slot: 'early_night',
  polled_at: new Date().toISOString(),
};

// --- DUMMY DASHBOARD STATE (pausado) ---
export const DUMMY_DASHBOARD_PAUSED: DashboardState = {
  ...DUMMY_DASHBOARD_PLAYING,
  current_track: DUMMY_DASHBOARD_PLAYING.current_track
    ? { ...DUMMY_DASHBOARD_PLAYING.current_track, is_playing: false }
    : null,
  session_status: 'paused',
};

// --- DUMMY DASHBOARD STATE (sin dispositivo) ---
export const DUMMY_DASHBOARD_NO_DEVICE: DashboardState = {
  current_track: null,
  queue: [],
  device: {
    is_active: false,
    name: '',
  },
  session_status: 'no_device',
  time_slot: 'early_night',
  polled_at: new Date().toISOString(),
};

// --- HELPER: Obtener el label en español del time_slot ---
export const TIME_SLOT_LABELS: Record<DashboardState['time_slot'], string> = {
  opening:     'Apertura (12–17h)',
  afternoon:   'Tarde (17–20h)',
  early_night: 'Noche temprana (20–23h)',
  peak_night:  'Noche alta (23–02h)',
  closing:     'Cierre (02–06h)',
};
