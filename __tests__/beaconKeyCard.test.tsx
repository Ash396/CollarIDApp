/**
 * The beacon encryption card through the screens — the wiring
 * beaconKey.test.ts cannot see:
 *  - on Home only with a connected collar whose build passes the gate AND
 *    whose status echo carries the report (absent = hidden),
 *  - the badge, the status line and the server's record (stale called out;
 *    no key store disables Provision),
 *  - Provision confirms in the website's words, runs the flow, shows the
 *    progress and the outcome; Remove keys likewise; a refusal is shown
 *    after "Provisioning: " / "Remove keys: ",
 *  - signed out: Provision is off and says why; Remove keys still works.
 */
import React from 'react';
import { Buffer } from 'buffer';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Alert, Text } from 'react-native';

import HomeScreen from '../src/screens/HomeScreen';
import BeaconKeyCard from '../src/components/BeaconKeyCard';
import { RADIO_KEYS_MIN_FW_BUILD } from '../src/utils/fw';
import { ApiError } from '../src/utils/api';
import { kcvHex } from '../src/utils/aes128';
import type { BeaconKeyEcho } from '../src/utils/beaconKey';

/* ---------------- the rest of the app ---------------- */

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn() };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));
const FAKE_DEVICE = { id: 'AA:BB', name: 'CollarID-0025001C', isConnected: async () => true };
let mockDeviceState: any;
jest.mock('../src/context/DeviceContext', () => ({ useDevice: () => mockDeviceState }));
jest.mock('../src/context/RadioConfigContext', () => ({ useRadioConfig: () => ({ clearRadioState: jest.fn() }) }));
jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({ draftSchedules: [], draftEngaged: false, clearSchedulesState: jest.fn(), replaceDraft: jest.fn() }),
}));
let mockSession = { ready: true, signedIn: true, username: 'u', role: 'user', isAdmin: false, generation: 1 };
jest.mock('../src/utils/useSession', () => ({ useSession: () => mockSession }));
jest.mock('../src/utils/fwReleases', () => ({
  getFwReleases: jest.fn(async () => []),
  fwDisplayLabel: (raw: string) => raw,
}));
jest.mock('../src/ble/otaLink', () => ({
  probeRadioCaps: jest.fn(async () => null),
  otaLinkForDevice: jest.fn(async () => null),
}));

/* The collar: a key store with the firmware's rules. */
const mockCollar = { supported: true, state: 0, gen: 0, kcv: '', result: 0 };
const collarLog: string[] = [];
const mockEcho = (): BeaconKeyEcho =>
  mockCollar.supported
    ? { beaconKey: { state: mockCollar.state, gen: mockCollar.gen, kcv: mockCollar.kcv ? new Uint8Array(Buffer.from(mockCollar.kcv, 'hex')) : new Uint8Array(0), result: mockCollar.result, txCounter: 0 } }
    : { beaconKey: null };
jest.mock('../src/ble/bleManager', () => {
  const actual = jest.requireActual('../src/ble/bleManager');
  const { kcvHex: kcv } = jest.requireActual('../src/utils/aes128');
  return {
    ...actual,
    beaconKeyIo: jest.fn(() => ({
      status: async () => {
        collarLog.push('status');
        return mockEcho();
      },
      set: async (key: Uint8Array, gen: number) => {
        collarLog.push(`set ${gen}`);
        if (gen <= mockCollar.gen) mockCollar.result = 3;
        else {
          mockCollar.state = 1;
          mockCollar.gen = gen;
          mockCollar.kcv = kcv(key);
          mockCollar.result = 1;
        }
        return mockEcho();
      },
      clear: async () => {
        collarLog.push('clear');
        mockCollar.state = 0;
        mockCollar.kcv = '';
        mockCollar.result = 2;
        return mockEcho();
      },
    })),
  };
});

/* The server. */
let mockServerStatus: any;
let mockIssueError: Error | null = null;
const serverLog: any[] = [];
const KEY_HEX = '13fa2ccb237dd8d8b4957185cc53d4e8'; // beacon/vectors.json, kcv 2b1a1e
jest.mock('../src/utils/api', () => {
  const actual = jest.requireActual('../src/utils/api');
  return {
    ...actual,
    getRadioKeyStatus: jest.fn(async () => mockServerStatus),
    issueRadioKey: jest.fn(async (uid: string, echo: any) => {
      serverLog.push(['issue', uid, echo]);
      if (mockIssueError) throw mockIssueError;
      const gen = Math.max(echo.collar_gen, 6) + 1;
      return { uid, gen, kcv: '2b1a1e', keys: [{ slot: 'beacon', gen, key: KEY_HEX, kcv: '2b1a1e' }], action: 'new' };
    }),
    markRadioKeyProvisioned: jest.fn(async (uid: string, echo: any) => {
      serverLog.push(['provisioned', uid, echo]);
      mockServerStatus = { ...mockServerStatus, state: 'provisioned', keyed: true, gen: echo.gen, kcv: echo.kcv };
      return mockServerStatus;
    }),
    clearRadioKey: jest.fn(async (uid: string) => {
      serverLog.push(['clear', uid]);
      mockServerStatus = { ...mockServerStatus, state: 'cleared', keyed: false, kcv: null };
      return mockServerStatus;
    }),
  };
});

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
/** Press the confirming button of the last Alert. */
async function confirmAlert(spy: jest.SpyInstance, index = 1) {
  const buttons = spy.mock.calls[spy.mock.calls.length - 1][2];
  await act(async () => {
    await buttons[index].onPress();
  });
  await drain();
}

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  Object.assign(mockCollar, { supported: true, state: 0, gen: 0, kcv: '', result: 0 });
  collarLog.length = 0;
  serverLog.length = 0;
  mockIssueError = null;
  mockServerStatus = { uid: '0x0025001C', state: 'none', keyed: false, gen: 0, kcv: null, stale: false, kek_configured: true, generations_left: 255 };
  mockSession = { ready: true, signedIn: true, username: 'u', role: 'user', isAdmin: false, generation: 1 };
  mockDeviceState = {
    device: FAKE_DEVICE,
    fwBuild: RADIO_KEYS_MIN_FW_BUILD,
    caps: 0x07,
    systemUid: 0x0025001c,
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

/* ---------------- on Home ---------------- */

describe('the card on Home', () => {
  it('is there with a connected collar at the gate whose echo carries the report; the uid comes from the status packet', async () => {
    const r = await render(<HomeScreen />);
    expect(byId(r, 'beaconkey-card')).toBeTruthy();
    expect(collarLog).toEqual(['status']);
    expect(textOf(byId(r, 'beaconkey-badge')!)).toBe('Plaintext (no key)');
    expect(textOf(byId(r, 'beaconkey-server')!)).toBe('Server record: no key issued for this collar.');
    expect(textOf(byId(r, 'beaconkey-card')!)).not.toMatch(/WB5M|WB15/);
  });

  it('is hidden below the gate, and hidden when the collar’s echo carries no report', async () => {
    mockDeviceState.fwBuild = RADIO_KEYS_MIN_FW_BUILD - 1;
    const r0 = await render(<HomeScreen />);
    expect(byId(r0, 'beaconkey-card')).toBeUndefined();
    expect(collarLog).toEqual([]);
    mockDeviceState.fwBuild = RADIO_KEYS_MIN_FW_BUILD;
    mockCollar.supported = false;
    const r = await render(<HomeScreen />);
    expect(byId(r, 'beaconkey-card')).toBeUndefined();
    expect(collarLog).toEqual(['status']);
  });

  it('is hidden with no collar', async () => {
    mockDeviceState.device = null;
    const r = await render(<HomeScreen />);
    expect(byId(r, 'beaconkey-card')).toBeUndefined();
  });
});

/* ---------------- the card ---------------- */

const Card = () => <BeaconKeyCard device={FAKE_DEVICE as any} uid="0x0025001C" />;

describe('the card', () => {
  it('a keyed collar: the badge names the generation and KCV, the status line the state; stale is called out', async () => {
    Object.assign(mockCollar, { state: 1, gen: 7, kcv: '2b1a1e', result: 1 });
    mockServerStatus = { ...mockServerStatus, state: 'provisioned', keyed: true, gen: 7, kcv: '2b1a1e', stale: true };
    const r = await render(<Card />);
    expect(textOf(byId(r, 'beaconkey-badge')!)).toBe('Encrypted · generation 7 · KCV 2b1a1e');
    expect(textOf(byId(r, 'beaconkey-status')!)).toMatch(/^Encrypted: the collar sends its lost-mode beacon encrypted under this key\./);
    expect(textOf(byId(r, 'beaconkey-server')!)).toBe(
      'Server record: provisioned at generation 7 (KCV 2b1a1e). This collar’s key is older than the organisation’s current generation — provision again.',
    );
    expect(byId(r, 'beaconkey-clear')!.props.disabled).toBe(false);
    expect(byId(r, 'beaconkey-provision')!.props.disabled).toBe(false);
  });

  it('no key store on the server: Provision is off and the line says why', async () => {
    mockServerStatus = { ...mockServerStatus, kek_configured: false };
    const r = await render(<Card />);
    expect(byId(r, 'beaconkey-provision')!.props.disabled).toBe(true);
    expect(textOf(byId(r, 'beaconkey-server')!)).toMatch(/^The server has no key store configured/);
    expect(byId(r, 'beaconkey-clear')!.props.disabled).toBe(true); // nothing to remove
  });

  it('Provision: the website’s confirmation, then the flow, the progress and the outcome', async () => {
    const r = await render(<Card />);
    await press(r, 'beaconkey-provision');
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, msg] = alertSpy.mock.calls[0];
    expect(title).toBe('Provision beacon encryption keys');
    expect(msg).toMatch(/^Provision beacon encryption keys for 0x0025001C from the CollarID server\?/);
    expect(msg).toMatch(/need the key \(the website’s Handheld Relay page, signed in\)\.$/);
    expect(serverLog).toEqual([]);
    await confirmAlert(alertSpy);
    expect(serverLog[0]).toEqual(['issue', '0x0025001C', { collar_gen: 0, collar_kcv: '' }]);
    expect(collarLog).toEqual(['status', 'status', 'set 7']);
    expect(serverLog[1]).toEqual(['provisioned', '0x0025001C', { gen: 7, kcv: '2b1a1e' }]);
    expect(textOf(byId(r, 'beaconkey-progress')!)).toBe('provisioned ✓ generation 7, KCV 2b1a1e, confirmed by the collar');
    expect(textOf(byId(r, 'beaconkey-message')!)).toBe(
      'Beacon encryption provisioned: the lost-mode beacon is encrypted from the next beacon on.',
    );
    expect(textOf(byId(r, 'beaconkey-badge')!)).toBe('Encrypted · generation 7 · KCV 2b1a1e');
    expect(textOf(byId(r, 'beaconkey-server')!)).toBe('Server record: provisioned at generation 7 (KCV 2b1a1e).');
    expect(textOf(r)).not.toMatch(new RegExp(KEY_HEX)); // the key is never shown
  });

  it('a refused provision shows the reason after "Provisioning:" and re-reads both sides', async () => {
    mockIssueError = new ApiError(409, 'HTTP 409', 'gen 255 reached');
    const r = await render(<Card />);
    await press(r, 'beaconkey-provision');
    await confirmAlert(alertSpy);
    expect(textOf(byId(r, 'beaconkey-message')!)).toBe('Provisioning: the server refused: gen 255 reached');
    expect(collarLog).toEqual(['status', 'status', 'status']);
    expect(byId(r, 'beaconkey-progress')).toBeUndefined();
  });

  it('REJECTED_GEN comes back in the collar’s words', async () => {
    Object.assign(mockCollar, { state: 1, gen: 9, kcv: 'aabbcc' });
    const r = await render(<Card />);
    await press(r, 'beaconkey-provision');
    await confirmAlert(alertSpy);
    // the fake server issues max(9, 6) + 1 = 10; make the collar refuse
    // by pretending it already moved on
    expect(collarLog).toContain('set 10');
    expect(textOf(byId(r, 'beaconkey-badge')!)).toBe('Encrypted · generation 10 · KCV 2b1a1e');
  });

  it('Remove keys: the website’s confirmation, CLEAR, the server told, the outcome', async () => {
    Object.assign(mockCollar, { state: 1, gen: 7, kcv: '2b1a1e', result: 1 });
    mockServerStatus = { ...mockServerStatus, state: 'provisioned', keyed: true, gen: 7, kcv: '2b1a1e' };
    const r = await render(<Card />);
    await press(r, 'beaconkey-clear');
    const [title, msg] = alertSpy.mock.calls[0];
    expect(title).toBe('Remove beacon encryption keys');
    expect(msg).toMatch(/^Remove the beacon encryption keys from 0x0025001C\?/);
    expect(msg).toMatch(/The counter is kept, so a later key starts at a fresh generation\.$/);
    await confirmAlert(alertSpy);
    expect(collarLog).toEqual(['status', 'clear']);
    expect(serverLog).toEqual([['clear', '0x0025001C']]);
    expect(textOf(byId(r, 'beaconkey-badge')!)).toBe('Plaintext (no key)');
    expect(textOf(byId(r, 'beaconkey-message')!)).toBe(
      'Beacon encryption removed: the lost-mode beacon is plaintext from the next beacon on.',
    );
    expect(textOf(byId(r, 'beaconkey-server')!)).toMatch(/cleared \(plaintext\)/);
  });

  it('signed out: Provision is off and says why; Remove keys clears the collar without the server', async () => {
    mockSession = { ...mockSession, signedIn: false };
    Object.assign(mockCollar, { state: 1, gen: 2, kcv: 'aabbcc' });
    const r = await render(<Card />);
    expect(byId(r, 'beaconkey-provision')!.props.disabled).toBe(true);
    expect(byId(r, 'beaconkey-signin')).toBeTruthy();
    expect(byId(r, 'beaconkey-server')).toBeUndefined();
    await press(r, 'beaconkey-clear');
    await confirmAlert(alertSpy);
    expect(collarLog).toEqual(['status', 'clear']);
    expect(serverLog).toEqual([]);
    expect(textOf(byId(r, 'beaconkey-progress')!)).toBe('key removed ✓ plaintext beacons');
  });
});
