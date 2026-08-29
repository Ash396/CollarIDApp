// utils/powerEstimator.ts
//
// Port of the website's js/power-model.js (the single source of truth for
// the measured per-subsystem power model, shared by configure.html and
// schedule.html). Keep the constants and formulas in lockstep with that
// file — change them there first, then mirror here.
import type { Schedule } from "../navigation/ScheduleNavigator";

// Empirical power measurements (mW) from characterization, Table 5.1
const POWER_MW = {
  // Always-on baseline — directly measured for each sensor combination
  base:             0.74,  // MCU + GPS standby only (no sensors active)
  alwaysOnLight:    0.760, // + light sensor
  alwaysOnEnv:      0.840, // + environmental sensor (temp/humidity/pressure)
  alwaysOnLightEnv: 1.00,  // + light + environmental
  alwaysOn25hz:     1.20,  // + light + env + accel @ 25 Hz
  alwaysOn50hz:     1.37,  // + light + env + accel @ 50 Hz
  // Accel incremental above light+env baseline (for unmeasured combos)
  accelDelta25hz:   0.20,  // 1.20 - 1.00
  accelDelta50hz:   0.37,  // 1.37 - 1.00
  // Duty-cycled increments
  micDelta:         7.60,  // Microphone incremental (recording + SD write) at 16 kHz
  micDeltaUnapproved: 15.20, // Mic incremental on an unapproved SD card (~2x)
  // Sample-rate scaling, indexed by the MicSampleRate wire value
  // (0 = 16 kHz, 1 = 8 kHz). Mirrors POWER_MW.mic_rate_scale in the website's
  // js/power-model.js — keep the two in step.
  //
  // Ratio measured on the bench 2026-08-29 (6.62 mW at 16 kHz vs 5.91 mW at
  // 8 kHz, both at 3.85 V). Only the ratio is used; the 7.60 absolute is the
  // original characterization figure, kept for headroom. Far from the 0.5 a
  // byte-proportional model would give, because most of the cost of recording
  // is rate-independent — being awake with the card powered, not the bytes.
  micRateScale:     [1.00, 0.893],
  gpsAcqDelta:     36.3,   // GPS acquisition incremental above baseline
  loraPower:       40.3,   // LoRaWAN TX + Class A RX window, avg power (mW)
  loraDur:          6.3,   // Duration of TX + RX event (s), 100-byte payload
  gpsAcqSLow:      10,     // GPS acquisition time (s) at low accuracy
  gpsAcqSMed:      25,     // GPS acquisition time (s) at medium accuracy
  gpsAcqSHigh:     40,     // GPS acquisition time (s) at high accuracy
  panelMw:          215,   // SM141K07TF solar panel at STC
  chargeEff:        0.80,  // Charging circuit efficiency
} as const;

// Assumed time-in-state split for dynamic GPS power estimates. Real activity
// is species- and deployment-dependent and unknown at config time, so we use
// one conservative default and surface it in the UI. A more active animal
// fixes more often (shorter interval) and, with TX-on-fix, transmits more.
export const ACTIVITY_SPLIT = { none: 0.70, medium: 0.20, high: 0.10 } as const;

// Climate viability ladder: how much of a typical day of each lighting
// condition the collar needs to break even. fraction = panel output vs full
// sun; typicalMaxH = realistic daily hours of that condition. Mirrors
// SOLAR_CONDITIONS in js/power-model.js.
export const SOLAR_CONDITIONS = [
  { label: 'Full sun',      fraction: 1.00, typicalMaxH: 6  },
  { label: 'Partly cloudy', fraction: 0.50, typicalMaxH: 10 },
  { label: 'Overcast',      fraction: 0.30, typicalMaxH: 12 },
  { label: 'Open shade',    fraction: 0.15, typicalMaxH: 10 },
  { label: 'Dense canopy',  fraction: 0.05, typicalMaxH: 10 },
] as const;

// Convert mW average to solar-hours/day needed for net-zero
function mwToSolarHours(mw: number): number {
  return (mw * 24) / (POWER_MW.panelMw * POWER_MW.chargeEff);
}

export type PowerEstimate = {
  totalSolarHours: number;
  components: {
    baseline: number;
    gps: number;
    microphone: number;
    lora: number;
  };
};

function clamp(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function windowHours(window: { startHour: number; endHour: number }): number {
  const start = clamp(window.startHour ?? 0, 0, 23);
  const end = clamp(window.endHour ?? 0, 0, 23);
  let diff = end - start + 1;
  if (diff <= 0) diff += 24;
  return diff;
}

/** Select the measured always-on power for a schedule's active sensor set. */
function getAlwaysOnMw(s: Schedule): number {
  const light = s.light?.enabled         ?? false;
  const env   = s.environmental?.enabled ?? false;
  const accel = s.accelerometer?.enabled ?? false;
  const rate  = s.accelerometer?.sampleRate ?? 0; // 0 = 25 Hz, 1 = 50 Hz

  if (!accel) {
    if (light && env) return POWER_MW.alwaysOnLightEnv;
    if (light)        return POWER_MW.alwaysOnLight;
    if (env)          return POWER_MW.alwaysOnEnv;
    return POWER_MW.base;
  }

  // Accel enabled — use directly measured value if light+env are both on,
  // otherwise add accel delta to the appropriate measured base.
  const accelDelta = rate === 1 ? POWER_MW.accelDelta50hz : POWER_MW.accelDelta25hz;
  if (light && env) return rate === 1 ? POWER_MW.alwaysOn50hz : POWER_MW.alwaysOn25hz;
  if (light)        return POWER_MW.alwaysOnLight + accelDelta;
  if (env)          return POWER_MW.alwaysOnEnv   + accelDelta;
  return              POWER_MW.base               + accelDelta;
}

/** Per-schedule power in mW: always-on baseline for its window + duty-cycled increments. */
function scheduleIncrementalMw(s: Schedule): { baseline: number; mic: number; gps: number; lora: number } {
  const hours = s.window ? windowHours(s.window) : 24;
  const frac  = hours / 24;

  let mic = 0, gps = 0, lora = 0;

  if (s.microphone?.enabled) {
    const rateScale =
      POWER_MW.micRateScale[s.microphone.sampleRate ?? 0] ?? POWER_MW.micRateScale[0];
    if (s.microphone.continuousMode) {
      mic = frac * POWER_MW.micDelta * rateScale;
    } else {
      const duty = clamp(
        (s.microphone.sampleLengthMin ?? 1) / (s.microphone.sampleWindowMin ?? 10), 0, 1
      );
      mic = frac * POWER_MW.micDelta * rateScale * duty;
    }
  }

  // GPS: incremental power = acquisition_energy_per_fix * fix_rate.
  // gpsFixHz is the average number of fixes per second over the active window;
  // radio TX-on-fix reuses it below so the two stay coupled.
  let gpsFixHz = 0;
  if (s.gps?.enabled) {
    const acc = s.gps.accuracy ?? 5;
    const gpsAcqS = acc <= 1 ? POWER_MW.gpsAcqSLow : acc <= 5 ? POWER_MW.gpsAcqSMed : POWER_MW.gpsAcqSHigh;

    if (s.gps.dynamicSamplingMode) {
      // Each activity tier fixes at its own interval, so the average fix rate
      // is the time-weighted sum of per-tier rates (Σ fraction / interval).
      const baseMin = s.gps.sampleIntervalMin ?? 20;                    // resting / no-motion
      const medMin  = s.gps.mediumMotionGpsIntervalMin || baseMin;      // 0 → fall back to resting
      const highMin = s.gps.highMotionGpsIntervalMin   || baseMin;
      gpsFixHz = ACTIVITY_SPLIT.none   / (baseMin * 60)
               + ACTIVITY_SPLIT.medium / (medMin  * 60)
               + ACTIVITY_SPLIT.high   / (highMin * 60);
    } else {
      gpsFixHz = 1 / ((s.gps.sampleIntervalMin ?? 20) * 60);
    }
    gps = frac * POWER_MW.gpsAcqDelta * gpsAcqS * gpsFixHz;
  }

  // Radio (LoRaWAN or raw LoRa — mutually exclusive per schedule). With
  // TX-on-fix the radio transmits once per GPS fix, so it inherits gpsFixHz
  // (including the dynamic-mode speed-up); otherwise it runs on its own fixed
  // interval. Uses one generic TX+RX event cost for both radio types.
  if (s.lorawan?.enabled || s.lora?.enabled) {
    const onFix = s.gps?.enabled &&
      (s.lorawan?.enabled ? s.gps?.lorawanTxOnGpsFix : s.gps?.loraTxOnGpsFix);
    const intervalMin = s.lorawan?.enabled
      ? (s.lorawan.sendIntervalMin ?? 60)
      : (s.lora?.sendIntervalMin ?? 60);
    const txHz = onFix ? gpsFixHz : 1 / (intervalMin * 60);
    lora = frac * POWER_MW.loraPower * POWER_MW.loraDur * txHz;
  }

  // Always-on baseline during this schedule's active window (P_always-on per Eq. 5.1)
  const baseline = frac * getAlwaysOnMw(s);

  return { baseline, mic, gps, lora };
}

// Quiescent power (0.74 mW) for hours not covered by any schedule.
function getUncoveredBaselineMw(schedules: Schedule[]): number {
  const covered = new Array<boolean>(24).fill(false);
  for (const s of schedules) {
    if (!s.window) { covered.fill(true); break; }
    const start = clamp(s.window.startHour ?? 0, 0, 23);
    const end   = clamp(s.window.endHour   ?? 0, 0, 23);
    if (end >= start) {
      for (let h = start; h <= end; h++) covered[h] = true;
    } else {
      for (let h = start; h < 24; h++) covered[h] = true;
      for (let h = 0;     h <= end; h++) covered[h] = true;
    }
  }
  const uncoveredHours = 24 - covered.filter(Boolean).length;
  return uncoveredHours * POWER_MW.base / 24;
}

/** Full power estimate across all schedules, expressed in solar-hours/day. */
export function estimatePower(schedules: Schedule[]): PowerEstimate {
  let baseline = 0, mic = 0, gps = 0, lora = 0;
  for (const s of schedules) {
    const inc = scheduleIncrementalMw(s);
    baseline += inc.baseline;
    mic      += inc.mic;
    gps      += inc.gps;
    lora     += inc.lora;
  }
  const totalBaseline = baseline + getUncoveredBaselineMw(schedules);

  return {
    totalSolarHours: mwToSolarHours(totalBaseline + mic + gps + lora),
    components: {
      baseline:   mwToSolarHours(totalBaseline),
      gps:        mwToSolarHours(gps),
      microphone: mwToSolarHours(mic),
      lora:       mwToSolarHours(lora),
    },
  };
}

/** Solar-hours/day for a single schedule, including its always-on baseline. */
export function estimateScheduleSolarHours(s: Schedule): number {
  const { baseline, mic, gps, lora } = scheduleIncrementalMw(s);
  return mwToSolarHours(baseline + mic + gps + lora);
}

// ── SD card capacity ──────────────────────────────────────────
// Microphone audio, mono PCM: bytes/s = sample rate x bytes per sample.
// 16 kHz x 16-bit is 32 000 B/s. Accelerometer + sensor CSV rows are <1% of
// that and ignored — the mic is the only realistic capacity driver for any
// deployment with audio enabled.
//
// Indexed by the wire enum values, so an absent or legacy 0 lands on the
// historical 16 kHz / 16-bit figure. Mirrors MIC_RATE_HZ / MIC_SAMPLE_BYTES
// in the website's js/power-model.js — keep the two in step.
//
// Unlike power, storage scales exactly with the byte rate: 8 kHz really does
// halve it. (Bit depth is not user-selectable — recordings are always
// 16-bit — but the table stays general because the firmware supports it.)
const MIC_RATE_HZ = [16000, 8000];
const MIC_SAMPLE_BYTES = [2, 1];

/** SD-card bytes/day written by a schedule's microphone (0 if mic off). */
export function estimateMicBytesPerDay(s: Schedule): number {
  if (!s.microphone?.enabled) return 0;
  const hours = s.window ? windowHours(s.window) : 24;
  const frac = hours / 24;
  const duty = s.microphone.continuousMode
    ? 1
    : clamp(
        (s.microphone.sampleLengthMin ?? 1) /
          (s.microphone.sampleWindowMin ?? 10),
        0,
        1,
      );
  const hz = MIC_RATE_HZ[s.microphone.sampleRate ?? 0] ?? MIC_RATE_HZ[0];
  const bytes =
    MIC_SAMPLE_BYTES[s.microphone.bitDepth ?? 0] ?? MIC_SAMPLE_BYTES[0];
  return frac * duty * 86400 * hz * bytes;
}

/** Microphone power multiplier on an unapproved SD card vs the approved one. */
export const MIC_UNAPPROVED_POWER_RATIO =
  POWER_MW.micDeltaUnapproved / POWER_MW.micDelta;

// ── Battery-caution copy (js/collar-vocab.js collarWarnings port) ─────────
const WARN_GPS_FAST_MIN   = 5;
const WARN_RADIO_FAST_MIN = 15;

/** Human-readable battery cautions for one schedule (may be empty). */
export function collarWarnings(s: Schedule): string[] {
  const w: string[] = [];
  if (s.microphone?.enabled) {
    w.push(s.microphone.continuousMode
      ? 'Continuous audio fills the SD card fastest and is the single largest battery cost on the collar.'
      : 'Audio recording is the biggest storage and battery consumer — check the power estimate.');
  }
  if (s.gps?.enabled && (s.gps.sampleIntervalMin || 20) < WARN_GPS_FAST_MIN)
    w.push(`GPS fixes more often than every ${WARN_GPS_FAST_MIN} minutes drain the battery quickly — intended for short deployments.`);
  const iv = s.lorawan?.enabled ? s.lorawan.sendIntervalMin
           : s.lora?.enabled    ? s.lora.sendIntervalMin : 0;
  if (iv && iv < WARN_RADIO_FAST_MIN)
    w.push(`Transmitting more often than every ${WARN_RADIO_FAST_MIN} minutes is a heavy battery cost — fine on a bench, rarely right in the field.`);
  return w;
}
