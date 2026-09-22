// Named schedule setups for the editor's "Quick setups" row, and the stock
// slot every one of them (and "+ Add Schedule") is built from.
//
// A researcher deploying collars themselves makes three or four decisions —
// position, movement, audio, how hard to save the battery — and then sets
// the hours. Each preset is a COMPLETE slot (every wire field named), so
// the power / card estimators can price it and the packet builder can
// encode it without a single fallback firing. The hours are deliberately
// not part of a preset: applying one keeps the window the operator chose.
//
// Mirrors SCHEDULE_PRESETS in the website's js/collar-vocab.js — same
// keys, labels, descriptions and numbers; the slot here is the app's
// camelCase Schedule shape where the website's is its snake_case one
// (presetShape.ts converts between the two). Values are wire values.
import type { Schedule } from '../navigation/ScheduleNavigator';
import { ENV_INTERVAL_FIXED_MIN, micFieldsForGates } from './fw';
import type { FeatureGates } from './fw';
import { appSchedulesEqual } from './scheduleEquality';

/** A schedule without its positional identity (id / "Schedule N"). */
export type ScheduleSlot = Omit<Schedule, 'id' | 'name'>;

/** The app's stock slot — what "+ Add Schedule" creates and what every
 *  preset starts from. Matches the website configurator's defaultSchedule():
 *  everything off, full day, the historical intervals. */
export function defaultScheduleSlot(): ScheduleSlot {
  return {
    window: { startHour: 0, endHour: 23 },
    gps: {
      enabled: false,
      sampleIntervalMin: 20,
      accuracy: 5,
      dynamicSamplingMode: false,
      mediumMotionVedbaThresholdX100: 20,
      mediumMotionGpsIntervalMin: 10,
      highMotionVedbaThresholdX100: 100,
      highMotionGpsIntervalMin: 5,
      lorawanTxOnGpsFix: false,
      loraTxOnGpsFix: false,
    },
    light: { enabled: false, sampleIntervalMin: 10 },
    environmental: { enabled: false, sampleIntervalMin: ENV_INTERVAL_FIXED_MIN },
    particulate: { enabled: false, sampleIntervalMin: 15 },
    microphone: {
      enabled: false,
      continuousMode: false,
      sampleLengthMin: 1,
      sampleWindowMin: 10,
      sampleRate: 0, // 16 kHz
      bitDepth: 0, // 16-bit, never user-selectable
      sensitivity: 0, // gain: default
      codec: 0, // WAV
      lsbDrop: 0,
    },
    accelerometer: { enabled: false, sampleRate: 0, sensitivity: 0 },
    lorawan: { enabled: false, sendIntervalMin: 60 },
    lora: { enabled: false, sendIntervalMin: 60 },
    magnetometer: { enabled: false, sampleIntervalS: 60 },
  };
}

export type SchedulePresetKey = 'standard' | 'audio' | 'movement' | 'battery';

export type SchedulePreset = {
  key: SchedulePresetKey;
  label: string;
  /** Under the label: what the setup does, in plain words (the website's
   *  text, verbatim). */
  description: string;
  slot: ScheduleSlot;
};

// Deep-ish merge of the named sensor blocks over the stock slot, so a preset
// spells out only what it changes and still comes out complete.
function slot(over: {
  [K in keyof ScheduleSlot]?: Partial<NonNullable<ScheduleSlot[K]>>;
}): ScheduleSlot {
  const base = defaultScheduleSlot();
  const out: any = { ...base };
  for (const k of Object.keys(over) as (keyof ScheduleSlot)[]) {
    out[k] = { ...(base[k] as object), ...(over[k] as object) };
  }
  return out as ScheduleSlot;
}

const STANDARD = slot({
  gps: { enabled: true, sampleIntervalMin: 30 },
  accelerometer: { enabled: true, sampleRate: 0 }, // 25 Hz
  light: { enabled: true },
  environmental: { enabled: true },
  lorawan: { enabled: true, sendIntervalMin: 5 },
});

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    key: 'standard',
    label: 'Standard deployment',
    description:
      'GPS fix every 30 min, accelerometer at 25 Hz, light and environment on, no audio, uplink every 5 min.',
    slot: STANDARD,
  },
  {
    key: 'audio',
    label: 'Audio study',
    description:
      'Standard deployment plus continuous 16 kHz audio, stored compressed (lossless), default gain.',
    slot: {
      ...STANDARD,
      microphone: {
        ...STANDARD.microphone!,
        enabled: true,
        continuousMode: true,
        // Continuous mode records on 60-minute file boundaries; the editor
        // pins the length/window pair to 60/60 (same as the website).
        sampleLengthMin: 60,
        sampleWindowMin: 60,
        sampleRate: 0, // 16 kHz
        codec: 1, // compressed (FLAC), fw 380+ — the save path forces WAV below
        lsbDrop: 0,
        sensitivity: 0, // gain: default
      },
    },
  },
  {
    key: 'movement',
    label: 'Movement only',
    description:
      'GPS every 15 min, faster while the animal moves (dynamic sampling), accelerometer at 25 Hz, no audio, uplink every 10 min.',
    slot: slot({
      gps: { enabled: true, sampleIntervalMin: 15, dynamicSamplingMode: true },
      accelerometer: { enabled: true, sampleRate: 0 },
      lorawan: { enabled: true, sendIntervalMin: 10 },
    }),
  },
  {
    key: 'battery',
    label: 'Battery saver',
    description:
      'GPS every 2 h, accelerometer on, no audio, light and environment off, uplink every 30 min.',
    slot: slot({
      gps: { enabled: true, sampleIntervalMin: 120 },
      accelerometer: { enabled: true, sampleRate: 0 },
      light: { enabled: false },
      environmental: { enabled: false },
      lorawan: { enabled: true, sendIntervalMin: 30 },
    }),
  },
];

/** The preset applied to a schedule: every sensor block from the preset,
 *  the schedule's own identity and hours kept. */
export function applySchedulePreset(s: Schedule, p: SchedulePreset): Schedule {
  return { ...s, ...p.slot, window: { ...s.window } };
}

/** Which preset (if any) a schedule currently IS, hours aside — so the
 *  editor can highlight it, and drop the highlight the moment a knob moves.
 *  Compared under the same wire-level normalization as the BLE verify path,
 *  so a stray parameter on a disabled sensor never breaks the match. With
 *  `gates`, the preset is first held to what that collar records (the Audio
 *  study's compressed audio is WAV on a collar below 380) so the setup the
 *  operator just tapped still reads as chosen. */
export function matchingSchedulePreset(
  s: Schedule,
  gates?: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec'>,
): SchedulePresetKey | null {
  for (const p of SCHEDULE_PRESETS) {
    const target = applySchedulePreset(s, p);
    if (gates && target.microphone) {
      target.microphone = {
        ...target.microphone,
        ...micFieldsForGates(target.microphone, gates),
      };
    }
    if (appSchedulesEqual([s], [target])) return p.key;
  }
  return null;
}
