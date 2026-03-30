// ============================================
// Riff — Shared Types
// Tipos compartidos entre API, Web y Mobile
// ============================================

// ---- Riff User Profile (linked to Supabase auth.users) ----
export interface RiffProfile {
  id: string; // Same as auth.users.id
  displayName: string | null;
  avatarUrl: string | null;
  city: string | null;
  notifyPush: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  // From auth.users (joined)
  email?: string;
}

export interface UpdateRiffProfileInput {
  displayName?: string;
  avatarUrl?: string;
  city?: string;
  notifyPush?: boolean;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
  phone?: string;
}

// ---- Artists ----
export interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  popularity: number | null;
  country: string | null;
  isLocal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtistInput {
  name: string;
  imageUrl?: string;
  genres?: string[];
  popularity?: number;
  country?: string;
  isLocal?: boolean;
}

// ---- Venues ----
export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string | null;
  capacity: number | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  instagramHandle: string | null;
  createdAt: string;
}

export interface CreateVenueInput {
  name: string;
  city: string;
  address?: string;
  capacity?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  instagramHandle?: string;
}

// ---- Events ----
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled' | 'sold_out' | 'past';

export interface Event {
  id: string;
  title: string;
  artistId: string;
  venueId: string;
  date: string;
  doorsOpen: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  ticketUrl: string | null;
  imageUrl: string | null;
  description: string | null;
  status: EventStatus;
  source: string;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  artist?: Artist;
  venue?: Venue;
}

export interface CreateEventInput {
  title: string;
  artistId: string;
  venueId: string;
  date: string;
  doorsOpen?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  ticketUrl?: string;
  imageUrl?: string;
  description?: string;
  status?: EventStatus;
  source: string;
  sourceUrl?: string;
}

// ---- Genres ----
export interface Genre {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

// ---- User Preferences ----
export interface UserArtistFollow {
  userId: string;
  artistId: string;
  createdAt: string;
}

export interface UserGenrePreference {
  userId: string;
  genreId: string;
  createdAt: string;
}

// ---- Notifications ----
export type NotificationChannel = 'push' | 'email' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'opened';

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt: string | null;
  openedAt: string | null;
  createdAt: string;
}

// ---- Scraping ----
export type ScrapingSourceType = 'puntoticket' | 'ticketmaster' | 'instagram' | 'facebook' | 'website';

export interface ScrapingSource {
  id: string;
  name: string;
  type: ScrapingSourceType;
  url: string;
  isActive: boolean;
  lastScrapedAt: string | null;
  scrapeIntervalMinutes: number;
}

export interface ScrapingLog {
  id: string;
  sourceId: string;
  status: 'success' | 'error' | 'partial';
  eventsFound: number;
  eventsNew: number;
  errorMessage: string | null;
  durationMs: number;
  createdAt: string;
}

// ---- API Responses ----
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ---- Auth ----
// ---- Event Feed Filters ----
export interface EventFeedFilters {
  city?: string;
  genreId?: string;
  artistId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: EventStatus;
  page?: number;
  perPage?: number;
  sortBy?: 'date' | 'popularity' | 'recent';
}

// ---- Dashboard Stats (Admin) ----
export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalArtists: number;
  totalVenues: number;
  eventsThisWeek: number;
  notificationsSentToday: number;
  scrapingSourcesActive: number;
  lastScrapingRun: string | null;
}
