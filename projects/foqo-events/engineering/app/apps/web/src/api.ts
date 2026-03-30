const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error?.message || error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Stats
  getStats: () => request<any>('/stats'),

  // Events
  getEvents: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/events${qs}`);
  },
  getEvent: (id: string) => request<any>(`/events/${id}`),
  createEvent: (data: any) => request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => request<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => request<any>(`/events/${id}`, { method: 'DELETE' }),

  // Artists
  getArtists: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/artists${qs}`);
  },
  getArtist: (id: string) => request<any>(`/artists/${id}`),
  createArtist: (data: any) => request<any>('/artists', { method: 'POST', body: JSON.stringify(data) }),

  // Venues
  getVenues: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/venues${qs}`);
  },
  createVenue: (data: any) => request<any>('/venues', { method: 'POST', body: JSON.stringify(data) }),

  // Genres
  getGenres: () => request<any>('/genres'),
};
