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
 *    truth.
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
      'Connected collar: firmware not reported yet. Options that need a newer firmware stay off until it is.',
    );
    expect(fwOptionsLine(0, editorFeatureGates(0, 0))).toMatch(/^No collar connected/);
    expect(fwOptionsLine(382, bleFeatureGates(382, 0), true)).toBe(
      'Connected collar: firmware 382, all options available',
    );
    expect(fwGateNote(0, 380)).toBe('Needs firmware 380+ — this collar has not reported its firmware.');
    expect(fwGateNote(375, 380)).toBe('Needs firmware 380+ — this collar reports 375.');
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
