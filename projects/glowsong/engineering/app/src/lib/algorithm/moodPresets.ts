/**
 * F2 — Mood Presets por Tipo de Local y Franja Horaria
 *
 * IMPORTANTE: Los keywords son descriptores de MOOD/ENERGIA, no de género.
 * Los géneros ya los eligió el dueño del local en el onboarding.
 * Estos keywords modifican el VIBE de la búsqueda dentro de esos géneros.
 *
 * Ejemplo: Un bar que eligió jazz + soul:
 * - Opening → busca "genre:jazz OR genre:soul smooth chill"
 * - Peak    → busca "genre:jazz OR genre:soul party energy hits"
 *
 * El mismo jazz suena diferente: "chill jazz" vs "party jazz".
 */

import type { TimeSlot } from './timeSlots';

export type LocalType = 'bar' | 'pub' | 'cocteleria' | 'cerveceria' | 'restaurante' | 'discoteca' | 'otro';

export interface SlotMood {
  keywords: string[];
  description: string;
}

export type MoodPreset = Record<TimeSlot, SlotMood>;

export const MOOD_PRESETS: Record<LocalType, MoodPreset> = {
  bar: {
    opening:     { keywords: ['smooth', 'chill', 'relaxed'],           description: 'Apertura relajada — música suave de fondo' },
    afternoon:   { keywords: ['groovy', 'upbeat', 'feel good'],        description: 'Happy hour — ritmo que sube, ambiente animado' },
    early_night: { keywords: ['energy', 'vibes', 'upbeat'],            description: 'Noche temprana — la energía sube' },
    peak_night:  { keywords: ['party', 'hits', 'dance'],               description: 'Peak — máxima energía, todos bailando' },
    closing:     { keywords: ['mellow', 'slow', 'soft'],               description: 'Cierre — bajamos la intensidad' },
  },
  pub: {
    opening:     { keywords: ['chill', 'easy', 'mellow'],              description: 'Apertura tranquila — ambiente relajado' },
    afternoon:   { keywords: ['classic', 'upbeat', 'feel good'],       description: 'Tarde animada — clásicos y buena onda' },
    early_night: { keywords: ['energy', 'anthems', 'sing along'],      description: 'Noche — himnos para cantar' },
    peak_night:  { keywords: ['party', 'anthems', 'crowd'],            description: 'Peak — lo mejor para corear en grupo' },
    closing:     { keywords: ['slow', 'mellow', 'quiet'],              description: 'Cierre — bajando la energía' },
  },
  cocteleria: {
    opening:     { keywords: ['smooth', 'elegant', 'sophisticated'],   description: 'Apertura elegante — sofisticado y suave' },
    afternoon:   { keywords: ['smooth', 'warm', 'elegant'],            description: 'Tarde refinada — cálido y agradable' },
    early_night: { keywords: ['groovy', 'sexy', 'smooth'],             description: 'Noche — groovy y sofisticado' },
    peak_night:  { keywords: ['groovy', 'sexy', 'vibrant'],            description: 'Peak — vibrante pero elegante' },
    closing:     { keywords: ['mellow', 'soft', 'quiet'],              description: 'Cierre — suave y tranquilo' },
  },
  cerveceria: {
    opening:     { keywords: ['chill', 'easy', 'relaxed'],             description: 'Apertura casual — relajado' },
    afternoon:   { keywords: ['feel good', 'summer', 'upbeat'],        description: 'Tarde — buena onda, animado' },
    early_night: { keywords: ['energy', 'upbeat', 'fun'],              description: 'Noche — energía y diversión' },
    peak_night:  { keywords: ['party', 'sing along', 'hits'],          description: 'Peak — para cantar y celebrar' },
    closing:     { keywords: ['mellow', 'chill', 'soft'],              description: 'Cierre — tranquilo' },
  },
  restaurante: {
    opening:     { keywords: ['soft', 'gentle', 'background'],         description: 'Almuerzo — música suave de fondo' },
    afternoon:   { keywords: ['warm', 'elegant', 'smooth'],            description: 'Tarde — ambiente agradable' },
    early_night: { keywords: ['smooth', 'romantic', 'warm'],           description: 'Cena — romántico, conversacional' },
    peak_night:  { keywords: ['warm', 'sophisticated', 'smooth'],      description: 'Noche — sofisticado' },
    closing:     { keywords: ['quiet', 'soft', 'gentle'],              description: 'Cierre — minimalista' },
  },
  discoteca: {
    opening:     { keywords: ['chill', 'warm up', 'smooth'],           description: 'Warm up — calentando el ambiente' },
    afternoon:   { keywords: ['upbeat', 'groovy', 'build up'],         description: 'Build up — subiendo energía' },
    early_night: { keywords: ['dance', 'energy', 'vibes'],             description: 'Noche — la fiesta arranca' },
    peak_night:  { keywords: ['party', 'dance', 'hits', 'energy'],    description: 'Peak — máxima energía' },
    closing:     { keywords: ['chill', 'mellow', 'slow'],              description: 'After — bajando' },
  },
  otro: {
    opening:     { keywords: ['chill', 'background', 'easy'],          description: 'Apertura — música de fondo relajada' },
    afternoon:   { keywords: ['upbeat', 'feel good', 'positive'],      description: 'Tarde — positiva y animada' },
    early_night: { keywords: ['energy', 'fun', 'vibes'],               description: 'Noche — energía y diversión' },
    peak_night:  { keywords: ['party', 'hits', 'dance'],               description: 'Peak — hits bailables' },
    closing:     { keywords: ['mellow', 'soft', 'quiet'],              description: 'Cierre — suave y tranquilo' },
  },
};

/** Obtiene el mood para un tipo de local y franja horaria */
export function getMoodForSlot(localType: string, slot: TimeSlot): SlotMood {
  const type = (localType || 'otro') as LocalType;
  const preset = MOOD_PRESETS[type] || MOOD_PRESETS.otro;
  return preset[slot];
}
