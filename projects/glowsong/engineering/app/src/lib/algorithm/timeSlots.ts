/**
 * F2 — Time Slots
 * Define las franjas horarias y los parámetros de energía correspondientes.
 * Zona horaria: Chile/Santiago (UTC-3, ajusta por DST automáticamente si se usa toLocaleString).
 */

export type TimeSlot =
  | 'opening'     // 12:00–17:00 → energy low
  | 'afternoon'   // 17:00–20:00 → energy medium
  | 'early_night' // 20:00–23:00 → energy high
  | 'peak_night'  // 23:00–02:00 → energy high
  | 'closing';    // 02:00–06:00 → energy medium-low

export interface EnergyParams {
  minEnergy: number;
  maxEnergy: number;
  minTempo: number;
  maxTempo: number;
  targetEnergy: number;
  targetTempo: number;
}

export const TIME_SLOT_PARAMS: Record<TimeSlot, EnergyParams> = {
  opening: {
    minEnergy: 0,    maxEnergy: 0.4,
    minTempo: 60,    maxTempo: 110,
    targetEnergy: 0.25, targetTempo: 88,
  },
  afternoon: {
    minEnergy: 0.4,  maxEnergy: 0.7,
    minTempo: 100,   maxTempo: 130,
    targetEnergy: 0.55, targetTempo: 116,
  },
  early_night: {
    minEnergy: 0.65, maxEnergy: 1.0,
    minTempo: 115,   maxTempo: 180,
    targetEnergy: 0.78, targetTempo: 128,
  },
  peak_night: {
    minEnergy: 0.7,  maxEnergy: 1.0,
    minTempo: 120,   maxTempo: 180,
    targetEnergy: 0.85, targetTempo: 134,
  },
  closing: {
    minEnergy: 0,    maxEnergy: 0.5,
    minTempo: 60,    maxTempo: 115,
    targetEnergy: 0.35, targetTempo: 96,
  },
};

/**
 * Calcula la franja horaria actual en hora de Chile (UTC-3).
 * Maneja el cruce de medianoche correctamente.
 */
export function getCurrentTimeSlot(now?: Date): TimeSlot {
  const date = now ?? new Date();

  // Hora en Chile en formato 24h
  const chileanHour = parseInt(
    date.toLocaleString('en-US', {
      timeZone: 'America/Santiago',
      hour: 'numeric',
      hour12: false,
    }),
    10
  );

  // Un valor de 24 puede volver como 0 en algunos engines
  const h = chileanHour === 24 ? 0 : chileanHour;

  if (h >= 12 && h < 17) return 'opening';
  if (h >= 17 && h < 20) return 'afternoon';
  if (h >= 20 && h < 23) return 'early_night';
  if (h >= 23 || h < 2)  return 'peak_night';   // 23–01:59
  if (h >= 2  && h < 6)  return 'closing';

  // Entre 06:00 y 12:00 (antes de apertura) → como opening
  return 'opening';
}

/**
 * Devuelve los parámetros de energía para una franja dada,
 * pudiendo sobreescribir con el nivel fijo del MusicProfile.
 */
export function getEnergyParamsForSlot(
  slot: TimeSlot,
  fixedEnergyLevel?: 'low' | 'medium' | 'high' | 'auto'
): EnergyParams {
  if (!fixedEnergyLevel || fixedEnergyLevel === 'auto') {
    return TIME_SLOT_PARAMS[slot];
  }

  // Si el Owner configuró un nivel fijo, mapear a parámetros
  const fixed: Record<'low' | 'medium' | 'high', EnergyParams> = {
    low:    TIME_SLOT_PARAMS.opening,
    medium: TIME_SLOT_PARAMS.afternoon,
    high:   TIME_SLOT_PARAMS.peak_night,
  };

  return fixed[fixedEnergyLevel];
}
