/**
 * Geofence zones through the screens — the wiring geofence.test.ts cannot
 * see:
 *  - the Zones screen reads the collar's slots on open (fw 305+), lists
 *    them with the website's row words and badges, and below 305 explains
 *    the gate instead of writing a frame,
 *  - Delete confirms, runs the delete transaction and re-reads,
 *  - the editor validates with the website's words, sends the fragments
 *    through the tunnel, shows the paced progress and the collar's verdict,
 *    and goes back on "applied"; the unsent form is a per-collar draft,
 *  - the map picker hands corners back as lat, lon lines.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ZonesScreen from '../src/screens/ZonesScreen';
import EditZoneScreen, { ZONE_DRAFT_KEY_PREFIX } from '../src/screens/EditZoneScreen';
import SchedulesScreen from '../src/screens/SchedulesScreen';
import { CFG_ACK, GF_ACTION } from '../src/utils/geofence';
import type { Fence } from '../src/utils/geofence';

/* ---------------- the rest of the app ---------------- */

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => () => {}),
};
let mockRouteParams: any = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));

const FAKE_DEVICE = { id: 'AA:BB', name: 'CollarID_TEST', isConnected: async () => true };
let mockDeviceState: any;
jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => mockDeviceState,
}));
jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => ({ clearRadioState: jest.fn(), loadRadioFromDevice: jest.fn() }),
}));
jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({
    draftSchedules: [],
    collarSchedules: [],
    draftEngaged: false,
    collarEngaged: false,
    setDraftEngaged: jest.fn(),
    loadSchedulesFromDevice: jest.fn(),
    clearSchedulesState: jest.fn(),
    addSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    replaceDraft: jest.fn(),
    discardDraft: jest.fn(),
    isDirty: false,
  }),
}));

/* The tunnel: a fake collar holding fences, transactions applied by the
   test's own rule. */
let mockFences: Fence[] = [];
let mockActiveMask = 0;
let mockTxnVerdict: { ackStatus: number; missingMask: number } = { ackStatus: CFG_ACK.APPLIED, missingMask: 0 };
let mockTxnError: Error | null = null;
const txnLog: any[][] = [];
jest.mock('../src/ble/bleManager', () => {
  const actual = jest.requireActual('../src/ble/bleManager');
  return {
    ...actual,
    tunnelQueryAllFences: jest.fn(async () => ({
      fences: mockFences.map(f => ({ ...f })),
      echo: { echoSeq: 1, fenceActiveMask: mockActiveMask },
    })),
    tunnelRunTxn: jest.fn(async (_device: any, frags: any[], onProgress?: (d: number, t: number) => void) => {
      txnLog.push(frags);
      if (mockTxnError) throw mockTxnError;
      for (let i = 1; i <= frags.length + 2; i++) onProgress?.(i, frags.length + 2);
      return { echoSeq: 2, ...mockTxnVerdict };
    }),
  };
});
const BLE = require('../src/ble/bleManager');

/* ---------------- render helpers ---------------- */

async function drain() {
  for (let i = 0; i < 4; i++) {
    await act(async () => {
      await new Promise<void>(r => setTimeout(() => r(), 0));
    });
  }
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
  c == null || typeof c === 'boolean' ? '' : Array.isArray(c) ? c.map(flat).join('') : typeof c === 'object' ? flat(c.props?.children) : String(c);
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
async function type(r: Renderer, id: string, text: string) {
  const n = r.root.findAll(x => x.type === TextInput && x.props.testID === id)[0];
  if (!n) throw new Error(`no input ${id}`);
  await act(async () => {
    n.props.onChangeText(text);
  });
  await drain();
}

const fence = (over: Partial<Fence> = {}): Fence => ({
  fenceId: 1,
  action: GF_ACTION.REPORT_ONLY,
  zoneSlot: 0,
  confirmFixes: 2,
  minDwellMin: 15,
  maxHaccM: 25,
  consumed: false,
  startEpoch: 0,
  expiryEpoch: 0,
  verts: [
    { latitudeE7: 442645000, longitudeE7: -725755000 },
    { latitudeE7: 442645000, longitudeE7: -725710000 },
    { latitudeE7: 442690000, longitudeE7: -725710000 },
  ],
  vertexCount: 3,
  ...over,
});

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockNavigation.navigate.mockClear();
  mockNavigation.goBack.mockClear();
  mockRouteParams = {};
  mockFences = [];
  mockActiveMask = 0;
  mockTxnVerdict = { ackStatus: CFG_ACK.APPLIED, missingMask: 0 };
  mockTxnError = null;
  txnLog.length = 0;
  BLE.tunnelQueryAllFences.mockClear();
  BLE.tunnelRunTxn.mockClear();
  await AsyncStorage.clear();
  mockDeviceState = {
    device: FAKE_DEVICE,
    fwBuild: 305,
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

/* ---------------- the list ---------------- */

describe('the Zones screen', () => {
  it('is reached from the Schedules header', async () => {
    const r = await render(<SchedulesScreen />);
    await press(r, 'zones-link');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Zones');
  });

  it('with no collar: says to connect one, reads nothing', async () => {
    mockDeviceState.device = null;
    const r = await render(<ZonesScreen />);
    expect(byId(r, 'zones-no-collar')).toBeTruthy();
    expect(BLE.tunnelQueryAllFences).not.toHaveBeenCalled();
  });

  it('below build 305: the website’s gate words, no tunnel frame', async () => {
    mockDeviceState.fwBuild = 300;
    const r = await render(<ZonesScreen />);
    const gate = textOf(byId(r, 'zones-gate')!);
    expect(gate).toMatch(/firmware \(build 300\) predates Bluetooth zone delivery/);
    expect(gate).toMatch(/firmware v1\.15\+ \(build 305\)/);
    expect(gate).toMatch(/Remote Schedule page/);
    expect(byId(r, 'zones-add')).toBeUndefined();
    expect(BLE.tunnelQueryAllFences).not.toHaveBeenCalled();
  });

  it('a collar that has not reported its build waits for it', async () => {
    mockDeviceState.fwBuild = 0;
    const r = await render(<ZonesScreen />);
    expect(textOf(byId(r, 'zones-gate')!)).toMatch(/has not reported its firmware yet/);
    expect(BLE.tunnelQueryAllFences).not.toHaveBeenCalled();
  });

  it('reads the slots on open and lists them with the row words and badges', async () => {
    mockFences = [
      fence(),
      fence({ fenceId: 3, action: GF_ACTION.SCHEDULE_OVERRIDE, zoneSlot: 2 }),
      fence({ fenceId: 4, action: GF_ACTION.DETACH, consumed: true, expiryEpoch: 1700000000 }),
    ];
    mockActiveMask = 0b0100; // inside zone 3
    const r = await render(<ZonesScreen />);
    expect(BLE.tunnelQueryAllFences).toHaveBeenCalledTimes(1);
    expect(byId(r, 'zones-empty')).toBeUndefined();
    const row1 = textOf(byId(r, 'zone-row-1')!);
    expect(row1).toMatch(/Zone 1/);
    expect(row1).toMatch(/Test only/);
    expect(row1).toMatch(/3 corners · expires never/);
    expect(textOf(byId(r, 'zone-row-3')!)).toMatch(/Switch schedule → slot 2/);
    expect(byId(r, 'zone-inside-3')).toBeTruthy();
    expect(byId(r, 'zone-inside-1')).toBeUndefined();
    const row4 = textOf(byId(r, 'zone-row-4')!);
    expect(row4).toMatch(/DETACH/);
    expect(byId(r, 'zone-fired-4')).toBeTruthy();
    expect(byId(r, 'zones-add')).toBeTruthy();
    // Refresh re-reads
    await press(r, 'zones-refresh');
    expect(BLE.tunnelQueryAllFences).toHaveBeenCalledTimes(2);
  });

  it('an empty collar says so; Add zone opens the editor on the first free slot', async () => {
    mockFences = [fence({ fenceId: 1 }), fence({ fenceId: 2 })];
    const r = await render(<ZonesScreen />);
    await press(r, 'zones-add');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditZone', { form: undefined, suggestedId: 3 });
    mockFences = [];
    const r2 = await render(<ZonesScreen />);
    expect(byId(r2, 'zones-empty')).toBeTruthy();
  });

  it('Edit opens the editor on the fence as a form', async () => {
    mockFences = [fence({ fenceId: 2, action: GF_ACTION.SCHEDULE_OVERRIDE, zoneSlot: 1 })];
    const r = await render(<ZonesScreen />);
    await press(r, 'zone-edit-2');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditZone', {
      form: expect.objectContaining({ id: 2, action: 0, zoneSlot: 1, confirm: 2, hacc: 25 }),
    });
    const form = mockNavigation.navigate.mock.calls[0][1].form;
    expect(form.vertsText.split('\n')).toHaveLength(3);
  });

  it('Delete confirms, runs the delete transaction, reports the verdict and re-reads', async () => {
    mockFences = [fence({ fenceId: 2 })];
    const r = await render(<ZonesScreen />);
    await press(r, 'zone-delete-2');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, msg, buttons] = alertSpy.mock.calls[0];
    expect(title).toBe('Delete zone');
    expect(msg).toBe('Delete zone 2 from the collar now (over Bluetooth)?');
    expect(txnLog).toHaveLength(0);
    await act(async () => {
      await buttons[1].onPress();
    });
    await drain();
    expect(txnLog).toEqual([[{ scheduleIndex: 0, cfgGeofence: { fenceId: 2, vertexCount: 0 } }]]);
    expect(alertSpy).toHaveBeenLastCalledWith('Zone deleted', 'Zone 2 deleted.');
    expect(BLE.tunnelQueryAllFences).toHaveBeenCalledTimes(2);
    expect(byId(r, 'zones-error')).toBeUndefined();
  });

  it('a refused delete shows the collar’s verdict', async () => {
    mockFences = [fence({ fenceId: 1 })];
    mockTxnVerdict = { ackStatus: CFG_ACK.RAIL, missingMask: 9 };
    const r = await render(<ZonesScreen />);
    await press(r, 'zone-delete-1');
    await act(async () => {
      await alertSpy.mock.calls[0][2][1].onPress();
    });
    await drain();
    expect(textOf(byId(r, 'zones-error')!)).toBe(
      'The collar refused: zones need at least one schedule with GPS enabled.',
    );
  });
});

/* ---------------- the editor ---------------- */

const CORNERS = '44.26450, -72.57550\n44.26450, -72.57100\n44.26900, -72.57100\n44.26900, -72.57550';

describe('the zone editor', () => {
  it('validates with the website’s words before writing anything', async () => {
    const r = await render(<EditZoneScreen />);
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe('bad corner line: ""');
    await type(r, 'editzone-verts', '1,2\n3,4');
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe('a zone needs 3–8 corners');
    await type(r, 'editzone-verts', '1,2\n3,4\nnope');
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe('bad corner line: "nope"');
    await type(r, 'editzone-verts', CORNERS);
    await type(r, 'editzone-start-date', '2026-10-01');
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toMatch(/^start needs a date/);
    expect(txnLog).toHaveLength(0);
  });

  it('sends the meta + corner fragments, shows the paced progress, goes back on "applied", forgets the draft', async () => {
    mockRouteParams = { suggestedId: 2 };
    const r = await render(<EditZoneScreen />);
    await type(r, 'editzone-verts', CORNERS);
    await type(r, 'editzone-confirm', '3');
    await type(r, 'editzone-hacc', '0');
    // the draft is persisted per collar while editing
    expect(JSON.parse((await AsyncStorage.getItem(`${ZONE_DRAFT_KEY_PREFIX}CollarID_TEST`))!)).toMatchObject({
      id: 2, action: GF_ACTION.REPORT_ONLY, confirm: '3', hacc: '0', vertsText: CORNERS,
    });
    await press(r, 'editzone-send');
    expect(txnLog).toHaveLength(1);
    const frags = txnLog[0];
    expect(frags).toHaveLength(5);
    expect(frags[0].cfgGeofence).toEqual({
      fenceId: 2, action: 2, zoneSlot: 0, confirmFixes: 3, minDwellMin: 15, maxHaccM: 0,
      startEpoch: 0, expiryEpoch: 0, vertexCount: 4,
    });
    expect(frags[1].cfgGeofence.vertex).toEqual({ latitudeE7: 442645000, longitudeE7: -725755000 });
    expect(alertSpy).toHaveBeenCalledWith('Zone delivered', 'Zone delivered and applied.');
    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(await AsyncStorage.getItem(`${ZONE_DRAFT_KEY_PREFIX}CollarID_TEST`)).toBeNull();
  });

  it('a refused zone shows the collar’s verdict and stays; a failed delivery says so', async () => {
    mockTxnVerdict = { ackStatus: CFG_ACK.RAIL, missingMask: 7 };
    const r = await render(<EditZoneScreen />);
    await type(r, 'editzone-verts', CORNERS);
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe(
      'The collar refused: the zone shape was invalid (needs 3–8 corners, every corner delivered).',
    );
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
    mockTxnError = new Error('collar did not answer over BLE (echo timeout)');
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe('Delivery failed: collar did not answer over BLE (echo timeout)');
  });

  it('a detach zone needs an expiry: prefilled a week out when the action is picked, refused when cleared', async () => {
    const r = await render(<EditZoneScreen />);
    await type(r, 'editzone-verts', CORNERS);
    // pick "Detach when inside" on the action picker
    const pickers = r.root.findAll(n => n.props.placeholder === 'Action' && typeof n.props.onValueChange === 'function');
    await act(async () => {
      pickers[0].props.onValueChange(GF_ACTION.DETACH);
    });
    await drain();
    const date = r.root.findAll(x => x.type === TextInput && x.props.testID === 'editzone-expiry-date')[0];
    expect(date.props.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await press(r, 'editzone-send');
    expect(byId(r, 'editzone-error')).toBeUndefined();
    expect(txnLog[0][0].cfgGeofence.action).toBe(GF_ACTION.DETACH);
    expect(txnLog[0][0].cfgGeofence.expiryEpoch).toBeGreaterThan(Date.now() / 1000 + 6 * 86400);
    // cleared: the website's refusal
    mockNavigation.goBack.mockClear();
    await type(r, 'editzone-expiry-date', '');
    await type(r, 'editzone-expiry-time', '');
    await press(r, 'editzone-send');
    expect(textOf(byId(r, 'editzone-error')!)).toBe('a detach zone requires an expiry (max 30 days)');
  });

  it('editing a fence the collar holds starts from its form; the schedule slot shows for a switch zone', async () => {
    mockRouteParams = {
      form: { id: 3, action: GF_ACTION.SCHEDULE_OVERRIDE, zoneSlot: 2, confirm: 4, hacc: 10, start: 0, expiry: 0, vertsText: CORNERS },
    };
    const r = await render(<EditZoneScreen />);
    expect(textOf(r)).toMatch(/EDIT ZONE 3/);
    expect(r.root.findAll(n => n.props.placeholder === 'Schedule slot').length).toBeGreaterThan(0);
    await press(r, 'editzone-send');
    expect(txnLog[0][0].cfgGeofence).toMatchObject({ fenceId: 3, action: 0, zoneSlot: 2, confirmFixes: 4, maxHaccM: 10 });
  });

  it('below build 305 the send explains the gate instead of writing', async () => {
    mockDeviceState.fwBuild = 300;
    const r = await render(<EditZoneScreen />);
    await type(r, 'editzone-verts', CORNERS);
    await press(r, 'editzone-send');
    expect(alertSpy).toHaveBeenCalledWith('Zones over Bluetooth', 'Bluetooth zone delivery needs firmware v1.15+ (build 305).');
    expect(txnLog).toHaveLength(0);
  });

  it('the map picker hands corners back as lat, lon lines', async () => {
    const r = await render(<EditZoneScreen />);
    await press(r, 'editzone-map');
    const picker = byId(r, 'zone-map-picker')!;
    expect(picker).toBeTruthy();
    const web = byId(r, 'zone-map-webview')!;
    expect(web.props.source.html).toMatch(/maplibre-gl@4\.5\.0/);
    await act(async () => {
      web.props.onMessage({ nativeEvent: { data: JSON.stringify({ type: 'ready' }) } });
      web.props.onMessage({ nativeEvent: { data: JSON.stringify({ type: 'count', n: 3 }) } });
    });
    await drain();
    expect(textOf(byId(r, 'zone-map-count')!)).toBe('3 corners');
    await act(async () => {
      web.props.onMessage({
        nativeEvent: { data: JSON.stringify({ type: 'corners', corners: [[44.2645, -72.5755], [44.2645, -72.571], [44.269, -72.571]] }) },
      });
    });
    await drain();
    const verts = r.root.findAll(x => x.type === TextInput && x.props.testID === 'editzone-verts')[0];
    expect(verts.props.value).toBe('44.264500, -72.575500\n44.264500, -72.571000\n44.269000, -72.571000');
  });
});
