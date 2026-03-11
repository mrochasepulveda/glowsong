'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SeedArtist } from '@/types';

// Tipos locales para evitar problemas con inferencia de Supabase generics
export type LocalRow = {
  id: string;
  owner_id: string;
  name: string;
  type: 'bar' | 'pub' | 'cocteleria' | 'cerveceria' | 'restaurante' | 'discoteca' | 'otro';
  address: string | null;
  city: string;
  capacity: number | null;
  status: 'pending_spotify' | 'configured' | 'active' | 'inactive';
  spotify_device_id: string | null;
  created_at: string;
  updated_at: string;
};

export type MusicProfileRow = {
  id: string;
  local_id: string;
  genres: string[];
  seed_artists?: SeedArtist[];
  energy_level: 'low' | 'medium' | 'high' | 'auto';
  bpm_min: number;
  bpm_max: number;
  popularity_min: number;
  explicit_allowed: boolean;
  created_at: string;
  updated_at: string;
};

type LocalInsert = Omit<LocalRow, 'id' | 'created_at' | 'updated_at'>;

export type MusicProfileUpdate = Pick<MusicProfileRow, 'genres' | 'seed_artists' | 'energy_level' | 'bpm_min' | 'bpm_max' | 'popularity_min' | 'explicit_allowed'>;

interface UseLocalReturn {
  local: LocalRow | null;
  musicProfile: MusicProfileRow | null;
  loading: boolean;
  error: string | null;
  createLocal: (data: Omit<LocalInsert, 'owner_id'>) => Promise<LocalRow | null>;
  updateLocal: (data: Partial<LocalInsert>) => Promise<void>;
  updateMusicProfile: (data: Partial<MusicProfileUpdate>) => Promise<void>;
  refetch: () => void;
}

export function useLocal(): UseLocalReturn {
  const [local, setLocal] = useState<LocalRow | null>(null);
  const [musicProfile, setMusicProfile] = useState<MusicProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocal = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;

      const { data: localData, error: localErr } = await client
        .from('locals')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (localErr) throw localErr;
      setLocal(localData as LocalRow | null);

      if (localData?.id) {
        const { data: profileData, error: profileErr } = await client
          .from('music_profiles')
          .select('*')
          .eq('local_id', localData.id)
          .maybeSingle();

        if (profileErr) throw profileErr;
        setMusicProfile(profileData as MusicProfileRow | null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocal(); }, [fetchLocal]);

  const createLocal = async (data: Omit<LocalInsert, 'owner_id'>): Promise<LocalRow | null> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newLocal, error: err } = await (supabase as any)
      .from('locals')
      .insert({ ...data, owner_id: user.id })
      .select()
      .single();

    if (err) throw err;
    setLocal(newLocal as LocalRow);
    return newLocal as LocalRow;
  };

  const updateLocal = async (data: Partial<LocalInsert>) => {
    if (!local) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('locals')
      .update(data)
      .eq('id', local.id);
    if (err) throw err;
    setLocal((prev: LocalRow | null) => prev ? { ...prev, ...data } : prev);
  };

  const updateMusicProfile = async (data: Partial<MusicProfileUpdate>) => {
    if (!musicProfile) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('music_profiles')
      .update(data)
      .eq('id', musicProfile.id);
    if (err) throw err;
    setMusicProfile((prev: MusicProfileRow | null) => prev ? { ...prev, ...data } : prev);
  };

  return { local, musicProfile, loading, error, createLocal, updateLocal, updateMusicProfile, refetch: fetchLocal };
}
