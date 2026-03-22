/**
 * F2 — useAlgorithm Hook (Event-Driven)
 * Hook de React que integra el motor del algoritmo con el Dashboard.
 *
 * Ya no usa polling de 5s. Reacciona a eventos del Web Playback SDK:
 * - Track change → persistir SessionEvent + evaluar cola
 * - Queue baja (< 5) → ejecutar runEnqueueCycle (hasta 10 tracks)
 * - Safety net: check cada 60s como respaldo
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  runEnqueueCycle,
  type AlgorithmState,
} from '@/lib/algorithm/engine';
import {
  persistSessionEvent,
  getRecentEvents,
  type SpotifyRecommendation,
} from '@/lib/algorithm/spotifyClient';
import { getCurrentTimeSlot } from '@/lib/algorithm/timeSlots';
import { resolveProfileForNow } from '@/lib/algorithm/weeklyResolver';
import type { MusicProfile, Block, SessionEvent, WeeklyDayStatus, WeeklySlotOverride } from '@/types';
import type { WebPlaybackTrack } from './useWebPlayback';

const MIN_QUEUE_THRESHOLD = 10;
const SAFETY_CHECK_INTERVAL_MS = 60_000; // 60 segundos (respaldo)

export interface QueuedTrack {
  spotify_track_id: string;
  name: string;
  artist: string;
  album: string;
  album_art_url: string;
  duration_ms: number;
}

export interface UseAlgorithmReturn {
  algorithmState: AlgorithmState;
  recentlyEnqueued: SpotifyRecommendation[];
  localQueue: QueuedTrack[];
}

export interface UseAlgorithmOptions {
  musicProfile: MusicProfile;
  blocks: Block[];
  localId: string;
  localType: string;
  deviceId: string | null;
  currentTrack: WebPlaybackTrack | null;
  queueCount: number;
  enabled: boolean;
  dayStatuses: WeeklyDayStatus[];
  slotOverrides: WeeklySlotOverride[];
}

export function useAlgorithm({
  musicProfile,
  blocks,
  localId,
  localType,
  deviceId,
  currentTrack,
  queueCount,
  enabled,
  dayStatuses,
  slotOverrides,
}: UseAlgorithmOptions): UseAlgorithmReturn {
  const [algorithmState, setAlgorithmState] = useState<AlgorithmState>({
    status: 'idle',
    currentSlot: getCurrentTimeSlot(),
    queueCount: 0,
    lastEnqueuedAt: null,
    recentlyEnqueued: [],
    warningMessage: null,
    lastError: null,
  });

  const [recentlyEnqueued, setRecentlyEnqueued] = useState<SpotifyRecommendation[]>([]);
  const [localQueue, setLocalQueue] = useState<QueuedTrack[]>([]);

  // Refs para evitar re-renders en ciclos
  const isRunningRef = useRef(false);
  const previousTrackIdRef = useRef<string | null>(null);
  const safetyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localQueueLenRef = useRef(0);

  // Mantener ref del tamaño de la cola local sincronizado
  useEffect(() => { localQueueLenRef.current = localQueue.length; }, [localQueue]);

  // Ref para las dependencias del ciclo (evita recrear callbacks)
  const depsRef = useRef({ musicProfile, blocks, localId, localType, deviceId, dayStatuses, slotOverrides });
  useEffect(() => {
    depsRef.current = { musicProfile, blocks, localId, localType, deviceId, dayStatuses, slotOverrides };
  }, [musicProfile, blocks, localId, localType, deviceId, dayStatuses, slotOverrides]);

  /**
   * Ejecuta un ciclo de encolado completo.
   */
  const runCycle = useCallback(async (currentQueueCount: number) => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const { musicProfile: mp, blocks: bl, localId: lid, localType: lt, deviceId: did, dayStatuses: ds, slotOverrides: so } = depsRef.current;
    const cycleStart = Date.now();
    console.log(`[useAlgorithm] Ciclo iniciado — cola actual: ${currentQueueCount}, localQueue: ${localQueueLenRef.current}`);

    try {
      // Resolver perfil semanal antes de encolar
      const resolved = resolveProfileForNow(mp, ds, so);
      if (resolved.isClosed) {
        console.log('[useAlgorithm] Día/franja cerrada según planificador semanal — skip');
        setAlgorithmState((prev) => ({
          ...prev,
          status: 'idle',
          currentSlot: getCurrentTimeSlot(),
          warningMessage: 'Hoy está marcado como cerrado en el planificador semanal.',
        }));
        isRunningRef.current = false;
        return;
      }

      const resolvedProfile = resolved.profile;
      if (resolved.isCustom) {
        console.log(`[useAlgorithm] Usando perfil personalizado del planificador semanal`);
      }

      setAlgorithmState((prev) => ({
        ...prev,
        status: 'enqueueing',
        currentSlot: getCurrentTimeSlot(),
      }));

      // Obtener eventos recientes (ventana 4h) desde Supabase
      const recentEventsRaw = await getRecentEvents(lid);
      const recentEvents: SessionEvent[] = recentEventsRaw.map((e) => ({
        id: '',
        local_id: lid,
        spotify_track_id: e.spotify_track_id,
        track_name: e.track_name,
        artist_name: e.artist_name,
        genre: 'ROCK' as const, // el filtro solo usa spotify_track_id
        energy_level: 'medium' as const,
        played_at: e.played_at,
        time_slot: 'opening' as const,
        day_of_week: 0,
        source: 'algorithm' as const,
      }));

      const result = await runEnqueueCycle({
        musicProfile: resolvedProfile,
        blocks: bl,
        recentEvents,
        currentQueueCount,
        localId: lid,
        deviceId: did,
        localType: lt,
      });

      console.log(`[useAlgorithm] Ciclo completado en ${Date.now() - cycleStart}ms — encolados: ${result.enqueuedCount}, fallidos: ${result.failedCount}${result.warning ? `, warning: ${result.warning}` : ''}`);

      setAlgorithmState((prev) => ({
        ...prev,
        status: result.warning ? 'error' : 'running',
        queueCount: currentQueueCount + result.enqueuedCount,
        lastEnqueuedAt: result.enqueuedCount > 0 ? new Date() : prev.lastEnqueuedAt,
        warningMessage: result.warning,
        lastError: result.failedCount > 0
          ? `${result.failedCount} tracks fallaron al encolar`
          : null,
      }));

      if (result.enqueuedCount > 0 && result.enqueuedTracks.length > 0) {
        const newQueueItems: QueuedTrack[] = result.enqueuedTracks.map((t) => ({
          spotify_track_id: t.spotify_track_id,
          name: t.name,
          artist: t.artist,
          album: t.album,
          album_art_url: t.album_art_url,
          duration_ms: t.duration_ms,
        }));
        setLocalQueue((prev) => [...prev, ...newQueueItems]);
        setRecentlyEnqueued((prev) => prev.slice(-10));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error(`[useAlgorithm] Error en ciclo (${Date.now() - cycleStart}ms):`, message);
      setAlgorithmState((prev) => ({
        ...prev,
        status: 'error',
        lastError: message,
      }));
    } finally {
      isRunningRef.current = false;
    }
  }, []);

  /**
   * Evento: Track cambió (detectado por el SDK via useWebPlayback).
   * Persistir SessionEvent + evaluar si la cola necesita rellenarse.
   */
  useEffect(() => {
    if (!enabled || !currentTrack || !localId) return;

    const trackId = currentTrack.id;

    // Ignorar el primer track (inicialización)
    if (previousTrackIdRef.current === null) {
      previousTrackIdRef.current = trackId;
      // Pero sí evaluar cola en el arranque
      const effectiveQueue = Math.max(queueCount, localQueueLenRef.current);
      if (effectiveQueue < MIN_QUEUE_THRESHOLD) {
        runCycle(effectiveQueue);
      }
      return;
    }

    // Si el track no cambió, no hacer nada
    if (previousTrackIdRef.current === trackId) return;

    previousTrackIdRef.current = trackId;

    // Quitar el track que acaba de empezar a sonar de nuestra cola local
    setLocalQueue((prev) => {
      const idx = prev.findIndex((t) => t.spotify_track_id === trackId);
      if (idx !== -1) {
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      // Si no lo encontramos por ID, quitar el primero (orden FIFO)
      return prev.length > 0 ? prev.slice(1) : prev;
    });

    // Persistir SessionEvent (fire and forget — nunca bloquear reproducción)
    const slot = getCurrentTimeSlot();
    persistSessionEvent({
      local_id: localId,
      spotify_track_id: currentTrack.id,
      track_name: currentTrack.name,
      artist_name: currentTrack.artist,
      album_art_url: currentTrack.albumArtUrl,
      duration_ms: currentTrack.durationMs,
      time_slot: slot,
      day_of_week: new Date().getDay(),
      source: 'algorithm',
    });

    // Evaluar cola (usar tamaño real de nuestra cola local, -1 por el track que acabamos de quitar)
    const effectiveQueue = Math.max(queueCount, localQueueLenRef.current);
    if (effectiveQueue < MIN_QUEUE_THRESHOLD) {
      runCycle(effectiveQueue);
    }
  }, [currentTrack, enabled, localId, queueCount, runCycle]);

  /**
   * Evento: Cola bajó del umbral (sin cambio de track).
   * Puede pasar si Spotify avanza pero el SDK reporta menos tracks en cola.
   */
  useEffect(() => {
    if (!enabled || !deviceId) return;

    setAlgorithmState((prev) => ({
      ...prev,
      queueCount,
      currentSlot: getCurrentTimeSlot(),
      status: enabled ? (prev.status === 'idle' ? 'running' : prev.status) : 'idle',
    }));
  }, [queueCount, enabled, deviceId]);

  /**
   * Safety net: check cada 60 segundos como respaldo.
   */
  useEffect(() => {
    if (!enabled || !deviceId) {
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
      if (safetyIntervalRef.current) {
        clearInterval(safetyIntervalRef.current);
        safetyIntervalRef.current = null;
      }
    };
  }, [enabled, deviceId, queueCount, runCycle]);

  /**
   * Marcar idle cuando se pausa/deshabilita (pero NO borrar la cola)
   */
  useEffect(() => {
    if (!enabled) {
      setAlgorithmState((prev) => ({ ...prev, status: 'idle' }));
    }
  }, [enabled]);

  return {
    algorithmState,
    recentlyEnqueued,
    localQueue,
  };
}
