/**
 * The app account, through the screens that use it:
 *  - Home's account card: AutoFill-ready sign-in form, the server's error
 *    words, show-password, signed-in state with shortcuts, sign-out, expiry;
 *  - Saved schedules unlocks when Home signs in (one session);
 *  - the radio editor's "Load from CollarID server": fills the form from
 *    GET /devices/{uid}/config and sends nothing;
 *  - the Map tab: sign-in prompt, the signed-in WebView and its rules.
 * Tokens and keys are obviously fake.
 */
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import { Linking, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { Buffer } from 'buffer';

import * as api from '../src/utils/api';
import AccountCard from '../src/components/AccountCard';
import SavedSchedulesScreen from '../src/screens/SavedSchedulesScreen';
import EditRadioConfigScreen from '../src/screens/EditRadioConfigScreen';
import LiveMapScreen from '../src/screens/LiveMapScreen';
import HomeScreen from '../src/screens/HomeScreen';
import StyledPicker from '../src/components/StyledPicker';

/* ---------------- the rest of the app ---------------- */

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));

let mockDeviceState: any = { device: null, systemUid: null };
jest.mock('../src/context/DeviceContext', () => ({
  useDevice: () => mockDeviceState,
}));

const mockRadio = {
  deviceRadioConfig: null,
  draftRadioConfig: null,
  setDraftRadioConfig: jest.fn(),
  clearRadioState: jest.fn(),
};
jest.mock('../src/context/RadioConfigContext', () => ({
  useRadioConfig: () => mockRadio,
}));

jest.mock('../src/context/SchedulesContext', () => ({
  useSchedules: () => ({
    draftSchedules: [],
    draftEngaged: false,
    clearSchedulesState: jest.fn(),
    replaceDraft: jest.fn(),
  }),
}));

/* ---------------- helpers ---------------- */

const FAKE_TOKEN = 'fake-token-for-tests';

function resp(status: number, body?: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('no body');
      return body;
    },
  };
}

let fetchMock: jest.Mock;

const byId = (r: Renderer, id: string): ReactTestInstance | undefined =>
  r.root.findAll(n => n.props.testID === id)[0];

const textOf = (n: ReactTestInstance | Renderer): string => {
  const root = 'root' in n ? (n as Renderer).root : (n as ReactTestInstance);
  return root
    .findAllByType(Text)
    .map(t => {
      const flat = (c: any): string =>
        c == null || typeof c === 'boolean'
          ? ''
          : typeof c === 'string' || typeof c === 'number'
          ? String(c)
          : Array.isArray(c)
          ? c.map(flat).join('')
          : c.props
          ? flat(c.props.children)
          : '';
      return flat(t.props.children);
    })
    .join('\n');
};

// Every renderer a test creates is unmounted after it, so a later test's
// session changes never reach screens that are still mounted.
let mounted: Renderer[] = [];

async function render(el: React.ReactElement): Promise<Renderer> {
  let r!: Renderer;
  await act(async () => {
    r = ReactTestRenderer.create(el);
  });
  mounted.push(r);
  return r;
}

async function press(r: Renderer, id: string) {
  const n = byId(r, id);
  if (!n) throw new Error(`no ${id}`);
  await act(async () => {
    await n.props.onPress();
  });
}

async function type(r: Renderer, id: string, value: string) {
  const n = byId(r, id);
  if (!n) throw new Error(`no ${id}`);
  await act(async () => {
    n.props.onChangeText(value);
  });
}

async function signInDirect(role = 'user', username = 'field-team') {
  fetchMock.mockResolvedValueOnce(resp(200, { token: FAKE_TOKEN, role }));
  await act(async () => {
    await api.login(username, 'not-a-real-password');
  });
  fetchMock.mockClear();
}

afterEach(async () => {
  for (const r of mounted) {
    await act(async () => r.unmount());
  }
  mounted = [];
});

beforeEach(async () => {
  fetchMock = jest.fn();
  (globalThis as any).fetch = fetchMock;
  await act(async () => {
    await api.loadSession();
    await api.logout();
  });
  (Keychain as any).__reset();
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockDeviceState = { device: null, systemUid: null };
});

/* ---------------- Home: account card ---------------- */

describe('Home account card', () => {
  it('signed out: username/password with iOS AutoFill hints', async () => {
    const r = await render(<AccountCard />);
    expect(byId(r, 'account-card-signed-out')).toBeTruthy();

    const u = byId(r, 'account-username')!;
    expect(u.props.textContentType).toBe('username');
    expect(u.props.autoComplete).toBe('username');
    expect(u.props.autoCapitalize).toBe('none');
    expect(u.props.autoCorrect).toBe(false);

    const p = byId(r, 'account-password')!;
    expect(p.props.textContentType).toBe('password');
    expect(p.props.autoComplete).toBe('current-password');
    expect(p.props.autoCapitalize).toBe('none');
    expect(p.props.autoCorrect).toBe(false);
    expect(p.props.secureTextEntry).toBe(true);
  });

  it('show-password toggles the secure entry', async () => {
    const r = await render(<AccountCard />);
    await press(r, 'account-toggle-password');
    expect(byId(r, 'account-password')!.props.secureTextEntry).toBe(false);
    expect(textOf(byId(r, 'account-toggle-password')!)).toBe('Hide');
    await press(r, 'account-toggle-password');
    expect(byId(r, 'account-password')!.props.secureTextEntry).toBe(true);
  });

  it('asks for both fields before calling the server', async () => {
    const r = await render(<AccountCard />);
    await press(r, 'account-sign-in');
    expect(textOf(byId(r, 'account-error')!)).toBe(
      'Enter your username and password.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the server's error text", async () => {
    const r = await render(<AccountCard />);
    await type(r, 'account-username', 'field-team');
    await type(r, 'account-password', 'wrong');
    fetchMock.mockResolvedValueOnce(resp(401, { detail: 'Invalid credentials' }));
    await press(r, 'account-sign-in');
    expect(textOf(byId(r, 'account-error')!)).toBe('Invalid credentials');
    expect(byId(r, 'account-card-signed-out')).toBeTruthy();
  });

  it('says when the server cannot be reached', async () => {
    const r = await render(<AccountCard />);
    await type(r, 'account-username', 'field-team');
    await type(r, 'account-password', 'x');
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await press(r, 'account-sign-in');
    expect(textOf(byId(r, 'account-error')!)).toBe(
      'Cannot reach server. Check your connection.',
    );
  });

  it('signs in: "Signed in as", role for admins, shortcuts, sign out', async () => {
    const r = await render(<AccountCard />);
    await type(r, 'account-username', '  field-team ');
    await type(r, 'account-password', 'not-a-real-password');
    fetchMock.mockResolvedValueOnce(resp(200, { token: FAKE_TOKEN, role: 'admin' }));
    await press(r, 'account-sign-in');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).username).toBe('field-team');
    const card = byId(r, 'account-card-signed-in')!;
    expect(card).toBeTruthy();
    expect(textOf(card)).toContain('Signed in as field-team · admin');
    expect(textOf(r)).not.toContain('not-a-real-password');

    await press(r, 'account-open-saved');
    expect(mockNavigation.navigate).toHaveBeenLastCalledWith('SchedulesTab', {
      screen: 'SavedSchedules',
      initial: false,
    });
    await press(r, 'account-open-map');
    expect(mockNavigation.navigate).toHaveBeenLastCalledWith('MapTab');

    await press(r, 'account-sign-out');
    expect(byId(r, 'account-card-signed-out')).toBeTruthy();
    expect(api.getToken()).toBeNull();
    expect((Keychain as any).__items()['org.collarid.api']).toBeUndefined();
  });

  it('a plain user sees no role', async () => {
    await signInDirect('user');
    const r = await render(<AccountCard />);
    expect(textOf(byId(r, 'account-card-signed-in')!)).toContain(
      'Signed in as field-team',
    );
    expect(textOf(r)).not.toContain('admin');
  });

  it('goes back to the form, and says why, when a 401 ends the session elsewhere', async () => {
    await signInDirect();
    const r = await render(<AccountCard />);
    fetchMock.mockResolvedValueOnce(resp(401));
    await act(async () => {
      await api.listPresets().catch(() => {});
    });
    expect(byId(r, 'account-card-signed-out')).toBeTruthy();
    expect(textOf(byId(r, 'account-error')!)).toMatch(/expired/);
  });

  it('sits below the Bluetooth list on Home', async () => {
    const r = await render(<HomeScreen />);
    const all = textOf(r);
    expect(all.indexOf('NEARBY COLLARS')).toBeGreaterThanOrEqual(0);
    expect(all.indexOf('ACCOUNT')).toBeGreaterThan(all.indexOf('NEARBY COLLARS'));
    expect(byId(r, 'account-card-signed-out')).toBeTruthy();
    const scroll = r.root.findAll(
      n => n.props.keyboardShouldPersistTaps === 'handled',
    )[0];
    expect(scroll).toBeTruthy();
    await act(async () => r.unmount());
  });
});

/* ---------------- Saved schedules: the same session ---------------- */

describe('Saved schedules', () => {
  it('unlocks when Home signs in, and locks again on sign-out', async () => {
    const r = await render(<SavedSchedulesScreen />);
    expect(textOf(r)).toContain('Sign in');

    // Its own form uses the same AutoFill hints.
    const inputs = r.root.findAll(
      n => n.props.textContentType === 'password' && !!n.props.onChangeText,
    );
    expect(inputs.length).toBeGreaterThan(0);

    fetchMock.mockResolvedValueOnce(resp(200, { token: FAKE_TOKEN, role: 'user' }));
    fetchMock.mockResolvedValueOnce(resp(200, [])); // GET /schedules
    await act(async () => {
      await api.login('field-team', 'not-a-real-password');
    });
    await act(async () => {});
    expect(textOf(r)).toContain('Signed in as field-team');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.collarid.org/schedules');

    await act(async () => {
      await api.logout();
    });
    expect(textOf(r)).not.toContain('Signed in as');
  });
});

/* ---------------- Radio editor: Load from CollarID server ---------------- */

const OTAA_REPLY = {
  configured: true,
  region: 'AU915',
  supports_otaa: true,
  dev_eui: '0101010101010101',
  join_eui: '0202020202020202',
  app_key: 'aa'.repeat(16),
  nwk_key: 'bb'.repeat(16),
};
const ABP_REPLY = {
  configured: true,
  region: 'EU868',
  supports_otaa: false,
  dev_addr: '0c0c0c0c',
  nwk_s_enc_key: 'dd'.repeat(16),
  app_s_key: 'ee'.repeat(16),
  f_nwk_s_int_key: 'f1'.repeat(16),
  s_nwk_s_int_key: 'f2'.repeat(16),
};

const pickers = (r: Renderer) =>
  r.root.findAllByType(StyledPicker).map(p => p.props.selectedValue);

describe('Radio editor: Load from CollarID server', () => {
  it('no collar connected: nothing offered', async () => {
    await signInDirect();
    const r = await render(<EditRadioConfigScreen />);
    expect(byId(r, 'radio-load-from-server')).toBeUndefined();
    expect(byId(r, 'radio-server-signed-out')).toBeUndefined();
  });

  it('signed out: explains where to sign in, no button', async () => {
    mockDeviceState = { device: { id: 'x', name: 'CollarID-0006001B' }, systemUid: 0x0006001b };
    const r = await render(<EditRadioConfigScreen />);
    expect(byId(r, 'radio-load-from-server')).toBeUndefined();
    expect(textOf(byId(r, 'radio-server-signed-out')!)).toMatch(/Home tab/);
  });

  it('OTAA: uses the status UID, fills every OTAA field + region + auth, sends nothing', async () => {
    await signInDirect();
    // The name disagrees on purpose: the status packet's UID wins.
    mockDeviceState = { device: { id: 'x', name: 'CollarID-12345678' }, systemUid: 0x0006001b };
    const r = await render(<EditRadioConfigScreen />);
    fetchMock.mockResolvedValueOnce(resp(200, OTAA_REPLY));
    await press(r, 'radio-load-from-server');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.collarid.org/devices/0x0006001B/config',
    );
    expect(pickers(r).slice(0, 2)).toEqual(['REGION_AU915', 'AUTH_OTAA']);
    expect(byId(r, 'radio-devEui')!.props.value).toBe('0101010101010101');
    expect(byId(r, 'radio-joinEui')!.props.value).toBe('0202020202020202');
    expect(byId(r, 'radio-appKey')!.props.value).toBe('AA'.repeat(16));
    expect(byId(r, 'radio-nwkKey')!.props.value).toBe('BB'.repeat(16));
    expect(textOf(byId(r, 'radio-server-note')!)).toContain(
      'Filled from the CollarID server for 0x0006001B (OTAA, AU915)',
    );
    // Review first: no draft written, nothing sent.
    expect(mockRadio.setDraftRadioConfig).not.toHaveBeenCalled();
  });

  it('ABP: fills every ABP field; falls back to the Bluetooth name for the UID', async () => {
    await signInDirect();
    mockDeviceState = { device: { id: 'x', name: 'CollarID-00060018' }, systemUid: null };
    const r = await render(<EditRadioConfigScreen />);
    fetchMock.mockResolvedValueOnce(resp(200, ABP_REPLY));
    await press(r, 'radio-load-from-server');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.collarid.org/devices/0x00060018/config',
    );
    expect(pickers(r).slice(0, 2)).toEqual(['REGION_EU868', 'AUTH_ABP']);
    expect(byId(r, 'radio-devAddr')!.props.value).toBe('0C0C0C0C');
    expect(byId(r, 'radio-nwkSKey')!.props.value).toBe('DD'.repeat(16));
    expect(byId(r, 'radio-appSKey')!.props.value).toBe('EE'.repeat(16));
    expect(byId(r, 'radio-fNwkSIntKey')!.props.value).toBe('F1'.repeat(16));
    expect(byId(r, 'radio-sNwkSIntKey')!.props.value).toBe('F2'.repeat(16));
    expect(textOf(byId(r, 'radio-server-note')!)).toMatch(/Bluetooth name/);
    expect(mockRadio.setDraftRadioConfig).not.toHaveBeenCalled();
  });

  it('SAVE after loading puts the server keys in the draft (the existing path)', async () => {
    await signInDirect();
    mockDeviceState = { device: { id: 'x', name: 'CollarID-0006001B' }, systemUid: 0x0006001b };
    const r = await render(<EditRadioConfigScreen />);
    fetchMock.mockResolvedValueOnce(resp(200, OTAA_REPLY));
    await press(r, 'radio-load-from-server');
    const save = r.root.findAll(
      n => typeof n.props.onPress === 'function' && textOf(n) === 'SAVE',
    )[0];
    await act(async () => save.props.onPress());
    expect(mockRadio.setDraftRadioConfig).toHaveBeenCalledTimes(1);
    const pb = mockRadio.setDraftRadioConfig.mock.calls[0][0];
    expect(pb.loRaWANConfig.region).toBe(1);
    expect(pb.loRaWANConfig.auth).toBe(0);
    expect(Buffer.from(pb.loRaWANConfig.otaa.appKey).toString('hex')).toBe(
      'aa'.repeat(16),
    );
  });

  it('403 / not on the network: explains and leaves the form alone', async () => {
    await signInDirect();
    mockDeviceState = { device: { id: 'x', name: 'CollarID-0006001B' }, systemUid: 0x0006001b };
    const r = await render(<EditRadioConfigScreen />);

    fetchMock.mockResolvedValueOnce(resp(403, { detail: 'Device not provisioned to your account' }));
    await press(r, 'radio-load-from-server');
    expect(textOf(byId(r, 'radio-server-note')!)).toMatch(/not on your CollarID account/);
    expect(byId(r, 'radio-devEui')!.props.value).toBe('');

    fetchMock.mockResolvedValueOnce(resp(200, { configured: false, detail: 'Device not found in ChirpStack' }));
    await press(r, 'radio-load-from-server');
    expect(textOf(byId(r, 'radio-server-note')!)).toMatch(/own LoRaWAN network/);
    expect(byId(r, 'radio-devEui')!.props.value).toBe('');
  });

  it('a collar with no usable ID: says so, calls nothing', async () => {
    await signInDirect();
    mockDeviceState = { device: { id: 'x', name: 'CollarID' }, systemUid: null };
    const r = await render(<EditRadioConfigScreen />);
    await press(r, 'radio-load-from-server');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(textOf(byId(r, 'radio-server-note')!)).toMatch(/Could not tell this collar's ID/);
  });
});

/* ---------------- Map tab ---------------- */

const webview = (r: Renderer) =>
  r.root.findAll(n => n.type === ('RNCWebView' as any))[0];

describe('Map tab', () => {
  it('signed out: a prompt to sign in on Home, no WebView', async () => {
    const r = await render(<LiveMapScreen />);
    expect(byId(r, 'map-signed-out')).toBeTruthy();
    expect(webview(r)).toBeUndefined();
    await press(r, 'map-go-home');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });

  it('signed in: the live map, incognito, signed in before content loads', async () => {
    await signInDirect('admin');
    const r = await render(<LiveMapScreen />);
    const wv = webview(r);
    expect(wv).toBeTruthy();
    expect(wv.props.source).toEqual({ uri: 'https://collarid.org/live-map' });
    expect(wv.props.incognito).toBe(true);
    expect(wv.props.injectedJavaScriptBeforeContentLoadedForMainFrameOnly).toBe(true);
    const js: string = wv.props.injectedJavaScriptBeforeContentLoaded;
    expect(js).toContain('window.location.origin !== "https://collarid.org"');
    expect(js).toContain(JSON.stringify(FAKE_TOKEN));
    expect(js).toContain('"admin"');
    expect(mockNavigation.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({ headerRight: expect.any(Function) }),
    );
  });

  it('keeps navigation on collarid.org; everything else goes to Safari', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    const decide = webview(r).props.onShouldStartLoadWithRequest;
    expect(decide({ url: 'https://collarid.org/export', isTopFrame: true })).toBe(true);
    expect(open).not.toHaveBeenCalled();
    expect(decide({ url: 'https://www.openstreetmap.org/copyright', isTopFrame: true })).toBe(false);
    expect(open).toHaveBeenCalledWith('https://www.openstreetmap.org/copyright');
  });

  it('Reload builds a fresh WebView', async () => {
    const mounts = (require('react-native-webview').WebView as any).__mounts;
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    const start = mounts();
    const opts = mockNavigation.setOptions.mock.calls.at(-1)[0];
    const header = await render(opts.headerRight());
    await act(async () => byId(header, 'map-reload')!.props.onPress());
    expect(mounts()).toBe(start + 1);
    expect(webview(r)).toBeTruthy();
  });

  it('sign-out removes the WebView (and its incognito storage with it)', async () => {
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    expect(webview(r)).toBeTruthy();
    await act(async () => {
      await api.logout();
    });
    expect(webview(r)).toBeUndefined();
    expect(byId(r, 'map-signed-out')).toBeTruthy();
  });

  it('page reports expiry, server confirms: the app session ends', async () => {
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    fetchMock.mockResolvedValueOnce(resp(401)); // GET /auth/me
    await act(async () => {
      await webview(r).props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: 'collarid:session-expired' }),
          url: 'https://collarid.org/live-map',
        },
      });
    });
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.collarid.org/auth/me');
    expect(api.getToken()).toBeNull();
    expect(byId(r, 'map-signed-out')).toBeTruthy();
  });

  it('page reports expiry, server disagrees: one fresh WebView, never a loop', async () => {
    const mounts = (require('react-native-webview').WebView as any).__mounts;
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    const start = mounts();
    const msg = {
      nativeEvent: {
        data: JSON.stringify({ type: 'collarid:session-expired' }),
        url: 'https://collarid.org/live-map',
      },
    };
    fetchMock.mockResolvedValue(resp(200, { username: 'field-team' }));
    await act(async () => {
      await webview(r).props.onMessage(msg);
    });
    expect(mounts()).toBe(start + 1); // one fresh WebView, injected afresh
    await act(async () => {
      await webview(r).props.onMessage(msg);
    });
    expect(mounts()).toBe(start + 1); // not again
    expect(api.getToken()).toBe(FAKE_TOKEN);
  });

  it('posts the session to the page once it has loaded; the page adopting it ends "signing in"', async () => {
    const WV = require('react-native-webview').WebView as any;
    WV.__resetPosted();
    await signInDirect('admin');
    const r = await render(<LiveMapScreen />);
    expect(WV.__posted()).toEqual([]); // nothing before the page is up
    expect(byId(r, 'map-handing')).toBeUndefined();
    await act(async () => {
      webview(r).props.onLoadEnd({ nativeEvent: {} });
    });
    const posted = WV.__posted();
    expect(posted).toHaveLength(1);
    expect(JSON.parse(posted[0])).toEqual({ type: 'collarid:session', token: FAKE_TOKEN, role: 'admin' });
    expect(byId(r, 'map-handing')).toBeTruthy();
    await act(async () => {
      await webview(r).props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: 'collarid:session-adopted' }),
          url: 'https://collarid.org/live-map',
        },
      });
    });
    expect(byId(r, 'map-handing')).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled(); // adoption asks the server nothing
    // a fresh page (Reload) is handed the session again on its own load end
    const opts = mockNavigation.setOptions.mock.calls.at(-1)[0];
    const header = await render(opts.headerRight());
    await act(async () => byId(header, 'map-reload')!.props.onPress());
    expect(WV.__posted()).toHaveLength(1);
    await act(async () => {
      webview(r).props.onLoadEnd({ nativeEvent: {} });
    });
    expect(WV.__posted()).toHaveLength(2);
  });

  it('signed out: no message is ever posted', async () => {
    const WV = require('react-native-webview').WebView as any;
    WV.__resetPosted();
    const r = await render(<LiveMapScreen />);
    expect(webview(r)).toBeUndefined();
    expect(WV.__posted()).toEqual([]);
  });

  it('ignores messages that are not from collarid.org', async () => {
    await signInDirect();
    const r = await render(<LiveMapScreen />);
    await act(async () => {
      await webview(r).props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: 'collarid:session-expired' }),
          url: 'https://evil.example/',
        },
      });
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
