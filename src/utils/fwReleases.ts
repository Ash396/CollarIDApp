// Firmware build -> human release label, mirroring the website's
// renderFwVersion(): the changelog rows carry {version, fw_build}; a collar
// reporting "b329 <hash>" displays as the newest release at-or-below build
// 329, plus "+N" when it runs N commits past that release.
//
// The endpoint is public (no auth). Results are cached in AsyncStorage so
// labels keep working in the field with no connectivity after a first fetch.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './api';
import { parseFwBuild } from './fw';

export type FwRelease = { version: string; build: number };

const CACHE_KEY = 'fw.releases.cache';

let _releases: FwRelease[] | null = null;
let _inflight: Promise<FwRelease[]> | null = null;

async function fetchReleases(): Promise<FwRelease[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`${API_BASE}/firmware/changelog`, {
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    const releases: FwRelease[] = (Array.isArray(rows) ? rows : [])
      .filter((r: any) => r.fw_build)
      .map((r: any) => ({ version: String(r.version), build: Number(r.fw_build) }))
      .sort((a: FwRelease, b: FwRelease) => b.build - a.build);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(releases)).catch(() => {});
    return releases;
  } finally {
    clearTimeout(timer);
  }
}

/** Release list, newest first. Network first, cached list offline, [] if
 *  neither — callers fall back to the raw firmware string. */
export async function getFwReleases(): Promise<FwRelease[]> {
  if (_releases) return _releases;
  if (!_inflight) {
    _inflight = (async () => {
      try {
        _releases = await fetchReleases();
      } catch (_) {
        try {
          const raw = await AsyncStorage.getItem(CACHE_KEY);
          _releases = raw ? JSON.parse(raw) : [];
        } catch (_2) {
          _releases = [];
        }
      }
      return _releases!;
    })();
  }
  return _inflight;
}

/** "b329 830ba85" -> "v1.15.0 +19 · b329" (website style, build kept visible
 *  since phones have no hover tooltip). Unparsable or unmapped builds return
 *  the raw string unchanged. */
export function fwDisplayLabel(
  raw: string | undefined,
  releases: FwRelease[],
): string {
  if (!raw) return '—';
  const build = parseFwBuild(raw);
  if (!build) return raw;
  const rel = releases.find(r => r.build <= build);
  if (!rel) return raw;
  const delta = build - rel.build;
  const version = delta ? `${rel.version} +${delta}` : rel.version;
  return `${version} · b${build}`;
}
