'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DAY_LABELS_FULL,
  TIME_SLOT_LABELS,
  type Genre,
  type EnergyLevel,
  type LocalType,
  type TimeSlot,
  type WeeklyDayStatus,
  type WeeklySlotOverride,
  type DaySchedule,
  type SlotConfig,
} from '@/types';
import { generateSmartDefaults } from '@/lib/algorithm/weeklyResolver';
import styles from './SettingsView.module.css';
import p from './WeeklyPlanner.module.css';

// ── Constants ──
const ALL_TIME_SLOTS: TimeSlot[] = ['opening', 'afternoon', 'early_night', 'peak_night', 'closing'];
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun

const SLOT_HOURS: Record<TimeSlot, { start: string; end: string; durationH: number }> = {
  opening:     { start: '12:00', end: '17:00', durationH: 5 },
  afternoon:   { start: '17:00', end: '20:00', durationH: 3 },
  early_night: { start: '20:00', end: '23:00', durationH: 3 },
  peak_night:  { start: '23:00', end: '02:00', durationH: 3 },
  closing:     { start: '02:00', end: '06:00', durationH: 4 },
};

const ENERGY_SOLID: Record<string, string> = {
  low: '#60A5FA',
  medium: '#C8A96E',
  high: '#F87171',
};

const ENERGY_BG: Record<string, string> = {
  low: 'rgba(96, 165, 250, 0.18)',
  medium: 'rgba(200, 169, 110, 0.18)',
  high: 'rgba(248, 113, 113, 0.18)',
};

const VIBE: Record<string, { emoji: string; label: string; desc: string }> = {
  low:    { emoji: '☕', label: 'Relax',   desc: 'Conversación tranquila' },
  medium: { emoji: '🎵', label: 'Vibra',   desc: 'Buena onda, disfrutando' },
  high:   { emoji: '🔥', label: 'Fuego',   desc: 'Energía al máximo' },
};

const ENERGY_CYCLE: EnergyLevel[] = ['low', 'medium', 'high'];

// ── Helpers ──
function buildDaySchedule(
  day: number,
  dayStatuses: WeeklyDayStatus[],
  slotOverrides: WeeklySlotOverride[]
): DaySchedule {
  const dayStatus = dayStatuses.find((d) => d.day_of_week === day);
  const isClosed = dayStatus?.is_closed ?? false;
  const slots = {} as Record<TimeSlot, SlotConfig>;
  for (const slot of ALL_TIME_SLOTS) {
    const ov = slotOverrides.find((o) => o.day_of_week === day && o.time_slot === slot);
    if (!ov) {
      slots[slot] = { mode: 'default', genres: null, energy_level: null };
    } else if (ov.is_closed) {
      slots[slot] = { mode: 'closed', genres: null, energy_level: null };
    } else if ((ov.genres && ov.genres.length > 0) || ov.energy_level !== null) {
      slots[slot] = { mode: 'custom', genres: ov.genres as Genre[] | null, energy_level: ov.energy_level as EnergyLevel | null };
    } else {
      slots[slot] = { mode: 'default', genres: null, energy_level: null };
    }
  }
  return { day_of_week: day, is_closed: isClosed, slots };
}

function nextEnergy(current: EnergyLevel | null): EnergyLevel {
  if (!current || current === 'auto') return 'medium';
  const idx = ENERGY_CYCLE.indexOf(current);
  return ENERGY_CYCLE[(idx + 1) % ENERGY_CYCLE.length];
}

// ── Component ──
interface WeeklyPlannerProps {
  dayStatuses: WeeklyDayStatus[];
  slotOverrides: WeeklySlotOverride[];
  defaultGenres: Genre[];
  onChange: (dayStatuses: WeeklyDayStatus[], slotOverrides: WeeklySlotOverride[]) => void;
  localId: string;
  localType: LocalType;
  openTime: string;
  closeTime: string;
}

export function WeeklyPlanner({
  dayStatuses, slotOverrides, defaultGenres, onChange,
  localId, localType, openTime, closeTime,
}: WeeklyPlannerProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const schedules = useMemo(() => {
    const map: Record<number, DaySchedule> = {};
    for (const day of ALL_DAYS) map[day] = buildDaySchedule(day, dayStatuses, slotOverrides);
    return map;
  }, [dayStatuses, slotOverrides]);

  const emit = useCallback(
    (ds: WeeklyDayStatus[], so: WeeklySlotOverride[]) => onChange(ds, so),
    [onChange]
  );

  const toggleDayClosed = useCallback((day: number) => {
    const wasClosed = schedules[day].is_closed;
    const newDs = dayStatuses.filter((d) => d.day_of_week !== day);
    if (!wasClosed) {
      newDs.push({ local_id: localId, day_of_week: day, is_closed: true });
      emit(newDs, slotOverrides);
    } else {
      const { slotOverrides: smart } = generateSmartDefaults(localId, localType, defaultGenres, openTime, closeTime);
      const daySlots = smart.filter((o) => o.day_of_week === day);
      const others = slotOverrides.filter((o) => o.day_of_week !== day);
      emit(newDs, [...others, ...daySlots]);
    }
    if (expandedDay === day) setExpandedDay(null);
  }, [schedules, dayStatuses, slotOverrides, localId, localType, defaultGenres, openTime, closeTime, emit, expandedDay]);

  const cycleSlotEnergy = useCallback((day: number, slot: TimeSlot) => {
    const ov = slotOverrides.find((o) => o.day_of_week === day && o.time_slot === slot);
    if (!ov || ov.is_closed) return;
    const updated = slotOverrides.map((o) =>
      o.day_of_week === day && o.time_slot === slot
        ? { ...o, energy_level: nextEnergy(o.energy_level as EnergyLevel | null) }
        : o
    );
    emit(dayStatuses, updated);
  }, [slotOverrides, dayStatuses, emit]);

  // Calculate total hours for proportional widths
  const totalH = ALL_TIME_SLOTS.reduce((sum, s) => sum + SLOT_HOURS[s].durationH, 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className={styles.cardHeaderText}>
          <h2 className={styles.cardTitle}>Curva de Energía Semanal</h2>
          <p className={styles.cardDescription}>
            Define cómo se siente la música en cada momento del día. Haz clic en una zona para cambiar la intensidad.
          </p>
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Legend */}
        <div className={p.legend}>
          {ENERGY_CYCLE.map((e) => (
            <span key={e} className={p.legendItem}>
              <span className={p.legendEmoji}>{VIBE[e].emoji}</span>
              <span className={p.legendLabel} style={{ color: ENERGY_SOLID[e] }}>{VIBE[e].label}</span>
              <span className={p.legendDesc}>{VIBE[e].desc}</span>
            </span>
          ))}
        </div>

        {/* Day rows */}
        <div className={p.dayRows}>
          {ALL_DAYS.map((day) => {
            const schedule = schedules[day];
            const isClosed = schedule.is_closed;
            const isExpanded = expandedDay === day;

            // Get active (non-closed) slots for this day
            const activeSlots = ALL_TIME_SLOTS.filter((s) => schedule.slots[s].mode !== 'closed');

            return (
              <div key={day} className={`${p.dayRow} ${isClosed ? p.dayRowClosed : ''} ${isExpanded ? p.dayRowExpanded : ''}`}>
                {/* Day header */}
                <div className={p.dayHeader}>
                  <button
                    type="button"
                    className={p.dayName}
                    onClick={() => !isClosed && setExpandedDay(isExpanded ? null : day)}
                  >
                    {DAY_LABELS_FULL[day]}
                  </button>
                  <label className={p.toggle}>
                    <input
                      type="checkbox"
                      checked={!isClosed}
                      onChange={() => toggleDayClosed(day)}
                      className={p.toggleInput}
                    />
                    <span className={p.toggleTrack}>
                      <span className={p.toggleThumb} />
                    </span>
                    <span className={`${p.toggleText} ${isClosed ? p.toggleTextClosed : ''}`}>
                      {isClosed ? 'Cerrado' : 'Abierto'}
                    </span>
                  </label>
                </div>

                {/* Timeline bar */}
                {!isClosed && (
                  <div className={p.timeline}>
                    {ALL_TIME_SLOTS.map((slot) => {
                      const config = schedule.slots[slot];
                      const slotClosed = config.mode === 'closed';
                      const energy = (config.energy_level ?? 'medium') as string;
                      const vibe = VIBE[energy] ?? VIBE.medium;
                      const widthPct = (SLOT_HOURS[slot].durationH / totalH) * 100;
                      const isActive = activeSlots.includes(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`${p.segment} ${slotClosed ? p.segmentClosed : ''}`}
                          style={{
                            width: `${widthPct}%`,
                            background: slotClosed ? 'rgba(255,255,255,0.02)' : ENERGY_BG[energy],
                            borderColor: slotClosed ? 'transparent' : `${ENERGY_SOLID[energy]}33`,
                          }}
                          onClick={() => !slotClosed && cycleSlotEnergy(day, slot)}
                          disabled={slotClosed}
                          title={slotClosed ? 'Fuera de horario' : `${TIME_SLOT_LABELS[slot]}: ${vibe.desc} — clic para cambiar`}
                        >
                          {!slotClosed && isActive && (
                            <>
                              <span className={p.segmentEmoji}>{vibe.emoji}</span>
                              <span className={p.segmentTime}>{SLOT_HOURS[slot].start}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                    {/* End time marker */}
                    <span className={p.timeEnd}>
                      {SLOT_HOURS[ALL_TIME_SLOTS[ALL_TIME_SLOTS.length - 1]].end}
                    </span>
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && !isClosed && (
                  <div className={p.detail}>
                    {ALL_TIME_SLOTS.map((slot) => {
                      const config = schedule.slots[slot];
                      const slotClosed = config.mode === 'closed';
                      const energy = (config.energy_level ?? 'medium') as string;
                      const vibe = VIBE[energy] ?? VIBE.medium;
                      const color = ENERGY_SOLID[energy] ?? '#C8A96E';

                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`${p.detailSlot} ${slotClosed ? p.detailSlotClosed : ''}`}
                          onClick={() => !slotClosed && cycleSlotEnergy(day, slot)}
                          disabled={slotClosed}
                        >
                          <span className={p.detailTime}>
                            {SLOT_HOURS[slot].start} – {SLOT_HOURS[slot].end}
                          </span>
                          {slotClosed ? (
                            <span className={p.detailClosed}>Fuera de horario</span>
                          ) : (
                            <>
                              <span className={p.detailVibe}>
                                <span>{vibe.emoji}</span>
                                <span style={{ color }}>{vibe.desc}</span>
                              </span>
                              <span className={p.detailEnergy} style={{ background: `${color}22`, color }}>
                                {vibe.label}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Closed overlay */}
                {isClosed && (
                  <div className={p.closedBar}>
                    <span>Cerrado este día</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
