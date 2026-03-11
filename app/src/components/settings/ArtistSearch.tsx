'use client';

import { useState, useEffect, useRef } from 'react';
import { SeedArtist } from '@/types';
import styles from './ArtistSearch.module.css';

interface ArtistSearchProps {
  selectedArtists: SeedArtist[];
  onChange: (artists: SeedArtist[]) => void;
  maxArtists?: number;
}

export function ArtistSearch({ selectedArtists, onChange, maxArtists = 5 }: ArtistSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SeedArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spotify/search?type=artist&q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Error buscando artistas');
        const data = await res.json();
        
        // Transform incoming Spotify data to our SeedArtist type
        const fetchedArtists: SeedArtist[] = (data.artists?.items || []).slice(0, 5).map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          image_url: artist.images?.[0]?.url || 'https://via.placeholder.com/64?text=?',
        }));

        setResults(fetchedArtists);
      } catch (error) {
        console.error('Failed to fetch artists:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (artist: SeedArtist) => {
    if (selectedArtists.length >= maxArtists) return;
    if (selectedArtists.find((a) => a.id === artist.id)) return;
    
    onChange([...selectedArtists, artist]);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(selectedArtists.filter((a) => a.id !== id));
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>Artistas Base (Máx {maxArtists})</label>
      <p className={styles.helper}>Busca artistas para afinar el algoritmo (opcional pero muy recomendado).</p>
      
      <div className={styles.inputWrapper}>
        <div className={styles.searchIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="11" cy="11" r="8"></circle>
             <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="Busca un artista (ej. Coldplay, Bad Bunny)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={selectedArtists.length >= maxArtists}
        />
        
        {isSearching && (
          <div className={styles.spinnerWrapper}>
            <span className={styles.spinner} />
          </div>
        )}

        {isOpen && results.length > 0 && (
          <ul className={styles.dropdown}>
            {results.map((artist) => (
              <li key={artist.id} className={styles.dropdownItem} onClick={() => handleSelect(artist)}>
                <img src={artist.image_url} alt={artist.name} className={styles.artistThumb} />
                <span className={styles.artistName}>{artist.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.selectedGrid}>
        {selectedArtists.map((artist) => (
          <div key={artist.id} className={styles.artistChip}>
            <img src={artist.image_url} alt={artist.name} className={styles.artistChipImg} />
            <span className={styles.artistChipName}>{artist.name}</span>
            <button
              type="button"
              className={styles.artistChipRemove}
              onClick={() => handleRemove(artist.id)}
              aria-label={`Eliminar ${artist.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
