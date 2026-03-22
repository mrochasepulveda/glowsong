/**
 * Weekly Resolver
 * Resuelve qué perfil musical usar según el día de la semana y la franja horaria.
 *
 * Flujo:
 * 1. Chequea si el día está cerrado (weekly_day_status)
 * 2. Busca override para (día, franja) en weekly_slot_overrides
 * 3. Si hay override → mergea sobre el perfil default
 * 4. Si no → retorna el perfil default sin cambios
 */

import type { Genre, LocalType, EnergyLevel, MusicProfile, WeeklyDayStatus, WeeklySlotOverride } from '@/types';
import { getCurrentTimeSlot, type TimeSlot } from './timeSlots';

// ── Genre energy classification ──
const CHILL_GENRES: Set<Genre> = new Set([
  'JAZZ', 'BLUES', 'BOSSA_NOVA', 'CLASICA', 'FOLK', 'BOLERO', 'SOUL', 'TANGO',
]);
const MEDIUM_GENRES: Set<Genre> = new Set([
  'POP', 'INDIE', 'ALTERNATIVO', 'R_AND_B', 'LATIN_POP', 'COUNTRY',
  'MUSICA_CHILENA', 'FLAMENCO', 'ROCK', 'FUNK',
]);
// Everything else is upbeat: ELECTRONICA, REGGAETON, CUMBIA, SALSA, HIP_HOP, BACHATA, MERENGUE

function classifyGenres(genres: Genre[]): { chill: Genre[]; medium: Genre[]; upbeat: Genre[] } {
  const chill: Genre[] = [];
  const medium: Genre[] = [];
  const upbeat: Genre[] = [];
  for (const g of genres) {
    if (CHILL_GENRES.has(g)) chill.push(g);
    else if (MEDIUM_GENRES.has(g)) medium.push(g);
    else upbeat.push(g);
  }
  return { chill, medium, upbeat };
}

/** Pick genres appropriate for the energy level, falling back to all if none match */
function pickGenresForEnergy(
  classified: ReturnType<typeof classifyGenres>,
  energy: EnergyLevel,
  allGenres: Genre[]
): Genre[] {
  if (energy === 'low') {
    const pool = [...classified.chill, ...classified.medium];
    return pool.length > 0 ? pool : allGenres;
  }
  if (energy === 'medium') {
    const pool = [...classified.medium, ...classified.chill.slice(0, 2), ...classified.upbeat.slice(0, 2)];
    return pool.length > 0 ? pool : allGenres;
  }
  if (energy === 'high') {
    const pool = [...classified.upbeat, ...classified.medium];
    return pool.length > 0 ? pool : allGenres;
  }
  return allGenres;
}

// ── Energy templates per local type & time slot ──
type EnergyTemplate = Record<TimeSlot, EnergyLevel | 'closed'>;

const ENERGY_TEMPLATES: Record<LocalType, EnergyTemplate> = {
  restaurante: {
    opening: 'low', afternoon: 'low', early_night: 'medium', peak_night: 'medium', closing: 'closed',
  },
  bar: {
    opening: 'closed', afternoon: 'low', early_night: 'medium', peak_night: 'high', closing: 'medium',
  },
  pub: {
    opening: 'closed', afternoon: 'low', early_night: 'medium', peak_night: 'high', closing: 'medium',
  },
  cocteleria: {
    opening: 'closed', afternoon: 'low', early_night: 'medium', peak_night: 'high', closing: 'medium',
  },
  cerveceria: {
    opening: 'low', afternoon: 'medium', early_night: 'medium', peak_night: 'high', closing: 'low',
  },
  discoteca: {
    opening: 'closed', afternoon: 'closed', early_night: 'medium', peak_night: 'high', closing: 'high',
  },
  otro: {
    opening: 'low', afternoon: 'medium', early_night: 'medium', peak_night: 'high', closing: 'low',
  },
};

// Days typically closed per local type (0=Sun, 1=Mon, ... 6=Sat)
const CLOSED_DAYS: Partial<Record<LocalType, number[]>> = {
  restaurante: [1],      // Lunes
  bar: [1],              // Lunes
  pub: [1],              // Lunes
  cerveceria: [1],       // Lunes
  cocteleria: [0, 1],    // Domingo, Lunes
  discoteca: [1, 2, 3],  // Lun, Mar, Mié
};

const ALL_SLOTS: TimeSlot[] = ['opening', 'afternoon', 'early_night', 'peak_night', 'closing'];

// Each slot's start hour (24h format). For slots crossing midnight, closing starts at 2.
const SLOT_START_HOURS: Record<TimeSlot, number> = {
  opening: 12,
  afternoon: 17,
  early_night: 20,
  peak_night: 23,
  closing: 2,
};

const SLOT_END_HOURS: Record<TimeSlot, number> = {
  opening: 17,
  afternoon: 20,
  early_night: 23,
  peak_night: 2,   // crosses midnight
  closing: 6,
};

/**
 * Checks if a time slot overlaps with the local's operating hours.
 * Handles midnight crossing for both the slot and the operating hours.
 */
function isSlotWithinOperatingHours(
  slot: TimeSlot,
  openHour: number,
  closeHour: number
): boolean {
  const slotStart = SLOT_START_HOURS[slot];
  const slotEnd = SLOT_END_HOURS[slot];

  // Normalize to a timeline where open=0 and we count forward
  // This handles midnight crossing for both operating hours and slots
  const normalize = (hour: number, reference: number): number => {
    let h = hour - reference;
    if (h < 0) h += 24;
    return h;
  };

  const opDuration = normalize(closeHour, openHour);
  const slotStartNorm = normalize(slotStart, openHour);
  const slotEndNorm = normalize(slotEnd, openHour);

  // The slot overlaps if either its start or end falls within the operating window
  // Or if the operating window falls entirely within the slot
  if (slotStartNorm < opDuration) return true;
  if (slotEndNorm > 0 && slotEndNorm <= opDuration) return true;

  return false;
}

/** Parse "HH:mm" to hour number */
function parseHour(time: string): number {
  const [h] = time.split(':').map(Number);
  return h;
}

/**
 * Genera una planificación semanal inteligente basada en el tipo de local,
 * géneros seleccionados y horario de operación.
 */
export function generateSmartDefaults(
  localId: string,
  localType: LocalType,
  genres: Genre[],
  openTime?: string,
  closeTime?: string
): { dayStatuses: WeeklyDayStatus[]; slotOverrides: WeeklySlotOverride[] } {
  const classified = classifyGenres(genres);
  const template = ENERGY_TEMPLATES[localType] ?? ENERGY_TEMPLATES.otro;
  const closedDays = CLOSED_DAYS[localType] ?? [];

  const openHour = openTime ? parseHour(openTime) : null;
  const closeHour = closeTime ? parseHour(closeTime) : null;
  const hasHours = openHour !== null && closeHour !== null;

  const dayStatuses: WeeklyDayStatus[] = closedDays.map((day) => ({
    local_id: localId,
    day_of_week: day,
    is_closed: true,
  }));

  const slotOverrides: WeeklySlotOverride[] = [];
  const allDays = [0, 1, 2, 3, 4, 5, 6];

  for (const day of allDays) {
    if (closedDays.includes(day)) continue;

    for (const slot of ALL_SLOTS) {
      // Check if slot is outside operating hours
      const outsideHours = hasHours && !isSlotWithinOperatingHours(slot, openHour!, closeHour!);
      const energySetting = template[slot];

      if (outsideHours || energySetting === 'closed') {
        slotOverrides.push({
          local_id: localId,
          day_of_week: day,
          time_slot: slot,
          is_closed: true,
          genres: null,
          energy_level: null,
        });
      } else {
        const slotGenres = pickGenresForEnergy(classified, energySetting as EnergyLevel, genres);
        slotOverrides.push({
          local_id: localId,
          day_of_week: day,
          time_slot: slot,
          is_closed: false,
          genres: slotGenres,
          energy_level: energySetting as EnergyLevel,
        });
      }
    }
  }

  return { dayStatuses, slotOverrides };
}

export interface ResolvedProfile {
  profile: MusicProfile;
  isClosed: boolean;
  isCustom: boolean;
  activeOverride: WeeklySlotOverride | null;
}

/**
 * Obtiene el día de la semana actual en timezone Chile/Santiago.
 * Retorna 0=Sunday, 1=Monday, ..., 6=Saturday (misma convención que JS Date.getDay()).
 */
export function getCurrentDayOfWeek(now?: Date): number {
  const date = now ?? new Date();

  const dayStr = date.toLocaleString('en-US', {
    timeZone: 'America/Santiago',
    weekday: 'short',
  });

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  return dayMap[dayStr] ?? date.getDay();
}

/**
 * Resuelve el perfil musical que debe usar el algoritmo AHORA,
 * considerando el día de la semana y la franja horaria actual.
 */
export function resolveProfileForNow(
  defaultProfile: MusicProfile,
  dayStatuses: WeeklyDayStatus[] | null,
  slotOverrides: WeeklySlotOverride[] | null,
  overrideSlot?: TimeSlot,
  overrideDay?: number
): ResolvedProfile {
  const currentDay = overrideDay ?? getCurrentDayOfWeek();
  const currentSlot = overrideSlot ?? getCurrentTimeSlot();

  // 1. Chequear si el día completo está cerrado
  if (dayStatuses && dayStatuses.length > 0) {
    const dayStatus = dayStatuses.find((d) => d.day_of_week === currentDay);
    if (dayStatus?.is_closed) {
      return {
        profile: defaultProfile,
        isClosed: true,
        isCustom: false,
        activeOverride: null,
      };
    }
  }

  // 2. Buscar override para (día, franja)
  if (!slotOverrides || slotOverrides.length === 0) {
    return {
      profile: defaultProfile,
      isClosed: false,
      isCustom: false,
      activeOverride: null,
    };
  }

  const override = slotOverrides.find(
    (o) => o.day_of_week === currentDay && o.time_slot === currentSlot
  );

  if (!override) {
    return {
      profile: defaultProfile,
      isClosed: false,
      isCustom: false,
      activeOverride: null,
    };
  }

  // 3. Si la franja específica está cerrada
  if (override.is_closed) {
    return {
      profile: defaultProfile,
      isClosed: true,
      isCustom: false,
      activeOverride: override,
    };
  }

  // 4. Mergear campos non-null del override sobre el perfil default
  const hasCustomGenres = override.genres !== null && override.genres.length > 0;
  const hasCustomEnergy = override.energy_level !== null;

  if (!hasCustomGenres && !hasCustomEnergy) {
    // Override existe pero no tiene datos custom → tratar como default
    return {
      profile: defaultProfile,
      isClosed: false,
      isCustom: false,
      activeOverride: override,
    };
  }

  const mergedProfile: MusicProfile = {
    ...defaultProfile,
    ...(hasCustomGenres ? { allowed_genres: override.genres! } : {}),
    ...(hasCustomEnergy ? { energy_level: override.energy_level! } : {}),
  };

  return {
    profile: mergedProfile,
    isClosed: false,
    isCustom: true,
    activeOverride: override,
  };
}
