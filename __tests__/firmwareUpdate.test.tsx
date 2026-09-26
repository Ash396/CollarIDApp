/**
 * The firmware update through the screens — the wiring ota.test.ts cannot
 * see:
 *  - the card sits with the connected collar on Home; below build 266 (or
 *    with no parsable build) the button explains the gate instead of
 *    opening the modal,
 *  - the modal probes the radio and shows its policy; the image comes from
 *    the server's list (signed in), with the website's picker label,
 *  - Upload & Apply downloads the image, runs the transfer with the
 *    release's version as the stream's hash, follows progress, then says
 *    "leave it alone" — and the link dropping (the device leaving) is the
 *    positive confirmation, in the website's words,
 *  - Cancel transfer aborts; a failed transfer offers the trace and Try
 *    again; a radio that must be updated first disables the button.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text } from 'react-native';

import HomeScreen from '../src/screens/HomeScreen';
import FirmwareUpdateModal, { CHECKING_WORDS, DONE_WORDS } from '../src/components/FirmwareUpdateModal';
import { OtaAborted, U5_BLE_GATE_REASON, radioCapsFrom } from '../src/ble/ota';

/* ---------------- the rest of the app ---------------- */

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));

const FAKE_DEVICE = { id: 'AA:BB', name: 'CollarID_TEST', isConnected: jest.fn(async () => true) };
let mockDeviceState: any;
jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => mockDeviceState,
}));
jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => ({ clearRadioState: jest.fn() }),
}));
jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({ draftSchedules: [], draftEngaged: false, clearSchedulesState: jest.fn(), replaceDraft: jest.fn() }),
}));

let mockSession = { ready: true, signedIn: true, username: 'u', role: 'user', isAdmin: false, generation: 1 };
jest.mock('../src/utils/useSession', () => ({ useSession: () => mockSession }));

const mockReleases = [
  { id: 7, version: 'v1.21.0', target: 'u5', filename: 'v1_21_0.bin', file_size: 600 * 1024 },
  { id: 5, version: 'v1.20.4', target: 'u5', filename: 'v1_20_4.bin', file_size: 590 * 1024 },
];
const mockImage = new Uint8Array(200 * 1024);
jest.mock('../src/utils/api', () => {
  const actual = jest.requireActual('../src/utils/api');
  return {
    ...actual,
    listFirmware: jest.fn(async () => mockReleases),
    downloadFirmware: jest.fn(async () => mockImage),
  };
});
jest.mock('../src/utils/fwReleases', () => ({
  getFwReleases: jest.fn(async () => [{ version: 'v1.21.0', build: 425 }]),
  fwDisplayLabel: jest.requireActual('../src/utils/fwReleases').fwDisplayLabel,
}));

let mockCaps = radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x07]), { canNotify: true, canWriteNoResp: true });
const mockLink = { canNotify: true, canWriteNoResp: true, isConnected: jest.fn(async () => true) };
jest.mock('../src/ble/otaLink', () => ({
  probeRadioCaps: jest.fn(async () => mockCaps),
  otaLinkForDevice: jest.fn(async () => mockLink),
}));

/* The transfer parks until the test drives it: progress steps, then a
   result or an error. */
let mockSendCalls: any[] = [];
let mockSendControl: { progress: (s: number, t: number) => void; finish: (r: any) => void; fail: (e: any) => void; abortRequested: () => boolean } | null = null;
jest.mock('../src/ble/ota', () => {
  const actual = jest.requireActual('../src/ble/ota');
  return {
    ...actual,
    sendU5Image: jest.fn(
      (link: any, image: Uint8Array, hash: string, opts: any) =>
        new Promise((resolve, reject) => {
          mockSendCalls.push({ link, image, hash });
          mockSendControl = {
            progress: (s, t) => opts.onProgress?.(s, t),
            finish: resolve,
            fail: reject,
            abortRequested: () => !!opts.abortRequested?.(),
          };
        }),
    ),
  };
});
const OTA = require('../src/ble/ota');
const API = require('../src/utils/api');

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
const byId = (r: Renderer, id: string): ReactTestInstance | undefined => r.root.findAll(n => n.props.testID === id)[0];
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

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockSendCalls = [];
  mockSendControl = null;
  OTA.sendU5Image.mockClear();
  API.listFirmware.mockClear();
  API.downloadFirmware.mockClear();
  mockLink.isConnected.mockClear();
  mockLink.isConnected.mockImplementation(async () => true);
  mockCaps = radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x07]), { canNotify: true, canWriteNoResp: true });
  mockSession = { ready: true, signedIn: true, username: 'u', role: 'user', isAdmin: false, generation: 1 };
  mockDeviceState = {
    device: FAKE_DEVICE,
    fwBuild: 425,
    caps: 0x07,
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

/* ---------------- the card and the gate ---------------- */

describe('the firmware update card on Home', () => {
  it('is there only with a connected collar; the button opens the modal', async () => {
    mockDeviceState.device = null;
    const r0 = await render(<HomeScreen />);
    expect(byId(r0, 'fwupdate-card')).toBeUndefined();
    mockDeviceState.device = FAKE_DEVICE;
    const r = await render(<HomeScreen />);
    expect(byId(r, 'fwupdate-card')).toBeTruthy();
    expect(byId(r, 'fwupdate-gate-note')).toBeUndefined();
    expect(byId(r, 'fwupdate-modal')).toBeUndefined();
    await press(r, 'fwupdate-open');
    expect(alertSpy).not.toHaveBeenCalled();
    expect(byId(r, 'fwupdate-modal')).toBeTruthy();
    expect(textOf(byId(r, 'fwupdate-card')!)).not.toMatch(/WB5M|WB15/);
  });

  it('below build 266 the button explains the gate (USB-C once) instead of opening', async () => {
    mockDeviceState.fwBuild = 260;
    const r = await render(<HomeScreen />);
    expect(textOf(byId(r, 'fwupdate-gate-note')!)).toBe('Needs firmware 266+ — this collar reports 260.');
    await press(r, 'fwupdate-open');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, msg] = alertSpy.mock.calls[0];
    expect(title).toBe('Firmware update');
    expect(msg).toMatch(/needs firmware v1\.14\.0 \(build 266\)\+/);
    expect(msg).toMatch(/USB-C/);
    expect(byId(r, 'fwupdate-modal')).toBeUndefined();
  });

  it('a collar with no parsable build (a bare hash) is blocked too', async () => {
    mockDeviceState.fwBuild = 0;
    const r = await render(<HomeScreen />);
    expect(textOf(byId(r, 'fwupdate-gate-note')!)).toMatch(/has not reported its firmware/);
    await press(r, 'fwupdate-open');
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });
});

/* ---------------- the modal ---------------- */

function Harness({ device, fwBuild = 425, version = 'b425 abc1234' }: { device: any; fwBuild?: number; version?: string }) {
  return <FirmwareUpdateModal visible device={device} fwBuild={fwBuild} firmwareVersion={version} onClose={() => {}} />;
}

describe('the update modal', () => {
  it('probes the radio, lists the server images with the website’s label, names the installed release', async () => {
    const r = await render(<Harness device={FAKE_DEVICE} />);
    expect(textOf(byId(r, 'fwupdate-installed')!)).toBe('Installed: v1.21.0 · b425');
    expect(textOf(byId(r, 'fwupdate-radio')!)).toBe('Radio firmware is up to date');
    expect(API.listFirmware).toHaveBeenCalledWith('u5');
    const picker = r.root.findAll(n => n.props.placeholder === 'Firmware image' && typeof n.props.onValueChange === 'function')[0];
    expect(picker.props.items.map((i: any) => i.label)).toEqual(['v1.21.0 — v1_21_0.bin (600 KB)', 'v1.20.4 — v1_20_4.bin (590 KB)']);
    expect(picker.props.selectedValue).toBe(7);
    expect(byId(r, 'fwupdate-start')!.props.disabled).toBe(false);
    expect(byId(r, 'fwupdate-gate')).toBeUndefined();
  });

  it('signed out: no list, a sign-in note, the button off', async () => {
    mockSession = { ...mockSession, signedIn: false };
    const r = await render(<Harness device={FAKE_DEVICE} />);
    expect(byId(r, 'fwupdate-signin')).toBeTruthy();
    expect(API.listFirmware).not.toHaveBeenCalled();
    expect(byId(r, 'fwupdate-start')!.props.disabled).toBe(true);
  });

  it('a radio that should be updated first disables the button with the website’s reason', async () => {
    mockCaps = radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x03]), { canNotify: false, canWriteNoResp: false });
    const r = await render(<Harness device={FAKE_DEVICE} />);
    expect(textOf(byId(r, 'fwupdate-radio')!)).toBe(
      'Radio firmware is out of date — Update the radio first — this then runs several times faster.',
    );
    expect(byId(r, 'fwupdate-start')!.props.disabled).toBe(true);
  });

  it('below the safe build the gate box shows the website’s words and the button is off', async () => {
    const r = await render(<Harness device={FAKE_DEVICE} fwBuild={250} version="b250 abc1234" />);
    expect(textOf(byId(r, 'fwupdate-gate')!)).toBe(U5_BLE_GATE_REASON);
    expect(byId(r, 'fwupdate-start')!.props.disabled).toBe(true);
  });

  it('Upload & Apply: download, transfer with the version as the hash, progress, "leave it alone", then the drop confirms', async () => {
    let device: any = FAKE_DEVICE;
    let setDevice: (d: any) => void = () => {};
    function Wrap() {
      const [d, set] = React.useState<any>(FAKE_DEVICE);
      device = d;
      setDevice = set;
      return <Harness device={d} />;
    }
    const r = await render(<Wrap />);
    await press(r, 'fwupdate-start');
    expect(API.downloadFirmware).toHaveBeenCalledWith(7);
    expect(mockSendCalls).toHaveLength(1);
    expect(mockSendCalls[0].hash).toBe('v1.21.0');
    expect(mockSendCalls[0].image).toBe(mockImage);
    expect(mockSendCalls[0].link).toBe(mockLink);
    expect(byId(r, 'fwupdate-abort')).toBeTruthy();
    expect(byId(r, 'fwupdate-start')).toBeUndefined();
    await act(async () => {
      mockSendControl!.progress(51200, 204800);
    });
    await drain();
    expect(textOf(byId(r, 'fwupdate-status')!)).toBe('Uploading… 50/200 KB');
    expect(textOf(byId(r, 'fwupdate-pct')!)).toBe('25%');
    await act(async () => {
      mockSendControl!.progress(204800, 204800);
      mockSendControl!.finish({ delivered: true, confirmed: true });
    });
    await drain();
    expect(textOf(byId(r, 'fwupdate-pct')!)).toBe('100%');
    expect(textOf(byId(r, 'fwupdate-status')!)).toMatch(new RegExp(`^Sent in \\d+ s\\. ${CHECKING_WORDS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    expect(byId(r, 'fwupdate-abort')).toBeUndefined();
    expect(byId(r, 'fwupdate-hide')).toBeTruthy();
    // the collar reboots: Home's disconnect handler drops the device
    await act(async () => {
      setDevice(null);
    });
    await drain();
    expect(device).toBeNull();
    expect(textOf(byId(r, 'fwupdate-status')!)).toBe(DONE_WORDS);
    expect(byId(r, 'fwupdate-done')).toBeTruthy();
    expect(textOf(byId(r, 'fwupdate-modal')!)).not.toMatch(/WB5M|WB15/);
  });

  it('a link already gone when the transfer resolves is the reboot too', async () => {
    const r = await render(<Harness device={FAKE_DEVICE} />);
    await press(r, 'fwupdate-start');
    mockLink.isConnected.mockImplementation(async () => false);
    await act(async () => {
      mockSendControl!.finish({ delivered: true, confirmed: false });
    });
    await drain();
    expect(textOf(byId(r, 'fwupdate-status')!)).toBe(DONE_WORDS);
  });

  it('Cancel transfer asks the transfer to stop; the abort ends in a plain message and Try again', async () => {
    const r = await render(<Harness device={FAKE_DEVICE} />);
    await press(r, 'fwupdate-start');
    expect(mockSendControl!.abortRequested()).toBe(false);
    await press(r, 'fwupdate-abort');
    expect(mockSendControl!.abortRequested()).toBe(true);
    expect(textOf(byId(r, 'fwupdate-status')!)).toBe('Cancelling…');
    await act(async () => {
      mockSendControl!.fail(new OtaAborted());
    });
    await drain();
    expect(textOf(byId(r, 'fwupdate-failure')!)).toMatch(/^Update cancelled\. The collar keeps its current firmware/);
    await press(r, 'fwupdate-again');
    expect(byId(r, 'fwupdate-start')).toBeTruthy();
  });

  it('a failed transfer shows the message, the trace on request, and Try again', async () => {
    const r = await render(<Harness device={FAKE_DEVICE} />);
    await press(r, 'fwupdate-start');
    await act(async () => {
      mockSendControl!.fail(new Error('The collar stored nothing — its main-processor firmware is too old to update over Bluetooth. Update it once over USB-C, then this flow works.'));
    });
    await drain();
    expect(textOf(byId(r, 'fwupdate-failure')!)).toMatch(/^Failed: The collar stored nothing/);
    expect(byId(r, 'fwupdate-trace')).toBeUndefined();
    await press(r, 'fwupdate-trace-toggle');
    expect(byId(r, 'fwupdate-trace')).toBeTruthy();
    expect(byId(r, 'fwupdate-again')).toBeTruthy();
    expect(byId(r, 'fwupdate-done')).toBeTruthy();
  });
});
