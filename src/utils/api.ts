// CollarID cloud API client — mirrors the website's auth.js contract:
// JWT from POST /auth/login, Bearer header on everything else, and a 401
// on any authed endpoint means the token is finished (drop it).
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://api.collarid.org';

const TOKEN_KEY = 'collarid.token';
const ROLE_KEY = 'collarid.role';
const USER_KEY = 'collarid.username';

let _token: string | null = null;
let _role: string = 'user';
let _username: string | null = null;
let _loaded = false;
// Fires when a 401 invalidates the stored token so UI can re-render.
const _expiryListeners = new Set<() => void>();

export function onSessionExpired(fn: () => void): () => void {
  _expiryListeners.add(fn);
  return () => _expiryListeners.delete(fn);
}

export async function loadSession(): Promise<void> {
  if (_loaded) return;
  const [t, r, u] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(ROLE_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);
  _token = t;
  _role = r || 'user';
  _username = u;
  _loaded = true;
}

export function getToken(): string | null {
  return _token;
}

export function getUsername(): string | null {
  return _username;
}

export function isAdmin(): boolean {
  return _role === 'admin';
}

async function clearSession(): Promise<void> {
  _token = null;
  _role = 'user';
  _username = null;
  await Promise.all(
    [TOKEN_KEY, ROLE_KEY, USER_KEY].map(k => AsyncStorage.removeItem(k)),
  );
}

export async function login(
  username: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    throw new Error(data.detail || 'Invalid credentials');
  }
  const data = await res.json();
  _token = data.token;
  _role = data.role || 'user';
  _username = username;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, _token ?? ''),
    AsyncStorage.setItem(ROLE_KEY, _role),
    AsyncStorage.setItem(USER_KEY, username),
  ]);
}

export async function logout(): Promise<void> {
  await clearSession();
}

/** Authed fetch. A 401 is the server retiring our token — drop it once and
 *  surface a friendly error (same policy as the website's interceptor). */
async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_token}`,
      ...(init.headers || {}),
    },
  });
  if (res.status === 401 && _token) {
    await clearSession();
    _expiryListeners.forEach(fn => fn());
    throw new Error('Session expired — sign in again.');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json().catch(() => null);
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
