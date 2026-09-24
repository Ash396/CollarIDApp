// Plain-words description of a schedule, and its consequences.
//
// The list card and the editor both describe a schedule to a researcher who
// did not write the firmware: "Record 1 min every 10 min, compressed", not
// "windowed, FLAC, lsb_drop 2". One place for those words so the two screens
// never drift. Wire values in, sentences out; nothing here touches the
// packet.
import type { Schedule } from '../navigation/ScheduleNavigator';
import {
  DEFAULT_SUN_SH_PER_DAY,
  estimateLongevityDays,
  estimateMicBytesPerDay,
  estimatePower,
  solarHoursToMw,
} from './powerEstimator';

// ── Option labels (plain names; the wire values are the keys) ─────────────

/** GPS accuracy — the fix radius the collar waits for. Wire 1 / 5 / 10. */
export const GPS_ACCURACY_LABEL: Record<number, string> = {
  1: 'low accuracy',
  5: 'medium accuracy',
  10: 'high accuracy',
};

/** MicSampleRate, indexed by wire value (0 = 16 kHz is the historical
 *  default; the enum grew both ways from there). */
export const MIC_RATE_LABEL = ['16 kHz', '8 kHz', '48 kHz', '96 kHz', '192 kHz'];

/** MicSensitivity, indexed by wire value. Labelled as gain — that is what
 *  the field is (a digital boost over the calibrated baseline). */
export const MIC_GAIN_LABEL = ['default gain', '+6 dB gain', '+12 dB gain'];

/** MicCodec, indexed by wire value. "Storage" to the operator. */
export const MIC_STORAGE_LABEL = ['Standard (WAV)', 'Compressed (lossless, about 3× smaller)'];

/** Accelerometer rate / range, indexed by wire value. */
export const ACCEL_RATE_LABEL = ['25 Hz', '50 Hz'];
export const ACCEL_RANGE_LABEL = ['±2 g', '±4 g', '±8 g'];

/** Minutes as a researcher would say them: 90 → "1.5 h", 120 → "2 h",
 *  45 → "45 min". */
export function everyText(min: number | undefined): string {
  const m = Number(min) || 0;
  if (m >= 60 && m % 30 === 0) {
    const h = m / 60;
    return `every ${Number.isInteger(h) ? h : h.toFixed(1)} h`;
  }
  return `every ${m} min`;
}

/** The microphone in one clause: "record continuously" or "record N min
 *  every M min", then rate / gain only when off the default, and
 *  "compressed" only where the collar honours it: 16-bit at 8 or 16 kHz
 *  (the firmware's mic_format_codec_effective; the card estimate's
 *  micCodecRatio uses the same rule). New slots default to compressed, so a
 *  slot moved to 48 kHz and up would otherwise claim FLAC for a WAV take. */
export function microphoneText(m: Schedule['microphone'] | undefined): string {
  if (!m?.enabled) return '';
  const parts: string[] = [
    m.continuousMode
      ? 'record continuously'
      : `record ${m.sampleLengthMin ?? 1} min every ${m.sampleWindowMin ?? 10} min`,
  ];
  const rate = MIC_RATE_LABEL[m.sampleRate ?? 0];
  if ((m.sampleRate ?? 0) !== 0 && rate) parts.push(rate);
  const rateWire = m.sampleRate ?? 0;
  const codecHonoured =
    (m.codec ?? 0) === 1 && (m.bitDepth ?? 0) === 0 && (rateWire === 0 || rateWire === 1);
  if (codecHonoured) {
    // old: if ((m.codec ?? 0) === 1) {
    const drop = m.lsbDrop ?? 0;
    parts.push(
      drop
        ? `compressed, ${drop} low bit${drop === 1 ? '' : 's'} dropped`
        : 'compressed',
    );
  }
  if ((m.sensitivity ?? 0) !== 0) parts.push(MIC_GAIN_LABEL[m.sensitivity!] ?? '');
  return parts.filter(Boolean).join(', ');
}

/** One line per enabled sensor, in plain words, for the list card. Empty
 *  when nothing is on. */
export function scheduleSummaryLines(s: Schedule): string[] {
  const out: string[] = [];
  if (s.gps?.enabled) {
    const acc = GPS_ACCURACY_LABEL[s.gps.accuracy ?? 5] ?? 'medium accuracy';
    out.push(
      `📍 Position ${everyText(s.gps.sampleIntervalMin ?? 20)}, ${acc}${
        s.gps.dynamicSamplingMode ? ', faster when moving' : ''
      }`,
    );
  }
  if (s.accelerometer?.enabled) {
    out.push(
      `🏃 Movement at ${ACCEL_RATE_LABEL[s.accelerometer.sampleRate ?? 0] ?? '25 Hz'}, ${
        ACCEL_RANGE_LABEL[s.accelerometer.sensitivity ?? 0] ?? '±2 g'
      }`,
    );
  }
  if (s.microphone?.enabled) {
    const t = microphoneText(s.microphone);
    out.push(`🎙️ Audio: ${t.charAt(0).toUpperCase()}${t.slice(1)}`);
  }
  const extras: string[] = [];
  if (s.light?.enabled) extras.push(`light ${everyText(s.light.sampleIntervalMin ?? 10)}`);
  if (s.environmental?.enabled) extras.push('weather every 5 min');
  if (s.magnetometer?.enabled) {
    extras.push(
      `heading ${everyText(
        Math.max(1, Math.round((s.magnetometer.sampleIntervalS ?? 60) / 60)),
      )}`,
    );
  }
  if (s.particulate?.enabled) {
    extras.push(`particulates ${everyText(s.particulate.sampleIntervalMin ?? 15)}`);
  }
  if (extras.length) {
    out.push(`🌡️ ${extras.join(', ').replace(/^./, c => c.toUpperCase())}`);
  }
  if (s.lorawan?.enabled) {
    out.push(
      `📡 Uplink ${
        s.gps?.enabled && s.gps.lorawanTxOnGpsFix
          ? 'on every new position'
          : everyText(s.lorawan.sendIntervalMin ?? 60)
      }`,
    );
  }
  if (s.lora?.enabled) {
    out.push(
      `📻 Direct radio ${
        s.gps?.enabled && s.gps.loraTxOnGpsFix
          ? 'on every new position'
          : everyText(s.lora.sendIntervalMin ?? 60)
      }`,
    );
  }
  return out;
}

// ── Consequences: battery and card, not parameters ────────────────────────

export type ScheduleConsequences = {
  /** Days from a full charge at DEFAULT_SUN_SH_PER_DAY; Infinity = runs on
   *  sun alone. Priced as if this schedule were the whole deployment (its
   *  window plus the quiescent draw of the uncovered hours). */
  batteryDays: number;
  /** Audio written to the card, GB per 30.4-day month. 0 with the mic off. */
  cardGbPerMonth: number;
  /** "Battery: about N days" */
  batteryText: string;
  /** "Card: about N GB per month" */
  cardText: string;
};

export function formatBatteryDays(days: number): string {
  if (!isFinite(days)) return 'Battery: runs on sun alone';
  if (days >= 730) return `Battery: about ${(days / 365).toFixed(1)} years`;
  if (days < 1) return 'Battery: under a day';
  return `Battery: about ${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
}

export function formatCardGbPerMonth(gb: number): string {
  if (gb <= 0) return 'Card: no audio, well under 1 GB per month';
  if (gb < 1) return `Card: about ${gb.toFixed(1)} GB per month`;
  return `Card: about ${Math.round(gb)} GB per month`;
}

export function scheduleConsequences(s: Schedule): ScheduleConsequences {
  const sh = estimatePower([s]).totalSolarHours;
  const batteryDays = estimateLongevityDays(solarHoursToMw(sh), DEFAULT_SUN_SH_PER_DAY);
  const cardGbPerMonth = (estimateMicBytesPerDay(s) * 30.4) / 1e9;
  return {
    batteryDays,
    cardGbPerMonth,
    batteryText: formatBatteryDays(batteryDays),
    cardText: formatCardGbPerMonth(cardGbPerMonth),
  };
}
