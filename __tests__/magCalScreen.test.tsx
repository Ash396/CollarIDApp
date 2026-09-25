/**
 * Magnetometer calibration through the screens — the wiring the flow tests
 * in magCal.test.ts cannot see:
 *  - the card sits with the connected collar on Home; below build 398 the
 *    button says so instead of opening the modal,
 *  - Start → the instructions give way to the ring, which follows
 *    progress_pct, then the verdict; the card keeps a "Last run" line,
 *  - Abort sends CMD_MAG_CALIBRATE_ABORT once and the run ends stopped,
 *  - a run already going on the collar is followed, not restarted,
 *  - firmware that never reports a run ends in a clear message, and the
 *    modal stops whatever the collar may be doing before showing it.
 *
 * The transport is a gated fake: every status/command call parks until the
 * test answers it, so each step of the run is observed without timers
 * (the 2 s pacing is the flow test's; here polls are immediate).
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text } from 'react-native';

import HomeScreen from '../src/screens/HomeScreen';
import { MAG_CAL } from '../src/utils/magCal';
import type { MagCalEcho, MagCalReport } from '../src/utils/magCal';

/* ---------------- the rest of the app ---------------- */

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));

const FAKE_DEVICE = {
  id: 'AA:BB:CC:DD:EE:FF',
  name: 'CollarID_TEST',
  isConnected: async () => true,
};
let mockDeviceState: any;
jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => mockDeviceState,
}));
jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => ({ clearRadioState: jest.fn() }),
}));
jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({
    draftSchedules: [],
    draftEngaged: false,
    clearSchedulesState: jest.fn(),
    replaceDraft: jest.fn(),
  }),
}));

/* Polls immediate: the run then advances exactly one io call per answer. */
jest.mock('../src/utils/magCal', () => {
  const actual = jest.requireActual('../src/utils/magCal');
  return {
    ...actual,
    runMagCal: (io: any, opts: any) => actual.runMagCal(io, { ...opts, pollMs: 0 }),
  };
});

/* The gated transport behind magCalIo(). */
const ioLog: (string | number)[] = [];
const parked: ((e: MagCalEcho | null) => void)[] = [];
let seq = 0;
const mockGatedIo = {
  status: jest.fn(
    () =>
      new Promise<MagCalEcho | null>(res => {
        ioLog.push('status');
        parked.push(res);
      }),
  ),
  command: jest.fn(
    (cmd: number) =>
      new Promise<MagCalEcho | null>(res => {
        ioLog.push(cmd);
        parked.push(res);
      }),
  ),
};
jest.mock('../src/ble/bleManager', () => {
  const actual = jest.requireActual('../src/ble/bleManager');
  return { ...actual, magCalIo: jest.fn(() => mockGatedIo) };
});

const { STATE: S, VERDICT: V, REASON: R } = MAG_CAL;
const rep = (state: number, run: number, pct: number, extra: Partial<MagCalReport> = {}): MagCalReport => ({
  state, run, progressPct: pct, sectorsHit: Math.round((pct / 100) * MAG_CAL.SECTORS),
  verdict: 0, reason: 0, fieldUtX10: 0, residualPermille: 0, ...extra,
});

/* ---------------- render helpers ---------------- */

async function drain() {
  for (let i = 0; i < 4; i++) {
    await act(async () => {
      await new Promise<void>(r => setTimeout(() => r(), 0));
    });
  }
}

/** Answer the collar's oldest parked frame with this report. */
async function answer(report: MagCalReport | null) {
  const res = parked.shift();
  if (!res) throw new Error('the flow has no frame in flight');
  await act(async () => {
    res({ echoSeq: ++seq, magCal: report });
  });
  await drain();
}

let mounted: Renderer[] = [];
async function render(el: React.ReactElement): Promise<Renderer> {
  let r!: Renderer;
  await act(async () => {
    r = ReactTestRenderer.create(el);
  });
  await drain();
  mounted.push(r);
  return r;
}

const byId = (r: Renderer, id: string): ReactTestInstance | undefined =>
  r.root.findAll(n => n.props.testID === id)[0];

const flat = (c: any): string =>
  c == null || typeof c === 'boolean'
    ? ''
    : Array.isArray(c)
    ? c.map(flat).join('')
    : typeof c === 'object'
    ? flat(c.props?.children)
    : String(c);
const textOf = (n: ReactTestInstance | Renderer): string => {
  const root = 'root' in n ? (n as Renderer).root : (n as ReactTestInstance);
  return root.findAllByType(Text).map(t => flat(t.props.children)).join('\n');
};

async function press(r: Renderer, id: string) {
  const n = byId(r, id);
  if (!n) throw new Error(`no ${id}`);
  await act(async () => {
    n.props.onPress();
  });
  await drain();
}

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  ioLog.length = 0;
  parked.length = 0;
  seq = 0;
  mockGatedIo.status.mockClear();
  mockGatedIo.command.mockClear();
  mockDeviceState = {
    device: FAKE_DEVICE,
    fwBuild: 398,
    caps: 0,
    systemUid: null,
    setDevice: jest.fn(),
    setFwBuild: jest.fn(),
    setCaps: jest.fn(),
    setSystemUid: jest.fn(),
  };
});

afterEach(async () => {
  for (const r of mounted) {
    await act(async () => r.unmount());
  }
  mounted = [];
  alertSpy.mockRestore();
});

/** Open the modal and press Start; the first status frame is then parked. */
async function openAndStart(r: Renderer) {
  await press(r, 'magcal-open');
  expect(byId(r, 'magcal-instructions')).toBeTruthy();
  await press(r, 'magcal-start');
  expect(ioLog).toEqual(['status']);
}

/* ---------------- the card and the gate ---------------- */

describe('the calibration card on Home', () => {
  it('is there only with a connected collar', async () => {
    mockDeviceState.device = null;
    const r = await render(<HomeScreen />);
    expect(byId(r, 'magcal-card')).toBeUndefined();
    expect(byId(r, 'magcal-modal')).toBeUndefined();
  });

  it('with a 398+ collar: the button opens the instructions, the LED words and Start', async () => {
    const r = await render(<HomeScreen />);
    expect(byId(r, 'magcal-card')).toBeTruthy();
    expect(byId(r, 'magcal-gate-note')).toBeUndefined();
    expect(byId(r, 'magcal-modal')).toBeUndefined();
    await press(r, 'magcal-open');
    expect(alertSpy).not.toHaveBeenCalled();
    const modal = byId(r, 'magcal-modal')!;
    const words = textOf(modal);
    expect(words).toMatch(/Away from metal and electronics/);
    expect(words).toMatch(/a few slow figure-8s, then a full roll about each axis/);
    expect(words).toMatch(/pulses cyan while it collects/);
    expect(words).toMatch(/two green flashes, then blue/);
    expect(words).toMatch(/two red flashes/);
    expect(words).not.toMatch(/assembl|batter|housing|sound/i);
    expect(byId(r, 'magcal-start')).toBeTruthy();
    expect(byId(r, 'magcal-cancel')).toBeTruthy();
    expect(byId(r, 'magcal-abort')).toBeUndefined();
    // Cancel closes without writing a frame
    await press(r, 'magcal-cancel');
    expect(byId(r, 'magcal-modal')).toBeUndefined();
    expect(ioLog).toEqual([]);
  });

  it('below build 398 the button explains the gate instead of opening the modal', async () => {
    mockDeviceState.fwBuild = 380;
    const r = await render(<HomeScreen />);
    expect(textOf(byId(r, 'magcal-gate-note')!)).toBe(
      'Needs firmware 398+ — this collar reports 380.',
    );
    await press(r, 'magcal-open');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message] = alertSpy.mock.calls[0];
    expect(title).toBe('Magnetometer calibration');
    expect(message).toMatch(/needs firmware build 398\+/);
    expect(message).toMatch(/this collar reports 380/);
    expect(byId(r, 'magcal-modal')).toBeUndefined();
    expect(ioLog).toEqual([]);
  });

  it('a collar that has not reported its build is gated too, in those words', async () => {
    mockDeviceState.fwBuild = 0;
    const r = await render(<HomeScreen />);
    expect(textOf(byId(r, 'magcal-gate-note')!)).toMatch(/has not reported its firmware/);
    await press(r, 'magcal-open');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(byId(r, 'magcal-modal')).toBeUndefined();
  });
});

/* ---------------- the run ---------------- */

describe('a calibration run from the modal', () => {
  it('start, the ring follows progress, the fit, the verdict, the last-run line', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    expect(byId(r, 'magcal-instructions')).toBeUndefined();
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Starting…');

    await answer(null); // nothing running: the start goes out
    expect(ioLog).toEqual(['status', 20]);
    await answer(rep(S.COLLECTING, 1, 0));
    expect(textOf(byId(r, 'magcal-pct')!)).toBe('0%');
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Keep turning the collar through every orientation');
    expect(ioLog).toEqual(['status', 20, 'status']);

    await answer(rep(S.COLLECTING, 1, 40));
    expect(textOf(byId(r, 'magcal-pct')!)).toBe('40%');
    expect(textOf(byId(r, 'magcal-modal')!)).toMatch(/10 of 26 directions covered/);

    await answer(rep(S.FITTING, 1, 100));
    expect(textOf(byId(r, 'magcal-pct')!)).toBe('100%');
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Enough directions covered. Fitting…');

    await answer(rep(S.DONE, 1, 100, { verdict: V.GOOD, fieldUtX10: 512, residualPermille: 18 }));
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Calibrated — good');
    expect(textOf(byId(r, 'magcal-result-detail')!)).toMatch(/51\.2 µT, fit error 1\.8 %/);
    expect(byId(r, 'magcal-abort')).toBeUndefined();
    expect(byId(r, 'magcal-again')).toBeTruthy();
    expect(textOf(byId(r, 'magcal-last')!)).toBe('Last run: Calibrated — good');
    // the verdict's echo ends the run: no poll after it
    expect(ioLog).toEqual(['status', 20, 'status', 'status', 'status']);

    await press(r, 'magcal-done');
    expect(byId(r, 'magcal-modal')).toBeUndefined();
    expect(textOf(byId(r, 'magcal-last')!)).toBe('Last run: Calibrated — good');
  });

  it('Abort sends CMD_MAG_CALIBRATE_ABORT once and the run ends stopped', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    await answer(null);
    await answer(rep(S.COLLECTING, 1, 10));
    await answer(rep(S.COLLECTING, 1, 30));
    expect(textOf(byId(r, 'magcal-pct')!)).toBe('30%');

    await press(r, 'magcal-abort');
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Stopping…');
    expect(byId(r, 'magcal-abort')!.props.disabled).toBe(true);
    // the abort goes out as the next frame, after the poll in flight
    expect(ioLog).toEqual(['status', 20, 'status', 'status']);
    await answer(rep(S.COLLECTING, 1, 35));
    expect(ioLog).toEqual(['status', 20, 'status', 'status', 21]);
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Stopping…');
    await answer(rep(S.COLLECTING, 1, 35)); // the collar acts on it a moment later
    await answer(rep(S.ABORTED, 1, 35));
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Calibration stopped');
    expect(textOf(byId(r, 'magcal-result-detail')!)).toMatch(/stays in force/);
    expect(ioLog.filter(k => k === 21)).toHaveLength(1);
    expect(textOf(byId(r, 'magcal-last')!)).toBe('Last run: Calibration stopped');
  });

  it('closing the modal mid-run stops the run first; the result step then closes', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    await answer(null);
    await answer(rep(S.COLLECTING, 1, 10));
    await act(async () => {
      r.root.findAll(n => typeof n.props.onRequestClose === 'function')[0].props.onRequestClose();
    });
    await drain();
    expect(byId(r, 'magcal-modal')).toBeTruthy();
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Stopping…');
    await answer(rep(S.COLLECTING, 1, 10));
    expect(ioLog[ioLog.length - 1]).toBe(21);
    await answer(rep(S.ABORTED, 1, 10));
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Calibration stopped');
    await press(r, 'magcal-done');
    expect(byId(r, 'magcal-modal')).toBeUndefined();
  });

  it('a run already going on the collar is followed, not restarted', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    await answer(rep(S.COLLECTING, 4, 50));
    expect(ioLog).toEqual(['status', 'status']); // no start frame
    expect(textOf(byId(r, 'magcal-pct')!)).toBe('50%');
    await answer(rep(S.COLLECTING, 4, 75));
    await answer(rep(S.DONE, 4, 100, { verdict: V.FAIR, reason: R.TIMEOUT, fieldUtX10: 488, residualPermille: 22 }));
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Calibrated — fair, you can repeat');
    expect(ioLog).not.toContain(20);
    expect(textOf(byId(r, 'magcal-last')!)).toBe('Last run: Calibrated — fair, you can repeat');
  });

  it('firmware that never reports a run: a clear message, after stopping whatever the collar does', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    await answer(null); // the start goes out
    // START_POLLS empty echoes are tolerated (each one draws another poll)...
    for (let i = 0; i < MAG_CAL.START_POLLS; i++) await answer(null);
    expect(ioLog).toEqual(['status', 20, 'status', 'status', 'status']);
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Starting…');
    // ...the next one is where the flow gives up; the link is up, so the
    // modal stops the collar before saying so
    await answer(null);
    expect(ioLog[ioLog.length - 1]).toBe(21);
    expect(textOf(byId(r, 'magcal-status')!)).toBe('Stopping the run on the collar…');
    await answer(null);
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Calibration did not finish');
    expect(textOf(byId(r, 'magcal-result-detail')!)).toMatch(
      /its firmware does not support it yet\. Update the collar’s firmware and try again\./,
    );
    expect(byId(r, 'magcal-again')).toBeTruthy();
  });

  it('a failed fit: the retry words, and the previous calibration stays', async () => {
    const r = await render(<HomeScreen />);
    await openAndStart(r);
    await answer(null);
    await answer(rep(S.COLLECTING, 1, 20));
    await answer(rep(S.FAILED, 1, 20, { verdict: V.RETRY, reason: R.NOT_ENOUGH_ROTATION }));
    expect(textOf(byId(r, 'magcal-result-title')!)).toBe('Not enough rotation — try again');
    expect(textOf(byId(r, 'magcal-result-detail')!)).toMatch(/previous calibration, if any, stays in force/);
    // Calibrate again returns to the instructions with nothing written
    const n = ioLog.length;
    await press(r, 'magcal-again');
    expect(byId(r, 'magcal-instructions')).toBeTruthy();
    expect(ioLog.length).toBe(n);
  });
});
