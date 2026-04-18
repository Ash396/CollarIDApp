// utils/powerEstimator.ts
import type { Schedule } from "../navigation/ScheduleNavigator";

// Empirical power measurements (mW) from characterization, Table 5.1
const POWER_MW = {
  base:          0.74,  // Quiescent: MCU + GPS standby only (no sensors)
  alwaysOn25hz:  1.20,  // MCU + GPS standby + accel@25Hz + light + env + SD
  alwaysOn50hz:  1.37,  // MCU + GPS standby + accel@50Hz + light + env + SD
  micDelta:      7.60,  // Microphone incremental (recording + SD write)
  gpsAcqDelta:  36.3,   // GPS acquisition incremental above baseline
  loraPower:    40.3,   // LoRaWAN TX + Class A RX window, avg power (mW)
  loraDur:       6.3,   // Duration of TX + RX event (s), 100-byte payload
  gpsAcqS:      15,     // Average warm-start GPS acquisition time (s)
  panelMw:       215,   // SM141K07TF solar panel at STC
  chargeEff:     0.80,  // Charging circuit efficiency
} as const;

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
  let diff = end - start;
  if (diff <= 0) diff += 24;
  return diff;
}


/** Per-schedule power in mW: always-on baseline for its window + duty-cycled increments. */
function scheduleIncrementalMw(s: Schedule): { baseline: number; mic: number; gps: number; lora: number } {
  const hours = s.window ? windowHours(s.window) : 24;
  const frac  = hours / 24;

  let mic = 0, gps = 0, lora = 0;

  if (s.microphone?.enabled) {
    if (s.microphone.continuousMode) {
      mic = frac * POWER_MW.micDelta;
    } else {
      const duty = clamp(
        (s.microphone.sampleLengthMin ?? 1) / (s.microphone.sampleWindowMin ?? 10), 0, 1
      );
      mic = frac * POWER_MW.micDelta * duty;
    }
  }

  if (s.gps?.enabled) {
    const periodS = (s.gps.sampleIntervalMin ?? 20) * 60;
    gps = frac * POWER_MW.gpsAcqDelta * (POWER_MW.gpsAcqS / periodS);
  }

  if (s.lorawan?.enabled) {
    const periodS = (s.lorawan.sendIntervalMin ?? 60) * 60;
    lora = frac * POWER_MW.loraPower * (POWER_MW.loraDur / periodS);
  }

  // Always-on baseline during this schedule's active window (P_always-on per Eq. 5.1)
  const alwaysOn = (s.accelerometer?.enabled && s.accelerometer.sampleRate === 1)
    ? POWER_MW.alwaysOn50hz : POWER_MW.alwaysOn25hz;
  const baseline = frac * alwaysOn;

  return { baseline, mic, gps, lora };
}

// Quiescent power (0.74 mW) for hours not covered by any schedule.
function getUncoveredBaselineMw(schedules: Schedule[]): number {
  const covered = new Array<boolean>(24).fill(false);
  for (const s of schedules) {
    if (!s.window) { covered.fill(true); break; }
    const start = clamp(s.window.startHour ?? 0, 0, 23);
    const end   = clamp(s.window.endHour   ?? 0, 0, 23);
    if (end > start) {
      for (let h = start; h < end; h++) covered[h] = true;
    } else {
      for (let h = start; h < 24; h++) covered[h] = true;
      for (let h = 0;     h < end; h++) covered[h] = true;
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
