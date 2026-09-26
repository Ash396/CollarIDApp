// Lost-mode beacon encryption keys (collarID_thread docs/
// DESIGN_radio_security.md, phases E3-E6): the collar's key report, the
// two tunnel frames, the words, and the provisioning flow between the
// CollarID server and the collar.
//
// Port of the beacon-key half of the website's js/ble-cfg-tunnel.js
// (beaconKeyReport, the state / result texts, beaconKeySetFields /
// beaconKeyClearFields) and of configure.html's bleProvisionBeaconKey /
// bleClearBeaconKey, so both clients say the same thing and refuse the same
// things. __tests__/beaconKey.test.ts replays fixtures derived from the
// website's own code (scripts/derive-website-fixtures.js).
//
// The key crosses the Bluetooth link once, inside the SET frame, and
// nothing carries it back: the echo reports the collar's generation, its
// key check value (kcv = AES-128(key, 0)[0..2]) and the result, which is
// what the flow compares with the server's record. The report is present
// (even empty) on every status echo of firmware that has the key store and
// ABSENT on older firmware, so "not provisioned" and "not supported" are
// told apart by presence, not by state. Nothing here displays or logs key
// bytes; the KCV identifies a key without revealing it.
import { ApiError } from './api';
import type { RadioKeyIssue, RadioKeyStatus } from './api';
import { hexToBytes } from './protoUtils';
import { kcvHex } from './aes128';

/** downlink.proto CommandType: BLE tunnel only, like the factory reset. */
export const BEACON_KEY_CMD = { SET: 19, CLEAR: 22 } as const;

export const BEACON_KEY = {
  /** COMMAND is reserved: never offered. */
  SLOT: { BEACON: 0, COMMAND: 1 },
  STATE: { NONE: 0, KEYED: 1, FALLBACK: 2 },
  RESULT: { NONE: 0, APPLIED: 1, CLEARED: 2, REJECTED_GEN: 3, REJECTED_ARG: 4, STORE_ERROR: 5 },
  KEY_LEN: 16,
  KCV_LEN: 3,
  GEN_MAX: 255,
  /** A flash program on the collar sits between the write and its echo. */
  TIMEOUT_MS: 20000,
} as const;

/** CfgEchoPacket.beacon_key in plain fields; supported false when the
 *  firmware carries none. kcv is lower-case hex, '' when unkeyed. */
export type BeaconKeyReport = {
  supported: boolean;
  state: number;
  gen: number;
  kcv: string;
  result: number;
  txCounter: number;
};

/** The part of a CfgEchoPacket the report reads (a PB.CfgEchoPacket
 *  satisfies it; the generated module names the field beaconKey). */
export type BeaconKeyEcho = {
  beaconKey?: {
    state?: number | null;
    gen?: number | null;
    kcv?: Uint8Array | null;
    result?: number | null;
    txCounter?: number | null;
  } | null;
} | null;

const toHex = (b: Uint8Array | null | undefined) =>
  Array.from(b || [], x => x.toString(16).padStart(2, '0')).join('');

export function beaconKeyReport(echo: BeaconKeyEcho | undefined): BeaconKeyReport {
  const r = echo && echo.beaconKey;
  if (r == null) return { supported: false, state: 0, gen: 0, kcv: '', result: 0, txCounter: 0 };
  return {
    supported: true,
    state: r.state || 0,
    gen: r.gen || 0,
    kcv: toHex(r.kcv),
    result: r.result || 0,
    txCounter: (r.txCounter || 0) >>> 0,
  };
}

/* ── The words. They were the website's, character for character; the app
 *  now says them in plain words for non-technical users (no generation, no
 *  KCV), so the website's card still has the older wording until it is
 *  aligned. ──────────────────────────────────────────────────────────── */

export const BEACON_KEY_STATE_TEXT: Record<number, string> = {
  0: 'Off: the collar sends its lost-mode beacon unencrypted, as collars always have.',
  1: 'On: the collar’s lost-mode beacon is encrypted.',
  2:
    'Needs updating: the collar has a key it can no longer use, so its lost-mode beacon is not encrypted ' +
    'for now. Install keys again to fix this.',
};
export const BEACON_KEY_RESULT_TEXT: Record<number, string> = {
  0: '',
  1: 'key installed; used from the next beacon',
  2: 'key removed',
  3: 'refused: the collar already has a newer key. Ask your administrator to rotate keys on the website, then install again',
  4: 'refused: the collar did not accept the key. Try again; if it keeps happening, contact the CollarID team',
  5: 'the collar could not save the key; nothing changed',
};
export const BEACON_KEY_UNSUPPORTED_TEXT = 'This collar’s software cannot encrypt its beacon. Update the collar first.';

export function beaconKeyStateText(r: BeaconKeyReport | null | undefined): string {
  if (!r || !r.supported) return BEACON_KEY_UNSUPPORTED_TEXT;
  return BEACON_KEY_STATE_TEXT[r.state] || `unknown encryption state (${r.state})`;
}
export function beaconKeyResultText(r: { result?: number } | null | undefined): string {
  const t = BEACON_KEY_RESULT_TEXT[(r && r.result) as number];
  return t === undefined ? `unexpected answer from the collar (${r?.result})` : t;
}

/** The card's badge (configure.html renderBeaconKeyCard). null = not read
 *  yet. */
export function beaconKeyBadge(r: BeaconKeyReport | null | undefined): string {
  if (!r) return 'Not read yet';
  if (!r.supported) return 'Not supported';
  const S = BEACON_KEY.STATE;
  if (r.state === S.KEYED) return 'Encryption: on';
  if (r.state === S.FALLBACK) return 'Encryption: needs updating';
  return 'Encryption: off';
  // old: KEYED `Encrypted · generation ${r.gen} · KCV ${r.kcv}`,
  //      FALLBACK `Fallback to plaintext · generation ${r.gen}`, else 'Plaintext (no key)'
}

/** The card's status line: the state, the beacons sent under this
 *  generation, the last command's outcome. */
export function beaconKeyStatusLine(r: BeaconKeyReport | null | undefined): string {
  if (!r) return 'Waiting for the collar to report its encryption status.';
  if (!r.supported) return beaconKeyStateText(r);
  const ctr = r.txCounter ? ` Beacons sent with this key: ${r.txCounter & 0xffffff}.` : '';
  const last = beaconKeyResultText(r);
  return beaconKeyStateText(r) + ctr + (last ? ` Last change: ${last}.` : '');
}

/** What the server holds, in one line; stale and an unconfigured key store
 *  are called out (the coordinator's words for both). */
export function serverKeyLine(s: RadioKeyStatus | null | undefined): string {
  if (!s) return '';
  const parts: string[] = [];
  if (!s.kek_configured) {
    parts.push('The CollarID server is not set up to issue keys yet. Ask your administrator.');
  }
  if (s.state === 'provisioned' && s.keyed) {
    parts.push('Server record: key installed on this collar.');
  } else if (s.state === 'issued' && s.keyed) {
    parts.push('Server record: a key was issued but the collar never confirmed it. Install keys again.');
  } else if (s.state === 'cleared') {
    parts.push('Server record: no key (encryption off).');
  } else {
    parts.push('Server record: no key issued for this collar.');
  }
  if (s.stale) {
    parts.push('This collar’s key is out of date: install keys again.');
  }
  return parts.join(' ');
}

/* ── The two frames (pure; pinned by the tests) ─────────────────────── */

export type BeaconKeySetFields = {
  command: number;
  beaconKey: { slot: number; gen: number; key: Uint8Array };
};
export type BeaconKeyClearFields = { command: number; beaconKey: { slot: number } };

export function beaconKeySetFields(
  keyBytes: Uint8Array,
  gen: number,
  slot: number = BEACON_KEY.SLOT.BEACON,
): BeaconKeySetFields {
  if (!keyBytes || keyBytes.length !== BEACON_KEY.KEY_LEN) throw new Error('a beacon key is exactly 16 bytes');
  if (!Number.isInteger(gen) || gen < 1 || gen > BEACON_KEY.GEN_MAX) {
    throw new Error('the provision generation is 1..255');
  }
  if (slot !== BEACON_KEY.SLOT.BEACON) throw new Error('only the beacon slot can be provisioned');
  return { command: BEACON_KEY_CMD.SET, beaconKey: { slot, gen, key: keyBytes } };
}

export function beaconKeyClearFields(slot: number = BEACON_KEY.SLOT.BEACON): BeaconKeyClearFields {
  if (slot !== BEACON_KEY.SLOT.BEACON) throw new Error('only the beacon slot can be cleared');
  return { command: BEACON_KEY_CMD.CLEAR, beaconKey: { slot } };
}

/* ── The flows ──────────────────────────────────────────────────────── */

/** The transport: every call writes one frame and resolves with the echo
 *  that consumed it (ble/bleManager.ts beaconKeyIo). */
export type BeaconKeyIo = {
  status: () => Promise<BeaconKeyEcho>;
  set: (key: Uint8Array, gen: number) => Promise<BeaconKeyEcho>;
  clear: () => Promise<BeaconKeyEcho>;
};

/** The server (utils/api.ts), injectable for the tests. */
export type BeaconKeyApi = {
  status: (uid: string) => Promise<RadioKeyStatus>;
  issue: (uid: string, echo: { collar_gen: number; collar_kcv: string }) => Promise<RadioKeyIssue>;
  provisioned: (uid: string, echo: { gen: number; kcv: string }) => Promise<RadioKeyStatus>;
  clear: (uid: string) => Promise<RadioKeyStatus>;
};

export const BEACON_KEY_NO_REPORT = 'the collar did not report its encryption status: its software cannot encrypt the beacon. Update the collar first';

/** The server's refusal in the operator's words. */
export function issueErrorText(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 503) {
      return 'the CollarID server is not set up to issue keys yet. Ask your administrator';
    }
    if (e.status === 409) {
      return `the server has no new key for this collar. Ask your administrator to rotate keys${
        e.detail ? ` (details: ${e.detail})` : ''
      }`;
    }
    if (e.status === 422) return `the server did not accept the collar’s answer (details: ${e.detail || e.message})`;
    if (e.status === 403) return 'this collar is not on your CollarID account, so you cannot install its keys';
    if (e.status === 404) return 'the CollarID server does not know this collar';
    return e.detail ? `${e.message} (details: ${e.detail})` : e.message;
  }
  return String((e as any)?.message ?? e);
}

export type ProvisionResult = {
  report: BeaconKeyReport;
  server: RadioKeyStatus | null;
  gen: number;
  kcv: string;
  /** new | reissue, as the server said. */
  action: string;
};

/** Provision the collar's beacon key from the server, over the tunnel:
 *  read the collar's echo, ask the server for the key set with that echo
 *  (the same key comes back when the collar already holds the last issue),
 *  check the server's KCV against the key, write SET, compare the collar's
 *  echo (result, gen, KCV) with the server's, then tell the server. The key
 *  bytes are wiped once written and never returned. Throws with the words
 *  the card shows after "Provisioning: ". */
export async function provisionBeaconKey(
  io: BeaconKeyIo,
  api: BeaconKeyApi,
  uid: string,
  opts: { onProgress?: (text: string) => void } = {},
): Promise<ProvisionResult> {
  const progress = opts.onProgress || (() => {});
  progress('checking the collar…');
  const cur = beaconKeyReport(await io.status());
  if (!cur.supported) throw new Error(BEACON_KEY_NO_REPORT);

  progress('asking the server for a key…');
  let issued: RadioKeyIssue;
  try {
    issued = await api.issue(uid, { collar_gen: cur.gen || 0, collar_kcv: cur.kcv || '' });
  } catch (e) {
    throw new Error(issueErrorText(e));
  }
  const entry = (issued.keys || []).find(k => k.slot === 'beacon');
  let key: Uint8Array | null = null;
  try {
    const gen = Number(entry ? entry.gen : issued.gen);
    try {
      key = hexToBytes(entry ? entry.key : '');
    } catch (_) {
      key = new Uint8Array(0);
    }
    if (key.length !== BEACON_KEY.KEY_LEN || !Number.isInteger(gen) || gen < 1 || gen > BEACON_KEY.GEN_MAX) {
      throw new Error('the server sent a key the app cannot use; nothing was written to the collar');
    }
    const kcv = kcvHex(key);
    const named = String((entry && entry.kcv) || issued.kcv || '').toLowerCase();
    if (named && named !== kcv) {
      throw new Error('the key from the server failed its check; nothing was written to the collar');
    }

    progress('installing the key on the collar…');
    const echo = await io.set(key, gen);
    key.fill(0);
    key = null;
    const r = beaconKeyReport(echo);
    if (!r.supported) throw new Error(BEACON_KEY_NO_REPORT);
    if (r.result !== BEACON_KEY.RESULT.APPLIED) {
      throw new Error(beaconKeyResultText(r) || `the collar gave an unexpected answer (${r.result})`);
    }
    if (r.gen !== gen || r.kcv !== kcv) {
      throw new Error(
        'the key on the collar does not match the one the server issued. Try again',
      );
    }

    progress('key confirmed by the collar; telling the server…');
    let server: RadioKeyStatus | null = null;
    try {
      server = await api.provisioned(uid, { gen, kcv });
    } catch (e) {
      const why = e instanceof ApiError && e.status === 409 ? e.detail || e.message : issueErrorText(e);
      throw new Error(
        `the collar has the new key, but the server would not record it: ${why}`,
      );
    }
    return { report: r, server, gen, kcv, action: issued.action };
  } finally {
    if (key) key.fill(0);
  }
}

export type ClearResult = {
  report: BeaconKeyReport;
  /** true when the server was told; false when it was not asked (signed
   *  out, or no uid); an error names a server that still records a key. */
  serverCleared: boolean;
};

/** Take the collar back to plaintext (CLEAR), then tell the server so it
 *  never alerts on plaintext beacons from a collar cleared on purpose. */
export async function clearBeaconKey(
  io: BeaconKeyIo,
  api: BeaconKeyApi | null,
  uid: string | null,
  opts: { onProgress?: (text: string) => void } = {},
): Promise<ClearResult> {
  const progress = opts.onProgress || (() => {});
  progress('removing the key from the collar…');
  const r = beaconKeyReport(await io.clear());
  if (!r.supported) throw new Error(BEACON_KEY_NO_REPORT);
  if (r.result !== BEACON_KEY.RESULT.CLEARED || r.state !== BEACON_KEY.STATE.NONE) {
    throw new Error(beaconKeyResultText(r) || `the collar gave an unexpected answer (${r.result})`);
  }
  if (!api || !uid) {
    progress('key removed ✓ beacon no longer encrypted');
    return { report: r, serverCleared: false };
  }
  progress('key removed ✓ telling the server…');
  try {
    await api.clear(uid);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { report: r, serverCleared: false };
    const status = e instanceof ApiError ? e.message : String((e as any)?.message ?? e);
    // old: const status = e instanceof ApiError ? `HTTP ${e.status}` : String((e as any)?.message ?? e);
    throw new Error(
      `the collar’s beacon is no longer encrypted, but the server still lists a key for it and may raise alerts about unencrypted beacons. ${status}`,
    );
  }
  progress('key removed ✓ server record cleared ✓');
  return { report: r, serverCleared: true };
}
