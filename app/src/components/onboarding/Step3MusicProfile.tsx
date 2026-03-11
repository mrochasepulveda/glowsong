'use client';

import { useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import { GENRES_CATALOG, GENRE_DISPLAY_NAMES, type Genre } from '@/types';
import styles from './Step.module.css';
import genreStyles from './Step3MusicProfile.module.css';

interface Step3Props {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev?: () => void;
  isSaving?: boolean;
}

export function Step3MusicProfile({ data, onChange, onNext, onPrev, isSaving = false }: Step3Props) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleGenre = (genre: Genre) => {
    setError('');
    const current = data.genres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    onChange({ genres: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.genres.length === 0) {
      setError('Selecciona al menos 1 género');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);
    onNext();
  };

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.title}>Tu identidad musical</h1>
        <p className={styles.subtitle}>
          ¿Qué géneros definen el ambiente de tu local? El sistema ajustará la energía según la hora.
        </p>
        <div className={genreStyles.valuePropBox}>
          💡 <strong>La música ayuda a que los clientes se sientan cómodos y les guste más el bar.</strong> De hecho, más del 80% de los clientes que ingresan alguna queja hablan de la música.
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Contador */}
        <div className={genreStyles.counterRow}>
          <span className={genreStyles.counter}>
            {data.genres.length === 0
              ? 'Ningún género seleccionado'
              : `${data.genres.length} género${data.genres.length > 1 ? 's' : ''} seleccionado${data.genres.length > 1 ? 's' : ''}`}
          </span>
          {data.genres.length > 0 && (
            <button
              type="button"
              className={genreStyles.clearBtn}
              onClick={() => onChange({ genres: [] })}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Genre chips */}
        <div className={genreStyles.chipsGrid} role="group" aria-label="Selecciona géneros musicales">
          {GENRES_CATALOG.map((genre) => {
            const selected = data.genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                role="checkbox"
                aria-checked={selected}
                className={`${genreStyles.chip} ${selected ? genreStyles.chipSelected : ''}`}
                onClick={() => toggleGenre(genre)}
              >
                {GENRE_DISPLAY_NAMES[genre]}
              </button>
            );
          })}
        </div>

        {error && <span className={styles.errorMsg}>{error}</span>}

        <div className={styles.buttonRow}>
          {onPrev && (
            <button type="button" className={styles.secondaryBtn} onClick={onPrev} disabled={isLoading || isSaving}>
              ← Atrás
            </button>
          )}
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isLoading || data.genres.length === 0 || isSaving}
          >
            {isSaving ? 'Guardando...' : isLoading ? <span className={styles.btnSpinner} /> : 'Continuar →'}
          </button>
        </div>
      </form>
    </div>
  );
}
