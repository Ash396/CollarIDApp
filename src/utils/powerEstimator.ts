// utils/powerEstimator.ts
import type { Schedule } from "../navigation/ScheduleNavigator";

/** ---------- Constants (fake-but-plausible model) ---------- **/

// mW constants (from your slide / approximations)
const BASE_CORE_MW = 2.8;
const ACCEL_LUX_MW = 1.4;
const ENV_MW = 0.3;

const MIC_FULL_MW = 1.9;

const GPS_ACQ_MW = 53.6;
const GPS_STANDBY_MW = 0.4;

const PARTICULATE_INTEGRATION_MW = 87;
const PARTICULATE_STANDBY_MW = 0.1;

// Very rough placeholder for “always-on” radio / LoRa overhead
const LORA_BASE_MW = 3.0;

// Solar panel output assumption (mWh per “solar hour”)
const SOLAR_PANEL_OUTPUT_PER_HOUR_MWH = 30;

/** ---------- Helpers ---------- **/

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * Map an interval in [minInterval, maxInterval] minutes
 * to a factor in [1.0, 0.1] (shorter interval => higher duty).
 */
function intervalDutyFactor(
  intervalMin: number,
  minInterval: number,
  maxInterval: number
): number {
  const clamped = clamp(intervalMin, minInterval, maxInterval);
  const t = (clamped - minInterval) / (maxInterval - minInterval); // 0..1
  return 1.0 - 0.9 * t; // 1.0 at minInterval, 0.1 at maxInterval
}

/**
 * Compute the number of active hours for a window.
 * Handles wraparound (e.g., 20 -> 4 => 8 hours).
 */
function computeWindowHours(startHour?: number, endHour?: number): number {
  const s = clamp(startHour ?? 0, 0, 23);
  const e = clamp(endHour ?? 23, 0, 23);

  if (s === e) {
    // treat as full day if equal — or you can choose 0
    return 24;
  }

  const diff = (e - s + 24) % 24;
  return diff > 0 ? diff : 24;
}

/** ---------- Types for breakdown ---------- **/

export type ComponentKey =
  | "base"
  | "gps"
  | "lora"
  | "particulate"
  | "microphone"
  | "accelerometer"
  | "lightEnv";

export type ComponentContribution = {
  key: ComponentKey;
  label: string;
  mW: number; // average mW during the active window
};

export type SchedulePowerBreakdown = {
  schedule: Schedule;
  activeHours: number;
  components: ComponentContribution[];
  totalMilliwatts: number;
};

export type SystemSolarEstimate = {
  totalSolarHoursPerDay: number;
  perSchedule: {
    id?: string;
    name?: string;
    solarHoursPerDay: number;
  }[];
  components: {
    key: ComponentKey;
    label: string;
    share: number; // 0..1 fraction of total (for heaviest schedule)
  }[];
};

/** ---------- Core per-schedule power model ---------- **/

export function computeSchedulePower(schedule: Schedule): SchedulePowerBreakdown {
  const hours = computeWindowHours(
    schedule.window?.startHour,
    schedule.window?.endHour
  );

  const components: ComponentContribution[] = [];

  // Base + accel + env (always on while schedule is active)
  const base_mW = BASE_CORE_MW + ACCEL_LUX_MW + ENV_MW;
  components.push({
    key: "base",
    label: "Base + Accel + Env",
    mW: base_mW,
  });

  // Light + Environmental intervals (we’ll treat them as part of base load;
  // if you want, you can tweak this later to respond to sampling intervals)

  // GPS
  let gps_mW = 0;
  if (schedule.gps?.enabled) {
    const gpsInterval = clamp(schedule.gps.sampleIntervalMin ?? 60, 1, 12 * 60); // 1..720
    const factor = intervalDutyFactor(gpsInterval, 1, 12 * 60);
    gps_mW =
      GPS_STANDBY_MW + (GPS_ACQ_MW - GPS_STANDBY_MW) * factor; // standby + bursts
  }
  components.push({
    key: "gps",
    label: "GPS",
    mW: gps_mW,
  });

  // Particulate
  let particulate_mW = 0;
  if (schedule.particulate?.enabled) {
    const partInterval = clamp(
      schedule.particulate.sampleIntervalMin ?? 30,
      1,
      12 * 60
    );
    const factor = intervalDutyFactor(partInterval, 1, 12 * 60);
    particulate_mW =
      PARTICULATE_STANDBY_MW +
      (PARTICULATE_INTEGRATION_MW - PARTICULATE_STANDBY_MW) * factor;
  }
  components.push({
    key: "particulate",
    label: "Particulate",
    mW: particulate_mW,
  });

  // Microphone – duty-cycled based on sample_length / sample_window
  let mic_mW = 0;
  if (schedule.microphone?.enabled) {
    const rawWindow = schedule.microphone.sampleWindowMin ?? 10;
    const sampleWindow = clamp(rawWindow, 1, 60);
    const rawLength = schedule.microphone.sampleLengthMin ?? 1;
    const sampleLength = clamp(rawLength, 1, sampleWindow);

    const duty = sampleLength / sampleWindow; // e.g., 1/10 => 10% active
    mic_mW = MIC_FULL_MW * duty;
  }
  components.push({
    key: "microphone",
    label: "Microphone",
    mW: mic_mW,
  });

  // Accelerometer – small bump if 50 Hz vs 25 Hz
  let accelExtra_mW = 0;
  if (schedule.accelerometer?.enabled) {
    // proto enum: 0 => 25Hz, 1 => 50Hz
    const srEnum = schedule.accelerometer.sampleRate ?? 0;
    const is50Hz = srEnum === 1;
    accelExtra_mW = is50Hz ? 0.5 : 0.2; // tweakable
  }
  components.push({
    key: "accelerometer",
    label: "Accelerometer",
    mW: accelExtra_mW,
  });

  // Light & Env “extra” (if you want them adjustable later)
  components.push({
    key: "lightEnv",
    label: "Light & Environmental",
    mW: 0, // already roughly “inside” base; you can make this respond to intervals later
  });

  // LoRa – placeholder constant for now
  components.push({
    key: "lora",
    label: "LoRa Radio",
    mW: LORA_BASE_MW,
  });

  const total_mW = components.reduce((sum, c) => sum + c.mW, 0);

  return {
    schedule,
    activeHours: hours,
    components,
    totalMilliwatts: total_mW,
  };
}

/** ---------- Solar hours per schedule ---------- **/

export function estimateScheduleSolarHours(schedule: Schedule): number {
  const breakdown = computeSchedulePower(schedule);

  // mWh per day for this schedule, assuming its config applies
  const mWhPerDay = breakdown.totalMilliwatts * breakdown.activeHours;
  const solarHours =
    mWhPerDay / SOLAR_PANEL_OUTPUT_PER_HOUR_MWH || 0;

  return solarHours;
}

/** ---------- System-level estimate (for Power tab) ---------- **/

export function estimateSystemSolarHours(
  schedules: Schedule[]
): SystemSolarEstimate {
  if (!schedules.length) {
    return {
      totalSolarHoursPerDay: 0,
      perSchedule: [],
      components: [],
    };
  }

  const perScheduleBreakdowns = schedules.map((s) =>
    computeSchedulePower(s)
  );

  const perScheduleSolar = perScheduleBreakdowns.map((b) => {
    const mWhPerDay = b.totalMilliwatts * b.activeHours;
    const solarHours =
      mWhPerDay / SOLAR_PANEL_OUTPUT_PER_HOUR_MWH || 0;

    return {
      id: (b.schedule as any).id,
      name: (b.schedule as any).name,
      solarHoursPerDay: solarHours,
    };
  });

  // For now, assume the “worst” schedule dictates panel requirement
  const heaviest = perScheduleBreakdowns.reduce((max, curr) => {
    const max_mWh = max.totalMilliwatts * max.activeHours;
    const curr_mWh = curr.totalMilliwatts * curr.activeHours;
    return curr_mWh > max_mWh ? curr : max;
  }, perScheduleBreakdowns[0]);

  const heaviest_mWhPerDay =
    heaviest.totalMilliwatts * heaviest.activeHours;
  const totalSolarHoursPerDay =
    heaviest_mWhPerDay / SOLAR_PANEL_OUTPUT_PER_HOUR_MWH || 0;

  const totalHeaviest_mW = heaviest.components.reduce(
    (sum, c) => sum + c.mW,
    0
  );

  const components = heaviest.components.map((c) => ({
    key: c.key,
    label: c.label,
    share: totalHeaviest_mW > 0 ? c.mW / totalHeaviest_mW : 0,
  }));

  return {
    totalSolarHoursPerDay,
    perSchedule: perScheduleSolar,
    components,
  };
}
