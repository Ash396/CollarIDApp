// Which "Advanced" groups the schedule editor has open — remembered in the
// same AsyncStorage the drafts and the login session live in, so the owner
// who opens everything once keeps it open, and a researcher never sees it.
//
// Collapsed is the default for every section: the editor's whole point is
// that three or four decisions are visible and the rest is a tap away.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ADVANCED_SECTIONS = [
  'gps',
  'sensors',
  'microphone',
  'accelerometer',
  'lorawan',
  'lora',
] as const;
export type AdvancedSection = (typeof ADVANCED_SECTIONS)[number];
export type AdvancedPrefs = Record<AdvancedSection, boolean>;

export const ADVANCED_PREFS_KEY = 'editor.advanced';

/** Every section collapsed. */
export function defaultAdvancedPrefs(): AdvancedPrefs {
  const out = {} as AdvancedPrefs;
  for (const k of ADVANCED_SECTIONS) out[k] = false;
  return out;
}

/** Tolerant parse of the stored JSON: unknown keys ignored, missing ones
 *  collapsed, garbage → defaults. */
export function parseAdvancedPrefs(raw: string | null | undefined): AdvancedPrefs {
  const out = defaultAdvancedPrefs();
  if (!raw) return out;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v === 'object') {
      for (const k of ADVANCED_SECTIONS) if (typeof v[k] === 'boolean') out[k] = v[k];
    }
  } catch (_) {
    /* unreadable — defaults */
  }
  return out;
}

export async function loadAdvancedPrefs(): Promise<AdvancedPrefs> {
  try {
    return parseAdvancedPrefs(await AsyncStorage.getItem(ADVANCED_PREFS_KEY));
  } catch (_) {
    return defaultAdvancedPrefs();
  }
}

export function saveAdvancedPrefs(p: AdvancedPrefs): void {
  AsyncStorage.setItem(ADVANCED_PREFS_KEY, JSON.stringify(p)).catch(() => {});
}
