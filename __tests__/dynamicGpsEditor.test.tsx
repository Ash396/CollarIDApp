/**
 * The dynamic-GPS rule through the schedule editor: Save refuses an
 * inverted trio in plain words and rewrites nothing, the card says so live,
 * and a 0 ("same as the base interval") survives Save — it used to be
 * clamped up to 1 on its own.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchedulesProvider, useSchedules } from '../src/context/SchedulesContext';
import EditScheduleScreen from '../src/screens/EditScheduleScreen';
import { defaultScheduleSlot } from '../src/utils/schedulePresets';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

/* ---------------- the collar, the route, the rest of the app ---------------- */

jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => ({ device: null, fwBuild: 0, caps: 0 }),
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

/* ---------------- render helpers ---------------- */

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

/** A GPS-on, dynamic-on schedule with the given trio. */
const withIntervals = (base: number, medium: number, high: number): Schedule => {
  const s: Schedule = { id: 'g', name: 'Schedule 1', ...defaultScheduleSlot() };
  s.gps = {
    ...s.gps!,
    enabled: true,
    dynamicSamplingMode: true,
    sampleIntervalMin: base,
    mediumMotionGpsIntervalMin: medium,
    highMotionGpsIntervalMin: high,
  };
  return s;
};

async function openEditor(schedule: Schedule): Promise<Renderer> {
  mockRoute = { params: { schedule, index: 0 } };
  const r = await mount(<EditScheduleScreen />);
  await act(async () => ctx.replaceDraft([schedule]));
  await flush();
  return r;
}

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  await AsyncStorage.clear();
  mockNavigation.goBack.mockClear();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(async () => {
  for (const r of mounted) {
    await act(async () => r.unmount());
  }
  mounted.length = 0;
  alertSpy.mockRestore();
});

describe('the schedule editor and the dynamic-GPS rule', () => {
  it('Save refuses walking slower than still, in plain words, and rewrites nothing', async () => {
    const r = await openEditor(withIntervals(5, 10, 5));
    // said live under the GPS card
    expect(texts(r)).toContain('Check the movement intervals');
    expect(texts(r).join('\n')).toMatch(/The walking interval must not be longer than the still interval/);

    await press(r, 'SAVE');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message] = alertSpy.mock.calls[0];
    expect(title).toBe('Check the GPS intervals');
    expect(message).toMatch(/^The walking interval must not be longer than the still interval/);
    expect(message).toMatch(/10 min when walking, 5 min when still/);
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
    // the draft still holds what the operator typed — nothing silently moved
    expect(ctx.draftSchedules[0].gps).toMatchObject({
      sampleIntervalMin: 5,
      mediumMotionGpsIntervalMin: 10,
      highMotionGpsIntervalMin: 5,
    });
  });

  it('Save refuses running slower than walking', async () => {
    const r = await openEditor(withIntervals(20, 5, 10));
    await press(r, 'SAVE');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][1]).toMatch(
      /^The running interval must not be longer than the walking interval/,
    );
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  it('a consistent trio saves; 0 (same as the base interval) is kept, not clamped to 1', async () => {
    const r = await openEditor(withIntervals(5, 0, 0));
    expect(texts(r)).not.toContain('Check the movement intervals');
    await press(r, 'SAVE');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    expect(ctx.draftSchedules[0].gps).toMatchObject({
      sampleIntervalMin: 5,
      mediumMotionGpsIntervalMin: 0,
      highMotionGpsIntervalMin: 0,
    });
  });

  it('with dynamic sampling off the intervals are not judged', async () => {
    const s = withIntervals(5, 10, 20);
    s.gps!.dynamicSamplingMode = false;
    const r = await openEditor(s);
    expect(texts(r)).not.toContain('Check the movement intervals');
    await press(r, 'SAVE');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('a new slot opens with the stock 2 / 1 under its 20-minute base', async () => {
    const s: Schedule = { id: 'n', name: 'Schedule 1', ...defaultScheduleSlot() };
    s.gps = { ...s.gps!, enabled: true, dynamicSamplingMode: true };
    const r = await openEditor(s);
    expect(texts(r).join('\n')).toMatch(/Every 20 min when still, 2 min\s*when walking, 1 min when running/);
    await press(r, 'SAVE');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });
});
