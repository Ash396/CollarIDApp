/**
 * The simplified schedule editor: the four quick setups are complete slots
 * the estimator can price and the packet builder can encode, their
 * compressed audio obeys the fw-380 gate, the plain-words summary, the one
 * firmware line, and the Advanced groups' collapsed default.
 */
import * as PB from '../src/proto/collar_pb.js';
import {
  SCHEDULE_PRESETS,
  applySchedulePreset,
  defaultScheduleSlot,
  matchingSchedulePreset,
} from '../src/utils/schedulePresets';
import type { SchedulePreset } from '../src/utils/schedulePresets';
import {
  bleFeatureGates,
  editorFeatureGates,
  fwGateNote,
  fwOptionsLine,
  micFieldsForGates,
  MAG_RATE_MIN_FW_BUILD,
  MIC_CODEC_MIN_FW_BUILD,
} from '../src/utils/fw';
import {
  BATTERY_WH,
  DEFAULT_SUN_SH_PER_DAY,
  estimateLongevityDays,
  estimateMicBytesPerDay,
  estimateScheduleSolarHours,
  solarHoursToMw,
} from '../src/utils/powerEstimator';
import {
  everyText,
  formatBatteryDays,
  formatCardGbPerMonth,
  microphoneText,
  scheduleConsequences,
  scheduleSummaryLines,
} from '../src/utils/scheduleSummary';
import {
  ADVANCED_PREFS_KEY,
  ADVANCED_SECTIONS,
  defaultAdvancedPrefs,
  parseAdvancedPrefs,
} from '../src/utils/editorPrefs';
import { schedulesEqual } from '../src/utils/scheduleEquality';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const { buildSchedulePacketFromAppState } = require('../src/ble/bleManager');

const byKey = (key: SchedulePreset['key']) => SCHEDULE_PRESETS.find(p => p.key === key)!;
const asSchedule = (p: SchedulePreset, window = { startHour: 0, endHour: 23 }): Schedule =>
  applySchedulePreset({ id: 'x', name: 'Schedule 1', window }, p);

// Every leaf of every block defined — a preset with a hole would fall
// through to a `?? default` somewhere and silently differ from its label.
function leaves(o: any, path = ''): string[] {
  const out: string[] = [];
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object') out.push(...leaves(v, `${path}${k}.`));
    else if (v === undefined || v === null || Number.isNaN(v)) out.push(`${path}${k}`);
  }
  return out;
}

describe('quick setups are complete slots', () => {
  it('names exactly the four setups, in order, like the website vocab', () => {
    // Mirrors SCHEDULE_PRESETS in the website's js/collar-vocab.js: same
    // keys, labels and descriptions (verbatim), so the two editors say the
    // same thing.
    expect(SCHEDULE_PRESETS.map(p => p.key)).toEqual(['standard', 'audio', 'movement', 'battery']);
    expect(SCHEDULE_PRESETS.map(p => p.label)).toEqual([
      'Standard deployment',
      'Audio study',
      'Movement only',
      'Battery saver',
    ]);
    expect(SCHEDULE_PRESETS.map(p => p.description)).toEqual([
      'GPS fix every 30 min, accelerometer at 25 Hz, light and environment on, no audio, uplink every 5 min.',
      'Standard deployment plus continuous 16 kHz audio, stored compressed (lossless), default gain.',
      'GPS every 15 min, faster while the animal moves (dynamic sampling), accelerometer at 25 Hz, no audio, uplink every 10 min.',
      'GPS every 2 h, accelerometer on, no audio, light and environment off, uplink every 30 min.',
    ]);
  });

  it('every field of every block is set (no fallback ever fires)', () => {
    const blocks = Object.keys(defaultScheduleSlot());
    for (const p of SCHEDULE_PRESETS) {
      expect(Object.keys(p.slot).sort()).toEqual(blocks.sort());
      expect(leaves(p.slot)).toEqual([]);
    }
  });

  it('the estimator prices each one and the packet builder encodes it', () => {
    for (const p of SCHEDULE_PRESETS) {
      const s = asSchedule(p);
      const sh = estimateScheduleSolarHours(s);
      expect(Number.isFinite(sh)).toBe(true);
      expect(sh).toBeGreaterThan(0);
      expect(Number.isFinite(estimateMicBytesPerDay(s))).toBe(true);

      const packet = buildSchedulePacketFromAppState([s], true);
      const wire = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish());
      expect(schedulesEqual([s], wire.scheduleConfigPacket.schedules)).toBe(true);
    }
  });

  it('Standard: position every 30 min, movement at 25 Hz, no audio, light + weather, uplink every 5 min', () => {
    const s = byKey('standard').slot;
    expect(s.gps).toMatchObject({ enabled: true, sampleIntervalMin: 30, dynamicSamplingMode: false });
    expect(s.accelerometer).toEqual({ enabled: true, sampleRate: 0, sensitivity: 0 });
    expect(s.microphone?.enabled).toBe(false);
    expect(s.light?.enabled).toBe(true);
    expect(s.environmental).toEqual({ enabled: true, sampleIntervalMin: 5 });
    expect(s.lorawan).toEqual({ enabled: true, sendIntervalMin: 5 });
    expect(s.lora?.enabled).toBe(false);
  });

  it('Audio study: Standard plus continuous 16 kHz compressed audio at default gain', () => {
    const std = byKey('standard').slot;
    const a = byKey('audio').slot;
    expect({ ...a, microphone: std.microphone }).toEqual(std);
    expect(a.microphone).toMatchObject({
      enabled: true,
      continuousMode: true,
      sampleLengthMin: 60,
      sampleWindowMin: 60,
      sampleRate: 0, // 16 kHz
      bitDepth: 0,
      sensitivity: 0,
      codec: 1,
      lsbDrop: 0,
    });
  });

  it('Movement only: position every 15 min, faster when moving, uplink every 10 min, no audio', () => {
    const s = byKey('movement').slot;
    expect(s.gps).toMatchObject({ enabled: true, sampleIntervalMin: 15, dynamicSamplingMode: true });
    expect(s.accelerometer).toEqual({ enabled: true, sampleRate: 0, sensitivity: 0 });
    expect(s.microphone?.enabled).toBe(false);
    expect(s.lorawan).toEqual({ enabled: true, sendIntervalMin: 10 });
  });

  it('Battery saver: position every 2 h, movement on, uplink every 30 min, light and weather off', () => {
    const s = byKey('battery').slot;
    expect(s.gps).toMatchObject({ enabled: true, sampleIntervalMin: 120, dynamicSamplingMode: false });
    expect(s.accelerometer?.enabled).toBe(true);
    expect(s.microphone?.enabled).toBe(false);
    expect(s.lorawan).toEqual({ enabled: true, sendIntervalMin: 30 });
    expect(s.light?.enabled).toBe(false);
    expect(s.environmental?.enabled).toBe(false);
  });

  it('prices the ladder: audio > movement > standard > saver', () => {
    // Not the order a reader might expect: Movement's dynamic GPS at 15 min
    // (~1.3 mW at the 70/20/10 split) outweighs Standard's 5-minute uplink
    // (~0.85 mW) plus light and weather. Pinned so a change to the preset
    // numbers is a decision, not a surprise.
    const sh = (key: SchedulePreset['key']) => estimateScheduleSolarHours(asSchedule(byKey(key)));
    expect(sh('audio')).toBeGreaterThan(sh('movement'));
    expect(sh('movement')).toBeGreaterThan(sh('standard'));
    expect(sh('standard')).toBeGreaterThan(sh('battery'));
  });

  it('applying a preset keeps the schedule identity and hours', () => {
    const s = asSchedule(byKey('battery'), { startHour: 6, endHour: 18 });
    expect(s.id).toBe('x');
    expect(s.name).toBe('Schedule 1');
    expect(s.window).toEqual({ startHour: 6, endHour: 18 });
    expect(matchingSchedulePreset(s)).toBe('battery');
    // one knob moved and it is no longer that setup
    expect(matchingSchedulePreset({ ...s, gps: { ...s.gps!, sampleIntervalMin: 90 } })).toBeNull();
    // the stock slot is none of them
    expect(matchingSchedulePreset({ id: 'y', name: 'n', ...defaultScheduleSlot() })).toBeNull();
  });

  it('the stock slot is what "+ Add Schedule" always made', () => {
    expect(defaultScheduleSlot()).toMatchObject({
      window: { startHour: 0, endHour: 23 },
      gps: { enabled: false, sampleIntervalMin: 20, accuracy: 5 },
      light: { enabled: false, sampleIntervalMin: 10 },
      environmental: { enabled: false, sampleIntervalMin: 5 },
      particulate: { enabled: false, sampleIntervalMin: 15 },
      microphone: { enabled: false, continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10 },
      accelerometer: { enabled: false, sampleRate: 0, sensitivity: 0 },
      lorawan: { enabled: false, sendIntervalMin: 60 },
      lora: { enabled: false, sendIntervalMin: 60 },
      magnetometer: { enabled: false, sampleIntervalS: 60 },
    });
  });
});

describe('compressed audio in a preset obeys the fw-380 gate', () => {
  const audioMic = byKey('audio').slot.microphone!;

  it('is held to WAV / 0 below the recorder build and kept at or above it', () => {
    expect(micFieldsForGates(audioMic, bleFeatureGates(379, 0))).toMatchObject({ codec: 0, lsbDrop: 0 });
    expect(micFieldsForGates(audioMic, bleFeatureGates(MIC_CODEC_MIN_FW_BUILD, 0))).toMatchObject({
      codec: 1,
      lsbDrop: 0,
    });
    // the drop only rides on a FLAC take
    expect(micFieldsForGates({ ...audioMic, lsbDrop: 2 }, bleFeatureGates(375, 0)).lsbDrop).toBe(0);
    expect(micFieldsForGates({ ...audioMic, lsbDrop: 2 }, bleFeatureGates(380, 0)).lsbDrop).toBe(2);
  });

  it('clamps the sample rate and gain by their own builds', () => {
    const m = { enabled: true, sampleRate: 2, sensitivity: 2 };
    expect(micFieldsForGates(m, bleFeatureGates(337, 0))).toMatchObject({ sampleRate: 0, sensitivity: 0 });
    expect(micFieldsForGates(m, bleFeatureGates(342, 0))).toMatchObject({ sampleRate: 0, sensitivity: 0 });
    expect(micFieldsForGates(m, bleFeatureGates(343, 0))).toMatchObject({ sampleRate: 2, sensitivity: 0 });
    expect(micFieldsForGates(m, bleFeatureGates(349, 0))).toMatchObject({ sampleRate: 2, sensitivity: 2 });
  });

  it('the Audio study still reads as chosen on a WAV-only collar', () => {
    // What the editor's save path produces on fw 375: the preset, WAV.
    const s = asSchedule(byKey('audio'));
    const saved: Schedule = {
      ...s,
      microphone: { ...s.microphone!, ...micFieldsForGates(s.microphone, bleFeatureGates(375, 0)) },
    };
    expect(saved.microphone?.codec).toBe(0);
    expect(matchingSchedulePreset(saved)).toBeNull(); // ungated: it is not the preset
    expect(matchingSchedulePreset(saved, bleFeatureGates(375, 0))).toBe('audio');
    expect(matchingSchedulePreset(saved, bleFeatureGates(380, 0))).toBeNull();
  });

  it('with no collar the editor offers every option', () => {
    expect(editorFeatureGates(0, 0)).toMatchObject({
      micFormat: true,
      micRateExt: true,
      micSens: true,
      micCodec: true,
    });
    expect(editorFeatureGates(375, 0)).toEqual(bleFeatureGates(375, 0));
    expect(micFieldsForGates(audioMic, editorFeatureGates(0, 0)).codec).toBe(1);
  });
});

describe('one firmware line', () => {
  it('says everything is available, or what needs an update', () => {
    // The magnetometer rate mode (MAG_RATE_MIN_FW_BUILD) is the newest gate,
    // so it is named first; magRate.test.ts pins its build.
    expect(fwOptionsLine(MAG_RATE_MIN_FW_BUILD, bleFeatureGates(MAG_RATE_MIN_FW_BUILD, 0))).toBe(
      `Connected collar: firmware ${MAG_RATE_MIN_FW_BUILD}, all options available`,
    );
    expect(fwOptionsLine(380, bleFeatureGates(380, 0))).toBe(
      'Connected collar: firmware 380: heading at 1 to 16 Hz needs a firmware update',
    );
    // old: 'Connected collar: firmware 380, all options available'
    expect(fwOptionsLine(375, bleFeatureGates(375, 0))).toBe(
      'Connected collar: firmware 375: heading at 1 to 16 Hz and compressed audio need a firmware update',
    );
    // old: 'Connected collar: firmware 375: compressed audio needs a firmware update'
    expect(fwOptionsLine(340, bleFeatureGates(340, 0))).toBe(
      'Connected collar: firmware 340: heading at 1 to 16 Hz, compressed audio, microphone gain and sample rates above 16 kHz need a firmware update',
    );
    // old: 'Connected collar: firmware 340: compressed audio, microphone gain and sample rates above 16 kHz need a firmware update'
    // below 338 there is no rate field at all — one clause, not two
    const old = fwOptionsLine(310, bleFeatureGates(310, 0));
    expect(old).toMatch(/^Connected collar: firmware 310: /);
    expect(old).toMatch(/the sample rate need a firmware update$/);
    expect(old).not.toMatch(/above 16 kHz/);
  });

  it('says so with no collar connected', () => {
    expect(fwOptionsLine(0, editorFeatureGates(0, 0))).toMatch(/^No collar connected/);
  });

  it('uses the same note under every greyed control', () => {
    expect(fwGateNote(375, 380)).toBe('Needs firmware 380+ — this collar reports 375.');
  });
});

describe('plain-words summary', () => {
  it('says minutes and hours the way a researcher would', () => {
    expect(everyText(30)).toBe('every 30 min');
    expect(everyText(60)).toBe('every 1 h');
    expect(everyText(90)).toBe('every 1.5 h');
    expect(everyText(120)).toBe('every 2 h');
    expect(everyText(45)).toBe('every 45 min');
  });

  it('describes the microphone as what it records, not the codec', () => {
    expect(microphoneText({ enabled: true, continuousMode: true, sampleRate: 0, codec: 1 })).toBe(
      'record continuously, compressed',
    );
    expect(
      microphoneText({
        enabled: true,
        continuousMode: false,
        sampleLengthMin: 1,
        sampleWindowMin: 10,
        sampleRate: 1,
        codec: 1,
        lsbDrop: 2,
        sensitivity: 1,
      }),
    ).toBe('record 1 min every 10 min, 8 kHz, compressed, 2 low bits dropped, +6 dB gain');
    // WAV at 16 kHz, default gain: nothing to add
    expect(microphoneText({ enabled: true, continuousMode: false, sampleLengthMin: 5, sampleWindowMin: 30 })).toBe(
      'record 5 min every 30 min',
    );
    expect(microphoneText({ enabled: false })).toBe('');
  });

  it('lists each preset in the words the editor uses', () => {
    expect(scheduleSummaryLines(asSchedule(byKey('standard')))).toEqual([
      '📍 Position every 30 min, medium accuracy',
      '🏃 Movement at 25 Hz, ±2 g',
      '🌡️ Light every 10 min, weather every 5 min',
      '📡 Uplink every 5 min',
    ]);
    expect(scheduleSummaryLines(asSchedule(byKey('audio')))).toContain(
      '🎙️ Audio: Record continuously, compressed',
    );
    expect(scheduleSummaryLines(asSchedule(byKey('movement')))[0]).toBe(
      '📍 Position every 15 min, medium accuracy, faster when moving',
    );
    expect(scheduleSummaryLines(asSchedule(byKey('battery')))).toEqual([
      '📍 Position every 2 h, medium accuracy',
      '🏃 Movement at 25 Hz, ±2 g',
      '📡 Uplink every 30 min',
    ]);
    expect(scheduleSummaryLines({ id: 'y', name: 'n', ...defaultScheduleSlot() })).toEqual([]);
  });

  it('names uplink-on-fix and the direct radio', () => {
    const s = asSchedule(byKey('standard'));
    s.gps!.lorawanTxOnGpsFix = true;
    expect(scheduleSummaryLines(s)).toContain('📡 Uplink on every new position');
    s.lorawan!.enabled = false;
    s.lora = { enabled: true, sendIntervalMin: 15 };
    expect(scheduleSummaryLines(s)).toContain('📻 Direct radio every 15 min');
  });
});

describe('consequences: battery and card', () => {
  it('ports the website longevity model (2.96 Wh, harvest at the stated sun)', () => {
    expect(BATTERY_WH).toBe(2.96);
    expect(DEFAULT_SUN_SH_PER_DAY).toBe(1);
    // 5 mW all day = 120 mWh; one full-sun hour harvests 215 x 0.8 = 172 mWh
    expect(estimateLongevityDays(5, 1)).toBe(Infinity);
    // 20 mW = 480 mWh/day, net 308 → 2960 / 308
    expect(estimateLongevityDays(20, 1)).toBeCloseTo(2960 / 308, 6);
    expect(estimateLongevityDays(20, 0)).toBeCloseTo(2960 / 480, 6);
    // and the sh <-> mW conversion is the estimator's own, inverted
    expect(solarHoursToMw(24 / (215 * 0.8))).toBeCloseTo(1, 9);
  });

  it('prices a preset as days and gigabytes', () => {
    const std = scheduleConsequences(asSchedule(byKey('standard')));
    expect(std.cardGbPerMonth).toBe(0);
    expect(std.cardText).toBe('Card: no audio, well under 1 GB per month');
    expect(std.batteryText).toMatch(/^Battery: (about \d+ days|runs on sun alone)$/);

    // continuous 16 kHz compressed: 32 000 B/s / 3 planning ratio, 30.4 days
    const audio = scheduleConsequences(asSchedule(byKey('audio')));
    expect(audio.cardGbPerMonth).toBeCloseTo((86400 * 32000 * 30.4) / 3 / 1e9, 3);
    expect(audio.cardText).toBe('Card: about 28 GB per month');
    expect(Number.isFinite(audio.batteryDays)).toBe(true);
    expect(audio.batteryDays).toBeGreaterThan(0);
    expect(audio.batteryText).toMatch(/^Battery: about \d+ days$/);
    // the compressed figure is a third of the WAV one
    const s = asSchedule(byKey('audio'));
    s.microphone!.codec = 0;
    expect(scheduleConsequences(s).cardGbPerMonth).toBeCloseTo(audio.cardGbPerMonth * 3, 6);
  });

  it('formats the edges', () => {
    expect(formatBatteryDays(Infinity)).toBe('Battery: runs on sun alone');
    expect(formatBatteryDays(1)).toBe('Battery: about 1 day');
    expect(formatBatteryDays(12.4)).toBe('Battery: about 12 days');
    expect(formatBatteryDays(1000)).toBe('Battery: about 2.7 years');
    expect(formatBatteryDays(0.5)).toBe('Battery: under a day');
    expect(formatCardGbPerMonth(0.42)).toBe('Card: about 0.4 GB per month');
    expect(formatCardGbPerMonth(83.6)).toBe('Card: about 84 GB per month');
  });
});

describe('Advanced groups', () => {
  it('are collapsed by default, for every section', () => {
    const d = defaultAdvancedPrefs();
    expect(Object.keys(d).sort()).toEqual([...ADVANCED_SECTIONS].sort());
    expect(Object.values(d).every(v => v === false)).toBe(true);
    expect(parseAdvancedPrefs(null)).toEqual(d);
    expect(parseAdvancedPrefs('')).toEqual(d);
    expect(parseAdvancedPrefs('not json')).toEqual(d);
  });

  it('remember what was opened and ignore what they do not know', () => {
    const p = parseAdvancedPrefs('{"gps":true,"microphone":"yes","junk":1}');
    expect(p.gps).toBe(true);
    expect(p.microphone).toBe(false);
    expect((p as any).junk).toBeUndefined();
    expect(ADVANCED_PREFS_KEY).toBe('editor.advanced');
  });
});
