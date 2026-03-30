'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import styles from './GlobalSearch.module.css';

interface SearchResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
}

export function GlobalSearch() {
  const { isSearchOpen, setIsSearchOpen } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Handle global Escape / S key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if (e.key === 's' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSearchOpen, setIsSearchOpen]);

  // Debounced search against catalog
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        // Search catalog by keyword across genres
        const res = await fetch('/api/catalog/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            genres: [], // empty = search all
            moodKeywords: query.split(' '),
            limit: 20,
          }),
        });

        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        const tracks: SearchResult[] = (data.tracks || []).map((t: Record<string, string>) => ({
          id: t.track_id,
          name: t.name,
          artist: t.artist,
          album: t.album || '',
          albumArt: t.album_art_url || '',
        }));

        setResults(tracks);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsSearchOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Busca en tu catálogo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.closeBtn} onClick={() => setIsSearchOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <main className={styles.results}>
          {isSearching && (
            <div className={styles.status}>Buscando...</div>
          )}
          {!isSearching && results.length === 0 && query.trim() !== '' && (
            <div className={styles.status}>Sin resultados para &quot;{query}&quot;</div>
          )}
          {!isSearching && results.length === 0 && query.trim() === '' && (
            <div className={styles.status}>Escribe el nombre de un tema o artista</div>
          )}

          <div className={styles.list}>
            {results.map((track) => (
              <div key={track.id} className={styles.trackItem}>
                {track.albumArt && <img src={track.albumArt} alt={track.album} className={styles.art} />}
                <div className={styles.text}>
                  <span className={styles.name}>{track.name}</span>
                  <span className={styles.artist}>{track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className={styles.footer}>
          <span>Presiona <kbd>ESC</kbd> para cerrar</span>
        </footer>
      </div>
    </div>
  );
}
