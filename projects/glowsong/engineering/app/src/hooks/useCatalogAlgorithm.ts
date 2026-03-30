/**
 * F2 — useCatalogAlgorithm Hook
 * Versión del algoritmo que usa el catálogo propio en vez de Spotify.
 * Reemplaza useAlgorithm.ts para el flujo sin Spotify.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { runCatalogEnqueueCycle, type CatalogEnqueueResult } from '@/lib/algorithm/catalogEngine';
import { persistSessionEvent, getRecentEvents } from '@/lib/algorithm/catalogClient';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import { resolveProfileForNow } from '@/lib/algorithm/weeklyResolver';
import type { MusicProfile, Block, SessionEvent, WeeklyDayStatus, WeeklySlotOverride } from '@/types';
import type { AudioTrack } from './useAudioPlayer';
import type { TrackRecommendation } from '@/lib/algorithm/catalogClient';
import type { AlgorithmState } from '@/lib/algorithm/engine';

const MIN_QUEUE_THRESHOLD = 10;
const SAFETY_CHECK_INTERVAL_MS = 60_000;

export interface CatalogQueuedTrack {
  track_id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url: string;
  duration_ms: number;
  file_url: string;
}

export interface UseCatalogAlgorithmOptions {
  musicProfile: MusicProfile;
  blocks: Block[];
  localId: string;
  localType: string;
  currentTrack: AudioTrack | null;
  queueCount: number;
  enabled: boolean;
  dayStatuses: WeeklyDayStatus[];
  slotOverrides: WeeklySlotOverride[];
  onTracksReady?: (tracks: AudioTrack[]) => void;
}

/** Convierte TrackRecommendation del catálogo → AudioTrack para el player */
function toAudioTrack(rec: TrackRecommendation): AudioTrack {
  return {
    id: rec.track_id,
    name: rec.name,
    artist: rec.artist,
    album: rec.album,
    albumArtUrl: rec.album_art_url,
    durationMs: rec.duration_ms,
    fileUrl: rec.file_url,
  };
}

export function useCatalogAlgorithm({
  musicProfile,
  blocks,
  localId,
  localType,
  currentTrack,
  queueCount,
  enabled,
  dayStatuses,
  slotOverrides,
  onTracksReady,
}: UseCatalogAlgorithmOptions) {
  const [algorithmState, setAlgorithmState] = useState<AlgorithmState>({
    status: 'idle',
    currentSlot: getCurrentTimeSlot(),
    queueCount: 0,
    lastEnqueuedAt: null,
    recentlyEnqueued: [],
    warningMessage: null,
    lastError: null,
  });

  const [localQueue, setLocalQueue] = useState<CatalogQueuedTrack[]>([]);

  const isRunningRef = useRef(false);
  const previousTrackIdRef = useRef<string | null>(null);
  const safetyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localQueueLenRef = useRef(0);
  const onTracksReadyRef = useRef(onTracksReady);

  useEffect(() => { localQueueLenRef.current = localQueue.length; }, [localQueue]);
  useEffect(() => { onTracksReadyRef.current = onTracksReady; }, [onTracksReady]);

  const depsRef = useRef({ musicProfile, blocks, localId, localType, dayStatuses, slotOverrides });
  useEffect(() => {
    depsRef.current = { musicProfile, blocks, localId, localType, dayStatuses, slotOverrides };
  }, [musicProfile, blocks, localId, localType, dayStatuses, slotOverrides]);

  const runCycle = useCallback(async (currentQueueCount: number) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const { musicProfile: mp, blocks: bl, localId: lid, localType: lt, dayStatuses: ds, slotOverrides: so } = depsRef.current;
    console.log(`[useCatalogAlgorithm] Ciclo — cola: ${currentQueueCount}`);

    try {
      const resolved = resolveProfileForNow(mp, ds, so);
      if (resolved.isClosed) {
        setAlgorithmState(prev => ({
          ...prev,
          status: 'idle',
          currentSlot: getCurrentTimeSlot(),
          warningMessage: 'Hoy está marcado como cerrado en el planificador semanal.',
        }));
        isRunningRef.current = false;
        return;
      }

      setAlgorithmState(prev => ({ ...prev, status: 'enqueueing', currentSlot: getCurrentTimeSlot() }));

      // Eventos recientes (ventana 4h)
      const recentEventsRaw = await getRecentEvents(lid);
      const recentEvents: SessionEvent[] = recentEventsRaw.map((e) => ({
        id: '',
        local_id: lid,
        spotify_track_id: e.track_id,
        track_name: e.track_name,
        artist_name: e.artist_name,
        genre: 'ROCK' as const,
        energy_level: 'medium' as const,
        played_at: e.played_at,
        time_slot: 'opening' as const,
        day_of_week: 0,
        source: 'algorithm' as const,
      }));

      const result: CatalogEnqueueResult = await runCatalogEnqueueCycle({
        musicProfile: resolved.profile,
        blocks: bl,
        recentEvents,
        currentQueueCount,
        localId: lid,
        localType: lt,
      });

      console.log(`[useCatalogAlgorithm] Ciclo completado — ${result.enqueuedCount} tracks`);

      setAlgorithmState(prev => ({
        ...prev,
        status: result.warning ? 'error' : 'running',
        queueCount: currentQueueCount + result.enqueuedCount,
        lastEnqueuedAt: result.enqueuedCount > 0 ? new Date() : prev.lastEnqueuedAt,
        warningMessage: result.warning,
        lastError: null,
      }));

      if (result.enqueuedCount > 0 && result.enqueuedTracks.length > 0) {
        const newQueueItems: CatalogQueuedTrack[] = result.enqueuedTracks.map((t) => ({
          track_id: t.track_id,
          name: t.name,
          artist: t.artist,
          album: t.album,
          album_art_url: t.album_art_url,
          duration_ms: t.duration_ms,
          file_url: t.file_url,
        }));
        setLocalQueue(prev => [...prev, ...newQueueItems]);

        // Enviar los tracks al player
        const audioTracks = result.enqueuedTracks.map(toAudioTrack);
        onTracksReadyRef.current?.(audioTracks);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`[useCatalogAlgorithm] Error:`, message);
      setAlgorithmState(prev => ({ ...prev, status: 'error', lastError: message }));
    } finally {
      isRunningRef.current = false;
    }
  }, []);

  // Track change detection
  useEffect(() => {
    if (!enabled || !currentTrack || !localId) return;

    const trackId = currentTrack.id;

    if (previousTrackIdRef.current === null) {
      previousTrackIdRef.current = trackId;
      const effectiveQueue = Math.max(queueCount, localQueueLenRef.current);
      if (effectiveQueue < MIN_QUEUE_THRESHOLD) {
        runCycle(effectiveQueue);
      }
      return;
    }

    if (previousTrackIdRef.current === trackId) return;
    previousTrackIdRef.current = trackId;

    // Remove played track from local queue
    setLocalQueue(prev => {
      const idx = prev.findIndex(t => t.track_id === trackId);
      if (idx !== -1) return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      return prev.length > 0 ? prev.slice(1) : prev;
    });

    // Persist SessionEvent
    const slot = getCurrentTimeSlot();
    persistSessionEvent({
      local_id: localId,
      track_id: currentTrack.id,
      track_name: currentTrack.name,
      artist_name: currentTrack.artist,
      album_art_url: currentTrack.albumArtUrl,
      duration_ms: currentTrack.durationMs,
      time_slot: slot,
      day_of_week: new Date().getDay(),
      source: 'algorithm',
    });

    // Check if queue needs more tracks
    const effectiveQueue = Math.max(queueCount, localQueueLenRef.current);
    if (effectiveQueue < MIN_QUEUE_THRESHOLD) {
      runCycle(effectiveQueue);
    }
  }, [currentTrack, enabled, localId, queueCount, runCycle]);

  // Safety net: check every 60s
  useEffect(() => {
    if (!enabled) {
      if (safetyIntervalRef.current) {
        clearInterval(safetyIntervalRef.current);
        safetyIntervalRef.current = null;
      }
      return;
    }

    safetyIntervalRef.current = setInterval(() => {
      const effectiveQueue = Math.max(queueCount, localQueueLenRef.current);
      if (effectiveQueue < MIN_QUEUE_THRESHOLD && !isRunningRef.current) {
        runCycle(effectiveQueue);
      }
    }, SAFETY_CHECK_INTERVAL_MS);

    return () => {
      if (safetyIntervalRef.current) clearInterval(safetyIntervalRef.current);
    };
  }, [enabled, queueCount, runCycle]);

  // Trigger inicial: correr ciclo apenas se active (sin esperar 60s)
  const hasBootedRef = useRef(false);
  useEffect(() => {
    if (!enabled) {
      setAlgorithmState(prev => ({ ...prev, status: 'idle' }));
      hasBootedRef.current = false;
      return;
    }
    if (!hasBootedRef.current) {
      hasBootedRef.current = true;
      console.log('[useCatalogAlgorithm] Boot — ejecutando primer ciclo');
      runCycle(0);
    }
  }, [enabled, runCycle]);

  return { algorithmState, localQueue };
}
