/* ============================================================
   FOQO DESIGN SYSTEM — React Native Theme
   Espejo de packages/ui/ para React Native
   UX Strategy: "club a las 2am" — spotlight-not-flood
   Brand: Orange/coral accent — energético, urgente, nocturno
   ============================================================ */

// ── Core tokens (shared across all Foqo products) ──────────

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,   // dramatic headlines
  '6xl': 56,   // hero moments
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const lineHeight = {
  tight: 1.1,
  snug: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const duration = {
  instant: 80,
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
  dramatic: 800,
} as const;

// ── Foqo Brand Layer ───────────────────────────────────────
// Accent: Orange #F97316 — energía, urgencia, calor nocturno
// VOY: Green #00E676 — commitment, acción
// Background: #06060E — ultra dark, cinematic

export const colors = {
  // Brand accent — orange
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDim: '#C2410C',
  accentSecondary: '#FBBF24',
  accentSecondaryLight: '#FDE68A',

  // Backgrounds — deeper, more cinematic
  bgPrimary: '#06060E',
  bgSecondary: '#0C0C14',

  // Surfaces — warm-neutral tint
  surface1: '#121218',
  surface2: '#1A1A22',
  surface3: '#24242E',

  // Borders — warm subtle
  border: 'rgba(249, 115, 22, 0.10)',
  borderHover: 'rgba(249, 115, 22, 0.22)',
  borderActive: 'rgba(249, 115, 22, 0.40)',

  // Text
  textPrimary: '#F5F5F0',
  textSecondary: '#8A8A96',
  textTertiary: '#4A4A5A',
  textDisabled: '#2A2A38',
  textOnAccent: '#FFFFFF',

  // Semantic — vivid
  success: '#22C55E',
  successDim: '#166534',
  successGlow: 'rgba(34, 197, 94, 0.25)',
  warning: '#FBBF24',
  error: '#F87171',
  errorDim: '#7F1D1D',
  info: '#60A5FA',

  // VOY / commitment (green-electric)
  voy: '#00E676',
  voyGlow: 'rgba(0, 230, 118, 0.3)',
  voyBg: 'rgba(0, 230, 118, 0.08)',

  // Interesa (warm orange-light)
  interesa: '#FB923C',
  interesaGlow: 'rgba(251, 146, 60, 0.3)',
  interesaBg: 'rgba(251, 146, 60, 0.08)',

  // Overlay
  overlaySubtle: 'rgba(255, 255, 255, 0.03)',
  overlayMedium: 'rgba(255, 255, 255, 0.06)',
  overlayStrong: 'rgba(0, 0, 0, 0.70)',
  scrim: 'rgba(6, 6, 14, 0.90)',

  // Gradients (as solid ref colors)
  gradientStart: '#F97316',
  gradientEnd: '#FBBF24',

  // Transparent utilities
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

// ── Shadow presets ─────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  glowVoy: {
    shadowColor: colors.voy,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  glowWarm: {
    shadowColor: colors.accentSecondary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
} as const;
