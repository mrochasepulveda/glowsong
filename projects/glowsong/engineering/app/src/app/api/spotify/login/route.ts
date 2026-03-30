import { NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const REDIRECT_URI = `${NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

// Scopes requeridos para el Web Playback SDK y control de música
const SCOPES = [
  'streaming',                    // Web Playback SDK (browser como dispositivo)
  'user-read-email',              // Requerido por el SDK
  'user-read-private',            // Requerido por el SDK
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join(' ');

export async function GET(request: Request) {
  if (!SPOTIFY_CLIENT_ID) {
    return new NextResponse('Missing SPOTIFY_CLIENT_ID', { status: 500 });
  }

  // Obtenemos el localId de la query, lo pasaremos por el parametro "state" a Spotify
  const { searchParams } = new URL(request.url);
  const localId = searchParams.get('localId');

  if (!localId) {
    return new NextResponse('Falta el parametro localId', { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    access_type: 'offline', // Necesario para asegurar que nos den refresh_token
    scope: SCOPES,
    state: localId, // Pasamos el localId como state para recuperarlo en el callback
    show_dialog: 'true', // Opcional: fuerza mostrar el dialogo
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
