import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

type Page = 'dashboard' | 'events' | 'artists' | 'venues' | 'genres' | 'scraping';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalArtists: number;
  totalVenues: number;
  eventsThisWeek: number;
  notificationsSentToday: number;
  scrapingSourcesActive: number;
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'events' && <EventsPage />}
        {page === 'artists' && <ArtistsPage />}
        {page === 'venues' && <VenuesPage />}
        {page === 'genres' && <GenresPage />}
        {page === 'scraping' && <ScrapingPage />}
      </main>
    </div>
  );
}

// ---- Sidebar ----
function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const links: { key: Page; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'events', icon: '🎵', label: 'Eventos' },
    { key: 'artists', icon: '🎤', label: 'Artistas' },
    { key: 'venues', icon: '🏟️', label: 'Venues' },
    { key: 'genres', icon: '🎸', label: 'Géneros' },
    { key: 'scraping', icon: '🤖', label: 'Scraping' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="text-gradient">Riff</span>
      </div>
      <div className="sidebar-subtitle">Admin Panel</div>
      <nav className="sidebar-nav">
        {links.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`sidebar-link ${page === key ? 'active' : ''}`}
            onClick={() => setPage(key)}
          >
            <span className="sidebar-link-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        Riff v0.1.0 · Foqo Events
      </div>
    </aside>
  );
}

// ---- Dashboard ----
function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats()
      .then(res => setStats(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Panel de control de Riff</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-title">No se pudo conectar con la API</p>
          <p className="empty-state-text">
            Asegúrate de que el servidor esté corriendo en <code>localhost:3001</code>
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    { icon: '🎵', value: stats?.totalEvents || 0, label: 'Eventos totales' },
    { icon: '🎤', value: stats?.totalArtists || 0, label: 'Artistas' },
    { icon: '🏟️', value: stats?.totalVenues || 0, label: 'Venues' },
    { icon: '👥', value: stats?.totalUsers || 0, label: 'Usuarios' },
    { icon: '📅', value: stats?.eventsThisWeek || 0, label: 'Eventos esta semana' },
    { icon: '🔔', value: stats?.notificationsSentToday || 0, label: 'Notificaciones hoy' },
    { icon: '🤖', value: stats?.scrapingSourcesActive || 0, label: 'Fuentes activas' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Panel de control de Riff · Conciertos Chile</p>
        </div>
      </div>
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{card.value.toLocaleString()}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Events Page ----
function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents({ perPage: '50', sortBy: 'date' })
      .then(res => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return '—';
    if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    return `$${(min || max)?.toLocaleString()}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">{events.length} eventos en el sistema</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <p className="empty-state-title">No hay eventos aún</p>
          <p className="empty-state-text">Ejecuta el seed o el scraper para cargar datos</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((e: any) => (
            <div key={e.id} className="event-card">
              <div className="event-card-image">
                {e.imageUrl ? (
                  <img src={e.imageUrl} alt={e.title} />
                ) : (
                  <div className="event-card-image-placeholder">🎵</div>
                )}
                <div className="event-card-badge">
                  <span className={`badge badge-${e.status}`}>{e.status}</span>
                </div>
              </div>
              <div className="event-card-body">
                <h3 className="event-card-title">{e.title}</h3>
                <div className="event-card-meta">
                  <div className="event-card-meta-row">
                    🎤 <span>{e.artist?.name || 'Varios Artistas'}</span>
                  </div>
                  <div className="event-card-meta-row">
                    🏟️ <span>{e.venue?.name || 'Por definir'}</span>
                  </div>
                  <div className="event-card-meta-row">
                    📅 <span className="date">{formatDate(e.date)}</span>
                  </div>
                </div>
                <div className="event-card-footer">
                  <span className="event-card-price">{formatPrice(e.priceMin, e.priceMax)}</span>
                  {e.ticketUrl && (
                    <a href={e.ticketUrl} target="_blank" rel="noopener noreferrer" className="event-card-ticket">
                      Ver Ticket →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Artists Page ----
function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchArtists = useCallback(() => {
    const params: Record<string, string> = { perPage: '50' };
    if (search) params.q = search;
    api.getArtists(params)
      .then(res => setArtists(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Artistas</h1>
          <p className="page-subtitle">{artists.length} artistas registrados</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="input"
          placeholder="Buscar artistas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Local</th>
                <th>Popularidad</th>
                <th>Géneros</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.country || '—'}</td>
                  <td>{a.isLocal ? '🇨🇱 Sí' : 'No'}</td>
                  <td>
                    <div className="popularity-bar">
                      <div className="popularity-track">
                        <div className="popularity-fill" style={{ width: `${a.popularity || 0}%` }} />
                      </div>
                      <span className="popularity-value">{a.popularity || 0}</span>
                    </div>
                  </td>
                  <td>
                    {(a.genres || []).map((g: string) => (
                      <span key={g} className="badge badge-genre">{g}</span>
                    ))}
                    {(!a.genres || a.genres.length === 0) && <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Venues Page ----
function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVenues({ perPage: '50' })
      .then(res => setVenues(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Venues</h1>
          <p className="page-subtitle">{venues.length} recintos registrados</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Capacidad</th>
                <th>Instagram</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.city}</td>
                  <td>{v.capacity ? v.capacity.toLocaleString() : '—'}</td>
                  <td>
                    {v.instagramHandle ? (
                      <a href={`https://instagram.com/${v.instagramHandle}`}
                         target="_blank" rel="noopener">
                        @{v.instagramHandle}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Genres Page ----
function GenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGenres()
      .then(res => setGenres(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Géneros</h1>
          <p className="page-subtitle">{genres.length} géneros disponibles</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="genres-grid">
          {genres.map((g: any) => (
            <div key={g.id} className="genre-card">
              <div className="genre-name">{g.name}</div>
              <div className="genre-slug">{g.slug}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Scraping Page ----
function ScrapingPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Scraping</h1>
          <p className="page-subtitle">Fuentes de datos y logs de scraping</p>
        </div>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">🤖</div>
        <p className="empty-state-title">El módulo de scraping estará disponible pronto</p>
        <p className="empty-state-text">Incluirá scraping de Puntoticket, Instagram y más</p>
      </div>
    </div>
  );
}
