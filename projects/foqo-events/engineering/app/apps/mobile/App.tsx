import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
  Platform, TextInput, Animated, Dimensions, LayoutAnimation, UIManager,
  PanResponder, Image, Linking, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, radius, fontSize, fontWeight, shadows, duration } from './theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_H = SCREEN_HEIGHT * 0.62;

const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:3001/api'
  : process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.108:3001/api';

// ── Token Storage ───────────────────────────────────────────
const TOKEN_KEY = 'foqo_auth_token';
const USER_KEY = 'foqo_user';

const storeToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
};

const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
};

const storeUser = async (user: AuthUser) => {
  const json = JSON.stringify(user);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, json);
  } else {
    await SecureStore.setItemAsync(USER_KEY, json);
  }
};

const getStoredUser = async (): Promise<AuthUser | null> => {
  try {
    const json = Platform.OS === 'web'
      ? localStorage.getItem(USER_KEY)
      : await SecureStore.getItemAsync(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch { return null; }
};

// ── Auth API helpers ────────────────────────────────────────
const authFetch = async (endpoint: string, body: Record<string, unknown>) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
};

const authedFetch = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
};

// ── Types ───────────────────────────────────────────────────
interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  city?: string | null;
  avatarUrl?: string | null;
}
interface Event {
  id: string;
  title: string;
  date: string;
  priceMin: number | null;
  priceMax: number | null;
  status: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  artistId?: string;
  artist?: { id?: string; name: string; imageUrl: string | null };
  venue?: { name: string; city: string };
  matchScore?: number;
  matchReason?: string;
}

type AppScreen = 'auth' | 'onboarding' | 'home';
type OnboardingStep = 0 | 1 | 2 | 3 | 4;

// ── Data ────────────────────────────────────────────────────
const COUNTRIES = [
  { id: 'cl', name: 'Chile', flag: '🇨🇱' },
  { id: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { id: 'co', name: 'Colombia', flag: '🇨🇴' },
  { id: 'mx', name: 'México', flag: '🇲🇽' },
  { id: 'pe', name: 'Perú', flag: '🇵🇪' },
  { id: 'br', name: 'Brasil', flag: '🇧🇷' },
  { id: 'uy', name: 'Uruguay', flag: '🇺🇾' },
  { id: 'ec', name: 'Ecuador', flag: '🇪🇨' },
];

const CITIES_BY_COUNTRY: Record<string, { id: string; name: string; region: string }[]> = {
  cl: [
    { id: 'santiago', name: 'Santiago', region: 'Región Metropolitana' },
    { id: 'valparaiso', name: 'Valparaíso', region: 'Región de Valparaíso' },
    { id: 'concepcion', name: 'Concepción', region: 'Región del Biobío' },
    { id: 'vina', name: 'Viña del Mar', region: 'Región de Valparaíso' },
    { id: 'temuco', name: 'Temuco', region: 'Región de la Araucanía' },
    { id: 'antofagasta', name: 'Antofagasta', region: 'Región de Antofagasta' },
    { id: 'laserena', name: 'La Serena', region: 'Región de Coquimbo' },
    { id: 'rancagua', name: 'Rancagua', region: "Región de O'Higgins" },
    { id: 'talca', name: 'Talca', region: 'Región del Maule' },
    { id: 'iquique', name: 'Iquique', region: 'Región de Tarapacá' },
    { id: 'puertomontt', name: 'Puerto Montt', region: 'Región de Los Lagos' },
    { id: 'coquimbo', name: 'Coquimbo', region: 'Región de Coquimbo' },
    { id: 'arica', name: 'Arica', region: 'Región de Arica y Parinacota' },
    { id: 'chillan', name: 'Chillán', region: 'Región de Ñuble' },
    { id: 'osorno', name: 'Osorno', region: 'Región de Los Lagos' },
    { id: 'valdivia', name: 'Valdivia', region: 'Región de Los Ríos' },
    { id: 'copiapo', name: 'Copiapó', region: 'Región de Atacama' },
    { id: 'puntaarenas', name: 'Punta Arenas', region: 'Región de Magallanes' },
  ],
  ar: [
    { id: 'buenosaires', name: 'Buenos Aires', region: 'CABA' },
    { id: 'cordoba', name: 'Córdoba', region: 'Provincia de Córdoba' },
    { id: 'rosario', name: 'Rosario', region: 'Provincia de Santa Fe' },
    { id: 'mendoza', name: 'Mendoza', region: 'Provincia de Mendoza' },
    { id: 'laplata', name: 'La Plata', region: 'Provincia de Buenos Aires' },
    { id: 'mardelplata', name: 'Mar del Plata', region: 'Provincia de Buenos Aires' },
  ],
  co: [
    { id: 'bogota', name: 'Bogotá', region: 'Cundinamarca' },
    { id: 'medellin', name: 'Medellín', region: 'Antioquia' },
    { id: 'cali', name: 'Cali', region: 'Valle del Cauca' },
    { id: 'barranquilla', name: 'Barranquilla', region: 'Atlántico' },
    { id: 'cartagena', name: 'Cartagena', region: 'Bolívar' },
  ],
  mx: [
    { id: 'cdmx', name: 'Ciudad de México', region: 'CDMX' },
    { id: 'guadalajara', name: 'Guadalajara', region: 'Jalisco' },
    { id: 'monterrey', name: 'Monterrey', region: 'Nuevo León' },
    { id: 'puebla', name: 'Puebla', region: 'Puebla' },
    { id: 'tijuana', name: 'Tijuana', region: 'Baja California' },
  ],
  pe: [
    { id: 'lima', name: 'Lima', region: 'Lima' },
    { id: 'arequipa', name: 'Arequipa', region: 'Arequipa' },
    { id: 'cusco', name: 'Cusco', region: 'Cusco' },
    { id: 'trujillo', name: 'Trujillo', region: 'La Libertad' },
  ],
  br: [
    { id: 'saopaulo', name: 'São Paulo', region: 'São Paulo' },
    { id: 'riodejaneiro', name: 'Rio de Janeiro', region: 'Rio de Janeiro' },
    { id: 'beloHorizonte', name: 'Belo Horizonte', region: 'Minas Gerais' },
    { id: 'curitiba', name: 'Curitiba', region: 'Paraná' },
    { id: 'portoalegre', name: 'Porto Alegre', region: 'Rio Grande do Sul' },
  ],
  uy: [
    { id: 'montevideo', name: 'Montevideo', region: 'Montevideo' },
    { id: 'puntadeleste', name: 'Punta del Este', region: 'Maldonado' },
  ],
  ec: [
    { id: 'quito', name: 'Quito', region: 'Pichincha' },
    { id: 'guayaquil', name: 'Guayaquil', region: 'Guayas' },
    { id: 'cuenca', name: 'Cuenca', region: 'Azuay' },
  ],
};

const NOTIFICATION_CHANNELS = [
  { id: 'push', name: 'Notificaciones push', desc: 'Alertas instantáneas en tu celular' },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Resumen semanal + alertas importantes' },
  { id: 'email', name: 'Email', desc: 'Newsletter semanal de eventos nuevos' },
];

const VIBES = [
  { id: 'raw-energy', emoji: '🔥', title: 'Quiero perder la voz', desc: 'Mosh pit, guitarras, gritos', genres: ['rock', 'metal', 'punk', 'hardcore'], color: '#EF4444' },
  { id: 'dance-floor', emoji: '🪩', title: 'Bailar hasta las 6am', desc: 'Techno, house, DJ sets', genres: ['electronic', 'techno', 'house', 'dnb', 'trance'], color: '#A855F7' },
  { id: 'flow', emoji: '🎤', title: 'Flow & letras', desc: 'Trap, rap, freestyle, reggaetón', genres: ['hiphop', 'trap', 'reggaeton', 'urbano'], color: '#F59E0B' },
  { id: 'chill', emoji: '🌙', title: 'Vibra chill', desc: 'Jazz, folk, indie, acústico', genres: ['jazz', 'folk', 'indie', 'ambient', 'singer-songwriter'], color: '#06B6D4' },
  { id: 'latin', emoji: '💃', title: 'Sabor latino', desc: 'Cumbia, salsa, tropical, fusión', genres: ['cumbia', 'salsa', 'latin', 'reggae', 'tropical'], color: '#10B981' },
  { id: 'everything', emoji: '✨', title: 'De todo un poco', desc: 'Sorpréndeme con lo mejor', genres: [], color: '#F97316' },
];

// Fallback mock events when API is unavailable
const MOCK_EVENTS: Event[] = [
  { id: 'm1', title: 'Noche Techno: Warehouse Session', date: '2026-04-05T23:00:00Z', priceMin: 8000, priceMax: 15000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'DJ Raval', imageUrl: null }, venue: { name: 'Club Subsuelo', city: 'Santiago' } },
  { id: 'm2', title: 'Polyphia Live in Santiago', date: '2026-04-12T20:00:00Z', priceMin: 35000, priceMax: 65000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Polyphia', imageUrl: null }, venue: { name: 'Teatro Caupolicán', city: 'Santiago' } },
  { id: 'm3', title: 'Cumbia Demente — Festival', date: '2026-04-08T19:00:00Z', priceMin: 5000, priceMax: 10000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Cumbia Demente', imageUrl: null }, venue: { name: 'Parque Bicentenario', city: 'Santiago' } },
  { id: 'm4', title: 'Young Miko — ATT World Tour', date: '2026-04-18T21:00:00Z', priceMin: 25000, priceMax: 85000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Young Miko', imageUrl: null }, venue: { name: 'Movistar Arena', city: 'Santiago' } },
  { id: 'm5', title: 'Jazz al Atardecer', date: '2026-04-10T18:30:00Z', priceMin: 12000, priceMax: 12000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Cuarteto Sur', imageUrl: null }, venue: { name: 'Teatro del Lago', city: 'Valdivia' } },
  { id: 'm6', title: 'Duki — Antes de Ameri Tour', date: '2026-04-22T21:00:00Z', priceMin: 30000, priceMax: 75000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Duki', imageUrl: null }, venue: { name: 'Estadio Nacional', city: 'Santiago' } },
  { id: 'm7', title: 'Indie Night: Volcanes + Playa Gótica', date: '2026-04-06T20:30:00Z', priceMin: 6000, priceMax: 8000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Volcanes', imageUrl: null }, venue: { name: 'Bar Loreto', city: 'Santiago' } },
  { id: 'm8', title: 'Bad Bunny — No Me Quiero Ir Tour', date: '2026-05-03T20:00:00Z', priceMin: 45000, priceMax: 150000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Bad Bunny', imageUrl: null }, venue: { name: 'Estadio Monumental', city: 'Santiago' } },
  { id: 'm9', title: 'House Rooftop Session', date: '2026-04-11T22:00:00Z', priceMin: 10000, priceMax: 15000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Manu Desrets', imageUrl: null }, venue: { name: 'Terraza Nómade', city: 'Valparaíso' } },
  { id: 'm10', title: 'Metal Fest — Kreator + Testament', date: '2026-04-26T19:00:00Z', priceMin: 40000, priceMax: 60000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Kreator', imageUrl: null }, venue: { name: 'Blondie', city: 'Santiago' } },
  { id: 'm11', title: 'Noches de Salsa — La Fania Edition', date: '2026-04-09T21:00:00Z', priceMin: 8000, priceMax: 12000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Orquesta La 33', imageUrl: null }, venue: { name: 'Maestra Vida', city: 'Santiago' } },
  { id: 'm12', title: 'Tyler, The Creator — Chromakopia', date: '2026-05-10T20:00:00Z', priceMin: 55000, priceMax: 120000, status: 'on_sale', imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=900&fit=crop', ticketUrl: null, artist: { name: 'Tyler, The Creator', imageUrl: null }, venue: { name: 'Movistar Arena', city: 'Santiago' } },
];

// ── Helper Functions ────────────────────────────────────────

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// Placeholder color derived from name — warm palette consistent with brand
const PLACEHOLDER_COLORS = [
  '#7C2D12', '#713F12', '#4C1D95', '#1E3A5F', '#064E3B',
  '#4A1942', '#3B0764', '#78350F', '#1C1917', '#312E81',
] as const;
const getPlaceholderColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return PLACEHOLDER_COLORS[Math.abs(h) % PLACEHOLDER_COLORS.length];
};

const getTimeLabel = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  const diffD = diffMs / (1000 * 60 * 60 * 24);
  if (diffH < 0 && diffH > -6) return 'EN VIVO';
  if (diffH >= 0 && diffH < 6) return 'HOY';
  if (diffH >= 6 && diffH < 24) return 'ESTA NOCHE';
  if (diffD >= 0 && diffD < 2) return 'MAÑANA';
  if (diffD >= 0 && diffD < 7) {
    const day = d.toLocaleDateString('es-CL', { weekday: 'long' }).toUpperCase();
    return day;
  }
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).toUpperCase();
};

const getCountdown = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  if (diffMs < 0) return 'Ahora';
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(h / 24);
  if (h < 1) return `En ${Math.max(1, Math.floor(diffMs / 60000))} min`;
  if (h < 24) return `En ${h}h`;
  if (days < 7) return `En ${days}d`;
  return `En ${days}d`;
};

const isTonight = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diffH = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffH >= -6 && diffH < 24;
};

const isThisWeekend = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const dayOfWeek = now.getDay();
  const daysUntilFri = (5 - dayOfWeek + 7) % 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + daysUntilFri);
  friday.setHours(0, 0, 0, 0);
  const monday = new Date(friday);
  monday.setDate(friday.getDate() + 3);
  return d >= friday && d < monday;
};

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return { day: dt.getDate().toString(), month: dt.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase() };
};

// Match score: use real score from API (event.matchScore), fallback to 0
const getMatchScore = (_eventId: string, event?: Event) => {
  return event?.matchScore ?? 0;
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { greeting: 'Buenos días', emoji: '☀️', period: 'morning' };
  if (h >= 12 && h < 18) return { greeting: 'Buenas tardes', emoji: '🌤', period: 'afternoon' };
  if (h >= 18 && h < 22) return { greeting: 'Buenas noches', emoji: '🌙', period: 'evening' };
  return { greeting: 'Noche de eventos', emoji: '✨', period: 'night' };
};

// ── Signal System — One unique signal per card (real data only) ──
type EventSignal =
  | { type: 'live'; label: string; color: string }
  | { type: 'match'; label: string; color: string; score: number }
  | { type: 'reason'; label: string; color: string }
  | { type: 'time'; label: string; color: string };

const getEventSignal = (event: Event): EventSignal => {
  const timeLabel = getTimeLabel(event.date);
  if (timeLabel === 'EN VIVO') return { type: 'live', label: '● EN VIVO', color: colors.success };
  const score = getMatchScore(event.id, event);
  if (score >= 70) return { type: 'match', label: `${score}% tu vibe`, score, color: colors.accentLight };
  if (event.matchReason) return { type: 'reason', label: event.matchReason, color: colors.accentSecondary };
  return { type: 'time', label: getCountdown(event.date), color: colors.textSecondary };
};

const getContextHeader = (city?: string) => {
  const now = new Date();
  const dayName = now.toLocaleDateString('es-CL', { weekday: 'long' });
  const h = now.getHours();
  let timeOfDay = 'día';
  if (h >= 19 || h < 5) timeOfDay = 'noche';
  else if (h >= 14) timeOfDay = 'tarde';
  const cityLabel = city || 'tu ciudad';
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${timeOfDay} · ${cityLabel}`;
};

const isThursToSunday = () => {
  const day = new Date().getDay();
  return day >= 4 || day === 0;
};

const isLiveEvent = (dateStr: string) => {
  const diffH = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60);
  return diffH < 0 && diffH > -6;
};

const isFutureEvent = (dateStr: string, minDays: number) => {
  const diffD = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diffD > minDays;
};

const groupEventsByMonth = (events: Event[]) => {
  const groups: { month: string; events: Event[] }[] = [];
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  sorted.forEach(ev => {
    const d = new Date(ev.date);
    const monthKey = d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    const label = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
    const existing = groups.find(g => g.month === label);
    if (existing) existing.events.push(ev);
    else groups.push({ month: label, events: [ev] });
  });
  return groups;
};

// Card size variation — editorial rhythm, not uniform grid
const getCardVariant = (index: number): 'hero' | 'editorial' | 'compact' => {
  if (index === 0) return 'hero';
  if (index % 3 === 1) return 'editorial';
  return 'compact';
};

const OB_MIN_SAVES = 3;
const OB_MIN_VIBES = 1;
const TOTAL_STEPS = 4;


// ═══════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [booting, setBooting] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userChannels, setUserChannels] = useState<string[]>([]);
  const [initialSaved, setInitialSaved] = useState<string[]>([]);
  const [committed, setCommitted] = useState<string[]>([]);
  const [userVibes, setUserVibes] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Check for existing session on boot
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const user = await getStoredUser();
        if (token && user) {
          setAuthToken(token);
          setAuthUser(user);
          // Verify token is still valid
          try {
            const me = await authedFetch('/auth/me', token);
            setInitialSaved(me.savedEventIds || []);
            setScreen('home');
          } catch {
            // Token expired — go to login
            await removeToken();
            setScreen('auth');
          }
        } else {
          setScreen('auth');
        }
      } catch {
        setScreen('auth');
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body: Record<string, string> = { email, password };
      if (!isLogin) body.displayName = email.split('@')[0];

      const data = await authFetch(endpoint, body);
      const token = data.token as string;
      const user = data.user as AuthUser;

      await storeToken(token);
      await storeUser(user);
      setAuthToken(token);
      setAuthUser(user);

      if (isLogin) {
        // Existing user — fetch their profile and go home
        try {
          const me = await authedFetch('/auth/me', token);
          setInitialSaved(me.savedEventIds || []);
        } catch { /* profile might not exist yet */ }
        setScreen('home');
      } else {
        // New user — go to onboarding
        setScreen('onboarding');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error de conexión');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = async (savedIds: string[], vibes: string[], displayName?: string) => {
    setInitialSaved(savedIds);
    setUserVibes(vibes);
    if (displayName && authUser) {
      setAuthUser({ ...authUser, displayName });
      await storeUser({ ...authUser, displayName });
    }

    // Save onboarding data to API
    if (authToken) {
      try {
        await authedFetch('/auth/onboarding', authToken, {
          method: 'POST',
          body: JSON.stringify({
            displayName: displayName || authUser?.displayName,
            city: userCity,
            vibes,
            channels: userChannels,
            savedEventIds: savedIds,
          }),
        });
      } catch (err) {
        console.warn('Failed to save onboarding:', err);
      }
    }

    setScreen('home');
  };

  const handleLogout = async () => {
    await removeToken();
    setAuthToken(null);
    setAuthUser(null);
    setScreen('auth');
    setIsLogin(false);
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  // Boot splash
  if (booting) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
        <Text style={{ fontSize: 48, fontWeight: fontWeight.black, color: colors.accentLight, letterSpacing: -3 }}>Foqo</Text>
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing[4] }} />
      </SafeAreaView>
    );
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        isLogin={isLogin} setIsLogin={setIsLogin}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        onAuth={handleAuth}
        loading={authLoading}
        error={authError}
      />
    );
  }
  if (screen === 'onboarding') {
    return (
      <OnboardingScreen
        initialName={authUser?.displayName || email.split('@')[0]}
        userCountry={userCountry} setUserCountry={setUserCountry}
        userCity={userCity} setUserCity={setUserCity}
        userChannels={userChannels} setUserChannels={setUserChannels}
        onComplete={handleOnboardingComplete}
      />
    );
  }
  return (
    <HomeScreen
      initialSaved={initialSaved}
      committed={committed}
      authToken={authToken}
      authUser={authUser}
      onLogout={handleLogout}
    />
  );
}


// ═══════════════════════════════════════════════════════════
//  AUTH SCREEN — Cinematic entry
// ═══════════════════════════════════════════════════════════
function AuthScreen({ isLogin, setIsLogin, email, setEmail, password, setPassword, onAuth, loading, error }: {
  isLogin: boolean; setIsLogin: (v: boolean) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  onAuth: () => void;
  loading?: boolean;
  error?: string;
}) {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />
      <View style={s.authWrapper}>
        <View style={s.authCard}>
          {/* Pulsing glow behind logo */}
          <Animated.View style={[s.authGlow, { opacity: glowAnim }]} />

          <Text style={s.authLogo}>Foqo</Text>
          <Text style={s.authTagline}>
            {'Tu radar de\nconciertos'}
          </Text>
          <Text style={s.authSubtitle}>
            {'Descubre eventos que importan.\nNo más FOMO.'}
          </Text>

          <View style={s.authForm}>
            <TextInput
              style={s.input}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={s.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <TouchableOpacity style={[s.btnPrimary, loading && { opacity: 0.6 }]} onPress={onAuth} activeOpacity={0.8} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={s.btnPrimaryText}>{isLogin ? 'Ingresar' : 'Crear cuenta'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { setIsLogin(!isLogin); }} style={{ marginTop: spacing[6] }}>
            <Text style={s.linkText}>{isLogin ? 'Crear una cuenta nueva' : 'Ya tengo cuenta'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.footerText}>By Foqo</Text>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
//  ONBOARDING SCREEN — Narrative Flow (7 micro-steps)
//  0: Name → 1: City → 2: Welcome → 3: Vibes
//  → 4: Swipe → 5: Loading → 6: AHA
// ═══════════════════════════════════════════════════════════
const OB_TOTAL = 7;

function OnboardingScreen({ initialName, userCountry, setUserCountry, userCity, setUserCity, userChannels, setUserChannels, onComplete }: {
  initialName?: string;
  userCountry: string; setUserCountry: (v: string) => void;
  userCity: string; setUserCity: (v: string) => void;
  userChannels: string[]; setUserChannels: (v: string[]) => void;
  onComplete: (savedIds: string[], vibes: string[], displayName?: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState(initialName || '');
  const [citySearch, setCitySearch] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [obEvents, setObEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [obSaved, setObSaved] = useState<string[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [doneSwipe, setDoneSwipe] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const swipePan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const vibeScaleAnims = useRef(VIBES.map(() => new Animated.Value(1))).current;

  // Fetch events when reaching swipe step
  useEffect(() => {
    if (step === 4 && obEvents.length === 0) {
      setLoadingEvents(true);
      const vibeGenres = selectedVibes.flatMap(v => VIBES.find(vb => vb.id === v)?.genres || []);
      const query = vibeGenres.length > 0 ? `?genres=${vibeGenres.join(',')}` : '';
      fetch(`${API_BASE}/events/discover${query}`)
        .then(r => r.json())
        .then(data => { setObEvents(Array.isArray(data) && data.length > 0 ? data : MOCK_EVENTS); })
        .catch(() => setObEvents(MOCK_EVENTS))
        .finally(() => setLoadingEvents(false));
    }
  }, [step]);

  // Auto-advance loading screen
  useEffect(() => {
    if (step === 5) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(p => {
          if (p >= 100) { clearInterval(interval); return 100; }
          return p + 2;
        });
      }, 60);
      const timer = setTimeout(() => animateToStep(6), 3500);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }
  }, [step]);

  const animateToStep = (next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: next / OB_TOTAL, duration: 300, useNativeDriver: false }),
      ]).start();
    });
  };

  const canAdvance = () => {
    if (step === 0) return userName.trim().length >= 2;
    if (step === 1) return userCountry !== '' && userCity !== '';
    if (step === 2) return true; // Welcome — always
    if (step === 3) return selectedVibes.length >= OB_MIN_VIBES;
    if (step === 4) return obSaved.length >= OB_MIN_SAVES || doneSwipe;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step === 4) { animateToStep(5); return; } // Swipe → Loading
    if (step === 6) { onComplete(obSaved, selectedVibes, userName.trim()); return; } // AHA → Done
    animateToStep(step + 1);
  };

  const toggleVibe = (id: string, index: number) => {
    const isSelected = selectedVibes.includes(id);
    if (id === 'everything') {
      setSelectedVibes(isSelected ? [] : ['everything']);
    } else {
      const without = selectedVibes.filter(v => v !== 'everything' && v !== id);
      setSelectedVibes(isSelected ? without : [...without, id]);
    }
    Animated.sequence([
      Animated.timing(vibeScaleAnims[index], { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(vibeScaleAnims[index], { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const toggleChannel = (id: string) => {
    setUserChannels(userChannels.includes(id) ? userChannels.filter(c => c !== id) : [...userChannels, id]);
  };

  const swipeNext = (direction: 'right' | 'left' | 'up') => {
    if (swipeIndex >= obEvents.length) return;
    if (direction === 'right' || direction === 'up') {
      setObSaved(prev => prev.includes(obEvents[swipeIndex].id) ? prev : [...prev, obEvents[swipeIndex].id]);
    }
    const toValue = direction === 'left'
      ? { x: -SCREEN_WIDTH, y: 0 }
      : direction === 'right'
        ? { x: SCREEN_WIDTH, y: 0 }
        : { x: 0, y: -SCREEN_HEIGHT };
    Animated.timing(swipePan, { toValue, duration: 200, useNativeDriver: true }).start(() => {
      swipePan.setValue({ x: 0, y: 0 });
      if (swipeIndex + 1 >= obEvents.length) { setDoneSwipe(true); return; }
      setSwipeIndex(i => i + 1);
    });
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 15 || Math.abs(g.dy) > 15,
    onPanResponderMove: (_, g) => swipePan.setValue({ x: g.dx, y: g.dy }),
    onPanResponderRelease: (_, g) => {
      if (g.dy < -120) swipeNext('up');
      else if (g.dx > 80) swipeNext('right');
      else if (g.dx < -80) swipeNext('left');
      else Animated.spring(swipePan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
  })).current;

  const cities = CITIES_BY_COUNTRY[userCountry] || [];
  const filteredCities = citySearch ? cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())) : cities;
  const currentEv = obEvents[swipeIndex];
  const swipeRotate = swipePan.x.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ['-8deg', '0deg', '8deg'] });
  const overlayLeft = swipePan.x.interpolate({ inputRange: [-SCREEN_WIDTH, 0], outputRange: [0.9, 0], extrapolate: 'clamp' });
  const overlayRight = swipePan.x.interpolate({ inputRange: [0, SCREEN_WIDTH], outputRange: [0, 0.9], extrapolate: 'clamp' });
  const overlayVoy = swipePan.y.interpolate({ inputRange: [-120, 0], outputRange: [0.9, 0], extrapolate: 'clamp' });
  const obCardScale = swipePan.y.interpolate({ inputRange: [-200, 0], outputRange: [1.05, 1], extrapolate: 'clamp' });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  // City display name for welcome screen
  const cityDisplayName = cities.find(c => c.id === userCity)?.name || userCity;
  // Fake city stat (deterministic)
  const cityShowCount = 28 + (userCity.length * 7) % 40;

  // How many events match vibes for AHA
  const savedEvents = obEvents.filter(e => obSaved.includes(e.id));
  const thisWeekCount = Math.min(savedEvents.length, 3) + Math.floor(Math.random() * 3);

  // Steps that show the bottom CTA button
  const showCta = [0, 1, 3, 4, 6].includes(step);
  // Steps that show back arrow
  const showBack = step > 0 && step !== 2 && step !== 5 && step !== 6;

  const getCtaLabel = () => {
    if (step === 4) {
      if (obSaved.length >= OB_MIN_SAVES || doneSwipe) return 'Siguiente';
      return `Guarda ${OB_MIN_SAVES - obSaved.length} más`;
    }
    if (step === 6) return 'Entrar a Foqo';
    return 'Continuar';
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />
      <View style={os.obWrap}>
        {/* Progress bar */}
        <View style={os.progressBar}>
          <Animated.View style={[os.progressFill, { width: progressWidth }]} />
        </View>

        {/* Back button */}
        {showBack && (
          <TouchableOpacity style={ob.backBtn} onPress={() => animateToStep(step - 1)} activeOpacity={0.7}>
            <Text style={ob.backText}>←</Text>
          </TouchableOpacity>
        )}

        <Animated.View style={[os.obContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* ═══ Step 0: Name ═══ */}
          {step === 0 && (
            <View style={ob.centeredStep}>
              <Text style={ob.stepTitle}>{'¿Cómo te\nllaman?'}</Text>
              <Text style={ob.stepSubtitle}>Así te saludaremos cada vez que abras Foqo</Text>
              <TextInput
                style={ob.nameInput}
                placeholder="Tu nombre"
                placeholderTextColor={colors.textTertiary}
                value={userName}
                onChangeText={t => t.length <= 20 && setUserName(t)}
                autoFocus
                autoCapitalize="words"
              />
              <Text style={ob.charCount}>{userName.length}/20</Text>
            </View>
          )}

          {/* ═══ Step 1: Country + City ═══ */}
          {step === 1 && (
            <ScrollView showsVerticalScrollIndicator={false} style={os.obScroll}>
              <Text style={ob.stepTitle}>{'¿Desde dónde\nvives la música?'}</Text>
              <Text style={ob.stepSubtitle}>Tu ciudad define tu escena</Text>

              <Text style={os.obSectionLabel}>País</Text>
              <View style={os.obGrid}>
                {COUNTRIES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[os.obCountryChip, userCountry === c.id && os.obCountryChipActive]}
                    onPress={() => { setUserCountry(c.id); setUserCity(''); setCitySearch(''); }}
                    activeOpacity={0.7}
                  >
                    <Text style={os.obCountryFlag}>{c.flag}</Text>
                    <Text style={[os.obCountryName, userCountry === c.id && os.obCountryNameActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {userCountry !== '' && (
                <>
                  <Text style={[os.obSectionLabel, { marginTop: spacing[5] }]}>Ciudad</Text>
                  <TextInput
                    style={[s.input, { marginBottom: spacing[3] }]}
                    placeholder="Buscar ciudad..."
                    placeholderTextColor={colors.textSecondary}
                    value={citySearch}
                    onChangeText={setCitySearch}
                  />
                  <View style={os.obGrid}>
                    {filteredCities.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[os.obCityChip, userCity === c.id && os.obCityChipActive]}
                        onPress={() => setUserCity(c.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[os.obCityName, userCity === c.id && os.obCityNameActive]}>{c.name}</Text>
                        <Text style={os.obCityRegion}>{c.region}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          )}

          {/* ═══ Step 2: Welcome (emotional breather) ═══ */}
          {step === 2 && (
            <View style={ob.welcomeStep}>
              <Text style={ob.welcomeEmoji}>🎸</Text>
              <Text style={ob.welcomeTitle}>
                {'Bienvenido,\n'}
                <Text style={{ color: colors.accentLight }}>{userName || 'amigo'}</Text>
              </Text>
              <Text style={ob.welcomeSubtitle}>
                {cityDisplayName} tiene {cityShowCount} shows este mes.{'\n'}Vamos a encontrar los tuyos.
              </Text>

              <TouchableOpacity style={[s.btnPrimary, { marginTop: spacing[8] }]} onPress={() => animateToStep(3)} activeOpacity={0.8}>
                <Text style={s.btnPrimaryText}>Vamos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onComplete([], [], userName.trim())} style={{ marginTop: spacing[4] }}>
                <Text style={ob.skipLink}>Ir directo a la app</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══ Step 3: Vibes ═══ */}
          {step === 3 && (
            <ScrollView showsVerticalScrollIndicator={false} style={os.obScroll}>
              <Text style={ob.stepTitle}>{'¿Qué te\nmueve?'}</Text>
              <Text style={ob.stepSubtitle}>Elige las vibes que te representan</Text>
              <View style={os.vibesGrid}>
                {VIBES.map((v, i) => {
                  const active = selectedVibes.includes(v.id);
                  return (
                    <Animated.View key={v.id} style={{ transform: [{ scale: vibeScaleAnims[i] }] }}>
                      <TouchableOpacity
                        style={[os.vibeCard, active && { borderColor: v.color, borderWidth: 2 }]}
                        onPress={() => toggleVibe(v.id, i)}
                        activeOpacity={0.7}
                      >
                        <Text style={os.vibeEmoji}>{v.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={os.vibeTitle}>{v.title}</Text>
                          <Text style={os.vibeDesc}>{v.desc}</Text>
                        </View>
                        {active && <View style={[os.vibeCheck, { backgroundColor: v.color }]}><Text style={os.vibeCheckText}>✓</Text></View>}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
              <View style={ob.tipBox}>
                <Text style={ob.tipEmoji}>💡</Text>
                <Text style={ob.tipText}>Esto nos ayuda a mostrarte eventos que realmente te mueven. Puedes cambiarlo después.</Text>
              </View>
            </ScrollView>
          )}

          {/* ═══ Step 4: Swipe Discover ═══ */}
          {step === 4 && (
            <View style={os.swipeWrap}>
              <Text style={ob.stepTitle}>{'Tu primera\nnoche'}</Text>
              <Text style={[ob.stepSubtitle, { marginBottom: spacing[4] }]}>→ me interesa · ← paso · ↑ voy</Text>
              {loadingEvents ? (
                <View style={os.swipeLoading}><ActivityIndicator color={colors.accent} /><Text style={os.swipeLoadingText}>Buscando eventos...</Text></View>
              ) : doneSwipe || swipeIndex >= obEvents.length ? (
                <View style={os.swipeDone}>
                  <Text style={os.swipeDoneEmoji}>🎉</Text>
                  <Text style={os.swipeDoneText}>
                    {obSaved.length >= OB_MIN_SAVES ? `¡${obSaved.length} eventos guardados!` : `Guardaste ${obSaved.length}`}
                  </Text>
                </View>
              ) : currentEv ? (
                <>
                  <Animated.View
                    style={[os.swipeCard, { transform: [{ translateX: swipePan.x }, { translateY: swipePan.y }, { rotate: swipeRotate }, { scale: obCardScale }] }]}
                    {...panResponder.panHandlers}
                  >
                    {(currentEv.imageUrl || currentEv.artist?.imageUrl) ? (
                      <Image source={{ uri: (currentEv.imageUrl || currentEv.artist?.imageUrl)! }} style={os.swipeImg} />
                    ) : (
                      <View style={[os.swipeImg, { backgroundColor: getPlaceholderColor(currentEv.artist?.name || currentEv.title), justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fontSize['6xl'], fontWeight: fontWeight.black }}>{getInitials(currentEv.artist?.name || currentEv.title)}</Text>
                      </View>
                    )}
                    <View style={os.swipeGradient} />
                    <View style={os.swipeInfo}>
                      <Text style={os.swipeTitle}>{currentEv.artist?.name || currentEv.title}</Text>
                      <Text style={os.swipeMeta}>
                        {currentEv.venue?.name} · {fmtDate(currentEv.date).day} {fmtDate(currentEv.date).month}
                      </Text>
                      {currentEv.priceMin != null && (
                        <Text style={os.swipePrice}>
                          ${currentEv.priceMin.toLocaleString()}{currentEv.priceMax && currentEv.priceMax !== currentEv.priceMin ? ` - $${currentEv.priceMax.toLocaleString()}` : ''}
                        </Text>
                      )}
                    </View>
                    <Animated.View style={[os.swipeOverlay, os.swipeOverlayLeft, { opacity: overlayLeft }]}>
                      <Text style={os.swipeOverlayText}>PASO</Text>
                    </Animated.View>
                    <Animated.View style={[os.swipeOverlay, os.swipeOverlayRight, { opacity: overlayRight }]}>
                      <Text style={[os.swipeOverlayText, { color: colors.accent }]}>ME INTERESA</Text>
                    </Animated.View>
                    <Animated.View style={[os.swipeOverlay, { top: spacing[10], alignSelf: 'center', borderColor: colors.voy, backgroundColor: 'rgba(0,230,118,0.15)', borderWidth: 3, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radius.lg, zIndex: 10 }, { opacity: overlayVoy }]}>
                      <Text style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.voy, letterSpacing: 3 }}>VOY</Text>
                    </Animated.View>
                  </Animated.View>
                  <View style={os.swipeBtns}>
                    <TouchableOpacity style={os.swipeBtnPass} onPress={() => swipeNext('left')} activeOpacity={0.7}>
                      <Text style={os.swipeBtnPassText}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.voy, alignItems: 'center', justifyContent: 'center' }} onPress={() => swipeNext('up')} activeOpacity={0.7}>
                      <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.extrabold, color: colors.bgPrimary }}>VOY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={os.swipeBtnSave} onPress={() => swipeNext('right')} activeOpacity={0.7}>
                      <Text style={os.swipeBtnSaveText}>♥</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={os.swipeCounter}>{swipeIndex + 1}/{obEvents.length}</Text>
                </>
              ) : null}
              {obSaved.length > 0 && (
                <Text style={os.savedCount}>{obSaved.length} guardados</Text>
              )}
            </View>
          )}

          {/* ═══ Step 5: Loading (personalization + social proof) ═══ */}
          {step === 5 && (
            <View style={ob.loadingStep}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={ob.loadingTitle}>Armando tu radar...</Text>
              <Text style={ob.loadingSubtitle}>Analizando {cityDisplayName} para {userName || 'ti'}</Text>

              {/* Progress bar */}
              <View style={ob.loadingBar}>
                <View style={[ob.loadingBarFill, { width: `${loadingProgress}%` }]} />
              </View>

              {/* City stats */}
              <View style={ob.loadingStats}>
                <View style={ob.loadingStat}>
                  <Text style={ob.loadingStatNum}>{cityShowCount}</Text>
                  <Text style={ob.loadingStatLabel}>shows este mes</Text>
                </View>
                <View style={ob.loadingStat}>
                  <Text style={ob.loadingStatNum}>{12 + (userName.length * 3) % 15}</Text>
                  <Text style={ob.loadingStatLabel}>venues activos</Text>
                </View>
                <View style={ob.loadingStat}>
                  <Text style={ob.loadingStatNum}>{selectedVibes.length * 8 + 5}</Text>
                  <Text style={ob.loadingStatLabel}>eventos para ti</Text>
                </View>
              </View>

              {/* Social proof */}
              <View style={ob.socialProofCard}>
                <Text style={ob.socialProofQuote}>
                  "Descubrí 3 bandas que ahora son mis favoritas. Foqo sabe lo que me gusta antes que yo."
                </Text>
                <Text style={ob.socialProofAuthor}>— Usuario de Santiago</Text>
              </View>
            </View>
          )}

          {/* ═══ Step 6: AHA — Personalized result ═══ */}
          {step === 6 && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={ob.ahaStep}>
                <Text style={ob.ahaEmoji}>🎯</Text>
                <Text style={ob.ahaTitle}>
                  Encontramos{' '}
                  <Text style={{ color: colors.accentLight }}>{savedEvents.length > 0 ? savedEvents.length : cityShowCount} eventos</Text>
                  {'\n'}que son tu vibe
                </Text>
                <Text style={ob.ahaSub}>
                  {thisWeekCount > 0 ? `${thisWeekCount} son esta semana` : 'Tu radar está listo'}
                </Text>

                {/* Saved events preview */}
                {savedEvents.length > 0 && (
                  <View style={ob.ahaEvents}>
                    {savedEvents.slice(0, 3).map(ev => {
                      const { day, month } = fmtDate(ev.date);
                      return (
                        <View key={ev.id} style={os.lineupCard}>
                          {(ev.imageUrl || ev.artist?.imageUrl) ? (
                            <Image source={{ uri: (ev.imageUrl || ev.artist?.imageUrl)! }} style={os.lineupImg} />
                          ) : (
                            <View style={[os.lineupImg, { backgroundColor: getPlaceholderColor(ev.artist?.name || ev.title), justifyContent: 'center', alignItems: 'center' }]}>
                              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: fontWeight.bold }}>{getInitials(ev.artist?.name || ev.title)}</Text>
                            </View>
                          )}
                          <View style={os.lineupInfo}>
                            <Text style={os.lineupTitle} numberOfLines={1}>{ev.artist?.name || ev.title}</Text>
                            <Text style={os.lineupMeta}>{ev.venue?.name} · {day} {month}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Notification toggles (inline, not a separate step) */}
                <View style={ob.ahaNotifs}>
                  <Text style={ob.ahaNotifsTitle}>No te pierdas nada</Text>
                  {NOTIFICATION_CHANNELS.map(ch => {
                    const active = userChannels.includes(ch.id);
                    return (
                      <TouchableOpacity
                        key={ch.id}
                        style={[ob.notifRow, active && ob.notifRowActive]}
                        onPress={() => toggleChannel(ch.id)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={ob.notifName}>{ch.name}</Text>
                          <Text style={ob.notifDesc}>{ch.desc}</Text>
                        </View>
                        <View style={[ob.notifToggle, active && ob.notifToggleActive]}>
                          {active && <View style={ob.notifToggleDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          )}
        </Animated.View>

        {/* Bottom CTA */}
        {showCta && step !== 2 && step !== 5 && (
          <TouchableOpacity
            style={[s.btnPrimary, os.obCta, !canAdvance() && { opacity: 0.4 }]}
            onPress={handleNext}
            activeOpacity={canAdvance() ? 0.8 : 1}
          >
            <Text style={s.btnPrimaryText}>{getCtaLabel()}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
//  NarrativeCard — Variable sizes, one signal per card
// ═══════════════════════════════════════════════════════════
function NarrativeCard({ event, variant = 'editorial', saved, committed, onSave, onCommit, onPress }: {
  event: Event; variant?: 'hero' | 'editorial' | 'compact' | 'peek'; saved?: boolean; committed?: boolean; onSave?: () => void; onCommit?: () => void; onPress?: () => void;
}) {
  const signal = getEventSignal(event);
  const { day, month } = fmtDate(event.date);
  const imgUrl = event.imageUrl || event.artist?.imageUrl || null;

  const cardH = variant === 'hero' ? CARD_H * 0.75
    : variant === 'editorial' ? CARD_H * 0.5
    : variant === 'peek' ? CARD_H * 0.35
    : CARD_H * 0.22;
  const cardW = variant === 'peek' ? SCREEN_WIDTH * 0.7 : SCREEN_WIDTH - spacing[5] * 2;

  const signalBgColor = signal.type === 'live' ? 'rgba(34,197,94,0.9)'
    : signal.type === 'match' ? 'rgba(249,115,22,0.85)'
    : signal.type === 'reason' ? 'rgba(251,191,36,0.85)'
    : 'rgba(255,255,255,0.15)';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[ns.card, { width: cardW, height: cardH }]}>
      {imgUrl ? (
        <Image source={{ uri: imgUrl }} style={ns.cardImg} />
      ) : (
        <View style={[ns.cardImg, { backgroundColor: getPlaceholderColor(event.artist?.name || event.title), justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: variant === 'hero' ? fontSize['6xl'] : variant === 'editorial' ? fontSize['5xl'] : fontSize['3xl'], fontWeight: fontWeight.black }}>{getInitials(event.artist?.name || event.title)}</Text>
        </View>
      )}
      <View style={s.flyerGradient} />

      {/* ONE signal badge */}
      <View style={[ns.signalBadge, { backgroundColor: signalBgColor }]}>
        <Text style={ns.signalText}>{signal.label}</Text>
      </View>

      {/* Action buttons — always visible like Instagram */}
      <View style={ns.cardActions}>
        {onSave && (
          <TouchableOpacity style={ns.cardActionBtn} onPress={onSave} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[ns.cardActionIcon, saved && { color: colors.accent }]}>{saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        )}
        {onCommit && (
          <TouchableOpacity style={[ns.cardActionBtn, committed && { backgroundColor: colors.voyBg, borderColor: colors.voy }]} onPress={onCommit} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[ns.cardActionIcon, committed && { color: colors.voy }]}>{committed ? '✓' : 'Voy'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom info */}
      <View style={[ns.cardInfo, variant === 'hero' && ns.cardInfoHero]}>
        <Text style={[ns.cardTitle, variant === 'hero' && ns.cardTitleHero]} numberOfLines={variant === 'compact' ? 1 : 2}>
          {event.artist?.name || event.title}
        </Text>
        {variant !== 'compact' && (
          <Text style={ns.cardMeta} numberOfLines={1}>
            {event.venue?.name} · {day} {month}
          </Text>
        )}
        {variant === 'hero' && event.priceMin != null && (
          <Text style={ns.cardPrice}>
            ${event.priceMin.toLocaleString()}{event.priceMax && event.priceMax !== event.priceMin ? ` – $${event.priceMax.toLocaleString()}` : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Backward compat wrapper for onboarding swipe cards
function EventFlyerCard({ event, size = 'large', saved, onSave, onPress, matchScore }: {
  event: Event; size?: 'large' | 'medium' | 'small'; saved?: boolean; onSave?: () => void; onPress?: () => void; matchScore?: number;
}) {
  const variant = size === 'large' ? 'hero' : size === 'medium' ? 'editorial' : 'compact';
  return <NarrativeCard event={event} variant={variant} saved={saved} onSave={onSave} onPress={onPress} />;
}

// ═══════════════════════════════════════════════════════════
//  EventDetailSheet
// ═══════════════════════════════════════════════════════════
function EventDetailSheet({ event, visible, onClose, saved, onSave, onCommit, isCommitted, onDismiss }: {
  event: Event | null; visible: boolean; onClose: () => void; saved: boolean; onSave: () => void; onCommit?: () => void; isCommitted?: boolean; onDismiss?: () => void;
}) {
  if (!event) return null;
  const timeLabel = getTimeLabel(event.date);
  const { day, month } = fmtDate(event.date);
  const score = getMatchScore(event.id, event);
  const sheetImg = event.imageUrl || event.artist?.imageUrl || null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={hs.sheetOverlay}>
        <View style={hs.sheetContainer}>
          {/* Handle */}
          <View style={hs.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Image */}
            {sheetImg ? (
              <Image source={{ uri: sheetImg }} style={hs.sheetImage} />
            ) : (
              <View style={[hs.sheetImage, { backgroundColor: getPlaceholderColor(event.artist?.name || event.title), justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: fontSize['6xl'], fontWeight: fontWeight.black }}>{getInitials(event.artist?.name || event.title)}</Text>
              </View>
            )}

            <View style={hs.sheetContent}>
              {/* Match score — hide when too low */}
              {score >= 10 && (
                <View style={hs.sheetMatchRow}>
                  <Text style={hs.sheetMatchText}>{score}% match para ti</Text>
                </View>
              )}

              <Text style={hs.sheetTitle}>{event.title}</Text>

              {event.artist && <Text style={hs.sheetArtist}>{event.artist.name}</Text>}

              <View style={hs.sheetMetaRow}>
                <Text style={hs.sheetMetaText}>📍 {event.venue?.name}, {event.venue?.city}</Text>
              </View>

              <View style={hs.sheetMetaRow}>
                <Text style={hs.sheetMetaText}>📅 {day} {month} · {timeLabel}</Text>
              </View>

              {event.priceMin != null && (
                <Text style={hs.sheetPrice}>
                  ${event.priceMin.toLocaleString()}{event.priceMax && event.priceMax !== event.priceMin ? ` – $${event.priceMax.toLocaleString()}` : ''}
                </Text>
              )}

              {/* CTA Buttons */}
              <View style={hs.sheetActions}>
                {isCommitted ? (
                  <>
                    <View style={hs.sheetCommittedBadge}>
                      <Text style={hs.sheetCommittedText}>VOY — Tengo mi entrada</Text>
                    </View>
                    <TouchableOpacity style={hs.sheetBtnInteresa} onPress={onCommit} activeOpacity={0.8}>
                      <Text style={hs.sheetBtnInteresaText}>Ya no voy</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={hs.sheetBtnVoy} onPress={onCommit} activeOpacity={0.8}>
                      <Text style={hs.sheetBtnVoyText}>Voy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[hs.sheetBtnInteresa, saved && { borderColor: colors.accent }]} onPress={onSave} activeOpacity={0.8}>
                      <Text style={[hs.sheetBtnInteresaText, saved && { color: colors.accent }]}>
                        {saved ? '♥ Guardado' : 'Me interesa'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Ticket link */}
              {event.ticketUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(event.ticketUrl!)} style={hs.sheetTicketLink}>
                  <Text style={hs.sheetTicketText}>Ver tickets ↗</Text>
                </TouchableOpacity>
              )}

              {/* Dismiss — always visible, trains the algorithm */}
              {onDismiss && !isCommitted && (
                <TouchableOpacity style={hs.sheetDismiss} onPress={onDismiss} activeOpacity={0.7}>
                  <Text style={hs.sheetDismissText}>No me interesa</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={hs.sheetClose} onPress={onClose} activeOpacity={0.7}>
            <Text style={hs.sheetCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
//  Toast
// ═══════════════════════════════════════════════════════════
function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={[hs.toast, { opacity }]}>
      <Text style={hs.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════
//  LiveStrip — Conditional EN VIVO section (only shows when events are live)
// ═══════════════════════════════════════════════════════════
function LiveStrip({ events, onEventPress }: {
  events: Event[]; onEventPress: (ev: Event) => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const liveEvents = events.filter(e => isLiveEvent(e.date));
  if (liveEvents.length === 0) return null;

  return (
    <View style={ns.liveWrap}>
      <Animated.View style={[ns.liveDot, { transform: [{ scale: pulseAnim }] }]} />
      <Text style={ns.liveLabel}>EN VIVO AHORA</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ns.liveScroll}>
        {liveEvents.map(ev => (
          <TouchableOpacity key={ev.id} style={ns.liveCard} onPress={() => onEventPress(ev)} activeOpacity={0.85}>
            {(ev.imageUrl || ev.artist?.imageUrl) ? (
              <Image source={{ uri: (ev.imageUrl || ev.artist?.imageUrl)! }} style={ns.liveImg} />
            ) : (
              <View style={[ns.liveImg, { backgroundColor: getPlaceholderColor(ev.artist?.name || ev.title) }]} />
            )}
            <View style={ns.liveInfo}>
              <Text style={ns.liveTitle} numberOfLines={1}>{ev.artist?.name || ev.title}</Text>
              <Text style={ns.liveMeta} numberOfLines={1}>{ev.venue?.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
//  DiscoverSwiper — TRIPLE GESTURE (kept for daily drop)
// ═══════════════════════════════════════════════════════════
function DiscoverSwiper({ events, saved, committed, onSave, onCommit, onEventPress, onSkip }: {
  events: Event[]; saved: string[]; committed: string[]; onSave: (id: string) => void; onCommit: (id: string) => void; onEventPress: (ev: Event) => void; onSkip?: (ev: Event) => void;
}) {
  const [index, setIndex] = useState(0);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const dropEvents = events.slice(0, 7); // Daily drop: max 7 curated

  const swipeAway = useCallback((direction: 'left' | 'right' | 'up') => {
    if (index >= dropEvents.length) return;
    const ev = dropEvents[index];

    const toValue = direction === 'left'
      ? { x: -SCREEN_WIDTH * 1.5, y: 0 }
      : direction === 'right'
        ? { x: SCREEN_WIDTH * 1.5, y: 0 }
        : { x: 0, y: -SCREEN_HEIGHT };

    if (direction === 'right') onSave(ev.id);
    else if (direction === 'up') onCommit(ev.id);
    else if (direction === 'left' && onSkip) onSkip(ev);

    Animated.timing(pan, { toValue, duration: 250, useNativeDriver: true }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setIndex(i => i + 1);
    });
  }, [index, dropEvents, onSave, onCommit, pan]);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 15 || Math.abs(gs.dy) > 15,
    onPanResponderMove: (_, gs) => pan.setValue({ x: gs.dx, y: gs.dy }),
    onPanResponderRelease: (_, gs) => {
      if (gs.dy < -120) swipeAway('up');
      else if (gs.dx > 120) swipeAway('right');
      else if (gs.dx < -120) swipeAway('left');
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
  })).current;

  const currentEv = dropEvents[index];
  const cardRotate = pan.x.interpolate({ inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH], outputRange: ['-10deg', '0deg', '10deg'] });
  const cardScale = pan.y.interpolate({ inputRange: [-200, 0], outputRange: [1.05, 1], extrapolate: 'clamp' });
  const voyOpacity = pan.y.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const interesaOpacity = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const isDone = index >= dropEvents.length || !currentEv;
  const score = !isDone && currentEv ? getMatchScore(currentEv.id, currentEv) : 0;
  const dateFmt = !isDone && currentEv ? fmtDate(currentEv.date) : { day: '', month: '' };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={hs.swiperHeader}>
        <Text style={hs.swiperHeaderTitle}>Para ti hoy</Text>
        <View style={hs.swiperDropPill}>
          <Text style={hs.swiperDropText}>
            {isDone ? 'Drop completo' : `Daily Drop · ${index + 1}/${dropEvents.length}`}
          </Text>
        </View>
      </View>

      {isDone ? (
        /* Drop done → show empty + "En tu radar" below */
        <View style={{ paddingHorizontal: spacing[5], paddingTop: spacing[4], alignItems: 'center' }}>
          <Text style={{ fontSize: fontSize['2xl'], marginBottom: spacing[2] }}>✓</Text>
          <Text style={hs.swiperEmptyTitle}>{'Drop de hoy completado'}</Text>
          <Text style={hs.swiperEmptySubtitle}>Mañana a las 11am — nuevo drop</Text>
        </View>
      ) : (
        /* Active swiper */
        <View style={hs.swiperWrap}>
          <Animated.View
            style={[hs.swiperCard, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: cardRotate }, { scale: cardScale }] }]}
            {...panResponder.panHandlers}
          >
            {(currentEv.imageUrl || currentEv.artist?.imageUrl) ? (
              <Image source={{ uri: (currentEv.imageUrl || currentEv.artist?.imageUrl)! }} style={hs.swiperCardImg} />
            ) : (
              <View style={[hs.swiperCardImg, { backgroundColor: getPlaceholderColor(currentEv.artist?.name || currentEv.title), justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fontSize['5xl'], fontWeight: fontWeight.black }}>{getInitials(currentEv.artist?.name || currentEv.title)}</Text>
              </View>
            )}
            <View style={s.flyerGradient} />
            <View style={hs.swiperMatchBadge}>
              <Text style={hs.swiperMatchText}>{score}% match</Text>
            </View>
            <View style={hs.swiperCardInfo}>
              <Text style={hs.swiperCardTitle} numberOfLines={2}>{currentEv.artist?.name || currentEv.title}</Text>
              <Text style={hs.swiperCardMeta}>{currentEv.venue?.name} · {dateFmt.day} {dateFmt.month}</Text>
              {currentEv.priceMin != null && (
                <Text style={hs.swiperCardPrice}>
                  ${currentEv.priceMin.toLocaleString()}{currentEv.priceMax && currentEv.priceMax !== currentEv.priceMin ? ` – $${currentEv.priceMax.toLocaleString()}` : ''}
                </Text>
              )}
            </View>
            <Animated.View style={[hs.swiperOverlay, hs.swiperOverlayVoy, { opacity: voyOpacity }]}>
              <Text style={hs.swiperOverlayVoyText}>VOY</Text>
            </Animated.View>
            <Animated.View style={[hs.swiperOverlay, hs.swiperOverlayInteresa, { opacity: interesaOpacity }]}>
              <Text style={hs.swiperOverlayInteresaText}>ME INTERESA</Text>
            </Animated.View>
            <Animated.View style={[hs.swiperOverlay, hs.swiperOverlaySkip, { opacity: skipOpacity }]}>
              <Text style={hs.swiperOverlaySkipText}>PASO</Text>
            </Animated.View>
          </Animated.View>

          <View style={hs.swiperActions}>
            <TouchableOpacity style={hs.swiperBtnSkip} onPress={() => swipeAway('left')} activeOpacity={0.7}>
              <Text style={hs.swiperBtnSkipText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={hs.swiperBtnVoy} onPress={() => swipeAway('up')} activeOpacity={0.7}>
              <Text style={hs.swiperBtnVoyText}>IR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={hs.swiperBtnInteresa} onPress={() => swipeAway('right')} activeOpacity={0.7}>
              <Text style={hs.swiperBtnInteresaText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
//  EnTuRadar — High-affinity future events (lower visual energy)
// ═══════════════════════════════════════════════════════════
function EnTuRadar({ events, saved, onSave, onPress }: {
  events: Event[]; saved: string[]; onSave: (id: string) => void; onPress: (ev: Event) => void;
}) {
  // Future events with high match, sorted by match score
  const radarEvents = events
    .filter(e => isFutureEvent(e.date, 7))
    .sort((a, b) => getMatchScore(b.id, b) - getMatchScore(a.id, a))
    .slice(0, 8);

  if (radarEvents.length === 0) return null;

  const getRadarReason = (ev: Event) => {
    if (ev.matchReason) return ev.matchReason;
    const score = getMatchScore(ev.id, ev);
    if (score >= 70) return 'Alta afinidad';
    return 'Cerca de ti';
  };

  return (
    <View style={ns.radarSection}>
      <Text style={ns.radarTitle}>En tu radar</Text>
      <Text style={ns.radarSubtitle}>Eventos a futuro que encajan contigo</Text>
      {radarEvents.map(ev => {
        const { day, month } = fmtDate(ev.date);
        const score = getMatchScore(ev.id, ev);
        const reason = getRadarReason(ev);
        return (
          <TouchableOpacity key={ev.id} style={ns.radarRow} onPress={() => onPress(ev)} activeOpacity={0.8}>
            {(ev.imageUrl || ev.artist?.imageUrl) ? (
              <Image source={{ uri: (ev.imageUrl || ev.artist?.imageUrl)! }} style={ns.radarThumb} />
            ) : (
              <View style={[ns.radarThumb, { backgroundColor: getPlaceholderColor(ev.artist?.name || ev.title), alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: fontSize.xs, color: 'rgba(255,255,255,0.3)', fontWeight: fontWeight.bold }}>{getInitials(ev.artist?.name || ev.title)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={ns.radarEventTitle} numberOfLines={1}>{ev.artist?.name || ev.title}</Text>
              <Text style={ns.radarEventMeta}>{ev.venue?.name} · {day} {month}</Text>
              <Text style={ns.radarReason}>{reason} · {score}%</Text>
            </View>
            <TouchableOpacity onPress={() => onSave(ev.id)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: fontSize.lg, color: saved.includes(ev.id) ? colors.accent : colors.textTertiary }}>
                {saved.includes(ev.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── HomeScreen — Narrative Scroll System ─────────────────
function HomeScreen({ initialSaved = [], committed: initialCommitted = [], authToken, authUser, onLogout }: {
  initialSaved?: string[]; committed?: string[]; authToken?: string | null; authUser?: AuthUser | null; onLogout: () => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'explorar' | 'miset'>('explorar');
  const [saved, setSaved] = useState<string[]>(initialSaved);
  const [committed, setCommitted] = useState<string[]>(initialCommitted);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastKey, setToastKey] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      let list: Event[] = [];
      if (authToken) {
        const res = await fetch(`${API_BASE}/feed`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();
        list = Array.isArray(data) ? data : (data.data || []);
      }
      if (list.length === 0) {
        const res = await fetch(`${API_BASE}/events?perPage=50&sortBy=date`);
        const data = await res.json();
        list = Array.isArray(data) ? data : (data.data || []);
      }
      setEvents(list.length > 0 ? list : MOCK_EVENTS);
    } catch (e) {
      console.warn('Failed to fetch events', e);
      setEvents(MOCK_EVENTS);
    }
  }, [authToken]);

  useEffect(() => {
    fetchEvents().finally(() => setLoading(false));
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  // ── Signal helper — fires behavioral signals to train the algorithm ──
  const sendSignal = useCallback((eventId: string, artistId: string, signalType: string) => {
    if (!authToken) return;
    fetch(`${API_BASE}/signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ eventId, artistId, signalType }),
    }).catch(() => {}); // fire-and-forget
  }, [authToken]);

  const toggleSave = useCallback((id: string) => {
    const ev = events.find(e => e.id === id);
    setSaved(prev => {
      const wasSaved = prev.includes(id);
      if (ev?.artist) sendSignal(id, ev.artist?.id || ev.artistId || '', wasSaved ? 'unsave' : 'save');
      if (wasSaved) {
        if (ev) { setToastMsg(`${ev.artist?.name || ev.title} removido`); setToastKey(k => k + 1); }
        return prev.filter(x => x !== id);
      }
      if (ev) { setToastMsg(`${ev.artist?.name || ev.title} guardado`); setToastKey(k => k + 1); }
      return [...prev, id];
    });
  }, [events, sendSignal]);

  const toggleCommit = useCallback((id: string) => {
    const ev = events.find(e => e.id === id);
    setCommitted(prev => {
      if (prev.includes(id)) {
        if (ev) { setToastMsg(`Ya no vas a ${ev.artist?.name || ev.title}`); setToastKey(k => k + 1); }
        return prev.filter(x => x !== id);
      }
      if (ev?.artist) sendSignal(id, ev.artist?.id || ev.artistId || '', 'voy');
      if (ev) { setToastMsg(`Voy a ${ev.artist?.name || ev.title}`); setToastKey(k => k + 1); }
      return [...prev, id];
    });
  }, [events, sendSignal]);

  const openDetail = useCallback((ev: Event) => {
    setSelectedEvent(ev); setSheetVisible(true);
    if (ev.artist) sendSignal(ev.id, ev.artist?.id || ev.artistId || '', 'view_details');
  }, [sendSignal]);

  const handleDismiss = useCallback((ev: Event) => {
    sendSignal(ev.id, ev.artist?.id || ev.artistId || '', 'dismiss');
    setDismissed(prev => [...prev, ev.id]);
    setSheetVisible(false);
    setTimeout(() => setSelectedEvent(null), 300);
    setToastMsg(`${ev.artist?.name || ev.title} oculto del feed`);
    setToastKey(k => k + 1);
  }, [sendSignal]);
  const closeDetail = useCallback(() => { setSheetVisible(false); setTimeout(() => setSelectedEvent(null), 300); }, []);

  // ── Event segments for Explorar ──
  // Filter out dismissed events from all views
  const visibleEvents = events.filter(e => !dismissed.includes(e.id));
  const tonightEvents = visibleEvents.filter(e => isTonight(e.date));
  const weekendEvents = visibleEvents.filter(e => isThisWeekend(e.date) && !isTonight(e.date));
  const heroEvent = tonightEvents[0] || visibleEvents[0];
  const hasTonightContent = tonightEvents.length > 1;
  const narrativeEvents = (hasTonightContent ? tonightEvents.slice(1) : visibleEvents.slice(1)).slice(0, 10);
  const narrativeLabel = hasTonightContent ? 'Esta noche' : 'Próximamente';

  // ── Mi Set segments ──
  const committedEvents = events.filter(e => committed.includes(e.id));
  const savedOnlyEvents = events.filter(e => saved.includes(e.id) && !committed.includes(e.id));
  const allMySetEvents = [...committedEvents, ...savedOnlyEvents];
  const monthGroups = groupEventsByMonth(allMySetEvents);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={hs.header}>
        <Text style={hs.headerLogo}>Foqo</Text>
        <TouchableOpacity style={hs.headerAvatar} activeOpacity={0.7} onPress={() => setTab('miset')}>
          <Text style={hs.headerAvatarText}>
            {authUser?.displayName ? getInitials(authUser.displayName) : 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════
          TAB: EXPLORAR — Combined feed
          ═══════════════════════════════════════════════════════ */}
      {tab === 'explorar' && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
          {loading ? (
            <View style={s.center}><Text style={s.muted}>Cargando...</Text></View>
          ) : events.length === 0 ? (
            <View style={s.center}><Text style={s.emptyTitle}>Sin eventos</Text></View>
          ) : (
            <>
              {/* 1. Context header */}
              <View style={ns.contextWrap}>
                <Text style={ns.contextText}>{getContextHeader(authUser?.city || undefined)}</Text>
              </View>

              {/* 2. Hero pick — single event, full width */}
              {heroEvent && (
                <View style={ns.heroWrap}>
                  <NarrativeCard
                    event={heroEvent}
                    variant="hero"
                    saved={saved.includes(heroEvent.id)}
                    committed={committed.includes(heroEvent.id)}
                    onSave={() => toggleSave(heroEvent.id)}
                    onCommit={() => toggleCommit(heroEvent.id)}
                    onPress={() => openDetail(heroEvent)}
                  />
                </View>
              )}

              {/* 3. Conditional EN VIVO strip */}
              <LiveStrip events={events} onEventPress={openDetail} />

              {/* 4. Narrative cards — "Esta noche" or "Próximamente" */}
              {narrativeEvents.length > 0 && (
                <View style={ns.sectionWrap}>
                  <Text style={ns.sectionTitle}>{narrativeLabel}</Text>
                  {narrativeEvents.map((ev, i) => {
                    const variant = getCardVariant(i);
                    return (
                      <View key={ev.id} style={ns.narrativeItem}>
                        <NarrativeCard
                          event={ev}
                          variant={variant === 'hero' ? 'editorial' : variant}
                          saved={saved.includes(ev.id)}
                          committed={committed.includes(ev.id)}
                          onSave={() => toggleSave(ev.id)}
                          onCommit={() => toggleCommit(ev.id)}
                          onPress={() => openDetail(ev)}
                        />
                      </View>
                    );
                  })}
                </View>
              )}

              {/* 6. "Este finde" peek — only Thu-Sun, horizontal scroll */}
              {isThursToSunday() && weekendEvents.length > 0 && (
                <View style={ns.sectionWrap}>
                  <Text style={ns.sectionTitle}>Este finde</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
                    {weekendEvents.slice(0, 6).map(ev => (
                      <NarrativeCard
                        key={ev.id}
                        event={ev}
                        variant="peek"
                        saved={saved.includes(ev.id)}
                        committed={committed.includes(ev.id)}
                        onSave={() => toggleSave(ev.id)}
                        onCommit={() => toggleCommit(ev.id)}
                        onPress={() => openDetail(ev)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* 7. En Tu Radar — affinity-based recommendations */}
              <EnTuRadar events={visibleEvents} saved={saved} onSave={toggleSave} onPress={openDetail} />

              {/* 8. Finite footer */}
              <View style={ns.finiteFooter}>
                <Text style={ns.finiteEmoji}>✓</Text>
                <Text style={ns.finiteTitle}>Eso es todo por hoy</Text>
                <Text style={ns.finiteSub}>Vuelve mañana para nuevos eventos</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: MI SET — Month-grouped timeline
          ═══════════════════════════════════════════════════════ */}
      {tab === 'miset' && (
        <ScrollView style={{ flex: 1, paddingHorizontal: spacing[5] }} showsVerticalScrollIndicator={false}>
          {/* Profile header */}
          <View style={{ paddingTop: spacing[6], paddingBottom: spacing[4] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[3] }}>
              <View style={hs.profileAvatar}>
                <Text style={hs.profileInitial}>
                  {authUser?.displayName ? getInitials(authUser.displayName) : 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={hs.profileName}>{authUser?.displayName || 'Usuario'}</Text>
                <Text style={hs.profileSub}>{authUser?.city || 'Sin ciudad'}</Text>
              </View>
              <TouchableOpacity onPress={onLogout} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
            <Text style={ns.mySetTitle}>Mi Set</Text>
            <Text style={ns.mySetSub}>
              {allMySetEvents.length > 0
                ? `${committed.length} confirmados · ${savedOnlyEvents.length} en radar`
                : 'Tu lineup personal'}
            </Text>
          </View>

          {/* Month-grouped timeline */}
          {monthGroups.length > 0 ? (
            monthGroups.map(group => (
              <View key={group.month} style={ns.monthGroup}>
                <Text style={ns.monthLabel}>{group.month}</Text>
                {group.events.map(ev => {
                  const isCommitted = committed.includes(ev.id);
                  const { day, month } = fmtDate(ev.date);
                  return (
                    <TouchableOpacity key={ev.id} style={[ns.timelineRow, isCommitted && ns.timelineRowCommitted]} activeOpacity={0.8} onPress={() => openDetail(ev)}>
                      {/* Date column */}
                      <View style={ns.timelineDateCol}>
                        <Text style={ns.timelineDay}>{day}</Text>
                        <Text style={ns.timelineMonth}>{month}</Text>
                      </View>
                      {/* Timeline dot + line */}
                      <View style={ns.timelineLine}>
                        <View style={[ns.timelineDot, isCommitted && { backgroundColor: colors.voy }]} />
                      </View>
                      {/* Event info */}
                      <View style={ns.timelineContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                          <Text style={ns.timelineTitle} numberOfLines={1}>{ev.artist?.name || ev.title}</Text>
                          {isCommitted && <Text style={ns.voyTag}>VOY</Text>}
                        </View>
                        <Text style={ns.timelineVenue} numberOfLines={1}>{ev.venue?.name}</Text>
                        <Text style={ns.timelineCountdown}>{getCountdown(ev.date)}</Text>
                      </View>
                      {/* Thumb */}
                      {(ev.imageUrl || ev.artist?.imageUrl) ? (
                        <Image source={{ uri: (ev.imageUrl || ev.artist?.imageUrl)! }} style={ns.timelineThumb} />
                      ) : (
                        <View style={[ns.timelineThumb, { backgroundColor: getPlaceholderColor(ev.artist?.name || ev.title), alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: fontSize.xs, color: 'rgba(255,255,255,0.3)', fontWeight: fontWeight.bold }}>{getInitials(ev.artist?.name || ev.title)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          ) : (
            <View style={{ marginTop: spacing[10], alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize['2xl'], marginBottom: spacing[3] }}>🎵</Text>
              <Text style={hs.emptySetTitle}>Tu set está vacío</Text>
              <Text style={hs.emptySetSub}>Desliza en Explorar para descubrir eventos</Text>
            </View>
          )}

          {/* Tu Radar — high-affinity future events not yet saved */}
          {(() => {
            const unsavedFuture = events
              .filter(e => !saved.includes(e.id) && !committed.includes(e.id) && isFutureEvent(e.date, 14))
              .sort((a, b) => getMatchScore(b.id, b) - getMatchScore(a.id, a))
              .slice(0, 5);
            if (unsavedFuture.length === 0) return null;
            return (
              <View style={{ marginTop: spacing[6] }}>
                <Text style={[ns.sectionTitle, { paddingHorizontal: 0 }]}>Te puede gustar</Text>
                <Text style={ns.radarSubtitle}>Basado en tus gustos</Text>
                {unsavedFuture.map(ev => {
                  const { day, month } = fmtDate(ev.date);
                  return (
                    <TouchableOpacity key={ev.id} style={ns.radarRow} onPress={() => openDetail(ev)} activeOpacity={0.8}>
                      {(ev.imageUrl || ev.artist?.imageUrl) ? (
                        <Image source={{ uri: (ev.imageUrl || ev.artist?.imageUrl)! }} style={ns.radarThumb} />
                      ) : (
                        <View style={[ns.radarThumb, { backgroundColor: getPlaceholderColor(ev.artist?.name || ev.title), alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: fontSize.xs, color: 'rgba(255,255,255,0.3)', fontWeight: fontWeight.bold }}>{getInitials(ev.artist?.name || ev.title)}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={ns.radarEventTitle} numberOfLines={1}>{ev.artist?.name || ev.title}</Text>
                        <Text style={ns.radarEventMeta}>{ev.venue?.name} · {day} {month}</Text>
                      </View>
                      <TouchableOpacity onPress={() => toggleSave(ev.id)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={{ fontSize: fontSize.lg, color: colors.textTertiary }}>♡</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })()}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom Tab Bar */}
      <View style={hs.tabBar}>
        <TouchableOpacity style={hs.tabItem} onPress={() => setTab('explorar')} activeOpacity={0.7}>
          <Text style={[hs.tabIcon, tab === 'explorar' && hs.tabIconActive]}>●</Text>
          <Text style={[hs.tabLabel, tab === 'explorar' && hs.tabLabelActive]}>Explorar</Text>
          {tab === 'explorar' && <View style={hs.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity style={hs.tabItem} onPress={() => setTab('miset')} activeOpacity={0.7}>
          <Text style={[hs.tabIcon, tab === 'miset' && hs.tabIconActive]}>♫</Text>
          <Text style={[hs.tabLabel, tab === 'miset' && hs.tabLabelActive]}>Mi Set</Text>
          {tab === 'miset' && <View style={hs.tabIndicator} />}
          {allMySetEvents.length > 0 && <View style={hs.tabBadge}><Text style={hs.tabBadgeText}>{allMySetEvents.length}</Text></View>}
        </TouchableOpacity>
      </View>

      <EventDetailSheet
        event={selectedEvent}
        visible={sheetVisible}
        onClose={closeDetail}
        saved={selectedEvent ? saved.includes(selectedEvent.id) : false}
        onSave={() => { if (selectedEvent) toggleSave(selectedEvent.id); }}
        onCommit={() => { if (selectedEvent) toggleCommit(selectedEvent.id); }}
        isCommitted={selectedEvent ? committed.includes(selectedEvent.id) : false}
        onDismiss={() => { if (selectedEvent) handleDismiss(selectedEvent); }}
      />
      <Toast key={toastKey} message={toastMsg} visible={!!toastMsg && toastKey > 0} />
    </SafeAreaView>
  );
}

// ── Shared / base styles ─────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  authWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[6] },
  authCard: { width: '100%', maxWidth: 400, backgroundColor: colors.surface1, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing[8], alignItems: 'center', position: 'relative', overflow: 'hidden', ...shadows.lg },
  authGlow: { position: 'absolute', top: -100, left: '10%', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(249,115,22,0.08)' } as any,
  authLogo: { fontSize: 72, fontWeight: fontWeight.black, color: colors.accentLight, letterSpacing: -4 },
  authTagline: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center', marginTop: spacing[3], letterSpacing: -0.5 },
  authSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[3], marginBottom: spacing[8], lineHeight: 20 },
  authForm: { width: '100%' } as any,
  input: { width: '100%', backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.textPrimary, paddingHorizontal: spacing[4], paddingVertical: spacing[4], fontSize: fontSize.base, marginBottom: spacing[4] },
  btnPrimary: { width: '100%', backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[2], ...shadows.glow } as any,
  btnPrimaryText: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  linkText: { color: colors.accentLight, textAlign: 'center', fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  footerText: { marginTop: spacing[8], fontSize: fontSize.xs, color: colors.textTertiary },
  center: { padding: spacing[10], alignItems: 'center' },
  emptyTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing[2] },
  muted: { fontSize: fontSize.sm, color: colors.textTertiary },
  // @ts-ignore — web-only gradient
  flyerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundImage: 'linear-gradient(transparent, rgba(6,6,14,0.95))' } as any,
  obTitle: { fontSize: 36, fontWeight: fontWeight.extrabold, color: colors.textPrimary, lineHeight: 44, letterSpacing: -1 },
  errorText: { color: colors.error, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing[3] },
});

// ── Onboarding styles ────────────────────────────────────
const os = StyleSheet.create({
  obWrap: { flex: 1 },
  obContent: { flex: 1, paddingHorizontal: spacing[5] },
  obScroll: { flex: 1 },
  progressBar: { height: 2, backgroundColor: colors.surface2, marginHorizontal: spacing[5], borderRadius: 1, marginBottom: spacing[2] },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 1 } as any,
  obBack: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  obStepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  obStepText: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.semibold, letterSpacing: 1 },
  obSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[2], lineHeight: 20, paddingHorizontal: spacing[6] },
  skipNotif: {},
  skipNotifText: { fontSize: fontSize.sm, color: colors.textTertiary },
  obSectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing[4] },
  obGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  obCountryChip: { width: (SCREEN_WIDTH - spacing[5] * 2 - spacing[3] * 3) / 4, backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing[5], alignItems: 'center' },
  obCountryChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(249,115,22,0.06)' },
  obCountryFlag: { fontSize: 28, marginBottom: spacing[2] },
  obCountryName: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  obCountryNameActive: { color: colors.accentLight },
  obCityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[4], marginBottom: spacing[2] },
  obCityChipActive: { borderColor: colors.accent, backgroundColor: 'rgba(249,115,22,0.06)' },
  obCityName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  obCityNameActive: { color: colors.accentLight },
  obCityRegion: { fontSize: 11, color: colors.textTertiary, marginTop: 1 },
  obCta: { paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[6], borderTopWidth: 1, borderTopColor: colors.border },
  vibesGrid: { gap: spacing[3], paddingHorizontal: spacing[5] },
  vibeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', padding: spacing[4], gap: spacing[3] },
  vibeEmoji: { fontSize: 32 },
  vibeTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  vibeDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  vibeCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  vibeCheckText: { color: colors.white, fontSize: 14, fontWeight: fontWeight.bold },
  vibeHint: { fontSize: fontSize.xs, color: colors.textTertiary, textAlign: 'center', marginTop: spacing[4] },
  swipeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  swipeCard: { position: 'absolute', width: SCREEN_WIDTH - spacing[5] * 2, height: CARD_H * 0.85, borderRadius: radius.xl, overflow: 'hidden' },
  swipeImg: { width: '100%', height: '100%', position: 'absolute' } as any,
  // @ts-ignore — web-only gradient
  swipeGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundImage: 'linear-gradient(transparent, rgba(6,6,14,0.95))' } as any,
  swipeInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[5], zIndex: 2 },
  swipeTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: -0.5 },
  swipeMeta: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  swipePrice: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accentSecondary, marginTop: spacing[2] },
  swipeMatchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[2] },
  swipeMatchLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accentLight, backgroundColor: 'rgba(249,115,22,0.2)', paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.sm },
  swipeOverlay: { position: 'absolute', top: '35%', zIndex: 10, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radius.lg, borderWidth: 3 } as any,
  swipeOverlayRight: { right: spacing[4], borderColor: colors.success, backgroundColor: 'rgba(34,197,94,0.15)' },
  swipeOverlayLeft: { left: spacing[4], borderColor: colors.error, backgroundColor: 'rgba(248,113,113,0.15)' },
  swipeOverlayText: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, letterSpacing: 2 },
  swipeBtns: { position: 'absolute', bottom: 40, flexDirection: 'row', gap: spacing[8] },
  swipeBtnPass: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  swipeBtnPassText: { fontSize: fontSize.xl, color: colors.error, fontWeight: fontWeight.bold },
  swipeBtnSave: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.glow },
  swipeBtnSaveText: { fontSize: fontSize.xl, color: colors.white, fontWeight: fontWeight.bold },
  swipeCounter: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] },
  savedCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accentLight },
  swipeLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  swipeLoadingText: { fontSize: fontSize.sm, color: colors.textTertiary },
  swipeDone: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[5] },
  swipeDoneEmoji: { fontSize: 48, marginBottom: spacing[4] },
  swipeDoneText: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: 'center' },
  channelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, padding: spacing[5], marginBottom: spacing[3], borderWidth: 1, borderColor: colors.border },
  channelCardActive: { borderColor: colors.accent, backgroundColor: 'rgba(249,115,22,0.04)' },
  channelInfo: { flex: 1 },
  channelName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  channelDesc: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  channelToggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.surface3, padding: 2, justifyContent: 'center', marginLeft: spacing[4] },
  channelToggleActive: { backgroundColor: colors.accent },
  channelToggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.textTertiary },
  successWrap: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[10], alignItems: 'center' },
  successEmoji: { fontSize: 64, marginBottom: spacing[5] },
  successSub: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[2] },
  successFooter: { fontSize: fontSize.sm, color: colors.textTertiary, textAlign: 'center', marginTop: spacing[8] },
  matchBadge: { backgroundColor: 'rgba(249,115,22,0.12)', paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full },
  matchScore: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accentLight },
  lineupScroll: { marginTop: spacing[6] },
  lineupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[3], marginBottom: spacing[3], gap: spacing[3] },
  lineupImg: { width: 56, height: 56, borderRadius: radius.md },
  lineupInfo: { flex: 1 },
  lineupTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  lineupMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
});

// ── Home / component styles ──────────────────────────────
const hs = StyleSheet.create({
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  headerGreeting: { fontSize: fontSize.xs, color: colors.textSecondary },
  headerLogo: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.accentLight, letterSpacing: -0.5 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary },
  // Greeting
  greetingWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[2] },
  greetingEmoji: { fontSize: 24 },
  greetingText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  greetingSubtext: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  // Urgency Ticker
  tickerWrap: { paddingTop: spacing[3], marginBottom: spacing[4] },
  tickerTopRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], marginBottom: spacing[3], gap: spacing[2] },
  tickerLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, letterSpacing: 1.5, textTransform: 'uppercase' },
  tickerScroll: { paddingHorizontal: spacing[5], gap: spacing[3] },
  tickerCard: { width: SCREEN_WIDTH * 0.78, height: 110, flexDirection: 'row', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tickerImg: { width: 100, height: '100%' } as any,
  tickerInfo: { flex: 1, padding: spacing[3], justifyContent: 'space-between' },
  tickerTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  tickerMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  tickerLiveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.9)', paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: radius.full, gap: spacing[1] },
  tickerLiveText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white, letterSpacing: 1 },
  tickerMatchPill: { backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.sm },
  tickerMatchText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.accentLight },
  tickerSocial: { fontSize: 10, color: colors.textTertiary, marginTop: 2 },
  tickerSaveBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  tickerSaveIcon: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accent },
  tickerCommitted: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.voy, alignItems: 'center', justifyContent: 'center' },
  tickerCommittedText: { fontSize: 12, fontWeight: fontWeight.bold, color: colors.bgPrimary },
  // Event Flyer Card
  flyerCard: { borderRadius: radius.xl, overflow: 'hidden', position: 'relative', backgroundColor: colors.surface1 },
  flyerImg: { width: '100%', height: '100%', position: 'absolute' } as any,
  flyerInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[4], zIndex: 2, backgroundColor: 'rgba(6,6,14,0.8)' },
  flyerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: -0.3 },
  flyerMeta: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  flyerPrice: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accentSecondary, marginTop: spacing[2] },
  flyerBadge: { position: 'absolute', top: spacing[3], left: spacing[3], paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full },
  flyerBadgeLive: { backgroundColor: 'rgba(34,197,94,0.9)' },
  flyerBadgeToday: { backgroundColor: 'rgba(245,158,11,0.9)' },
  flyerBadgeText: { fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 1 },
  flyerSaveBtn: { position: 'absolute', top: spacing[3], right: spacing[3], width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  flyerSaveIcon: { fontSize: fontSize.base, color: colors.white, fontWeight: fontWeight.bold },
  matchScoreBadge: { position: 'absolute', top: spacing[3], right: spacing[3], backgroundColor: 'rgba(249,115,22,0.85)', paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  matchScoreText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white, letterSpacing: 0.5 },
  socialProof: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  // Featured + Sections
  featuredWrap: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  section: { marginTop: spacing[4] },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  secTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  secCount: { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.semibold },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[5], gap: spacing[3] },
  gridItem: { width: (SCREEN_WIDTH - spacing[5] * 2 - spacing[3]) / 2 },
  // Discover/Swiper
  swiperWrap: { height: CARD_H + 120, alignItems: 'center', justifyContent: 'center' },
  swiperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  swiperHeaderTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  swiperDropPill: { backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full },
  swiperDropText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accentLight },
  swiperCard: { position: 'absolute', width: SCREEN_WIDTH - spacing[5] * 2, height: CARD_H, borderRadius: radius.xl, overflow: 'hidden' },
  swiperCardImg: { width: '100%', height: '100%', position: 'absolute' } as any,
  swiperCardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[5], zIndex: 2, backgroundColor: 'rgba(6,6,14,0.8)' },
  swiperCardTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: -0.5 },
  swiperCardMeta: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  swiperCardPrice: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.accentSecondary, marginTop: spacing[2] },
  swiperMatchBadge: { backgroundColor: 'rgba(249,115,22,0.2)', paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full, marginTop: spacing[2], alignSelf: 'flex-start' },
  swiperMatchText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accentLight },
  swiperOverlay: { position: 'absolute', zIndex: 10, paddingHorizontal: spacing[6], paddingVertical: spacing[3], borderRadius: radius.lg, borderWidth: 3 },
  swiperOverlayVoy: { top: spacing[10], alignSelf: 'center', borderColor: colors.voy, backgroundColor: 'rgba(0,230,118,0.15)' },
  swiperOverlayVoyText: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.voy, letterSpacing: 3 },
  swiperOverlayInteresa: { right: spacing[5], top: '40%', borderColor: colors.interesa, backgroundColor: 'rgba(251,146,60,0.15)' } as any,
  swiperOverlayInteresaText: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.interesa, letterSpacing: 2 },
  swiperOverlaySkip: { left: spacing[5], top: '40%', borderColor: colors.error, backgroundColor: 'rgba(248,113,113,0.15)' } as any,
  swiperOverlaySkipText: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.error, letterSpacing: 2 },
  swiperActions: { position: 'absolute', bottom: 80, flexDirection: 'row', gap: spacing[6], alignItems: 'center' },
  swiperBtnSkip: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  swiperBtnSkipText: { fontSize: fontSize.xl, color: colors.error, fontWeight: fontWeight.bold },
  swiperBtnVoy: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.voy, alignItems: 'center', justifyContent: 'center', ...shadows.glowVoy },
  swiperBtnVoyText: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.bgPrimary },
  swiperBtnInteresa: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.interesa, alignItems: 'center', justifyContent: 'center' },
  swiperBtnInteresaText: { fontSize: fontSize.xl, color: colors.interesa, fontWeight: fontWeight.bold },
  swiperEmptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[5] },
  swiperEmptyTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: 'center' },
  swiperEmptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[2], textAlign: 'center' },
  // Detail Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(6,6,14,0.7)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: colors.bgPrimary, borderTopLeftRadius: radius['2xl'], borderTopRightRadius: radius['2xl'], maxHeight: SCREEN_HEIGHT * 0.88, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.surface3, alignSelf: 'center', marginVertical: spacing[3] },
  sheetClose: { position: 'absolute', top: spacing[3], right: spacing[4], width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  sheetCloseText: { fontSize: fontSize.base, color: colors.textPrimary },
  sheetImage: { width: '100%', height: 240 } as any,
  sheetContent: { padding: spacing[5] },
  sheetArtist: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  sheetTitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  sheetMatchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[3] },
  sheetMatchText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accentLight },
  sheetMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[4] },
  sheetMetaText: { fontSize: fontSize.sm, color: colors.textSecondary },
  sheetPrice: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.accentSecondary, marginTop: spacing[3] },
  sheetActions: { marginTop: spacing[6], gap: spacing[3] },
  sheetBtnVoy: { width: '100%', backgroundColor: colors.voy, borderRadius: radius.md, paddingVertical: spacing[4], alignItems: 'center', ...shadows.glowVoy } as any,
  sheetBtnVoyText: { color: colors.bgPrimary, fontSize: fontSize.base, fontWeight: fontWeight.extrabold },
  sheetBtnInteresa: { width: '100%', borderRadius: radius.md, paddingVertical: spacing[4], alignItems: 'center', borderWidth: 1.5, borderColor: colors.interesa } as any,
  sheetBtnInteresaText: { color: colors.interesa, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  sheetCommittedBadge: { width: '100%', backgroundColor: colors.voyBg, borderRadius: radius.md, paddingVertical: spacing[4], alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing[2] } as any,
  sheetCommittedText: { color: colors.voy, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  sheetTicketLink: { marginTop: spacing[3], alignItems: 'center' },
  sheetTicketText: { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.medium },
  sheetDismiss: { marginTop: spacing[6], alignItems: 'center', paddingVertical: spacing[3] },
  sheetDismissText: { fontSize: fontSize.sm, color: colors.textTertiary, fontWeight: fontWeight.medium },
  // Tab bar
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface1, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: spacing[5], paddingTop: spacing[2], alignItems: 'center' },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: spacing[2] },
  tabItemCenter: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: fontSize.base, color: colors.textTertiary, marginBottom: 2 },
  tabIconActive: { color: colors.accentLight },
  tabLabel: { fontSize: 10, color: colors.textTertiary, fontWeight: fontWeight.semibold },
  tabLabelActive: { color: colors.accentLight },
  tabIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: spacing[1] },
  forYouTab: { paddingHorizontal: spacing[6], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.accent },
  forYouTabActive: { backgroundColor: colors.accent, ...shadows.glow },
  forYouTabText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accent },
  forYouTabTextActive: { color: colors.white },
  tabBadge: { position: 'absolute', top: -2, right: SCREEN_WIDTH * 0.08, backgroundColor: colors.accent, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white },
  // Profile / My Set
  profileAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[4], ...shadows.glow },
  profileInitial: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.white },
  profileName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  profileSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  // Boarding Pass
  boardingPass: { flexDirection: 'row', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing[3], borderLeftWidth: 4, borderLeftColor: colors.voy },
  boardingPassLeft: { width: 72 },
  boardingThumb: { width: 72, height: 80 },
  boardingPassContent: { flex: 1, padding: spacing[3], justifyContent: 'center' },
  boardingArtist: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  boardingVenue: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  boardingFooter: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] },
  boardingDate: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.accentLight },
  boardingCountdown: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.accentSecondary },
  boardingPassRight: { width: 44, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: colors.border },
  boardingPassIcon: { fontSize: 20 },
  // VOY badge
  voyBadge: { backgroundColor: colors.voyBg, paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full },
  voyBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.voy },
  // Saved rows
  savedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[3], marginTop: spacing[3], gap: spacing[3] },
  savedThumb: { width: 52, height: 52, borderRadius: radius.md },
  savedTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  savedMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  savedCountdown: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.accentLight },
  // Empty set
  emptySetTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textSecondary },
  emptySetSub: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing[2] },
  // Toast
  toast: { position: 'absolute', top: 60, left: spacing[5], right: spacing[5], backgroundColor: colors.accent, borderRadius: radius.lg, paddingVertical: spacing[3], paddingHorizontal: spacing[5], alignItems: 'center', zIndex: 999, ...shadows.glow },
  toastText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});

// ── Narrative Scroll styles ───────────────────────────────
const ns = StyleSheet.create({
  // Context header
  contextWrap: { paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[2] },
  contextText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, letterSpacing: 0.5 },

  // Hero
  heroWrap: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },

  // NarrativeCard
  card: { borderRadius: radius.xl, overflow: 'hidden', position: 'relative', backgroundColor: colors.surface1 },
  cardImg: { width: '100%', height: '100%', position: 'absolute' } as any,
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[4], zIndex: 2, backgroundColor: 'rgba(6,6,14,0.75)' },
  cardInfoHero: { padding: spacing[5], backgroundColor: 'rgba(6,6,14,0.8)' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.white, letterSpacing: -0.3 },
  cardTitleHero: { fontSize: fontSize['2xl'], letterSpacing: -0.5 },
  cardMeta: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  cardPrice: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.accentSecondary, marginTop: spacing[2] },
  signalBadge: { position: 'absolute', top: spacing[3], left: spacing[3], paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: radius.full, zIndex: 5 },
  signalText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.white, letterSpacing: 0.5 },
  cardActions: { position: 'absolute', top: spacing[3], right: spacing[3], flexDirection: 'row', gap: spacing[2], zIndex: 5 },
  cardActionBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  cardActionIcon: { fontSize: fontSize.xs, color: colors.white, fontWeight: fontWeight.bold },

  // Section
  sectionWrap: { marginTop: spacing[5], paddingBottom: spacing[2] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  narrativeItem: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },

  // LiveStrip
  liveWrap: { paddingVertical: spacing[3], marginBottom: spacing[2] },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, position: 'absolute', top: spacing[3] + 5, left: spacing[5], zIndex: 2 },
  liveLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: colors.success, letterSpacing: 1.5, paddingLeft: spacing[5] + 14, marginBottom: spacing[3] },
  liveScroll: { paddingHorizontal: spacing[5], gap: spacing[3] },
  liveCard: { width: SCREEN_WIDTH * 0.55, flexDirection: 'row', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)', overflow: 'hidden' },
  liveImg: { width: 64, height: 72 } as any,
  liveInfo: { flex: 1, padding: spacing[3], justifyContent: 'center' },
  liveTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  liveMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Finite footer
  finiteFooter: { alignItems: 'center', paddingVertical: spacing[10], paddingBottom: 120 },
  finiteEmoji: { fontSize: 24, color: colors.textTertiary, marginBottom: spacing[2] },
  finiteTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  finiteSub: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing[1] },

  // En tu radar
  radarSection: { paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[4] },
  radarTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] },
  radarSubtitle: { fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: spacing[4] },
  radarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  radarThumb: { width: 48, height: 48, borderRadius: radius.md } as any,
  radarEventTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  radarEventMeta: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  radarReason: { fontSize: 10, color: colors.accentLight, marginTop: 2, fontWeight: fontWeight.medium },

  // My Set
  mySetTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.5 },
  mySetSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },

  // Month groups
  monthGroup: { marginTop: spacing[5] },
  monthLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: colors.textTertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing[3] },

  // Timeline rows
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[3], marginBottom: spacing[2] },
  timelineRowCommitted: { borderLeftWidth: 3, borderLeftColor: colors.voy },
  timelineDateCol: { width: 36, alignItems: 'center' },
  timelineDay: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  timelineMonth: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.textTertiary, textTransform: 'uppercase' },
  timelineLine: { width: 12, alignItems: 'center' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  timelineContent: { flex: 1 },
  timelineTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  timelineVenue: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  timelineCountdown: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.accentLight, marginTop: 2 },
  timelineThumb: { width: 44, height: 44, borderRadius: radius.md } as any,
  voyTag: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.voy, backgroundColor: colors.voyBg, paddingHorizontal: spacing[2], paddingVertical: 1, borderRadius: radius.sm, letterSpacing: 1 },
});

// ── Narrative Onboarding styles ──────────────────────────
const ob = StyleSheet.create({
  backBtn: { position: 'absolute', top: spacing[2], left: spacing[4], zIndex: 10, padding: spacing[2] },
  backText: { fontSize: fontSize['2xl'], color: colors.textSecondary },

  // Centered steps (name, city, vibes, frequency, swipe)
  centeredStep: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing[6] },
  stepTitle: { fontSize: fontSize['4xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -1, lineHeight: fontSize['4xl'] * 1.15, marginBottom: spacing[3] },
  stepSubtitle: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing[6], lineHeight: fontSize.base * 1.5 },

  // Name input
  nameInput: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.textPrimary, borderBottomWidth: 2, borderBottomColor: colors.accent, paddingVertical: spacing[3], marginBottom: spacing[2] },
  charCount: { fontSize: fontSize.xs, color: colors.textTertiary, textAlign: 'right' },

  // Welcome breather (step 2)
  welcomeStep: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[8] },
  welcomeEmoji: { fontSize: 56, marginBottom: spacing[5] },
  welcomeTitle: { fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5, marginBottom: spacing[3] },
  welcomeSubtitle: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', lineHeight: fontSize.base * 1.6 },
  skipLink: { fontSize: fontSize.sm, color: colors.textTertiary, textDecorationLine: 'underline', marginTop: spacing[6] },

  // Tip box
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing[4], marginTop: spacing[5], gap: spacing[3] },
  tipEmoji: { fontSize: fontSize.lg },
  tipText: { flex: 1, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: fontSize.xs * 1.6 },

  // Frequency cards (step 4)
  freqCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: spacing[4], marginBottom: spacing[3], gap: spacing[4] },
  freqCardActive: { borderColor: colors.accent, backgroundColor: 'rgba(249, 115, 22, 0.08)' },
  freqEmoji: { fontSize: fontSize['2xl'] },
  freqLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  freqLabelActive: { color: colors.accent },
  freqDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Loading step (step 6)
  loadingStep: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[8] },
  loadingTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing[2] },
  loadingSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing[6] },
  loadingBar: { width: '80%', height: 4, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden', marginBottom: spacing[8] },
  loadingBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 } as any,
  loadingStats: { flexDirection: 'row', justifyContent: 'center', gap: spacing[8], marginBottom: spacing[8] },
  loadingStat: { alignItems: 'center' },
  loadingStatNum: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors.accent },
  loadingStatLabel: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },

  // Social proof
  socialProofCard: { backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[5], marginTop: spacing[4], width: '100%' },
  socialProofQuote: { fontSize: fontSize.sm, color: colors.textSecondary, fontStyle: 'italic', lineHeight: fontSize.sm * 1.6, marginBottom: spacing[2] },
  socialProofAuthor: { fontSize: fontSize.xs, color: colors.textTertiary, fontWeight: fontWeight.medium },

  // AHA step (step 7)
  ahaStep: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing[6] },
  ahaEmoji: { fontSize: 48, marginBottom: spacing[4] },
  ahaTitle: { fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing[2] },
  ahaSub: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: fontSize.base * 1.5, marginBottom: spacing[5] },
  ahaEvents: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[6] },

  // Notification toggles in AHA
  ahaNotifs: { marginBottom: spacing[4] },
  ahaNotifsTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[3] },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[4], marginBottom: spacing[2] },
  notifRowActive: { borderColor: colors.accent, backgroundColor: 'rgba(249, 115, 22, 0.06)' },
  notifName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  notifDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  notifToggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: colors.surface3, justifyContent: 'center', paddingHorizontal: 3 },
  notifToggleActive: { backgroundColor: colors.accent, alignItems: 'flex-end' },
  notifToggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
});
