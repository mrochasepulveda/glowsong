import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getValidToken } from '@/lib/spotifyClient';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'artist'; // default to artist

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Auth check via Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the local for this user
    const { data: local, error: localError } = await supabase
      .from('locals')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (localError || !local) {
      return NextResponse.json({ error: 'Local not found' }, { status: 404 });
    }

    // Get a valid access token using the existing utility
    const accessToken = await getValidToken(local.id);

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to auth with Spotify. Is Spotify connected?' }, { status: 403 });
    }

    // Call Spotify Search API
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!spotifyRes.ok) {
      const errorText = await spotifyRes.text();
      console.error('[Spotify API Error]', spotifyRes.status, errorText);
      return NextResponse.json(
        { error: 'Spotify API error' },
        { status: spotifyRes.status }
      );
    }

    const data = await spotifyRes.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Search route error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
