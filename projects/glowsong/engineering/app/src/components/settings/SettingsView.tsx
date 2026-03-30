'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useLocal } from '@/hooks/useLocal';
import { GENRES_CATALOG, GENRE_DISPLAY_NAMES, type Genre, type LocalType, type SeedArtist, type WeeklyDayStatus, type WeeklySlotOverride } from '@/types';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import { ArtistSearch } from './ArtistSearch';
import { WeeklyPlanner } from './WeeklyPlanner';
import { generateSmartDefaults } from '@/lib/algorithm/weeklyResolver';
import styles from './SettingsView.module.css';

const LOCAL_TYPES: { value: LocalType; label: string; emoji: string }[] = [
  { value: 'bar',         label: 'Bar',         emoji: '🍺' },
  { value: 'pub',         label: 'Pub',         emoji: '🏠' },
  { value: 'cocteleria',  label: 'Coctelería',  emoji: '🍸' },
  { value: 'cerveceria',  label: 'Cervecería',  emoji: '🍻' },
  { value: 'restaurante', label: 'Restaurante', emoji: '🍽️' },
  { value: 'discoteca',   label: 'Discoteca',   emoji: '🎉' },
  { value: 'otro',        label: 'Otro',        emoji: '✨' },
];

interface FormData {
  localName: string;
  localType: LocalType | '';
  neighborhood: string;
  openTime: string;
  closeTime: string;
  genres: Genre[];
  seedArtists: SeedArtist[];
}

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export function SettingsView() {
  const { local, musicProfile, loading, updateLocal, updateMusicProfile } = useLocal();

  const [formData, setFormData] = useState<FormData>({
    localName: '', localType: '', neighborhood: '', openTime: '12:00', closeTime: '02:00', genres: [], seedArtists: []
  });
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dayStatuses, setDayStatuses] = useState<WeeklyDayStatus[]>([]);
  const [slotOverrides, setSlotOverrides] = useState<WeeklySlotOverride[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // Populate form when data loads
  useEffect(() => {
    if (local && musicProfile) {
      const data: FormData = {
        localName: local.name,
        localType: local.type,
        neighborhood: local.address || '',
        openTime: local.open_time || '12:00',
        closeTime: local.close_time || '02:00',
        genres: (musicProfile.genres || []) as Genre[],
        seedArtists: musicProfile.seed_artists || [],
      };
      setFormData(data);
      setInitialData(data);

      // Auto-generate smart weekly plan based on local type, genres & hours
      const genres = (musicProfile.genres || []) as Genre[];
      if (genres.length > 0 && local.type) {
        const { dayStatuses: ds, slotOverrides: so } = generateSmartDefaults(
          local.id,
          local.type,
          genres,
          local.open_time || '12:00',
          local.close_time || '02:00'
        );
        setDayStatuses(ds);
        setSlotOverrides(so);
      }
    }
  }, [local, musicProfile]);

  // Dirty checking
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      formData.localName !== initialData.localName ||
      formData.localType !== initialData.localType ||
      formData.neighborhood !== initialData.neighborhood ||
      formData.openTime !== initialData.openTime ||
      formData.closeTime !== initialData.closeTime ||
      JSON.stringify([...formData.genres].sort()) !== JSON.stringify([...initialData.genres].sort()) ||
      JSON.stringify(formData.seedArtists) !== JSON.stringify(initialData.seedArtists)
    );
  }, [formData, initialData]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.localName.trim()) e.localName = 'El nombre del local es requerido';
    if (!formData.localType) e.localType = 'Selecciona el tipo de local';
    if (!formData.neighborhood.trim()) e.neighborhood = 'El barrio o comuna es requerido';
    if (formData.genres.length === 0 && formData.seedArtists.length === 0) e.genres = 'Selecciona al menos 1 género o 1 artista base';
    return e;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      // 1. Update local info
      try {
        await updateLocal({
          name: formData.localName,
          type: formData.localType as LocalType,
          address: formData.neighborhood,
          open_time: formData.openTime,
          close_time: formData.closeTime,
        });
      } catch (localErr: any) {
        console.error('[Settings] Error updating local:', localErr);
        showToast(`Error en datos del local: ${localErr?.message || localErr}`, 'error');
        setIsSaving(false);
        return;
      }

      // 2. Update music profile
      try {
        await updateMusicProfile({
          genres: formData.genres,
          seed_artists: formData.seedArtists,
        });
      } catch (profileErr: any) {
        console.error('[Settings] Error updating music profile:', profileErr);
        showToast(`Error en perfil musical: ${profileErr?.message || profileErr}`, 'error');
        setIsSaving(false);
        return;
      }

      setInitialData({ ...formData });
      showToast('Cambios guardados exitosamente', 'success');
    } catch (err: any) {
      console.error('[Settings] Unexpected save error:', err);
      showToast(`Error al guardar: ${err?.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGenre = (genre: Genre) => {
    setErrors((prev) => ({ ...prev, genres: '' }));
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  // Loading state
  if (!mounted || loading) {
    return (
      <main className={styles.main}>
        <div className={styles.formArea}>
          <div className={styles.formContainer}>
             <div className={`skeleton ${styles.skeletonTitle}`} />
             <div className={`skeleton ${styles.skeletonSubtitle}`} />
          </div>
        </div>
      </main>
    );
  }

  // Redirect if no local
  if (!local) {
    if (typeof window !== 'undefined') window.location.href = '/onboarding';
    return null;
  }

  return (
    <>
      <div className={styles.ambientGlowPrimary} />
      <div className={styles.ambientGlowSecondary} />

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Link href="/dashboard" className={styles.backLink}>
              <div className={styles.backIconWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </div>
              <span className={styles.backText}>Volver al Dashboard</span>
            </Link>
          </div>
          <div className={styles.topBarRight}>
             {/* Optional: User profile or extra tools can go here */}
          </div>
        </div>

        <div className={styles.formArea}>
          <div className={styles.formContainer}>
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Configuración</h1>
              <p className={styles.pageSubtitle}>
                Personaliza la identidad visual y musical de tu local para crear la atmósfera perfecta.
              </p>
            </header>

            <form onSubmit={handleSave} noValidate className={styles.formGrid}>
              
              {/* ── Card 1: Perfil Básica ── */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  <div className={styles.cardHeaderText}>
                    <h2 className={styles.cardTitle}>Información General</h2>
                    <p className={styles.cardDescription}>Los datos básicos de tu negocio</p>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.fieldGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="localName">Nombre del local</label>
                      <input
                        id="localName"
                        type="text"
                        className={`${styles.input} ${errors.localName ? styles.inputError : ''}`}
                        placeholder="Ej: Bar El Refugio"
                        value={formData.localName}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, localName: e.target.value }));
                          setErrors((prev) => ({ ...prev, localName: '' }));
                        }}
                      />
                      {errors.localName && <span className={styles.errorMsg}>{errors.localName}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="neighborhood">Barrio o comuna</label>
                      <input
                        id="neighborhood"
                        type="text"
                        className={`${styles.input} ${errors.neighborhood ? styles.inputError : ''}`}
                        placeholder="Ej: Providencia, Santiago"
                        value={formData.neighborhood}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, neighborhood: e.target.value }));
                          setErrors((prev) => ({ ...prev, neighborhood: '' }));
                        }}
                      />
                      {errors.neighborhood && <span className={styles.errorMsg}>{errors.neighborhood}</span>}
                    </div>
                  </div>

                  <div className={styles.fieldGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="openTime">Hora de apertura</label>
                      <input
                        id="openTime"
                        type="time"
                        className={styles.input}
                        value={formData.openTime}
                        onChange={(e) => {
                          const newOpenTime = e.target.value;
                          setFormData((prev) => ({ ...prev, openTime: newOpenTime }));
                          // Regenerar plan semanal con nuevos horarios
                          if (local && formData.genres.length > 0 && formData.localType) {
                            const { dayStatuses: ds, slotOverrides: so } = generateSmartDefaults(
                              local.id, formData.localType as LocalType, formData.genres, newOpenTime, formData.closeTime
                            );
                            setDayStatuses(ds);
                            setSlotOverrides(so);
                          }
                        }}
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="closeTime">Hora de cierre</label>
                      <input
                        id="closeTime"
                        type="time"
                        className={styles.input}
                        value={formData.closeTime}
                        onChange={(e) => {
                          const newCloseTime = e.target.value;
                          setFormData((prev) => ({ ...prev, closeTime: newCloseTime }));
                          // Regenerar plan semanal con nuevos horarios
                          if (local && formData.genres.length > 0 && formData.localType) {
                            const { dayStatuses: ds, slotOverrides: so } = generateSmartDefaults(
                              local.id, formData.localType as LocalType, formData.genres, formData.openTime, newCloseTime
                            );
                            setDayStatuses(ds);
                            setSlotOverrides(so);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card 2: Tipo de Ambiente ── */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                  </div>
                  <div className={styles.cardHeaderText}>
                    <h2 className={styles.cardTitle}>Tipo de Ambiente</h2>
                    <p className={styles.cardDescription}>Selecciona la categoría que mejor define tu espacio</p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                   <div className={`${styles.typeGrid} ${errors.localType ? styles.typeGridError : ''}`}>
                    {LOCAL_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        className={`${styles.typeBtn} ${formData.localType === t.value ? styles.typeBtnActive : ''}`}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, localType: t.value }));
                          setErrors((prev) => ({ ...prev, localType: '' }));
                          // Regenerar plan semanal con nuevo tipo de local
                          if (local && formData.genres.length > 0) {
                            const { dayStatuses: ds, slotOverrides: so } = generateSmartDefaults(
                              local.id, t.value, formData.genres, formData.openTime, formData.closeTime
                            );
                            setDayStatuses(ds);
                            setSlotOverrides(so);
                          }
                        }}
                      >
                        <span className={styles.typeEmoji}>{t.emoji}</span>
                        <span className={styles.typeLabel}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.localType && <span className={styles.errorMsg} style={{marginTop: '12px', display: 'block'}}>{errors.localType}</span>}
                </div>
              </div>

              {/* ── Card 3: Identidad musical ── */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  </div>
                  <div className={styles.cardHeaderText}>
                    <h2 className={styles.cardTitle}>Identidad Musical</h2>
                    <p className={styles.cardDescription}>Establece los géneros y artistas base que sonarán en tu local</p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.counterRow}>
                    <span className={styles.counter}>
                      {formData.genres.length === 0
                        ? 'Ningún género seleccionado'
                        : `${formData.genres.length} género${formData.genres.length > 1 ? 's' : ''} seleccionado${formData.genres.length > 1 ? 's' : ''}`}
                    </span>
                    {formData.genres.length > 0 && (
                      <button
                        type="button"
                        className={styles.clearBtn}
                        onClick={() => setFormData((prev) => ({ ...prev, genres: [] }))}
                      >
                        Desmarcar todos
                      </button>
                    )}
                  </div>

                  <div className={styles.chipsGrid} role="group" aria-label="Selecciona géneros musicales">
                    {GENRES_CATALOG.map((genre) => {
                      const selected = formData.genres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          role="checkbox"
                          aria-checked={selected}
                          className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
                          onClick={() => toggleGenre(genre)}
                        >
                          {GENRE_DISPLAY_NAMES[genre]}
                        </button>
                      );
                    })}
                  </div>

                  <ArtistSearch 
                    selectedArtists={formData.seedArtists} 
                    onChange={(artists) => {
                      setFormData(prev => ({ ...prev, seedArtists: artists }));
                      setErrors(prev => ({ ...prev, genres: '' }));
                    }} 
                  />

                  {errors.genres && <span className={styles.errorMsg} style={{marginTop: '12px', display: 'block'}}>{errors.genres}</span>}
                </div>
              </div>

              {/* ── Card 4: Planificador Semanal ── */}
              <WeeklyPlanner
                dayStatuses={dayStatuses}
                slotOverrides={slotOverrides}
                defaultGenres={formData.genres}
                localId={local.id}
                localType={local.type}
                openTime={formData.openTime}
                closeTime={formData.closeTime}
                onChange={(newDayStatuses, newSlotOverrides) => {
                  setDayStatuses(newDayStatuses);
                  setSlotOverrides(newSlotOverrides);
                }}
              />

              {/* Spacer so the floating bar doesn't overlap content */}
              <div className={styles.bottomSpacer} />

            </form>
          </div>
        </div>

        {/* ── Floating Save Bar ── */}
        <div className={`${styles.floatingSaveBar} ${isDirty ? styles.floatingSaveBarVisible : ''}`}>
            <div className={styles.floatingSaveInner}>
               <span className={styles.unsavedText}>Tienes cambios sin guardar</span>
               <button onClick={handleSave} className={styles.saveBtn} disabled={!isDirty || isSaving}>
                 {isSaving ? <span className={styles.btnSpinner} /> : 'Guardar cambios'}
               </button>
            </div>
        </div>
      </main>

      {/* ── Toasts ── */}
      <div className={styles.toastContainer} role="alert" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span className={styles.toastIcon}>
              {toast.type === 'success' 
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               }
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
