// Geofence zones (collarID_thread docs/DESIGN_geofence_actions.md): the data
// model, the website's validation, the fragment vocabulary the config
// transaction carries, the collar's slot record, and the words for a verdict.
//
// Port of the website's js/geofence-ui.js (buildFenceFragments,
// fencesFromConfig's row text) and the fence half of js/ble-cfg-tunnel.js
// (parseSlotRecord, verdictText, ACK_TEXT, RAIL_TEXT). The messages are the
// website's, character for character, so a zone refused here is refused with
// the same words on either client; __tests__/geofence.test.ts replays
// fixtures derived from the website's own code (scripts/
// derive-website-fixtures.js) against every function below.
//
// A fence travels as ONE meta fragment (every scalar + vertex_count) and ONE
// fragment per corner, through the BLE config tunnel (ble/bleManager.ts
// tunnelRunTxn) on firmware BLE_ZONES_MIN_FW_BUILD+. Deleting a fence is a
// meta fragment with vertex_count 0. The transport is the same
// DownlinkPacket vocabulary the server radios down, so the collar applies
// the same rails (R7-R10) either way.
import { unixNow } from './protoUtils';

/** ConfigGeofence.action (downlink.proto). */
export const GF_ACTION = { SCHEDULE_OVERRIDE: 0, DETACH: 1, REPORT_ONLY: 2 } as const;

/** The row label per action — the website's GF_ACTIONS. */
export const GF_ACTIONS: Record<number, string> = {
  0: 'Switch schedule',
  1: 'DETACH',
  2: 'Test only',
};

/** The action picker, in the website's order (test-only first: the dry run
 *  a researcher should try before trusting a zone with a detach). */
export const GF_ACTION_OPTIONS: { value: number; label: string }[] = [
  { value: GF_ACTION.REPORT_ONLY, label: 'Test only (report entries/exits)' },
  { value: GF_ACTION.SCHEDULE_OVERRIDE, label: 'Switch to schedule…' },
  { value: GF_ACTION.DETACH, label: 'Detach when inside' },
];

/** Fence slots on the collar (1..4) and the schedule slots a switch zone can
 *  name (0..4) — the website's two selects. */
export const FENCE_IDS: readonly number[] = [1, 2, 3, 4];
export const ZONE_SCHEDULE_SLOTS: readonly number[] = [0, 1, 2, 3, 4];

export const FENCE_MIN_VERTS = 3;
export const FENCE_MAX_VERTS = 8;
/** R10: a detach zone's expiry may be at most this far past its start. */
export const DETACH_MAX_DAYS = 30;
/** The form's defaults (configure.html #ble-gf-confirm / #ble-gf-hacc). */
export const DEFAULT_CONFIRM_FIXES = 2;
export const DEFAULT_MAX_HACC_M = 25;
/** Fixed by the website's builder (not on the form): the state lock after
 *  any IN<->OUT transition, minutes. */
export const FIXED_MIN_DWELL_MIN = 15;
/** communications.cpp CONFIG_MAX_FRAGMENTS: a transaction's received-
 *  fragment mask is 32 bits wide. */
export const MAX_FRAGS_PER_TXN = 32;

/** GeoPoint, as the generated module names it. */
export type GeoPointE7 = { latitudeE7: number; longitudeE7: number };

/** ConfigGeofence, camelCase (the generated module's names). A meta fragment
 *  carries the scalars + vertexCount; a vertex fragment vertexIndex + vertex. */
export type FenceGeofenceFields = {
  fenceId: number;
  action?: number;
  zoneSlot?: number;
  confirmFixes?: number;
  minDwellMin?: number;
  maxHaccM?: number;
  startEpoch?: number;
  expiryEpoch?: number;
  vertexCount?: number;
  vertexIndex?: number;
  vertex?: GeoPointE7;
  consumed?: boolean;
};

/** One config fragment as tunnelRunTxn takes it (fragment_index /
 *  fragment_total are the transaction's to fill in). */
export type FenceFragment = { scheduleIndex: number; cfgGeofence: FenceGeofenceFields };

/** The add-zone form, as the website's sendBleFence() reads it. Corners are
 *  text — one "lat, lon" per line — so typed and map-picked corners go down
 *  the same validated path. */
export type FenceForm = {
  id: number;
  action: number;
  zoneSlot?: number;
  confirm?: number;
  hacc?: number;
  /** Unix seconds; 0 / undefined = armed on delivery. */
  start?: number;
  /** Unix seconds; 0 / undefined = never. Mandatory for DETACH. */
  expiry?: number;
  vertsText: string;
};

/** A [lat, lon] pair in degrees. */
export type LatLon = [number, number];

/** The strict parse the website's builder applies: every non-empty line
 *  must be two finite numbers. Throws the website's message. */
export function parseVertsText(text: string): LatLon[] {
  return (text ?? '')
    .trim()
    .split('\n')
    .map(l => {
      const m = l.split(',').map(s => parseFloat(s.trim()));
      if (m.length !== 2 || m.some(isNaN)) throw new Error(`bad corner line: "${l.trim()}"`);
      return [m[0], m[1]] as LatLon;
    });
}

/** The lenient parse the map picker seeds from (gfParseVertsText): bad
 *  lines are dropped, never an error. */
export function gfParseVertsText(text: string | null | undefined): LatLon[] {
  return (text || '')
    .trim()
    .split('\n')
    .map(l => {
      const m = l.split(',').map(s => parseFloat(s.trim()));
      return m.length === 2 && !m.some(isNaN) ? ([m[0], m[1]] as LatLon) : null;
    })
    .filter((p): p is LatLon => p !== null);
}

/** Corners back into the text the form holds: the map picker's format,
 *  six decimals (about 10 cm). */
export function vertsToText(verts: LatLon[]): string {
  return verts.map(([lat, lon]) => `${lat.toFixed(6)}, ${lon.toFixed(6)}`).join('\n');
}

/** Validate the form and build the meta + vertex fragments. Throws with the
 *  website's message on anything the firmware rails would refuse. `now` is
 *  the base a detach zone's expiry window is measured from when the form
 *  names no start (the website uses the clock). */
export function buildFenceFragments(v: FenceForm, now: number = unixNow()): FenceFragment[] {
  const verts = parseVertsText(v.vertsText);
  if (verts.length < FENCE_MIN_VERTS || verts.length > FENCE_MAX_VERTS) {
    throw new Error('a zone needs 3–8 corners');
  }
  if (v.action === GF_ACTION.DETACH) {
    if (!v.expiry) throw new Error('a detach zone requires an expiry (max 30 days)');
    const base = v.start || now;
    if (v.expiry <= base || v.expiry > base + DETACH_MAX_DAYS * 86400) {
      throw new Error('expiry must be after the start and within 30 days');
    }
  }
  const frags: FenceFragment[] = [
    {
      scheduleIndex: 0,
      cfgGeofence: {
        fenceId: v.id,
        action: v.action,
        zoneSlot: v.zoneSlot || 0,
        confirmFixes: v.confirm || DEFAULT_CONFIRM_FIXES,
        minDwellMin: FIXED_MIN_DWELL_MIN,
        maxHaccM: v.hacc || 0,
        startEpoch: v.start || 0,
        expiryEpoch: v.expiry || 0,
        vertexCount: verts.length,
      },
    },
  ];
  verts.forEach((p, i) =>
    frags.push({
      scheduleIndex: 0,
      cfgGeofence: {
        fenceId: v.id,
        vertexIndex: i,
        vertex: { latitudeE7: Math.round(p[0] * 1e7), longitudeE7: Math.round(p[1] * 1e7) },
      },
    }),
  );
  return frags;
}

/** Fence deletion: one meta fragment with vertex_count 0. */
export function deleteFenceFragments(fenceId: number): FenceFragment[] {
  return [{ scheduleIndex: 0, cfgGeofence: { fenceId, vertexCount: 0 } }];
}

/** A fence as the collar reports it (CfgEchoPacket.fence_report). */
export type Fence = {
  fenceId: number;
  action: number;
  zoneSlot: number;
  confirmFixes: number;
  minDwellMin: number;
  maxHaccM: number;
  /** A detach fence that has fired. */
  consumed: boolean;
  startEpoch: number;
  expiryEpoch: number;
  verts: GeoPointE7[];
  vertexCount: number;
};

/** CfgEchoPacket.fence_report: the version-tagged binary record documented
 *  in ble.proto and pinned by the firmware host test:
 *    [0]=1 [1]=fence_id [2]=action [3]=zone_slot [4]=confirm_fixes
 *    [5]=min_dwell_min [6]=max_hacc_m [7]=vertex_count [8]=flags (bit 0
 *    consumed) [9..12]=start_epoch LE [13..16]=expiry_epoch LE, then
 *    vertex_count x (lat_e7 LE int32, lon_e7 LE int32).
 *  Null for an empty slot (or a record this parser does not know). A count
 *  the bytes cannot cover keeps the corners that fit, as the website does. */
export function parseSlotRecord(bytes: Uint8Array | null | undefined): Fence | null {
  if (!bytes || bytes.length < 17 || bytes[0] !== 0x01) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const f: Fence = {
    fenceId: bytes[1],
    action: bytes[2],
    zoneSlot: bytes[3],
    confirmFixes: bytes[4],
    minDwellMin: bytes[5],
    maxHaccM: bytes[6],
    consumed: (bytes[8] & 1) === 1,
    startEpoch: dv.getUint32(9, true),
    expiryEpoch: dv.getUint32(13, true),
    verts: [],
    vertexCount: 0,
  };
  const n = bytes[7];
  for (let k = 0; k < n && 17 + k * 8 + 8 <= bytes.length; k++) {
    f.verts.push({
      latitudeE7: dv.getInt32(17 + k * 8, true),
      longitudeE7: dv.getInt32(21 + k * 8, true),
    });
  }
  f.vertexCount = f.verts.length;
  return f;
}

/** The form for editing a fence the collar holds (re-sending it to the same
 *  slot replaces it). */
export function fenceToForm(f: Fence): FenceForm {
  return {
    id: f.fenceId,
    action: f.action,
    zoneSlot: f.zoneSlot,
    confirm: f.confirmFixes,
    hacc: f.maxHaccM,
    start: f.startEpoch,
    expiry: f.expiryEpoch,
    vertsText: vertsToText(f.verts.map(v => [v.latitudeE7 / 1e7, v.longitudeE7 / 1e7])),
  };
}

/* ── Verdicts ────────────────────────────────────────────────────────── */

/** ConfigAckStatus, as the tunnel echoes it. */
export const CFG_ACK = { NONE: 0, APPLIED: 1, MISSING: 2, RAIL: 3, NO_TXN: 4, EXPIRED: 5 } as const;

export const ACK_TEXT: Record<number, string> = {
  0: 'no verdict',
  1: 'applied',
  2: 'refused — some parts never arrived',
  3: 'refused by the collar’s safety rules',
  4: 'refused — the collar saw no open transaction',
  5: 'refused — the transaction expired before it completed',
};

/** Mirrors SCHED_RAIL_* in firmware sched_sync.h (the reason rides
 *  missing_mask when ack_status is 3). */
export const RAIL_TEXT: Record<number, string> = {
  1: 'the schedule count was outside 1–5',
  2: 'a newly added schedule was missing its time window',
  3: 'it would have turned every radio off',
  4: 'the fastest check-in would have been sparser than daily',
  5: 'one schedule had both LoRaWAN and raw LoRa enabled',
  6: 'two schedules claimed the same hour of the day',
  7: 'the zone shape was invalid (needs 3–8 corners, every corner delivered)',
  8: 'the zone pointed at a schedule slot that doesn’t exist or has GPS off',
  9: 'zones need at least one schedule with GPS enabled',
  10: 'a detach zone needs a paired release add-on and an expiry within 30 days',
  11: 'one schedule could never run — the schedules above it cover all of its hours on every day it applies',
  12: 'a schedule’s date range ended before it started',
};

/** The part of a CfgEchoPacket a verdict reads. A PB.CfgEchoPacket
 *  satisfies it as is. */
export type VerdictEcho = { ackStatus?: number; missingMask?: number } | null | undefined;

/** Human verdict for a transaction's final echo — the website's verdictText. */
export function verdictText(echo: VerdictEcho): string {
  if (!echo) return 'no response';
  const ack = echo.ackStatus ?? 0;
  const mask = echo.missingMask ?? 0;
  if (ack === CFG_ACK.APPLIED) return 'applied';
  if (ack === CFG_ACK.RAIL && RAIL_TEXT[mask]) return `refused: ${RAIL_TEXT[mask]}`;
  if (ack === CFG_ACK.MISSING) return `refused: parts 0x${(mask >>> 0).toString(16)} never arrived`;
  return ACK_TEXT[ack] || `unknown verdict ${ack}`;
}

/* ── Rows ────────────────────────────────────────────────────────────── */

/** Bit N-1 of fence_active_mask: the collar is inside fence N now. */
export function fenceInside(activeMask: number | null | undefined, fenceId: number): boolean {
  return (((activeMask || 0) >> (fenceId - 1)) & 1) === 1;
}

/** The words of a zone row (fenceRowHtml): the action, the corner count
 *  and expiry, and the FIRED / INSIDE NOW badges. */
export function fenceRow(
  f: Fence,
  activeMask: number | null | undefined,
): { title: string; action: string; detail: string; fired: boolean; inside: boolean; detach: boolean } {
  const exp = f.expiryEpoch ? new Date(f.expiryEpoch * 1000).toLocaleString() : 'never';
  const action =
    (GF_ACTIONS[f.action] || '?') +
    (f.action === GF_ACTION.SCHEDULE_OVERRIDE ? ` → slot ${f.zoneSlot || 0}` : '');
  return {
    title: `Zone ${f.fenceId}`,
    action,
    detail: `${f.verts.filter(Boolean).length} corners · expires ${exp}`,
    fired: !!f.consumed,
    inside: fenceInside(activeMask, f.fenceId),
    detach: f.action === GF_ACTION.DETACH,
  };
}
