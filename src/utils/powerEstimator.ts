// utils/powerEstimator.ts
import type { Schedule } from "../navigation/ScheduleNavigator";

export type PowerBreakdown = {
  totalSolarHours: number;
  components: {
    gps: number;
    lora: number;
    particulate: number;
    microphone: number;
    accelerometer: number;
    lightEnv: number;
  };
};

/** Clamp helper */
function clamp(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

/** Hours in a schedule window, handling overnight windows. */
function windowHours(window: { startHour: number; endHour: number }): number {
  const start = clamp(window.startHour ?? 0, 0, 23);
  const end = clamp(window.endHour ?? 0, 0, 23);
  let diff = end - start;
  if (diff <= 0) diff += 24;
  return diff;
}

/**
 * Estimate solar-hours per day for a single schedule.
 * Placeholder model (easy to tweak later).
 */
export function estimateScheduleSolar(schedule: Schedule): PowerBreakdown {
  const hours = schedule.window
    ? windowHours(schedule.window)
    : 24;

  const fracDay = hours / 24;

  // ---- Placeholder base weights (tune with mentor later) ----
  const GPS_BASE = 2.0;           // at 1 min interval over full day
  const LORA_BASE = 1.5;          // roughly tied to GPS / transmit activity
  const PARTICULATE_BASE = 1.6;   // PM sensor, 1 min interval full day
  const MIC_BASE = 2.2;           // microphone at full duty
  const ACCEL_BASE = 0.8;         // accelerometer baseline
  const LIGHT_ENV_BASE = 0.7;     // lux + environmental baseline

  // ---- GPS ----
  let gpsHours = 0;
  if (schedule.gps?.enabled) {
    const gpsInterval = clamp(schedule.gps.sampleIntervalMin ?? 10, 1, 12 * 60);
    const norm = Math.sqrt(1 / gpsInterval); // slower decay than linear
    gpsHours = fracDay * GPS_BASE * norm;
  }

  // ---- LoRa (fake, derived from GPS interval for now) ----
  let loraHours = 0;
  if (schedule.gps?.enabled) {
    const txInterval = clamp(schedule.gps.sampleIntervalMin ?? 30, 1, 12 * 60);
    const norm = Math.sqrt(1 / txInterval);
    loraHours = fracDay * LORA_BASE * norm;
  }

  // ---- Particulate ----
  let particulateHours = 0;
  if (schedule.particulate?.enabled) {
    const pInterval = clamp(
      schedule.particulate.sampleIntervalMin ?? 15,
      1,
      12 * 60
    );
    const norm = Math.sqrt(1 / pInterval);
    particulateHours = fracDay * PARTICULATE_BASE * norm;
  }

  // ---- Microphone ----
  let micHours = 0;
  if (schedule.microphone?.enabled) {
    if (schedule.microphone.continuousMode) {
      micHours = fracDay * MIC_BASE; // always on during window
    } else {
      const sampleLen = clamp(schedule.microphone.sampleLengthMin ?? 1, 1, 60);
      const sampleWindow = clamp(
        schedule.microphone.sampleWindowMin ?? 10,
        1,
        60
      );
      const duty = clamp(sampleLen / sampleWindow, 0, 1);
      micHours = fracDay * MIC_BASE * duty;
    }
  }

  // ---- Accelerometer (assumed "roughly constant" when enabled) ----
  let accelHours = 0;
  if (schedule.accelerometer?.enabled) {
    const rate = schedule.accelerometer.sampleRate ?? 0; // 0=25Hz,1=50Hz
    const sensitivityIdx = schedule.accelerometer.sensitivity ?? 0; // 0,1,2
    const rateFactor = rate === 1 ? 1.3 : 1.0;
    const sensitivityFactor = 1 + sensitivityIdx * 0.15;
    accelHours = fracDay * ACCEL_BASE * rateFactor * sensitivityFactor;
  }

  // ---- Light + Environmental (treated as mostly constant if enabled) ----
  let lightEnvHours = 0;
  const lightEnabled = schedule.light?.enabled ?? true;
  const envEnabled = schedule.environmental?.enabled ?? true;
  if (lightEnabled || envEnabled) {
    const sensorsCount = (lightEnabled ? 1 : 0) + (envEnabled ? 1 : 0);
    lightEnvHours = fracDay * LIGHT_ENV_BASE * (sensorsCount / 2);
  }

  const totalSolarHours =
    gpsHours +
    loraHours +
    particulateHours +
    micHours +
    accelHours +
    lightEnvHours;

  return {
    totalSolarHours,
    components: {
      gps: gpsHours,
      lora: loraHours,
      particulate: particulateHours,
      microphone: micHours,
      accelerometer: accelHours,
      lightEnv: lightEnvHours,
    },
  };
}

/**
 * Aggregate solar-hours over many schedules (e.g. per-collar).
 */
export function estimateMultiScheduleSolar(
  schedules: Schedule[]
): PowerBreakdown {
  let total = 0;

  const agg = {
    gps: 0,
    lora: 0,
    particulate: 0,
    microphone: 0,
    accelerometer: 0,
    lightEnv: 0,
  };

  for (const s of schedules) {
    const est = estimateScheduleSolar(s);
    total += est.totalSolarHours;
    agg.gps += est.components.gps;
    agg.lora += est.components.lora;
    agg.particulate += est.components.particulate;
    agg.microphone += est.components.microphone;
    agg.accelerometer += est.components.accelerometer;
    agg.lightEnv += est.components.lightEnv;
  }

  return {
    totalSolarHours: total,
    components: agg,
  };
}
