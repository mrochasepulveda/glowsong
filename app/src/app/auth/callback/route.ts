import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Callback de OAuth y magic links de Supabase
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session?.user) {
      // Verificamos si ya tiene un local creado
      const { data: local } = await supabase
        .from('locals')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();
        
      if (!local) {
        // Redirigir al onboarding si es usuario nuevo
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si hay error, redirigir al login con mensaje
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
