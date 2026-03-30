'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Step1Register } from './Step1Register';
import { Step2LocalProfile } from './Step2LocalProfile';
import { Step3MusicProfile } from './Step3MusicProfile';
import { SuccessScreen } from './SuccessScreen';
import { OnboardingProgress } from './OnboardingProgress';
import type { Genre, LocalType } from '@/types';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import styles from './OnboardingWizard.module.css';

export type WizardStep = 1 | 2 | 3 | 'success';

export interface WizardData {
  // Step 1
  email: string;
  password: string;
  name: string;
  authMethod: 'email' | 'google';
  // Step 2
  localName: string;
  localType: LocalType | '';
  neighborhood: string;
  // Step 3
  genres: Genre[];
}

const INITIAL_DATA: WizardData = {
  email: '',
  password: '',
  name: '',
  authMethod: 'email',
  localName: '',
  localType: '',
  neighborhood: '',
  genres: [],
};

const STEP_LABELS = ['Registro', 'Local', 'Música'];

export function OnboardingWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  const updateData = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  // Inicialización
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Si ya hay sesión, omitimos el Step 1 (Registro)
        setStep(2);
      }

      setIsInitializing(false);
    }
    init();
  }, []);

  // Guarda en base de datos y finaliza el onboarding
  const handleNextFromStep3 = useCallback(async () => {
    setSaveError('');
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const user = session.user;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;

      // Check if local already exists
      const { data: existingLocal } = await client
        .from('locals')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      let finalLocalId = existingLocal?.id;

      if (!finalLocalId) {
        // Crear el local (status: 'configured' — listo para usar)
        const { data: localData, error: localErr } = await client
          .from('locals')
          .insert({
            owner_id: user.id,
            name: data.localName || 'Mi Local',
            type: data.localType || 'bar',
            address: data.neighborhood || null,
            city: 'Santiago',
            status: 'configured',
          })
          .select()
          .single();

        if (localErr) throw localErr;
        finalLocalId = localData.id;

        // Crear el perfil musical
        const { error: profileErr } = await client
          .from('music_profiles')
          .insert({
            local_id: finalLocalId,
            genres: data.genres,
            energy_level: 'auto',
            explicit_allowed: false,
          });

        if (profileErr) throw profileErr;
      }

      setStep('success');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error guardando datos');
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      return ((s as number) + 1) as WizardStep;
    });
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => {
      if (s === 'success' || s === 1) return s;
      return (s - 1) as WizardStep;
    });
  }, []);

  const goToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  if (isInitializing) {
    return (
      <div className={styles.initLoader}>
        <GlowsongIsotipo size={48} className={styles.initIcon} />
        <span className={styles.initText}>Preparando Glowsong...</span>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <SuccessScreen
        localName={data.localName || 'tu local'}
        onGoToDashboard={goToDashboard}
      />
    );
  }

  return (
    <div className={styles.wizard}>
      {/* Header del wizard */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={prevStep}
          disabled={step === 1}
          aria-label="Volver al paso anterior"
        >
          {step > 1 && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
        </button>

        <div className={styles.headerCenter}>
          <GlowsongIsotipo size={24} className={styles.headerIsotipo} />
          <span className={styles.stepLabel}>Paso {step} de 3</span>
        </div>

        <div className={styles.headerRight} />
      </header>

      {/* Progress bar */}
      <OnboardingProgress
        currentStep={step as number}
        totalSteps={3}
        labels={STEP_LABELS}
      />

      {/* Error de guardado */}
      {saveError && (
        <div style={{
          margin: '0 auto',
          maxWidth: '480px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '3px solid var(--color-error)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--color-error)',
        }}>
          {saveError}
        </div>
      )}

      {/* Contenido del paso */}
      <main className={styles.content}>
        {step === 1 && (
          <Step1Register
            data={data}
            onChange={updateData}
            onNext={nextStep}
          />
        )}
        {step === 2 && (
          <Step2LocalProfile
            data={data}
            onChange={updateData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {step === 3 && (
          <Step3MusicProfile
            data={data}
            onChange={updateData}
            onNext={handleNextFromStep3}
            onPrev={prevStep}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  );
}
