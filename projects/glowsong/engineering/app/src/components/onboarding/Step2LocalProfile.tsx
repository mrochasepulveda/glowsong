'use client';

import { useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import type { LocalType } from '@/types';
import styles from './Step.module.css';

interface Step2Props {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev?: () => void;
}

const LOCAL_TYPES: { value: LocalType; label: string; emoji: string }[] = [
  { value: 'bar',        label: 'Bar',           emoji: '🍺' },
  { value: 'pub',        label: 'Pub',            emoji: '🏠' },
  { value: 'cocteleria', label: 'Coctelería',     emoji: '🍸' },
  { value: 'cerveceria', label: 'Cervecería',     emoji: '🍻' },
  { value: 'restaurante',label: 'Restaurante',    emoji: '🍽️' },
  { value: 'discoteca',  label: 'Discoteca',      emoji: '🎉' },
  { value: 'otro',       label: 'Otro',           emoji: '✨' },
];

export function Step2LocalProfile({ data, onChange, onNext, onPrev }: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.localName.trim()) e.localName = 'El nombre del local es requerido';
    if (!data.localType) e.localType = 'Selecciona el tipo de local';
    if (!data.neighborhood.trim()) e.neighborhood = 'El barrio o comuna es requerido';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
    onNext();
  };

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.title}>Sobre tu local</h1>
        <p className={styles.subtitle}>
          Cuéntanos quién eres para personalizar tu experiencia musical.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Nombre del local */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="localName">Nombre del local</label>
          <input
            id="localName"
            type="text"
            className={`${styles.input} ${errors.localName ? styles.inputError : ''}`}
            placeholder="Ej: Bar El Copihue"
            value={data.localName}
            onChange={(e) => { onChange({ localName: e.target.value }); setErrors((p) => ({ ...p, localName: '' })); }}
          />
          {errors.localName && <span className={styles.errorMsg}>{errors.localName}</span>}
        </div>

        {/* Tipo de local */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tipo de local</label>
          <div className={`${styles.typeGrid} ${errors.localType ? styles.typeGridError : ''}`}>
            {LOCAL_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.typeBtn} ${data.localType === t.value ? styles.typeBtnActive : ''}`}
                onClick={() => { onChange({ localType: t.value }); setErrors((p) => ({ ...p, localType: '' })); }}
              >
                <span className={styles.typeEmoji}>{t.emoji}</span>
                <span className={styles.typeLabel}>{t.label}</span>
              </button>
            ))}
          </div>
          {errors.localType && <span className={styles.errorMsg}>{errors.localType}</span>}
        </div>

        {/* Barrio */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="neighborhood">Barrio o comuna</label>
          <input
            id="neighborhood"
            type="text"
            className={`${styles.input} ${errors.neighborhood ? styles.inputError : ''}`}
            placeholder="Ej: Barrio Italia, Santiago"
            value={data.neighborhood}
            onChange={(e) => { onChange({ neighborhood: e.target.value }); setErrors((p) => ({ ...p, neighborhood: '' })); }}
          />
          {errors.neighborhood && <span className={styles.errorMsg}>{errors.neighborhood}</span>}
        </div>

        <div className={styles.buttonRow}>
          {onPrev && (
            <button type="button" className={styles.secondaryBtn} onClick={onPrev} disabled={isLoading}>
              ← Atrás
            </button>
          )}
          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? <span className={styles.btnSpinner} /> : 'Continuar →'}
          </button>
        </div>
      </form>
    </div>
  );
}
