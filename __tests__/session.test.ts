/**
 * The shared CollarID session (src/utils/api.ts):
 *  - the token lives in the iOS Keychain (service org.collarid.api), never
 *    AsyncStorage; username + role stay in AsyncStorage,
 *  - a token left in AsyncStorage by older builds moves to the Keychain once,
 *  - sign-in errors are the server's words, or "Cannot reach server",
 *  - sign-out and a 401 clear both stores and tell every listener.
 * Tokens here are obviously fake strings, never JWT-shaped.
 */

export {}; // a module: its helpers stay out of other test files' scope

type Api = typeof import('../src/utils/api');

const FAKE_TOKEN = 'fake-token-for-tests';
const FAKE_TOKEN_2 = 'another-fake-token';

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

let api: Api;
let AsyncStorage: any;
let Keychain: any;
let fetchMock: jest.Mock;

beforeEach(() => {
  jest.resetModules();
  api = require('../src/utils/api');
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  Keychain = require('react-native-keychain');
  Keychain.__reset();
  fetchMock = jest.fn();
  (globalThis as any).fetch = fetchMock;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function signIn(role = 'user', token = FAKE_TOKEN, username = 'field-team') {
  fetchMock.mockResolvedValueOnce(resp(200, { token, role, expires_in: 3600 }));
  await api.login(username, 'not-a-real-password');
}

describe('sign in', () => {
  it('stores the token in the Keychain and only username/role in AsyncStorage', async () => {
    await signIn('admin');

    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(api.getUsername()).toBe('field-team');
    expect(api.isAdmin()).toBe(true);

    const item = Keychain.__items()['org.collarid.api'];
    expect(item.password).toBe(FAKE_TOKEN);
    expect(item.username).toBe('field-team');
    expect(item.options).toEqual({
      service: 'org.collarid.api',
      accessible: 'AccessibleWhenUnlockedThisDeviceOnly',
    });

    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
    expect(await AsyncStorage.getItem('collarid.username')).toBe('field-team');
    expect(await AsyncStorage.getItem('collarid.role')).toBe('admin');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.collarid.org/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      username: 'field-team',
      password: 'not-a-real-password',
    });
  });

  it("shows the server's words for a wrong password", async () => {
    fetchMock.mockResolvedValueOnce(resp(401, { detail: 'Invalid credentials' }));
    await expect(api.login('u', 'p')).rejects.toThrow('Invalid credentials');
    expect(api.getToken()).toBeNull();
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  it('says "Wrong username or password." for a bare 401', async () => {
    fetchMock.mockResolvedValueOnce(resp(401));
    await expect(api.login('u', 'p')).rejects.toThrow('Wrong username or password.');
  });

  it('says the server cannot be reached when the request never lands', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(api.login('u', 'p')).rejects.toThrow(
      'Cannot reach server. Check your connection.',
    );
  });

  it('does not blame the password for a server error', async () => {
    // Plain words, no status codes (the app is for non-technical users).
    fetchMock.mockResolvedValueOnce(resp(502));
    await expect(api.login('u', 'p')).rejects.toThrow(
      'The CollarID server can’t sign you in right now. Try again later.',
    );
    fetchMock.mockResolvedValueOnce(resp(422, { detail: [{ msg: 'field required' }] }));
    await expect(api.login('u', 'p')).rejects.toThrow(
      'The CollarID server can’t sign you in right now. Try again later.',
    );
  });

  it('stays signed in for this run if the Keychain refuses the token', async () => {
    Keychain.__setFailure('set', true);
    await signIn();
    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
    // The warning never carries the token.
    for (const call of (console.warn as jest.Mock).mock.calls) {
      expect(JSON.stringify(call)).not.toContain(FAKE_TOKEN);
    }
  });

  it('notifies session listeners', async () => {
    const changed = jest.fn();
    api.onSessionChange(changed);
    await signIn();
    expect(changed).toHaveBeenCalled();
  });
});

describe('loading the stored session', () => {
  it('moves a token left in AsyncStorage by an older build into the Keychain', async () => {
    await AsyncStorage.setItem('collarid.token', FAKE_TOKEN);
    await AsyncStorage.setItem('collarid.role', 'admin');
    await AsyncStorage.setItem('collarid.username', 'legacy-user');

    await api.loadSession();

    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(api.getUsername()).toBe('legacy-user');
    expect(api.isAdmin()).toBe(true);
    expect(Keychain.__items()['org.collarid.api'].password).toBe(FAKE_TOKEN);
    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
    // Username and role stay where they were.
    expect(await AsyncStorage.getItem('collarid.username')).toBe('legacy-user');
    expect(await AsyncStorage.getItem('collarid.role')).toBe('admin');
  });

  it('keeps the old copy for next launch when the Keychain write fails', async () => {
    await AsyncStorage.setItem('collarid.token', FAKE_TOKEN);
    await AsyncStorage.setItem('collarid.username', 'legacy-user');
    Keychain.__setFailure('set', true);

    await api.loadSession();

    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(await AsyncStorage.getItem('collarid.token')).toBe(FAKE_TOKEN);
  });

  it('migrates once even when several screens ask at the same time', async () => {
    await AsyncStorage.setItem('collarid.token', FAKE_TOKEN);
    await AsyncStorage.setItem('collarid.username', 'legacy-user');
    await Promise.all([api.loadSession(), api.loadSession(), api.loadSession()]);
    expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
    expect(api.isSessionLoaded()).toBe(true);
  });

  it('restores a Keychain session on a normal launch', async () => {
    Keychain.__items()['org.collarid.api'] = {
      username: 'field-team',
      password: FAKE_TOKEN,
    };
    await AsyncStorage.setItem('collarid.username', 'field-team');
    await AsyncStorage.setItem('collarid.role', 'user');

    await api.loadSession();

    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(api.getUsername()).toBe('field-team');
    expect(api.isAdmin()).toBe(false);
  });

  it('wipes a Keychain token that outlived an app delete', async () => {
    // Keychain items survive deleting the app; AsyncStorage does not.
    Keychain.__items()['org.collarid.api'] = {
      username: 'someone',
      password: FAKE_TOKEN,
    };

    await api.loadSession();

    expect(api.getToken()).toBeNull();
    expect(Keychain.__items()['org.collarid.api']).toBeUndefined();
  });

  it('starts signed out when the Keychain cannot be read', async () => {
    await AsyncStorage.setItem('collarid.username', 'field-team');
    Keychain.__setFailure('get', true);
    await api.loadSession();
    expect(api.getToken()).toBeNull();
    expect(api.isSessionLoaded()).toBe(true);
  });

  it('does not wipe a sign-in that lands while the Keychain is being read', async () => {
    // Launch: no username in AsyncStorage, Keychain read still pending...
    let release: (v: any) => void = () => {};
    Keychain.getGenericPassword.mockImplementationOnce(
      () => new Promise(r => (release = r)),
    );
    const loading = api.loadSession();
    await new Promise<void>(r => setTimeout(() => r(), 0));
    // ...the person signs in on Home...
    await signIn('user', FAKE_TOKEN, 'new-user');
    // ...and the pending read now returns the fresh token.
    release({ username: 'new-user', password: FAKE_TOKEN, service: 'org.collarid.api' });
    await loading;
    expect(Keychain.__items()['org.collarid.api'].password).toBe(FAKE_TOKEN);
    expect(api.getToken()).toBe(FAKE_TOKEN);
  });

  it('never lets a slow load overwrite a sign-in that finished first', async () => {
    Keychain.__items()['org.collarid.api'] = {
      username: 'old-user',
      password: FAKE_TOKEN_2,
    };
    await AsyncStorage.setItem('collarid.username', 'old-user');
    const loading = api.loadSession();
    await signIn('user', FAKE_TOKEN, 'new-user');
    await loading;
    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(api.getUsername()).toBe('new-user');
  });
});

describe('sign out and expiry', () => {
  it('sign-out clears the Keychain and AsyncStorage and tells listeners', async () => {
    await signIn('admin');
    const changed = jest.fn();
    api.onSessionChange(changed);

    await api.logout();

    expect(api.getToken()).toBeNull();
    expect(api.getUsername()).toBeNull();
    expect(api.isAdmin()).toBe(false);
    expect(Keychain.__items()['org.collarid.api']).toBeUndefined();
    expect(await AsyncStorage.getItem('collarid.username')).toBeNull();
    expect(await AsyncStorage.getItem('collarid.role')).toBeNull();
    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
    expect(changed).toHaveBeenCalled();
  });

  it('sign-out also removes a legacy AsyncStorage token', async () => {
    await AsyncStorage.setItem('collarid.token', FAKE_TOKEN);
    await AsyncStorage.setItem('collarid.username', 'legacy-user');
    Keychain.__setFailure('set', true);
    await api.loadSession();
    await api.logout();
    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
  });

  it('a 401 on an authed call ends the session once and tells everyone', async () => {
    await signIn();
    const expired = jest.fn();
    const changed = jest.fn();
    api.onSessionExpired(expired);
    api.onSessionChange(changed);

    fetchMock.mockResolvedValueOnce(resp(401, { detail: 'Invalid or expired token' }));
    await expect(api.listPresets()).rejects.toThrow('Session expired');

    expect(api.getToken()).toBeNull();
    expect(Keychain.__items()['org.collarid.api']).toBeUndefined();
    expect(expired).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalled();

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://api.collarid.org/schedules');
    expect(init.headers.Authorization).toBe(`Bearer ${FAKE_TOKEN}`);
  });

  it('a late 401 for an older session does not end a newer one', async () => {
    await signIn('user', FAKE_TOKEN, 'first');
    let answer: (v: any) => void = () => {};
    fetchMock.mockReturnValueOnce(new Promise(r => (answer = r)));
    const inFlight = api.listPresets();

    await signIn('user', FAKE_TOKEN_2, 'second');
    answer(resp(401));
    await expect(inFlight).rejects.toThrow();

    expect(api.getToken()).toBe(FAKE_TOKEN_2);
    expect(api.getUsername()).toBe('second');
  });

  it('keeps the old error messages for existing callers', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(500));
    // The message is plain words now (serverStatusText); the status stays on the error.
    await expect(api.listPresets()).rejects.toThrow('The CollarID server can’t do this right now. Try again later.');
    fetchMock.mockResolvedValueOnce(resp(500));
    expect(((await api.listPresets().catch(e => e)) as any).status).toBe(500);
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    const err: any = await api.listPresets().catch(e => e);
    expect(err).toBeInstanceOf(api.ApiError);
    expect(err.status).toBe(0);
    expect(api.getToken()).toBe(FAKE_TOKEN); // a network error is not an expiry
  });

  it('verifySession: valid, expired (session ended), unreachable, signed out', async () => {
    expect(await api.verifySession()).toBe('signed-out');
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(200, { username: 'field-team' }));
    expect(await api.verifySession()).toBe('valid');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.collarid.org/auth/me');
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    expect(await api.verifySession()).toBe('unreachable');
    expect(api.getToken()).toBe(FAKE_TOKEN);
    fetchMock.mockResolvedValueOnce(resp(401));
    expect(await api.verifySession()).toBe('expired');
    expect(api.getToken()).toBeNull();
  });

  it('verifySession: a 403 or 500 is an error, and the session stays', async () => {
    await signIn();
    fetchMock.mockResolvedValueOnce(resp(403, { detail: 'Forbidden' }));
    expect(await api.verifySession()).toBe('error');
    fetchMock.mockResolvedValueOnce(resp(500));
    expect(await api.verifySession()).toBe('error');
    expect(api.getToken()).toBe(FAKE_TOKEN);
    expect(Keychain.__items()['org.collarid.api'].password).toBe(FAKE_TOKEN);
  });
});

describe('a fresh sign-in replaces everything', () => {
  it('drops a legacy AsyncStorage token that a failed migration left behind', async () => {
    await AsyncStorage.setItem('collarid.token', FAKE_TOKEN);
    await AsyncStorage.setItem('collarid.username', 'legacy-user');
    Keychain.__setFailure('set', true);
    await api.loadSession();
    expect(await AsyncStorage.getItem('collarid.token')).toBe(FAKE_TOKEN);

    Keychain.__setFailure('set', false);
    await signIn('user', FAKE_TOKEN_2, 'new-user');

    expect(await AsyncStorage.getItem('collarid.token')).toBeNull();
    expect(api.getToken()).toBe(FAKE_TOKEN_2);
    expect(Keychain.__items()['org.collarid.api'].password).toBe(FAKE_TOKEN_2);
  });
});
