'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SeedArtist, WeeklyDayStatus, WeeklySlotOverride } from '@/types';

// Tipos locales para evitar problemas con inferencia de Supabase generics
export type LocalRow = {
  id: string;
  owner_id: string;
  name: string;
  type: 'bar' | 'pub' | 'cocteleria' | 'cerveceria' | 'restaurante' | 'discoteca' | 'otro';
  address: string | null;
  city: string;
  capacity: number | null;
  status: 'pending_setup' | 'configured' | 'active' | 'inactive';
  spotify_device_id: string | null;  // legacy — unused
  open_time: string;   // "HH:mm" e.g. "13:00"
  close_time: string;  // "HH:mm" e.g. "02:00"
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
  dayStatuses: WeeklyDayStatus[];
  slotOverrides: WeeklySlotOverride[];
  loading: boolean;
  error: string | null;
  createLocal: (data: Omit<LocalInsert, 'owner_id'>) => Promise<LocalRow | null>;
  updateLocal: (data: Partial<LocalInsert>) => Promise<void>;
  updateMusicProfile: (data: Partial<MusicProfileUpdate>) => Promise<void>;
  updateWeeklySchedule: (dayStatuses: WeeklyDayStatus[], slotOverrides: WeeklySlotOverride[]) => Promise<void>;
  refetch: () => void;
}

export function useLocal(): UseLocalReturn {
  const [local, setLocal] = useState<LocalRow | null>(null);
  const [musicProfile, setMusicProfile] = useState<MusicProfileRow | null>(null);
  const [dayStatuses, setDayStatuses] = useState<WeeklyDayStatus[]>([]);
  const [slotOverrides, setSlotOverrides] = useState<WeeklySlotOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

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

        // Fetch weekly planner data (tables may not exist yet — graceful fallback)
        try {
          const [dayStatusRes, slotOverrideRes] = await Promise.all([
            client
              .from('weekly_day_status')
              .select('*')
              .eq('local_id', localData.id),
            client
              .from('weekly_slot_overrides')
              .select('*')
              .eq('local_id', localData.id),
          ]);

          if (!dayStatusRes.error) {
            setDayStatuses((dayStatusRes.data ?? []) as WeeklyDayStatus[]);
          }
          if (!slotOverrideRes.error) {
            setSlotOverrides((slotOverrideRes.data ?? []) as WeeklySlotOverride[]);
          }
        } catch {
          // Tables don't exist yet — use empty defaults
          console.warn('[useLocal] weekly tables not found, using defaults');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocal(); }, [fetchLocal, fetchCount]);

  const refetch = useCallback(() => setFetchCount((c) => c + 1), []);

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

  const updateWeeklySchedule = async (
    newDayStatuses: WeeklyDayStatus[],
    newSlotOverrides: WeeklySlotOverride[]
  ) => {
    if (!local) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    // Upsert day statuses
    if (newDayStatuses.length > 0) {
      const rows = newDayStatuses.map((d) => ({
        local_id: local.id,
        day_of_week: d.day_of_week,
        is_closed: d.is_closed,
      }));

      const { error: dayErr } = await client
        .from('weekly_day_status')
        .upsert(rows, { onConflict: 'local_id,day_of_week' });

      if (dayErr) throw dayErr;
    }

    // Delete day statuses that are no longer present (days set back to default open)
    const activeDays = new Set(newDayStatuses.map((d) => d.day_of_week));
    const daysToDelete = dayStatuses
      .filter((d) => !activeDays.has(d.day_of_week))
      .map((d) => d.day_of_week);

    if (daysToDelete.length > 0) {
      await client
        .from('weekly_day_status')
        .delete()
        .eq('local_id', local.id)
        .in('day_of_week', daysToDelete);
    }

    // Upsert slot overrides
    if (newSlotOverrides.length > 0) {
      const rows = newSlotOverrides.map((o) => ({
        local_id: local.id,
        day_of_week: o.day_of_week,
        time_slot: o.time_slot,
        is_closed: o.is_closed,
        genres: o.genres,
        energy_level: o.energy_level,
      }));

      const { error: slotErr } = await client
        .from('weekly_slot_overrides')
        .upsert(rows, { onConflict: 'local_id,day_of_week,time_slot' });

      if (slotErr) throw slotErr;
    }

    // Delete slot overrides that are no longer present
    const activeSlotKeys = new Set(
      newSlotOverrides.map((o) => `${o.day_of_week}-${o.time_slot}`)
    );
    const slotsToDelete = slotOverrides.filter(
      (o) => !activeSlotKeys.has(`${o.day_of_week}-${o.time_slot}`)
    );

    for (const slot of slotsToDelete) {
      await client
        .from('weekly_slot_overrides')
        .delete()
        .eq('local_id', local.id)
        .eq('day_of_week', slot.day_of_week)
        .eq('time_slot', slot.time_slot);
    }

    // Update local state
    setDayStatuses(newDayStatuses);
    setSlotOverrides(newSlotOverrides);
  };

  return {
    local, musicProfile, dayStatuses, slotOverrides,
    loading, error, createLocal, updateLocal, updateMusicProfile,
    updateWeeklySchedule, refetch,
  };
}
