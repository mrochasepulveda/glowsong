import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/catalog/upload
 * Sube un track al catálogo con su metadata.
 * El archivo de audio se sube a Supabase Storage y la metadata a catalog_tracks.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options); }); }
          catch { /* ignore */ }
        },
      },
    }
  );

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get('audio') as File | null;
  const metadataRaw = formData.get('metadata') as string | null;

  if (!audioFile || !metadataRaw) {
    return NextResponse.json({ error: 'Missing audio file or metadata' }, { status: 400 });
  }

  let metadata;
  try {
    metadata = JSON.parse(metadataRaw);
  } catch {
    return NextResponse.json({ error: 'Invalid metadata JSON' }, { status: 400 });
  }

  // Validar campos requeridos
  const required = ['title', 'artist_name', 'genre', 'energy', 'energy_level', 'tempo_bpm', 'duration_ms', 'license_type'];
  for (const field of required) {
    if (metadata[field] === undefined || metadata[field] === null) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  // Subir audio a Supabase Storage
  const ext = audioFile.name.split('.').pop() || 'mp3';
  const fileName = `${Date.now()}_${slugify(metadata.title)}.${ext}`;
  const filePath = `tracks/${metadata.genre.toLowerCase()}/${fileName}`;

  const arrayBuffer = await audioFile.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('catalog-audio')
    .upload(filePath, arrayBuffer, {
      contentType: audioFile.type || 'audio/mpeg',
      upsert: false,
    });

  if (uploadError) {
    console.error('[Upload] Storage error:', uploadError.message);
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('catalog-audio')
    .getPublicUrl(filePath);

  const fileUrl = urlData.publicUrl;

  // Insertar metadata en catalog_tracks
  const { data: track, error: insertError } = await supabase
    .from('catalog_tracks')
    .insert({
      title: metadata.title,
      artist_name: metadata.artist_name,
      album: metadata.album || null,
      album_art_url: metadata.album_art_url || null,
      genre: metadata.genre,
      energy: metadata.energy,
      energy_level: metadata.energy_level,
      tempo_bpm: metadata.tempo_bpm,
      mood_tags: metadata.mood_tags || [],
      file_url: fileUrl,
      duration_ms: metadata.duration_ms,
      file_size_bytes: audioFile.size,
      license_type: metadata.license_type,
      license_attribution: metadata.license_attribution || null,
      source_url: metadata.source_url || null,
      source_platform: metadata.source_platform || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error('[Upload] DB insert error:', insertError.message);
    // Intentar limpiar el archivo subido
    await supabase.storage.from('catalog-audio').remove([filePath]);
    return NextResponse.json({ error: `Insert failed: ${insertError.message}` }, { status: 500 });
  }

  console.log(`[Upload] Track subido: "${metadata.title}" - ${metadata.artist_name} (${metadata.genre})`);
  return NextResponse.json({ track, fileUrl });
}

/**
 * POST /api/catalog/upload (batch metadata only — sin archivo de audio)
 * Para insertar metadata cuando los archivos ya están en storage.
 */
export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options); }); }
          catch { /* ignore */ }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const tracks = Array.isArray(body.tracks) ? body.tracks : [body];

  const results = [];
  for (const metadata of tracks) {
    const { data, error } = await supabase
      .from('catalog_tracks')
      .insert({
        title: metadata.title,
        artist_name: metadata.artist_name,
        album: metadata.album || null,
        album_art_url: metadata.album_art_url || null,
        genre: metadata.genre,
        energy: metadata.energy,
        energy_level: metadata.energy_level,
        tempo_bpm: metadata.tempo_bpm,
        mood_tags: metadata.mood_tags || [],
        file_url: metadata.file_url,
        duration_ms: metadata.duration_ms,
        file_size_bytes: metadata.file_size_bytes || null,
        license_type: metadata.license_type,
        license_attribution: metadata.license_attribution || null,
        source_url: metadata.source_url || null,
        source_platform: metadata.source_platform || null,
      })
      .select()
      .single();

    results.push({ title: metadata.title, success: !error, error: error?.message });
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`[Upload] Batch: ${successCount}/${results.length} tracks insertados`);
  return NextResponse.json({ results, total: results.length, success: successCount });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}
