'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlowsongIsotipo } from '@/components/shared/GlowsongIsotipo';
import styles from './LoginView.module.css';

type Mode = 'login' | 'register';

export function LoginView() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Revisamos si el usuario ya configuró un local, si no lo mandamos al onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: local } = await supabase.from('locals').select('id').eq('owner_id', user.id).single();
          if (!local) {
            window.location.href = '/onboarding';
            return;
          }
        }
        
        window.location.href = '/dashboard';
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess('Revisa tu email para confirmar tu cuenta.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      if (mode === 'register') {
        setLoading(false);
      }
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Google OAuth Error:', error);
        setError(error.message);
      }
    } catch (err: unknown) {
      console.error('Catch Google OAuth Error:', err);
      setError(err instanceof Error ? err.message : 'Error iniciando con Google');
    } finally {
      // Si fue exitoso el redirect ocurrirá de inmediato y la app se descarga.
      // Solo limpiamos loading si por alguna razón no redirige. 
      // Lo dejamos en true un momento extra por UX.
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className={styles.page}>
      {/* Fondo con glow */}
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoGroup}>
          <GlowsongIsotipo size={48} className={styles.logoIcon} />
          <h1 className={`${styles.logo} font-display`}>Glowsong</h1>
        </div>
        <p className={styles.tagline}>
          {mode === 'login'
            ? 'Inicia sesión para gestionar tu local'
            : 'Crea tu cuenta y empieza a usar Glowsong'}
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>o</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="tu@bar.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">{error}</div>
          )}
          {success && (
            <div className={styles.successMsg} role="status">{success}</div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading
              ? 'Procesando...'
              : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className={styles.toggleText}>
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
