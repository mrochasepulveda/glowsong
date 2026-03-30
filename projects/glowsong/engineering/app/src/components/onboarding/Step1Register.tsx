'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { WizardData } from './OnboardingWizard';
import styles from './Step.module.css';

interface Step1Props {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
}

export function Step1Register({ data, onChange, onNext }: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.name.trim()) e.name = 'Tu nombre es requerido';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = 'Email no válido';
    if (data.password.length < 8)
      e.password = 'Mínimo 8 caracteres';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrors({ email: error.message });
        return;
      }
      // Sesión activa → continuar onboarding
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setErrors({});
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Google Auth Error:', error);
        setErrors({ email: error.message });
      }
    } catch (err: unknown) {
      console.error('Catch Google Auth:', err);
      setErrors({ email: err instanceof Error ? err.message : 'Error al conectar con Google' });
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h1 className={styles.title}>Bienvenido a Glowsong</h1>
        <p className={styles.subtitle}>
          Gestiona la música de tu local de forma inteligente. Empecemos.
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>o con email</span>
        <span className={styles.dividerLine} />
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Nombre */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="name">Tu nombre</label>
          <input
            id="name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Ej: Tomás García"
            autoComplete="name"
            value={data.name}
            onChange={(e) => { onChange({ name: e.target.value }); setErrors((p) => ({ ...p, name: '' })); }}
          />
          {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
        </div>

        {/* Email */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu@local.cl"
            autoComplete="email"
            inputMode="email"
            value={data.email}
            onChange={(e) => { onChange({ email: e.target.value }); setErrors((p) => ({ ...p, email: '' })); }}
          />
          {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
        </div>

        {/* Contraseña */}
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">Contraseña</label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ''}`}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => { onChange({ password: e.target.value }); setErrors((p) => ({ ...p, password: '' })); }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
        </div>

        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={isLoading}
        >
          {isLoading ? <span className={styles.btnSpinner} /> : 'Crear cuenta'}
        </button>
      </form>

      <p className={styles.loginHint}>
        ¿Ya tienes cuenta?{' '}
        <a href="/login">Inicia sesión</a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
