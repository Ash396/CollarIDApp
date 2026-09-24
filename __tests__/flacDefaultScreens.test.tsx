/**
 * The FLAC default, through the screens that carry it — the wiring the
 * helper tests in flacDefault.test.ts cannot see:
 *  - "+ Add Schedule" creates a compressed slot, and the editor offers it,
 *  - the editor holds a connected collar with no reported build to WAV,
 *    and reads an absent codec as WAV,
 *  - SEND TO DEVICE holds a saved set or a restored draft to the connected
 *    collar's codec gate: WAV on the wire below build 380 (or with no build),
 *    the read-back verifies, and "Unsent changes" goes away.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as PB from '../src/proto/collar_pb.js';
import { SchedulesProvider, useSchedules } from '../src/context/SchedulesContext';
import SchedulesScreen from '../src/screens/SchedulesScreen';
import EditScheduleScreen from '../src/screens/EditScheduleScreen';
import {
  SCHEDULE_PRESETS,
  defaultScheduleSlot,
  slotMicCodec,
} from '../src/utils/schedulePresets';
import { editorFeatureGates, micFieldsForGates, micFormatForCollar } from '../src/utils/fw';
import { appToPresetSchedule, presetToAppSchedule } from '../src/utils/presetShape';
import type { Schedule } from '../src/navigation/ScheduleNavigator';
import * as verifyWriteModule from '../src/utils/verifyWrite';

/* ---------------- the collar, the route, the rest of the app ---------------- */

// What useDevice() reports: the connected collar (or none) and its build.
let mockDeviceState: { device: any; fwBuild: number; caps: number } = {
  device: null,
  fwBuild: 0,
  caps: 0,
};
jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => mockDeviceState,
}));

let mockRoute: { params: any } = { params: {} };
const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => ({ loadRadioFromDevice: async () => {} }),
}));

/* A simulated collar behind readSchedulesFromDevice / sendConfig. It stores
 * what it is sent and echoes it back the way its firmware would: one that
 * predates the codec field (`knowsCodec` false) drops codec / lsb_drop from
 * the echo, which then reads as WAV. The packet builder stays real. */
const mockCollar: {
  knowsCodec: boolean;
  stored: { schedules: any[]; engaged: boolean };
  sent: any[];
} = { knowsCodec: true, stored: { schedules: [], engaged: true }, sent: [] };

function mockEcho(packet: any): { schedules: any[]; engaged: boolean } {
  const scp = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish()).scheduleConfigPacket!;
  const schedules = (scp.schedules ?? []).map((sc: any) => {
    if (mockCollar.knowsCodec || !sc.microphone) return sc;
    const mic = PB.MicrophoneConfig.toObject(sc.microphone);
    delete mic.codec;
    delete mic.lsbDrop;
    return PB.ScheduleConfig.create({ ...sc, microphone: PB.MicrophoneConfig.create(mic) });
  });
  return { schedules, engaged: Boolean(scp.engaged) };
}

jest.mock('../src/ble/bleManager', () => {
  const actual = jest.requireActual('../src/ble/bleManager');
  return {
    ...actual,
    readSchedulesFromDevice: jest.fn(async () => ({
      schedules: mockCollar.stored.schedules,
      engaged: mockCollar.stored.engaged,
    })),
    sendConfig: jest.fn(async (_device: any, packet: any) => {
      mockCollar.sent.push(packet);
      mockCollar.stored = mockEcho(packet);
      return true;
    }),
  };
});
const { buildSchedulePacketFromAppState } = jest.requireActual('../src/ble/bleManager');

/* ---------------- render helpers ---------------- */

const DEVICE = { id: 'AA:BB:CC:DD:EE:FF', name: 'CollarID_TEST' };
const DRAFT_KEY = `draft.sched.${DEVICE.name}`;

// The schedules context, as the screens see it.
let ctx: ReturnType<typeof useSchedules>;
function Probe() {
  ctx = useSchedules();
  return null;
}

async function flush() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise<void>(r => setTimeout(() => r(), 0));
    });
  }
}

const mounted: Renderer[] = [];
async function mount(screen: React.ReactElement): Promise<Renderer> {
  let r: Renderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <SchedulesProvider>
        <Probe />
        {screen}
      </SchedulesProvider>,
    );
  });
  await flush();
  mounted.push(r!);
  return r!;
}

const flat = (c: any): string =>
  c == null || typeof c === 'boolean'
    ? ''
    : Array.isArray(c)
    ? c.map(flat).join('')
    : typeof c === 'object'
    ? flat(c.props?.children)
    : String(c);

const texts = (r: Renderer): string[] =>
  r.root.findAll(n => n.type === Text).map(n => flat(n.props.children));

async function press(r: Renderer, label: string) {
  const t = r.root.findAll(n => n.type === Text && flat(n.props.children) === label)[0];
  if (!t) throw new Error(`no "${label}" on screen`);
  let n: ReactTestInstance | null = t;
  while (n && typeof n.props.onPress !== 'function') n = n.parent;
  if (!n) throw new Error(`"${label}" is not pressable`);
  const target = n;
  await act(async () => {
    await target.props.onPress();
  });
  await flush();
}

/* ---------------- fixtures ---------------- */

/** "+ Add Schedule" with the microphone switched on, nothing else touched. */
const newSlotMicOn = (id = 'n'): Schedule => {
  const s: Schedule = { id, name: 'Schedule 1', ...defaultScheduleSlot() };
  s.microphone = { ...s.microphone!, enabled: true };
  return s;
};

/** The same slot saved in the editor with no collar connected (every option
 *  offered, so it keeps FLAC), stored as a saved set and loaded back — what
 *  SavedSchedulesScreen hands replaceDraft. */
const savedSetSchedule = (): Schedule => {
  const s = newSlotMicOn();
  const offline = {
    ...s,
    microphone: { ...s.microphone!, ...micFieldsForGates(s.microphone, editorFeatureGates(0, 0)) },
  };
  return presetToAppSchedule(appToPresetSchedule(offline), 0);
};

/** What the collar holds before the send: one full-day slot, sensors off. */
const collarBefore = () =>
  mockEcho(
    buildSchedulePacketFromAppState([{ id: 'c', name: 'Schedule 1', ...defaultScheduleSlot() }], true),
  );

const sentMics = () =>
  mockCollar.sent.flatMap((p: any) =>
    (p.scheduleConfigPacket?.schedules ?? []).map((sc: any) => sc.microphone),
  );

let alertSpy: jest.SpyInstance;
let verifySpy: jest.SpyInstance;
beforeEach(async () => {
  await AsyncStorage.clear();
  mockDeviceState = { device: null, fwBuild: 0, caps: 0 };
  mockRoute = { params: {} };
  mockNavigation.goBack.mockClear();
  mockCollar.knowsCodec = true;
  mockCollar.stored = { schedules: [], engaged: true };
  mockCollar.sent = [];
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  // Pass-through: the Send path's own verdict on the read-back. The screen
  // shows "Success" on a mismatch too, so the alert alone cannot tell.
  verifySpy = jest.spyOn(verifyWriteModule, 'verifyWrite');
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => {
    while (mounted.length) mounted.pop()!.unmount();
  });
  jest.restoreAllMocks();
});

/** What verify-after-write concluded for the one send in this test. */
const verdict = async () => {
  expect(verifySpy).toHaveBeenCalledTimes(1);
  return verifySpy.mock.results[0].value;
};

/* ---------------- Schedules screen ---------------- */

describe('+ Add Schedule', () => {
  it('creates a compressed, lossless slot', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 382, caps: 0 };
    mockCollar.stored = collarBefore();
    const r = await mount(<SchedulesScreen />);
    expect(ctx.draftSchedules).toHaveLength(1);
    await press(r, '+ Add Schedule');
    expect(ctx.draftSchedules).toHaveLength(2);
    const added = ctx.draftSchedules[ctx.draftSchedules.length - 1];
    expect(added.microphone).toMatchObject({ enabled: false, codec: 1, lsbDrop: 0 });
  });
});

describe('SEND TO DEVICE holds the codec to the collar', () => {
  // The codec field arrived before the FLAC recorder: 375-379 echo it but
  // record WAV; 340 and a collar with no reported build predate it.
  const OLD = [
    { build: 0, knowsCodec: false },
    { build: 340, knowsCodec: false },
    { build: 375, knowsCodec: true },
  ];

  for (const { build, knowsCodec } of OLD) {
    it(`a saved set loaded for a build-${build} collar goes out as WAV and verifies`, async () => {
      mockDeviceState = { device: DEVICE, fwBuild: build, caps: 0 };
      mockCollar.knowsCodec = knowsCodec;
      mockCollar.stored = collarBefore();
      const r = await mount(<SchedulesScreen />);

      // SavedSchedulesScreen.handleLoad
      const loaded = savedSetSchedule();
      expect(loaded.microphone).toMatchObject({ enabled: true, codec: 1 });
      await act(async () => ctx.replaceDraft([loaded]));
      expect(texts(r)).toContain('Unsent changes');

      await press(r, 'SEND TO DEVICE');

      // WAV on the wire, nothing dropped
      expect(sentMics()).toHaveLength(1);
      expect(sentMics()[0]).toMatchObject({ enabled: true, codec: 0, lsbDrop: 0 });
      // the read-back verified, and the draft is the collar's config again
      expect(await verdict()).toMatchObject({ ok: true });
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Schedules updated successfully.');
      expect(ctx.isDirty).toBe(false);
      expect(texts(r)).not.toContain('Unsent changes');
      // the draft says what the collar records (no "compressed" on the card)
      expect(ctx.draftSchedules[0].microphone).toMatchObject({ codec: 0, lsbDrop: 0 });
      expect(texts(r).join('\n')).not.toMatch(/compressed/);
      expect(await AsyncStorage.getItem(DRAFT_KEY)).toBeNull();
    });
  }

  it('a draft edited with no collar, restored on reconnect to a build-340 collar: WAV, verified', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 340, caps: 0 };
    mockCollar.knowsCodec = false;
    mockCollar.stored = collarBefore();
    // The persisted draft SchedulesContext restores for this collar.
    await AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ schedules: [savedSetSchedule()], engaged: true }),
    );
    const r = await mount(<SchedulesScreen />);
    expect(texts(r)).toContain('Unsent changes');
    expect(ctx.draftSchedules[0].microphone?.codec).toBe(1);

    await press(r, 'SEND TO DEVICE');

    expect(sentMics()[0]).toMatchObject({ codec: 0, lsbDrop: 0 });
    expect(await verdict()).toMatchObject({ ok: true });
    expect(ctx.isDirty).toBe(false);
    expect(texts(r)).not.toContain('Unsent changes');
  });

  it('a build-380+ collar gets the FLAC it was asked for, and verifies', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 382, caps: 0 };
    mockCollar.stored = collarBefore();
    const r = await mount(<SchedulesScreen />);
    const loaded = savedSetSchedule();
    await act(async () => ctx.replaceDraft([loaded]));

    await press(r, 'SEND TO DEVICE');

    expect(sentMics()[0]).toMatchObject({ enabled: true, codec: 1, lsbDrop: 0 });
    expect(await verdict()).toMatchObject({ ok: true });
    expect(alertSpy).toHaveBeenCalledWith('Success', 'Schedules updated successfully.');
    expect(ctx.isDirty).toBe(false);
    expect(ctx.draftSchedules[0].microphone?.codec).toBe(1);
  });
});

describe('micFormatForCollar', () => {
  it('holds the codec only, and only when the gate is closed', () => {
    const s = { ...newSlotMicOn(), microphone: { ...newSlotMicOn().microphone!, lsbDrop: 2, sampleRate: 1, sensitivity: 2 } };
    expect(micFormatForCollar(s, { micCodec: true })).toBe(s);
    const held = micFormatForCollar(s, { micCodec: false });
    expect(held.microphone).toMatchObject({ codec: 0, lsbDrop: 0, sampleRate: 1, sensitivity: 2 });
    // already WAV, or no microphone block: the same object back
    const wav = { ...s, microphone: { ...s.microphone!, codec: 0, lsbDrop: 0 } };
    expect(micFormatForCollar(wav, { micCodec: false })).toBe(wav);
    const noMic: Schedule = { id: 'z', name: 'Schedule 1', window: { startHour: 0, endHour: 23 } };
    expect(micFormatForCollar(noMic, { micCodec: false })).toBe(noMic);
  });
});

/* ---------------- Schedule editor ---------------- */

async function openEditor(schedule: Schedule) {
  mockRoute = { params: { schedule, index: 0 } };
  const r = await mount(<EditScheduleScreen />);
  // the draft the editor saves into
  await act(async () => ctx.replaceDraft([schedule]));
  return r;
}
const savedMic = () => ctx.draftSchedules[0].microphone;

const COMPRESSED = 'Compressed (lossless, about 3× smaller)';

describe('the editor', () => {
  it('no collar: a new slot shows and saves compressed', async () => {
    const r = await openEditor(newSlotMicOn());
    expect(texts(r)).toContain(COMPRESSED);
    await press(r, 'SAVE');
    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(savedMic()).toMatchObject({ enabled: true, codec: 1, lsbDrop: 0 });
  });

  it('a connected collar that has not reported its build: saved as WAV', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 0, caps: 0 };
    const r = await openEditor(newSlotMicOn());
    expect(texts(r)).toContain(
      'Connected collar: firmware not reported yet. Options that need a newer firmware stay off until it is.',
    );
    expect(texts(r)).not.toContain(COMPRESSED);
    await press(r, 'SAVE');
    expect(savedMic()).toMatchObject({ codec: 0, lsbDrop: 0 });
  });

  it('a build-375 collar: saved as WAV; a build-382 collar: compressed', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 375, caps: 0 };
    let r = await openEditor(newSlotMicOn());
    await press(r, 'SAVE');
    expect(savedMic()).toMatchObject({ codec: 0, lsbDrop: 0 });

    mockDeviceState = { device: DEVICE, fwBuild: 382, caps: 0 };
    r = await openEditor(newSlotMicOn());
    expect(texts(r)).toContain(COMPRESSED);
    await press(r, 'SAVE');
    expect(savedMic()).toMatchObject({ codec: 1, lsbDrop: 0 });
  });

  it('a slot that names no codec opens, and saves, as WAV', async () => {
    const legacy: Schedule = {
      id: 'old',
      name: 'Schedule 1',
      window: { startHour: 0, endHour: 23 },
      microphone: { enabled: true, continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10 },
    };
    expect(slotMicCodec(legacy.microphone)).toBe(0);
    expect(slotMicCodec(undefined)).toBe(0);
    const r = await openEditor(legacy);
    expect(texts(r)).toContain('Standard (WAV)');
    await press(r, 'SAVE');
    expect(savedMic()).toMatchObject({ codec: 0, lsbDrop: 0 });
  });

  it('a quick setup fills compressed storage in', async () => {
    const audio = SCHEDULE_PRESETS.find(p => p.key === 'audio')!;
    const legacy: Schedule = {
      id: 'old',
      name: 'Schedule 1',
      window: { startHour: 0, endHour: 23 },
      microphone: { enabled: false, continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10, codec: 0 },
    };
    const r = await openEditor(legacy);
    await press(r, audio.label);
    await press(r, 'SAVE');
    expect(savedMic()).toMatchObject({ enabled: true, codec: 1, lsbDrop: 0 });
  });
});
