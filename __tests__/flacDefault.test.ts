/**
 * Compressed (FLAC, lossless) is the default for NEW schedule slots:
 *  - the stock slot and every preset that does not choose WAV start at
 *    codec 1 with nothing dropped,
 *  - an ABSENT codec (collar echo, saved preset, old draft) still means WAV,
 *  - a collar below MIC_CODEC_MIN_FW_BUILD, or one that has not reported its
 *    build, gets WAV from the save path (and from the Send path, for saved
 *    sets and restored drafts — flacDefaultScreens.test.tsx): no refused
 *    push, no false mismatch,
 *  - the quick-setup highlight and the plain-words summary still tell the
 *    truth,
 *  - (2026-09-24) the editor starts a microphone that is OFF — no block in a
 *    collar's read-back, or a disabled block whatever codec it names — at
 *    the new-slot default, so switching it on records FLAC; a microphone
 *    that is ON keeps its codec, absent = WAV.
 */
import * as PB from '../src/proto/collar_pb.js';
import {
  SCHEDULE_PRESETS,
  applySchedulePreset,
  defaultScheduleSlot,
  matchingSchedulePreset,
  MIC_CODEC_NEW_DEFAULT,
  slotMicCodec,
  slotMicLsbDrop,
} from '../src/utils/schedulePresets';
import type { SchedulePreset } from '../src/utils/schedulePresets';
import {
  bleFeatureGates,
  editorFeatureGates,
  fwGateNote,
  fwOptionsLine,
  micFieldsForGates,
  MIC_CODEC_MIN_FW_BUILD,
} from '../src/utils/fw';
import type { FeatureGates } from '../src/utils/fw';
import { micCodecRatio } from '../src/utils/powerEstimator';
import { microphoneText } from '../src/utils/scheduleSummary';
import { mapProtoSchedule } from '../src/utils/mapProtoSchedule';
import { appSchedulesEqual, schedulesEqual } from '../src/utils/scheduleEquality';
import { appToPresetSchedule, presetToAppSchedule } from '../src/utils/presetShape';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const { buildSchedulePacketFromAppState } = require('../src/ble/bleManager');

const byKey = (key: SchedulePreset['key']) => SCHEDULE_PRESETS.find(p => p.key === key)!;
const asSchedule = (p: SchedulePreset): Schedule =>
  applySchedulePreset({ id: 'x', name: 'Schedule 1', window: { startHour: 0, endHour: 23 } }, p);

/** A brand-new slot ("+ Add Schedule") with the microphone switched on and
 *  nothing else touched — the case the default is for. */
const newSlotMicOn = (): Schedule => {
  const s: Schedule = { id: 'n', name: 'Schedule 1', ...defaultScheduleSlot() };
  s.microphone = { ...s.microphone!, enabled: true };
  return s;
};

/** What the editor's save path writes for this collar: the mic held to its
 *  gates (buildDraft in EditScheduleScreen). */
const saved = (
  s: Schedule,
  g: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec'>,
): Schedule => ({
  ...s,
  microphone: { ...s.microphone!, ...micFieldsForGates(s.microphone, g) },
});

/** Send a draft and decode what went out — the collar's echo when it
 *  understands every field. */
const echoOf = (draft: Schedule[]) =>
  PB.BlePacket.decode(PB.BlePacket.encode(buildSchedulePacketFromAppState(draft, true)).finish())
    .scheduleConfigPacket.schedules;

/** The echo of a collar that predates the codec field: it drops what it
 *  does not know, so the microphone comes back without codec / lsb_drop. */
const legacyEchoOf = (draft: Schedule[]) =>
  echoOf(draft).map((sc: any) => {
    if (!sc.microphone) return sc;
    const mic = PB.MicrophoneConfig.toObject(sc.microphone);
    delete mic.codec;
    delete mic.lsbDrop;
    return PB.ScheduleConfig.create({ ...sc, microphone: PB.MicrophoneConfig.create(mic) });
  });

describe('new slots store audio compressed, lossless', () => {
  it('the stock slot is FLAC with nothing dropped, 16 kHz, 16-bit', () => {
    expect(defaultScheduleSlot().microphone).toMatchObject({
      enabled: false,
      sampleRate: 0,
      bitDepth: 0,
      codec: 1,
      lsbDrop: 0,
    });
    // and the card estimate prices it as FLAC the moment the mic is on
    expect(micCodecRatio(newSlotMicOn().microphone)).toBe(3);
  });

  it('every quick setup starts from it; none of them chooses WAV', () => {
    for (const p of SCHEDULE_PRESETS) {
      expect(p.slot.microphone).toMatchObject({ codec: 1, lsbDrop: 0 });
    }
  });

  it('with the mic off the default costs nothing on the wire', () => {
    // A disabled sensor is stripped from the packet, so a new slot encodes to
    // exactly the bytes the WAV default did and verifies against its echo.
    const flac: Schedule = { id: 'n', name: 'Schedule 1', ...defaultScheduleSlot() };
    const wav: Schedule = { ...flac, microphone: { ...flac.microphone!, codec: 0 } };
    const bytes = (s: Schedule) =>
      Array.from(PB.BlePacket.encode(buildSchedulePacketFromAppState([s], true)).finish());
    expect(bytes(flac)).toEqual(bytes(wav));
    expect(schedulesEqual([flac], echoOf([flac]))).toBe(true);
    expect(schedulesEqual([flac], legacyEchoOf([flac]))).toBe(true);
  });
});

describe('an absent codec still means WAV', () => {
  it('in a collar echo', () => {
    const legacy = mapProtoSchedule(
      PB.ScheduleConfig.create({
        window: { startHour: 0, endHour: 23 },
        microphone: PB.MicrophoneConfig.create({ enabled: true }),
      }),
      0,
    );
    expect(legacy.microphone).toMatchObject({ codec: 0, lsbDrop: 0 });
  });

  it('in a saved preset', () => {
    const back = presetToAppSchedule(
      { window: { start_hour: 0, end_hour: 23 }, microphone: { enabled: true } },
      0,
    );
    expect(back.microphone).toMatchObject({ codec: 0, lsbDrop: 0 });
    // a FLAC preset keeps FLAC
    const flac = presetToAppSchedule(appToPresetSchedule(newSlotMicOn()), 0);
    expect(flac.microphone?.codec).toBe(1);
  });

  it('in a draft or the verify-after-write comparison', () => {
    const noCodec: Schedule = {
      ...newSlotMicOn(),
      microphone: { enabled: true, continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10 },
    };
    const wav: Schedule = { ...newSlotMicOn(), microphone: { ...newSlotMicOn().microphone!, codec: 0 } };
    const flac = newSlotMicOn();
    expect(appSchedulesEqual([noCodec], [wav])).toBe(true);
    expect(appSchedulesEqual([noCodec], [flac])).toBe(false);
    // and the packet builder sends an absent codec as WAV
    expect(echoOf([noCodec])[0].microphone!.codec).toBe(0);
  });
});

describe('a collar that cannot record FLAC gets WAV', () => {
  it('fw 380+: the new slot goes out as FLAC and verifies', () => {
    const d = [saved(newSlotMicOn(), editorFeatureGates(MIC_CODEC_MIN_FW_BUILD, 0, true))];
    expect(d[0].microphone).toMatchObject({ codec: 1, lsbDrop: 0 });
    const echo = echoOf(d);
    expect(echo[0].microphone!.codec).toBe(1);
    expect(schedulesEqual(d, echo)).toBe(true);
  });

  it('fw 375 (field known, WAV only): WAV on the wire, no mismatch', () => {
    const d = [saved(newSlotMicOn(), editorFeatureGates(375, 0, true))];
    expect(d[0].microphone).toMatchObject({ codec: 0, lsbDrop: 0 });
    expect(echoOf(d)[0].microphone!.codec).toBe(0);
    expect(schedulesEqual(d, echoOf(d))).toBe(true);
  });

  it('a collar predating the field: its echo verifies against the saved draft', () => {
    const d = [saved(newSlotMicOn(), editorFeatureGates(340, 0, true))];
    expect(schedulesEqual(d, legacyEchoOf(d))).toBe(true);
    // the ungated default is exactly what that echo would have failed
    expect(schedulesEqual([newSlotMicOn()], legacyEchoOf([newSlotMicOn()]))).toBe(false);
  });

  it('a connected collar with no reported build keeps every mic gate closed', () => {
    // "no build" is not "no collar": legacy firmware or a just-rebooted
    // collar must not be handed the FLAC default.
    const g = editorFeatureGates(0, 0, true);
    expect(g).toEqual(bleFeatureGates(0, 0));
    expect(g).toMatchObject({ micFormat: false, micRateExt: false, micSens: false, micCodec: false });
    const d = [saved(newSlotMicOn(), g)];
    expect(d[0].microphone).toMatchObject({ codec: 0, lsbDrop: 0, sampleRate: 0, sensitivity: 0 });
    expect(schedulesEqual(d, legacyEchoOf(d))).toBe(true);
    // with no collar at all every option is still offered, FLAC included
    expect(editorFeatureGates(0, 0)).toMatchObject({ micCodec: true });
    expect(editorFeatureGates(0, 0, false)).toMatchObject({ micCodec: true });
    // a reported build decides, connected or not
    expect(editorFeatureGates(382, 0, true)).toEqual(bleFeatureGates(382, 0));
  });

  it('says why in the firmware line and under the greyed control', () => {
    expect(fwOptionsLine(0, editorFeatureGates(0, 0, true), true)).toBe(
      'Connected collar: its software version has not come in yet. Newer options stay off until it does.',
    );
    expect(fwOptionsLine(0, editorFeatureGates(0, 0))).toMatch(/^No collar connected/);
    expect(fwOptionsLine(382, bleFeatureGates(382, 0), true)).toBe(
      'Connected collar: heading at 1 to 16 Hz needs a newer collar software version. Update the collar first.',
    );
    // old (before the magnetometer rate gate, MAG_RATE_MIN_FW_BUILD):
    //   'Connected collar: firmware 382, all options available'
    // Plain words, no build numbers (the app is for non-technical users).
    expect(fwGateNote(0, 380)).toBe(
      'This may need a newer collar software version. The collar has not reported its version yet.',
    );
    expect(fwGateNote(375, 380)).toBe('This needs a newer collar software version. Update the collar first.');
  });
});

describe('quick-setup matching with the new default', () => {
  it('every preset still reads as itself, on any collar', () => {
    for (const p of SCHEDULE_PRESETS) {
      const s = asSchedule(p);
      expect(matchingSchedulePreset(s)).toBe(p.key);
      for (const b of [0, 340, 375, MIC_CODEC_MIN_FW_BUILD]) {
        const g = editorFeatureGates(b, 0, b > 0);
        expect(matchingSchedulePreset(saved(s, g), g)).toBe(p.key);
      }
    }
  });

  it('switching continuous audio on over Standard now IS the Audio study', () => {
    const s = asSchedule(byKey('standard'));
    s.microphone = {
      ...s.microphone!,
      enabled: true,
      continuousMode: true,
      sampleLengthMin: 60,
      sampleWindowMin: 60,
    };
    expect(matchingSchedulePreset(s)).toBe('audio');
    // choosing WAV is a deliberate departure from it
    expect(matchingSchedulePreset({ ...s, microphone: { ...s.microphone!, codec: 0 } })).toBeNull();
  });

  it('the stock slot, mic on or off, is none of them', () => {
    expect(matchingSchedulePreset({ id: 'y', name: 'n', ...defaultScheduleSlot() })).toBeNull();
    expect(matchingSchedulePreset(newSlotMicOn())).toBeNull();
  });
});

describe('the summary claims compression only where the collar honours it', () => {
  it('8 and 16 kHz, 16-bit: compressed', () => {
    expect(microphoneText(newSlotMicOn().microphone)).toBe('record 1 min every 10 min, compressed');
    expect(microphoneText({ ...newSlotMicOn().microphone!, sampleRate: 1 })).toBe(
      'record 1 min every 10 min, 8 kHz, compressed',
    );
  });

  it('48 kHz and up, or 8-bit: the collar records WAV, so no claim', () => {
    for (const rate of [2, 3, 4]) {
      expect(microphoneText({ ...newSlotMicOn().microphone!, sampleRate: rate })).not.toMatch(
        /compressed/,
      );
    }
    expect(microphoneText({ ...newSlotMicOn().microphone!, sampleRate: 2 })).toBe(
      'record 1 min every 10 min, 48 kHz',
    );
    expect(microphoneText({ ...newSlotMicOn().microphone!, bitDepth: 1 })).not.toMatch(/compressed/);
  });
});

describe('a microphone that is off starts compressed in the editor (2026-09-24)', () => {
  /** A slot as the collar reads it back: through the packet builder (a
   *  disabled sensor is stripped) and mapProtoSchedule. */
  const readBack = (s: Schedule): Schedule => ({
    ...mapProtoSchedule(echoOf([s])[0], 0),
    id: s.id,
    name: s.name,
  });

  /** What the editor saves for a slot it opened, with the mic switched to
   *  `on` and nothing else touched: its codec state starts at slotMicCodec
   *  and is held to the collar's gates (buildDraft in EditScheduleScreen). */
  const editorSave = (
    s: Schedule,
    on: boolean,
    g: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec'>,
  ): Schedule => {
    const m = {
      enabled: on,
      continuousMode: s.microphone?.continuousMode ?? false,
      sampleLengthMin: s.microphone?.sampleLengthMin ?? 1,
      sampleWindowMin: s.microphone?.sampleWindowMin ?? 10,
      sampleRate: s.microphone?.sampleRate ?? 0,
      bitDepth: 0,
      sensitivity: s.microphone?.sensitivity ?? 0,
      codec: slotMicCodec(s.microphone),
      lsbDrop: slotMicLsbDrop(s.microphone),
    };
    return { ...s, microphone: { ...m, ...micFieldsForGates(m, g) } };
  };

  it('an off WAV mic with a drop switches on lossless (the website does the same)', () => {
    const offWavDrop: Schedule['microphone'] = { enabled: false, codec: 0, lsbDrop: 2 };
    expect(slotMicCodec(offWavDrop)).toBe(MIC_CODEC_NEW_DEFAULT);
    expect(slotMicLsbDrop(offWavDrop)).toBe(0);
    // The codec left alone keeps the slot's own drop.
    expect(slotMicLsbDrop({ enabled: false, codec: 1, lsbDrop: 2 })).toBe(2);
    expect(slotMicLsbDrop({ enabled: true, codec: 1, lsbDrop: 2 })).toBe(2);
    expect(slotMicLsbDrop({ enabled: true, lsbDrop: 0 })).toBe(0);
    expect(slotMicLsbDrop(undefined)).toBe(0);
    const s: Schedule = { ...defaultScheduleSlot(), id: 'drop', name: 'drop', microphone: offWavDrop };
    const mic = editorSave(s, true, editorFeatureGates(382, 0, true)).microphone;
    expect(mic?.codec).toBe(1);
    expect(mic?.lsbDrop).toBe(0);
  });

  it('the new-slot default is compressed, and it is what the stock slot carries', () => {
    expect(MIC_CODEC_NEW_DEFAULT).toBe(1);
    expect(defaultScheduleSlot().microphone?.codec).toBe(MIC_CODEC_NEW_DEFAULT);
  });

  it('mic off: no block, a disabled block, or a disabled block naming WAV', () => {
    expect(slotMicCodec(undefined)).toBe(MIC_CODEC_NEW_DEFAULT);
    expect(slotMicCodec({ enabled: false })).toBe(MIC_CODEC_NEW_DEFAULT);
    expect(slotMicCodec({ enabled: false, codec: 0 })).toBe(MIC_CODEC_NEW_DEFAULT);
    expect(slotMicCodec({ enabled: false, codec: 1 })).toBe(MIC_CODEC_NEW_DEFAULT);
  });

  it('mic on: its own codec, and WAV when it names none', () => {
    expect(slotMicCodec({ enabled: true })).toBe(0);
    expect(slotMicCodec({ enabled: true, codec: 0 })).toBe(0);
    expect(slotMicCodec({ enabled: true, codec: 1 })).toBe(1);
    // continuous mode is under the enable, not a second way of being on
    expect(slotMicCodec({ enabled: false, continuousMode: true, codec: 0 })).toBe(
      MIC_CODEC_NEW_DEFAULT,
    );
  });

  it('a read-back slot with the mic off has no block; switched on it goes out FLAC on 380+', () => {
    const back = readBack({ id: 'c', name: 'Schedule 1', ...defaultScheduleSlot() });
    expect(back.microphone).toBeUndefined();
    const d = [editorSave(back, true, editorFeatureGates(MIC_CODEC_MIN_FW_BUILD, 0, true))];
    expect(d[0].microphone).toMatchObject({ enabled: true, codec: 1, lsbDrop: 0 });
    expect(echoOf(d)[0].microphone!.codec).toBe(1);
    expect(schedulesEqual(d, echoOf(d))).toBe(true);
  });

  it('... and WAV on a collar below 380 or with no reported build, still verified', () => {
    const back = readBack({ id: 'c', name: 'Schedule 1', ...defaultScheduleSlot() });
    for (const b of [375, 340, 0]) {
      const d = [editorSave(back, true, editorFeatureGates(b, 0, true))];
      expect(d[0].microphone).toMatchObject({ enabled: true, codec: 0, lsbDrop: 0 });
      expect(echoOf(d)[0].microphone!.codec).toBe(0);
      expect(schedulesEqual(d, b >= 375 ? echoOf(d) : legacyEchoOf(d))).toBe(true);
    }
  });

  it('a disabled mic naming WAV (a saved preset or draft) switches on as FLAC', () => {
    const s: Schedule = {
      ...newSlotMicOn(),
      microphone: { ...newSlotMicOn().microphone!, enabled: false, codec: 0 },
    };
    const d = editorSave(s, true, editorFeatureGates(382, 0, true));
    expect(d.microphone).toMatchObject({ enabled: true, codec: 1 });
    // a saved preset carrying it: same
    const viaPreset = presetToAppSchedule(appToPresetSchedule(s), 0);
    expect(viaPreset.microphone).toMatchObject({ enabled: false, codec: 0 });
    expect(slotMicCodec(viaPreset.microphone)).toBe(MIC_CODEC_NEW_DEFAULT);
  });

  it('a mic that is on and names no codec stays WAV (what the collar records)', () => {
    const back = readBack({
      ...newSlotMicOn(),
      microphone: { enabled: true, continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10 },
    });
    expect(back.microphone).toMatchObject({ enabled: true, codec: 0 });
    const d = [editorSave(back, true, editorFeatureGates(382, 0, true))];
    expect(d[0].microphone).toMatchObject({ codec: 0, lsbDrop: 0 });
    expect(schedulesEqual(d, echoOf(d))).toBe(true);
  });

  it('saving a mic-off slot unchanged: no unsent change, no mismatch, same preset', () => {
    for (const p of SCHEDULE_PRESETS.filter(x => !x.slot.microphone?.enabled)) {
      const collar = asSchedule(p);
      const back = readBack(collar);
      expect(back.microphone).toBeUndefined();
      for (const b of [0, 340, 375, MIC_CODEC_MIN_FW_BUILD]) {
        const g = editorFeatureGates(b, 0, b > 0);
        const d = editorSave(back, false, g);
        // the codec the editor now holds for the off mic is invisible to the
        // draft-vs-collar compare, the read-back check and the wire
        expect(appSchedulesEqual([d], [back])).toBe(true);
        expect(schedulesEqual([d], echoOf([collar]))).toBe(true);
        expect(matchingSchedulePreset(back, g)).toBe(p.key);
        expect(matchingSchedulePreset(d, g)).toBe(p.key);
      }
    }
  });

  it('a read-back Standard with continuous audio switched on IS the Audio study on 380+', () => {
    const back = readBack(asSchedule(byKey('standard')));
    const on = editorSave(back, true, editorFeatureGates(382, 0, true));
    on.microphone = { ...on.microphone!, continuousMode: true, sampleLengthMin: 60, sampleWindowMin: 60 };
    expect(matchingSchedulePreset(on, editorFeatureGates(382, 0, true))).toBe('audio');
    // and on a 375 collar too, where the Audio study itself is held to WAV
    const old = editorSave(back, true, editorFeatureGates(375, 0, true));
    old.microphone = { ...old.microphone!, continuousMode: true, sampleLengthMin: 60, sampleWindowMin: 60 };
    expect(old.microphone.codec).toBe(0);
    expect(matchingSchedulePreset(old, editorFeatureGates(375, 0, true))).toBe('audio');
  });
});
