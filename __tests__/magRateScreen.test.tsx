/**
 * The magnetometer rate mode through the screens (fw MAG_RATE_MIN_FW_BUILD+):
 *  - the editor offers "Interval (every N min) | 1 Hz | ... | 16 Hz" under
 *    Other sensors > Advanced; a rate hides the minutes field,
 *  - below the gate the picker is greyed with the usual firmware note and
 *    SAVE holds the rate to interval mode, the interval kept; at or above
 *    it, and with no collar, the rate is saved,
 *  - SEND TO DEVICE holds a saved set or a restored draft to the connected
 *    collar's gate: no rate on the wire below the gate, the read-back
 *    verifies against a collar that predates the field, and the draft says
 *    what the collar runs.
 * Same harness as flacDefaultScreens.test.tsx.
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
import StyledPicker from '../src/components/StyledPicker';
import { defaultScheduleSlot } from '../src/utils/schedulePresets';
import { MAG_RATE_MIN_FW_BUILD } from '../src/utils/fw';
import { ADVANCED_PREFS_KEY } from '../src/utils/editorPrefs';
import { appToPresetSchedule, presetToAppSchedule } from '../src/utils/presetShape';
import type { Schedule } from '../src/navigation/ScheduleNavigator';
import * as verifyWriteModule from '../src/utils/verifyWrite';

/* ---------------- the collar, the route, the rest of the app ---------------- */

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

/* A simulated collar behind readSchedulesFromDevice / sendConfig. One that
 * predates the rate field (`knowsRate` false) drops sample_rate_hz from its
 * echo, which then reads as interval mode. The packet builder stays real. */
const mockCollar: {
  knowsRate: boolean;
  stored: { schedules: any[]; engaged: boolean };
  sent: any[];
} = { knowsRate: true, stored: { schedules: [], engaged: true }, sent: [] };

function mockEcho(packet: any): { schedules: any[]; engaged: boolean } {
  const scp = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish()).scheduleConfigPacket!;
  const schedules = (scp.schedules ?? []).map((sc: any) => {
    if (mockCollar.knowsRate || !sc.magnetometer) return sc;
    const m = PB.MagnetometerConfig.toObject(sc.magnetometer);
    delete m.sampleRateHz;
    return PB.ScheduleConfig.create({ ...sc, magnetometer: PB.MagnetometerConfig.create(m) });
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

/** The "Heading sampling" picker: what it shows, whether it is enabled, and
 *  a way to choose (the modal list calls onValueChange with the wire value). */
const HEADING_PICKER = 'Select heading sampling';
function headingPicker(r: Renderer) {
  const p = r.root
    .findAllByType(StyledPicker)
    .find(n => n.props.placeholder === HEADING_PICKER);
  if (!p) throw new Error('no heading sampling picker on screen (is Other sensors > Advanced open?)');
  return p;
}
async function chooseRate(r: Renderer, hz: number) {
  const p = headingPicker(r);
  await act(async () => {
    p.props.onValueChange(hz);
  });
  await flush();
}
const shownLabel = (r: Renderer) =>
  headingPicker(r).props.items.find((i: any) => i.value === headingPicker(r).props.selectedValue)?.label;

/* ---------------- fixtures ---------------- */

/** A full-day slot with the magnetometer at `hz` (0 = interval), every 5 min. */
const slotAt = (hz: number, id = 'n'): Schedule => ({
  id,
  name: 'Schedule 1',
  ...defaultScheduleSlot(),
  magnetometer: { enabled: true, sampleIntervalS: 300, sampleRateHz: hz },
});

/** The same slot saved with no collar connected (every option offered, so
 *  it keeps its rate), stored as a saved set and loaded back — what
 *  SavedSchedulesScreen hands replaceDraft. */
const savedSetSchedule = (hz: number) => presetToAppSchedule(appToPresetSchedule(slotAt(hz)), 0);

/** What the collar holds before the send: one full-day slot, sensors off. */
const collarBefore = () =>
  mockEcho(
    buildSchedulePacketFromAppState([{ id: 'c', name: 'Schedule 1', ...defaultScheduleSlot() }], true),
  );

const sentMags = () =>
  mockCollar.sent.flatMap((p: any) =>
    (p.scheduleConfigPacket?.schedules ?? []).map((sc: any) => sc.magnetometer),
  );

let alertSpy: jest.SpyInstance;
let verifySpy: jest.SpyInstance;
beforeEach(async () => {
  await AsyncStorage.clear();
  // Other sensors > Advanced open, where the heading controls live.
  await AsyncStorage.setItem(ADVANCED_PREFS_KEY, JSON.stringify({ sensors: true }));
  mockDeviceState = { device: null, fwBuild: 0, caps: 0 };
  mockRoute = { params: {} };
  mockNavigation.goBack.mockClear();
  mockCollar.knowsRate = true;
  mockCollar.stored = { schedules: [], engaged: true };
  mockCollar.sent = [];
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  verifySpy = jest.spyOn(verifyWriteModule, 'verifyWrite');
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => {
    while (mounted.length) mounted.pop()!.unmount();
  });
  jest.restoreAllMocks();
});

const verdict = async () => {
  expect(verifySpy).toHaveBeenCalledTimes(1);
  return verifySpy.mock.results[0].value;
};

/* ---------------- Schedule editor ---------------- */

async function openEditor(schedule: Schedule) {
  mockRoute = { params: { schedule, index: 0 } };
  const r = await mount(<EditScheduleScreen />);
  await act(async () => ctx.replaceDraft([schedule]));
  return r;
}
const savedMag = () => ctx.draftSchedules[0].magnetometer;

const INTERVAL = 'Interval (every N min)';
const MINUTES = 'Heading every (minutes)';
const NOTE = (build: number) =>
  `Needs firmware ${MAG_RATE_MIN_FW_BUILD}+ — this collar reports ${build}. It samples on the minute interval.`;

describe('the editor', () => {
  it('lists the interval and the five rates, in order', async () => {
    const r = await openEditor(slotAt(0));
    expect(headingPicker(r).props.items).toEqual([
      { label: INTERVAL, value: 0 },
      { label: '1 Hz', value: 1 },
      { label: '2 Hz', value: 2 },
      { label: '4 Hz', value: 4 },
      { label: '8 Hz', value: 8 },
      { label: '16 Hz', value: 16 },
    ]);
  });

  it('no collar: a rate is shown, the minutes field hidden, and the rate saved', async () => {
    const r = await openEditor(slotAt(4));
    expect(shownLabel(r)).toBe('4 Hz');
    expect(headingPicker(r).props.enabled).toBe(true);
    expect(texts(r)).not.toContain(MINUTES);
    expect(texts(r).join('\n')).toMatch(/Samples 4 times a second/);
    await press(r, 'SAVE');
    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(savedMag()).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 4 });
  });

  it('interval mode shows the minutes field; choosing a rate hides it and choosing Interval brings it back', async () => {
    const r = await openEditor(slotAt(0));
    expect(shownLabel(r)).toBe(INTERVAL);
    expect(texts(r)).toContain(MINUTES);
    await chooseRate(r, 16);
    expect(shownLabel(r)).toBe('16 Hz');
    expect(texts(r)).not.toContain(MINUTES);
    await chooseRate(r, 0);
    expect(texts(r)).toContain(MINUTES);
    await chooseRate(r, 2);
    await press(r, 'SAVE');
    // the interval survives the round trip through rate mode
    expect(savedMag()).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 2 });
  });

  it(`a build-${MAG_RATE_MIN_FW_BUILD} collar: the rate is offered and saved`, async () => {
    mockDeviceState = { device: DEVICE, fwBuild: MAG_RATE_MIN_FW_BUILD, caps: 0 };
    const r = await openEditor(slotAt(8));
    expect(shownLabel(r)).toBe('8 Hz');
    expect(headingPicker(r).props.enabled).toBe(true);
    expect(texts(r).join('\n')).not.toMatch(/Needs firmware/);
    await press(r, 'SAVE');
    expect(savedMag()).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 8 });
  });

  it('a build-398 collar: the picker is greyed at Interval with the firmware note, and SAVE holds the rate to 0', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 398, caps: 0 };
    const r = await openEditor(slotAt(4));
    expect(shownLabel(r)).toBe(INTERVAL);
    expect(headingPicker(r).props.enabled).toBe(false);
    expect(texts(r)).toContain(NOTE(398));
    expect(texts(r)).toContain(MINUTES);
    expect(texts(r)).toContain(
      'Connected collar: firmware 398: heading at 1 to 16 Hz needs a firmware update',
    );
    await press(r, 'SAVE');
    expect(savedMag()).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 0 });
  });

  it('a connected collar that has not reported its build: held to interval mode too', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 0, caps: 0 };
    const r = await openEditor(slotAt(16));
    expect(shownLabel(r)).toBe(INTERVAL);
    expect(headingPicker(r).props.enabled).toBe(false);
    expect(texts(r)).toContain(
      `Needs firmware ${MAG_RATE_MIN_FW_BUILD}+ — this collar has not reported its firmware. It samples on the minute interval.`,
    );
    await press(r, 'SAVE');
    expect(savedMag()).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 0 });
  });

  it('with the magnetometer off the picker is disabled, whatever the collar', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: MAG_RATE_MIN_FW_BUILD, caps: 0 };
    const r = await openEditor({ ...slotAt(4), magnetometer: { enabled: false, sampleIntervalS: 300, sampleRateHz: 4 } });
    expect(headingPicker(r).props.enabled).toBe(false);
  });
});

/* ---------------- SEND TO DEVICE ---------------- */

describe('SEND TO DEVICE holds the rate to the collar', () => {
  const OLD = [
    { build: 0, knowsRate: false },
    { build: 398, knowsRate: false },
    { build: MAG_RATE_MIN_FW_BUILD - 1, knowsRate: false },
  ];

  for (const { build, knowsRate } of OLD) {
    it(`a saved set at 4 Hz loaded for a build-${build} collar goes out in interval mode and verifies`, async () => {
      mockDeviceState = { device: DEVICE, fwBuild: build, caps: 0 };
      mockCollar.knowsRate = knowsRate;
      mockCollar.stored = collarBefore();
      const r = await mount(<SchedulesScreen />);

      const loaded = savedSetSchedule(4);
      expect(loaded.magnetometer).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 4 });
      await act(async () => ctx.replaceDraft([loaded]));
      expect(texts(r)).toContain('Unsent changes');

      await press(r, 'SEND TO DEVICE');

      // interval mode on the wire: no rate field at all
      expect(sentMags()).toHaveLength(1);
      expect(sentMags()[0]).toMatchObject({ enabled: true, sampleIntervalS: 300 });
      expect(sentMags()[0].hasOwnProperty('sampleRateHz')).toBe(false);
      expect(Array.from(PB.MagnetometerConfig.encode(sentMags()[0]).finish())).not.toContain(0x18);
      // the read-back verified, and the draft is the collar's config again
      expect(await verdict()).toMatchObject({ ok: true });
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Schedules updated successfully.');
      expect(ctx.isDirty).toBe(false);
      expect(texts(r)).not.toContain('Unsent changes');
      // the draft says what the collar runs (every 5 min, no rate on the card)
      expect(ctx.draftSchedules[0].magnetometer).toMatchObject({ sampleRateHz: 0, sampleIntervalS: 300 });
      expect(texts(r).join('\n')).toMatch(/Heading every 5 min/);
      expect(texts(r).join('\n')).not.toMatch(/Hz/);
      expect(await AsyncStorage.getItem(DRAFT_KEY)).toBeNull();
    });
  }

  it('a draft edited with no collar, restored on reconnect to a build-398 collar: interval mode, verified', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: 398, caps: 0 };
    mockCollar.knowsRate = false;
    mockCollar.stored = collarBefore();
    await AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ schedules: [savedSetSchedule(8)], engaged: true }),
    );
    const r = await mount(<SchedulesScreen />);
    expect(texts(r)).toContain('Unsent changes');
    expect(ctx.draftSchedules[0].magnetometer?.sampleRateHz).toBe(8);

    await press(r, 'SEND TO DEVICE');

    expect(sentMags()[0].hasOwnProperty('sampleRateHz')).toBe(false);
    expect(await verdict()).toMatchObject({ ok: true });
    expect(ctx.isDirty).toBe(false);
    expect(texts(r)).not.toContain('Unsent changes');
  });

  it(`a build-${MAG_RATE_MIN_FW_BUILD} collar gets the rate it was asked for, and verifies`, async () => {
    mockDeviceState = { device: DEVICE, fwBuild: MAG_RATE_MIN_FW_BUILD, caps: 0 };
    mockCollar.stored = collarBefore();
    const r = await mount(<SchedulesScreen />);
    await act(async () => ctx.replaceDraft([savedSetSchedule(4)]));

    await press(r, 'SEND TO DEVICE');

    expect(sentMags()[0]).toMatchObject({ enabled: true, sampleIntervalS: 300, sampleRateHz: 4 });
    expect(await verdict()).toMatchObject({ ok: true });
    expect(alertSpy).toHaveBeenCalledWith('Success', 'Schedules updated successfully.');
    expect(ctx.isDirty).toBe(false);
    expect(ctx.draftSchedules[0].magnetometer?.sampleRateHz).toBe(4);
    expect(texts(r).join('\n')).toMatch(/Heading at 4 Hz/);
  });

  it('a rate the collar echoes back is not an unsent change', async () => {
    mockDeviceState = { device: DEVICE, fwBuild: MAG_RATE_MIN_FW_BUILD, caps: 0 };
    mockCollar.stored = mockEcho(buildSchedulePacketFromAppState([slotAt(16, 'c')], true));
    const r = await mount(<SchedulesScreen />);
    expect(ctx.draftSchedules[0].magnetometer).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 16 });
    expect(ctx.isDirty).toBe(false);
    expect(texts(r)).not.toContain('Unsent changes');
    expect(texts(r).join('\n')).toMatch(/Heading at 16 Hz/);
  });
});
