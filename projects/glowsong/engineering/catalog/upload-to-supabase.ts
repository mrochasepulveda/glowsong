/**
 * Script para subir tracks a Supabase Storage y crear registros en catalog_tracks.
 *
 * Prerequisitos:
 * 1. Crear bucket "catalog-audio" en Supabase Dashboard (public, 50MB limit)
 * 2. Ejecutar migración 05_catalog_tracks.sql en Supabase
 * 3. Configurar variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso: npx tsx catalog-downloads/upload-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'catalog-audio';
const BASE_DIR = path.resolve(__dirname);

interface TrackMeta {
  title: string;
  artist_name: string;
  genre: string;
  energy: number;
  energy_level: string;
  tempo_bpm: number;
  mood_tags: string[];
  duration_ms: number;
  license_type: string;
  license_attribution: string;
  source_platform: string;
  file_path: string;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const metaPath = path.join(BASE_DIR, 'catalog-metadata.json');
  const tracks: TrackMeta[] = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  console.log(`Found ${tracks.length} tracks to upload\n`);

  let uploaded = 0;
  let failed = 0;

  for (const track of tracks) {
    const filePath = path.join(BASE_DIR, track.file_path);

    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP: File not found: ${track.file_path}`);
      failed++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `tracks/${track.genre.toLowerCase()}/${path.basename(track.file_path)}`;

    console.log(`Uploading: ${track.title} → ${storagePath}`);

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error(`  UPLOAD ERROR: ${uploadError.message}`);
      failed++;
      continue;
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;

    // 3. Insert metadata
    const { error: insertError } = await supabase
      .from('catalog_tracks')
      .upsert({
        title: track.title,
        artist_name: track.artist_name,
        genre: track.genre,
        energy: track.energy,
        energy_level: track.energy_level,
        tempo_bpm: track.tempo_bpm,
        mood_tags: track.mood_tags,
        duration_ms: track.duration_ms,
        license_type: track.license_type,
        license_attribution: track.license_attribution,
        source_platform: track.source_platform,
        file_url: fileUrl,
        is_active: true,
      }, {
        onConflict: 'title,artist_name',
      });

    if (insertError) {
      console.error(`  DB ERROR: ${insertError.message}`);
      failed++;
      continue;
    }

    uploaded++;
    console.log(`  OK (${uploaded}/${tracks.length})`);
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Failed: ${failed}`);
}

main().catch(console.error);
