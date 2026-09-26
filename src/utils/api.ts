// CollarID cloud API client — mirrors the website's auth.js contract:
// JWT from POST /auth/login, Bearer header on everything else, and a 401
// on any authed endpoint means the token is finished (drop it).
//
// One session for the whole app: the Home account card, Saved schedules,
// the radio editor's "Load from CollarID server" and the Map tab all read
// it (useSession() in useSession.ts subscribes to onSessionChange).
//
// Where it lives:
//  - the token: iOS Keychain (react-native-keychain, service
//    'org.collarid.api', this-device-only, readable while unlocked). It is a
//    bearer credential for the account, so it never goes to AsyncStorage
//    (a plain file in the app container that iCloud/iTunes backups carry).
//  - username + role: AsyncStorage (not secret; the username also marks
//    "this install signed in", see loadSession()).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export const API_BASE = 'https://api.collarid.org';

// Legacy location of the token (app builds before the Keychain move). Only
// read once, to migrate it, then deleted.
const TOKEN_KEY = 'collarid.token';
const ROLE_KEY = 'collarid.role';
const USER_KEY = 'collarid.username';

export const KEYCHAIN_SERVICE = 'org.collarid.api';
const KEYCHAIN_OPTS = { service: KEYCHAIN_SERVICE };
const KEYCHAIN_SET_OPTS = {
  service: KEYCHAIN_SERVICE,
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

let _token: string | null = null;
let _role: string = 'user';
let _username: string | null = null;
let _loaded = false;
let _loading: Promise<void> | null = null;
// Bumped by every login / logout / expiry. A loadSession() that started
// before one of those must not overwrite what it did.
let _generation = 0;
// Fires when a 401 invalidates the stored token so UI can re-render.
const _expiryListeners = new Set<() => void>();
// Fires on ANY session change: loaded, signed in, signed out, expired.
const _changeListeners = new Set<() => void>();

export function onSessionExpired(fn: () => void): () => void {
  _expiryListeners.add(fn);
  return () => _expiryListeners.delete(fn);
}

export function onSessionChange(fn: () => void): () => void {
  _changeListeners.add(fn);
  return () => _changeListeners.delete(fn);
}

function notifyChange() {
  _changeListeners.forEach(fn => {
    try {
      fn();
    } catch (_) {
      /* a listener must not break the session bookkeeping */
    }
  });
}

/* ── Keychain wrappers (never throw; never log the secret) ────────────── */

async function keychainRead(): Promise<{
  username: string;
  token: string;
} | null> {
  try {
    const c = await Keychain.getGenericPassword(KEYCHAIN_OPTS);
    if (!c || !c.password) return null;
    return { username: c.username, token: c.password };
  } catch (e: any) {
    console.warn('[api] Keychain read failed:', e?.message ?? 'unknown');
    return null;
  }
}

async function keychainWrite(username: string, token: string): Promise<boolean> {
  try {
    // The account field is only a label; the token is the "password".
    const r = await Keychain.setGenericPassword(
      username || 'collarid',
      token,
      KEYCHAIN_SET_OPTS,
    );
    return r !== false;
  } catch (e: any) {
    console.warn('[api] Keychain write failed:', e?.message ?? 'unknown');
    return false;
  }
}

async function keychainClear(): Promise<void> {
  try {
    await Keychain.resetGenericPassword(KEYCHAIN_OPTS);
  } catch (e: any) {
    console.warn('[api] Keychain clear failed:', e?.message ?? 'unknown');
  }
}

/**
 * Load the stored session once (later calls share the first one's promise).
 *
 *  1. A token still in AsyncStorage (app builds before the Keychain move) is
 *     moved into the Keychain and the AsyncStorage copy deleted. If the
 *     Keychain write fails the old copy is kept for the next launch, so a
 *     Keychain hiccup never signs anyone out.
 *  2. Otherwise the token comes from the Keychain — but only when AsyncStorage
 *     still has the username. Keychain items outlive an app delete; the
 *     AsyncStorage file does not. A Keychain token without a username is a
 *     session from before a reinstall, and deleting the app is how many people
 *     sign out, so it is wiped instead of silently restored.
 */
export function loadSession(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loading) {
    _loading = doLoadSession().finally(() => {
      _loading = null;
    });
  }
  return _loading;
}

async function doLoadSession(): Promise<void> {
  const gen = _generation;
  let legacy: (string | null)[] = [null, null, null];
  try {
    legacy = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(ROLE_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
  } catch (_) {
    /* unreadable storage = signed out */
  }
  const [legacyToken, r, u] = legacy;
  // A login/logout that happened meanwhile owns the stores now: touch
  // nothing (checked again before every write below).
  const superseded = () => gen !== _generation;
  if (superseded()) return;

  let token: string | null = null;
  let username: string | null = u;
  if (legacyToken) {
    token = legacyToken;
    if ((await keychainWrite(u ?? '', legacyToken)) && !superseded()) {
      await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    }
  } else {
    const kc = await keychainRead();
    if (kc && u) {
      token = kc.token;
    } else if (kc && !superseded()) {
      await keychainClear(); // left over from before a reinstall
    }
  }

  if (superseded()) return;
  _token = token;
  _role = token ? r || 'user' : 'user';
  _username = token ? username : null;
  _loaded = true;
  notifyChange();
  // old: (token straight from AsyncStorage, no Keychain)
  // const [t, r, u] = await Promise.all([
  //   AsyncStorage.getItem(TOKEN_KEY),
  //   AsyncStorage.getItem(ROLE_KEY),
  //   AsyncStorage.getItem(USER_KEY),
  // ]);
  // _token = t;
  // _role = r || 'user';
  // _username = u;
  // _loaded = true;
}

export function isSessionLoaded(): boolean {
  return _loaded;
}

export function getToken(): string | null {
  return _token;
}

export function getUsername(): string | null {
  return _username;
}

export function getRole(): string {
  return _role;
}

export function isAdmin(): boolean {
  return _role === 'admin';
}

/** Changes on every sign-in / sign-out / expiry — a key for anything that
 *  must be rebuilt per session (the Map tab's WebView). Not a secret. */
export function getSessionGeneration(): number {
  return _generation;
}

async function clearSession(): Promise<void> {
  _token = null;
  _role = 'user';
  _username = null;
  _loaded = true;
  _generation++;
  await Promise.all([
    keychainClear(),
    ...[TOKEN_KEY, ROLE_KEY, USER_KEY].map(k =>
      AsyncStorage.removeItem(k).catch(() => {}),
    ),
  ]);
  // old:
  // await Promise.all(
  //   [TOKEN_KEY, ROLE_KEY, USER_KEY].map(k => AsyncStorage.removeItem(k)),
  // );
}

export const CANNOT_REACH_SERVER = 'Cannot reach server. Check your connection.';

/** An HTTP failure from the CollarID API. `status` 0 = never reached it.
 *  The message stays "HTTP <status>" (what callers showed before); the
 *  server's own `detail` text, when it sent one, is kept beside it. */
export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

// FastAPI sends {"detail": "..."} — or a list of objects for a 422. Only a
// string is fit to show a person.
const detailText = (data: any): string | undefined =>
  typeof data?.detail === 'string' && data.detail.trim()
    ? data.detail
    : undefined;

export async function login(
  username: string,
  password: string,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (_) {
    // Same words as the website's sign-in box.
    throw new Error(CANNOT_REACH_SERVER);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    // 401 = wrong username/password; anything else is the server's problem,
    // not the password's.
    throw new Error(
      detailText(data) ||
        (res.status === 401
          ? 'Invalid credentials'
          : `Server error (HTTP ${res.status}). Try again later.`),
    );
    // old: throw new Error(data.detail || 'Invalid credentials');
  }
  const data = await res.json();
  if (typeof data?.token !== 'string' || !data.token) {
    throw new Error('Unexpected reply from the server. Try again later.');
  }
  // Wipe whatever was there first (another account's token, or a legacy
  // AsyncStorage copy) so two accounts can never be mixed.
  await clearSession();
  _token = data.token;
  _role = data.role || 'user';
  _username = username;
  _loaded = true;
  _generation++;
  const stored = await keychainWrite(username, data.token);
  if (!stored) {
    // Still signed in for this run; the next launch starts signed out.
    console.warn('[api] session not saved; sign-in lasts until app restart');
  }
  await Promise.all([
    AsyncStorage.setItem(ROLE_KEY, _role),
    AsyncStorage.setItem(USER_KEY, username),
  ]).catch(() => {});
  notifyChange();
  // old:
  // _token = data.token;
  // _role = data.role || 'user';
  // _username = username;
  // await Promise.all([
  //   AsyncStorage.setItem(TOKEN_KEY, _token ?? ''),
  //   AsyncStorage.setItem(ROLE_KEY, _role),
  //   AsyncStorage.setItem(USER_KEY, username),
  // ]);
}

export async function logout(): Promise<void> {
  await clearSession();
  notifyChange();
}

/** The server retired the token (a 401). Ends the session once and tells
 *  everyone. `usedToken` is the token the failing request carried: a late 401
 *  for an older session must not end a newer one. */
async function expireSession(usedToken: string | null): Promise<boolean> {
  if (!_token || _token !== usedToken) return false;
  await clearSession();
  _expiryListeners.forEach(fn => fn());
  notifyChange();
  return true;
}

/** Authed fetch. A 401 is the server retiring our token — drop it once and
 *  surface a friendly error (same policy as the website's interceptor). */
async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const usedToken = _token;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${usedToken}`,
        ...(init.headers || {}),
      },
    });
  } catch (_) {
    throw new ApiError(0, CANNOT_REACH_SERVER);
  }
  if (res.status === 401 && usedToken) {
    await expireSession(usedToken);
    throw new ApiError(401, 'Session expired — sign in again.');
  }
  // old:
  // if (res.status === 401 && _token) {
  //   await clearSession();
  //   _expiryListeners.forEach(fn => fn());
  //   throw new Error('Session expired — sign in again.');
  // }
  // if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, `HTTP ${res.status}`, detailText(data));
  }
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

/**
 * Ask the server whether the current token still works (GET /auth/me).
 * 'expired' has already ended the session (apiFetch's 401 path).
 */
export async function verifySession(): Promise<
  'valid' | 'expired' | 'signed-out' | 'unreachable' | 'error'
> {
  if (!_token) return 'signed-out';
  try {
    await apiFetch('/auth/me');
    return 'valid';
  } catch (e: any) {
    if (e instanceof ApiError && e.status === 401) return 'expired';
    if (e instanceof ApiError && e.status === 0) return 'unreachable';
    return 'error';
  }
}

/** Authed fetch for a binary body (a firmware image). Same 401 policy as
 *  apiFetch; the body comes back as bytes. */
async function apiFetchBytes(path: string): Promise<Uint8Array> {
  const usedToken = _token;
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${usedToken}` },
    });
  } catch (_) {
    throw new ApiError(0, CANNOT_REACH_SERVER);
  }
  if (res.status === 401 && usedToken) {
    await expireSession(usedToken);
    throw new ApiError(401, 'Session expired — sign in again.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, `HTTP ${res.status}`, detailText(data));
  }
  return new Uint8Array(await res.arrayBuffer());
}

/* ── Devices ──────────────────────────────────────────────────────────── */

/** GET /devices/{uid}/config — the collar's LoRaWAN identity and keys as the
 *  CollarID ChirpStack holds them (api/main.py device_config). `uid` is the
 *  server's form, "0x" + 8 upper-case hex. Carries keys: callers must not log
 *  or store the result beyond the radio form. */
export function getDeviceConfig(uid: string): Promise<any> {
  return apiFetch(`/devices/${encodeURIComponent(uid)}/config`);
}

/* ── Saved schedule presets ───────────────────────────────────────────── */
// Preset `schedules` payloads use the WEBSITE's snake_case proto shape so
// presets are interchangeable between the app and configure.html — see
// presetShape.ts for the conversion.
export type SavedPreset = {
  id: number;
  name: string;
  schedules: any[];
  updated_at?: string;
  is_owner?: boolean;
  owner_username?: string;
  assigned_to_me?: boolean;
};

export function listPresets(): Promise<SavedPreset[]> {
  return apiFetch('/schedules');
}

export function getPreset(id: number): Promise<SavedPreset> {
  return apiFetch(`/schedules/${id}`);
}

export function createPreset(
  name: string,
  schedules: any[],
): Promise<SavedPreset> {
  return apiFetch('/schedules', {
    method: 'POST',
    body: JSON.stringify({ name, schedules }),
  });
}

export function overwritePreset(id: number, schedules: any[]): Promise<any> {
  return apiFetch(`/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ schedules }),
  });
}

export function deletePreset(id: number): Promise<any> {
  return apiFetch(`/schedules/${id}`, { method: 'DELETE' });
}

/* ── Firmware images ──────────────────────────────────────────────────── */
// The website's update-device.html lists GET /firmware?target=u5 (signed in)
// and downloads GET /firmware/{id}/download; the release's `version` string
// rides in the U5FW stream header as the "git hash" (u5bGetImage). Same here.

export type FirmwareRelease = {
  id: number;
  version: string;
  target: string;
  filename: string;
  description?: string | null;
  release_notes?: string | null;
  release_date?: string | null;
  file_size?: number | null;
  created_at?: string | null;
  uploaded_by?: string | null;
};

/** The server's main-processor images, newest first (auth). */
export function listFirmware(target: 'u5' | 'wb5m' = 'u5'): Promise<FirmwareRelease[]> {
  return apiFetch(`/firmware?target=${encodeURIComponent(target)}`);
}

/** One image's bytes (auth). */
export function downloadFirmware(id: number): Promise<Uint8Array> {
  return apiFetchBytes(`/firmware/${encodeURIComponent(String(id))}/download`);
}
