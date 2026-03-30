import { redirect } from 'next/navigation';

// En MVP 1 con data dummy: redirigir directo al dashboard
// En Fase 3: leer sesión de Supabase y redirigir según estado
export default function HomePage() {
  redirect('/dashboard');
}
