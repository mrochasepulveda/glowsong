import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing Spotify credentials in .env');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const localId = searchParams.get('state'); // El localId que pasamos en el login

  if (error) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard?spotify_error=${error}`);
  }

  if (!code || !localId) {
    return new NextResponse('Missing code or localId', { status: 400 });
  }

  // Intercambiar code por tokens de Spotify usando Basic Auth
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  
  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Spotify token exchange failed:', errorText);
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard?spotify_error=exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calcular expiración
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Guardar tokens en Supabase usando el service_role (para bypassear RLS o confirmar)
    // Usamos el cliente server normal porque la cookie del owner debería estar activa
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignore
            }
          },
        },
      }
    );

    // Upsert the credentials
    const { error: dbError } = await supabase
      .from('spotify_credentials')
      .upsert({
        local_id: localId,
        access_token,
        refresh_token, // Si es undefined, igual upsertamos, pero offline debería darlo
        expires_at: expiresAt,
      }, {
        onConflict: 'local_id'
      });

    if (dbError) {
      console.error('Supabase save error:', dbError);
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard?spotify_error=db_save_failed`);
    }

    // Actualizamos el status del local a 'active' si conectó Spotify con éxito
    await supabase.from('locals').update({ status: 'active' }).eq('id', localId);

    // Todo bien, redirigir al éxito dentro del Onboarding o Dashboard
    // Haremos redirect al Onboarding con un hash para que detecte que terminó exitosamente
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/onboarding#spotify_success`);

  } catch (err) {
    console.error('Unexpected auth error:', err);
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard?spotify_error=unexpected_error`);
  }
}
