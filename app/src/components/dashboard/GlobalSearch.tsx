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
  uri: string;
}

export function GlobalSearch() {
  const { isSearchOpen, setIsSearchOpen, playTrackUri } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
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

  // Handle global Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      if (e.key === 's' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchOpen, setIsSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spotify/search?type=track&q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        
        const tracks: SearchResult[] = (data.tracks?.items || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          artist: t.artists[0]?.name || 'Unknown',
          album: t.album.name,
          albumArt: t.album.images?.[0]?.url || '',
          uri: t.uri
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

  const handlePlay = async (track: SearchResult) => {
    if (playingTrackId) return;
    setPlayingTrackId(track.id);
    try {
      await playTrackUri(track.uri);
      // Wait a bit to ensure UI reflects change or just close
      setTimeout(() => {
        setIsSearchOpen(false);
        setPlayingTrackId(null);
      }, 500);
    } catch (err) {
      console.error('Failed to play searched track:', err);
      setPlayingTrackId(null);
    }
  };

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
            placeholder="Busca una canción para sonar ahora..."
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
            <div className={styles.status}>Sin resultados para "{query}"</div>
          )}
          {!isSearching && results.length === 0 && query.trim() === '' && (
            <div className={styles.status}>Escribe el nombre de un tema o artista</div>
          )}

          <div className={styles.list}>
            {results.map((track) => (
              <button key={track.id} className={styles.trackItem} onClick={() => handlePlay(track)}>
                <img src={track.albumArt} alt={track.album} className={styles.art} />
                <div className={styles.text}>
                  <span className={styles.name}>{track.name}</span>
                  <span className={styles.artist}>{track.artist}</span>
                </div>
                <div className={`${styles.playIcon} ${playingTrackId === track.id ? styles.playIconActive : ''}`}>
                  {playingTrackId === track.id ? (
                    <span className={styles.miniSpinner} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
              </button>
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
