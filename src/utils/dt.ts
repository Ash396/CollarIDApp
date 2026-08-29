// CollarDT (detachment node) protocol — pure logic shared by the direct-BLE
// panel and the collar-relayed add-on panel. Byte layouts mirror the website
// (detach.html + configure.html) and firmware dt_service.h; keep in sync.

/* ── Commands ─────────────────────────────────────────────────────────── */
// DtBleCmdV1_t / DtBleFwdV1_t command byte. PAIR/SET_CHECKIN only make sense
// relayed through a collar; the rest work on both paths.
export const DT_CMD = {
  NOP: 0, // pure clock sync (every frame carries our UTC epoch)
  ARM: 1, // param = detach epoch (UTC seconds)
  DETACH: 2, // run detach motor (max 30 s)
  DISARM: 3,
  ATTACH: 6, // run attach motor (max 30 s)
  STOP: 7,
  SET_CHECKIN: 9, // relay only; param = cadence seconds
  PAIR: 10, // relay only
  UNPAIR: 11,
  FACTORY_RESET: 12,
  LOAD_TEST: 13, // stall pulse + battery sample (bench characterization)
  SET_AUTODETACH: 14, // param 1 = enable, 0 = disable
} as const;

/** DtBleCmdV1_t (12 B): 'D','T',1,cmd, param u32 LE, sender epoch u32 LE.
 *  Written directly to a CollarDT's UPDATE characteristic. The epoch
 *  disciplines the node's RTC on any contact (firmware gates on a sane
 *  post-2026 value). */
export function buildDtDirectCmd(
  cmd: number,
  param: number,
  nowEpoch: number,
): Uint8Array {
  const buf = new Uint8Array(12);
  const dv = new DataView(buf.buffer);
  dv.setUint8(0, 0x44); // 'D'
  dv.setUint8(1, 0x54); // 'T'
  dv.setUint8(2, 1); // version 1
  dv.setUint8(3, cmd);
  dv.setUint32(4, param >>> 0, true);
  dv.setUint32(8, nowEpoch >>> 0, true);
  return buf;
}

/** DtBleFwdV1_t (16 B): 'D','T',1,cmd, param u32, sender epoch u32,
 *  target_uid u32 — written to the COLLAR's update characteristic; the
 *  collar relays it to the add-on at its next Thread check-in. */
export function buildDtFwdCmd(
  targetUid: number,
  cmd: number,
  param: number,
  nowEpoch: number,
): Uint8Array {
  const buf = new Uint8Array(16);
  const dv = new DataView(buf.buffer);
  dv.setUint8(0, 0x44); // 'D'
  dv.setUint8(1, 0x54); // 'T'
  dv.setUint8(2, 1); // version 1
  dv.setUint8(3, cmd);
  dv.setUint32(4, param >>> 0, true);
  dv.setUint32(8, nowEpoch >>> 0, true);
  dv.setUint32(12, targetUid >>> 0, true);
  return buf;
}

/* ── Direct status blob (DtInfoV0..V5) ────────────────────────────────── */
export type DtInfo = {
  version: number;
  fw: string; // "major.minor"
  gitHash: string; // 8 ASCII chars
  uptimeS: number;
  detachEpoch: number; // 0 = not armed
  battMv: number;
  motorState: number; // 0 idle, 1 detaching, 2 attaching
  // v1+
  rtcEpoch: number | null; // null on old fw; 0 = never set
  mode: number | null; // 0 = standalone, else add-on (linked)
  fired: boolean | null;
  // v2+
  pairedUid: number | null; // 0 = unpaired
  // v3+
  loadedMv: number | null; // 0 = no sample yet
  dieTempC: number | null; // null = n/a
  // v4+
  autoDetachOn: boolean | null;
  // v5+
  checkinIntervalS: number | null;
};

export const MOTOR_STATE_LABELS = ['idle', 'detaching', 'attaching'];

/** Parse the CollarDT status characteristic. Returns null if the payload
 *  isn't a DT info blob (wrong magic / too short). Versioned tail fields
 *  come back null when the firmware predates them. */
export function parseDtInfo(bytes: Uint8Array): DtInfo | null {
  if (bytes.length < 24 || bytes[0] !== 0x44 || bytes[1] !== 0x54) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let git = '';
  for (let i = 5; i < 13; i++) git += String.fromCharCode(bytes[i]);
  const hasV1 = bytes.length >= 30;
  const hasV2 = bytes.length >= 34;
  const hasV3 = bytes.length >= 37;
  const hasV4 = bytes.length >= 38;
  const hasV5 = bytes.length >= 42;
  const dieTempRaw = hasV3 ? dv.getInt8(36) : -128;
  return {
    version: bytes[2],
    fw: `${bytes[3]}.${bytes[4]}`,
    gitHash: git,
    uptimeS: dv.getUint32(13, true),
    detachEpoch: dv.getUint32(17, true),
    battMv: dv.getUint16(21, true),
    motorState: bytes[23],
    rtcEpoch: hasV1 ? dv.getUint32(24, true) : null,
    mode: hasV1 ? bytes[28] : null,
    fired: hasV1 ? bytes[29] !== 0 : null,
    pairedUid: hasV2 ? dv.getUint32(30, true) : null,
    loadedMv: hasV3 ? dv.getUint16(34, true) : null,
    dieTempC: dieTempRaw === -128 ? null : dieTempRaw,
    autoDetachOn: hasV4 ? bytes[37] !== 0 : null,
    checkinIntervalS: hasV5 ? dv.getUint32(38, true) : null,
  };
}

/* ── Collar-relayed local device list ('D','L' blob) ──────────────────── */
export type AddonEntry = {
  uid: number;
  type: number; // 1 = Detachment, 2 = SatCom
  battMv: number;
  motorState: number;
  detachEpoch: number; // 0 = not armed
  heardAgoS: number;
  paired: boolean;
  fired: boolean;
  name: string; // "CollarDT-XXXXXXXX" / "Node-XXXXXXXX"
};

export const ADDON_TYPE_LABELS: { [k: number]: string } = {
  1: 'Detachment',
  2: 'SatCom',
};

/** Parse the collar's local-devices characteristic:
 *  [0]='D' [1]='L' [2]=blob version [3]=count, then per-entry
 *  (v1 = 18 B, v2 = 19 B with a trailing fired u8):
 *  uid u32, type u8, batt_mv u16, motor u8, detach_epoch u32,
 *  heard_ago u16, paired u32 [, fired u8]. All LE. */
export function parseLocalDevices(bytes: Uint8Array): AddonEntry[] | null {
  if (bytes.length < 4 || bytes[0] !== 0x44 || bytes[1] !== 0x4c) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const blobVer = bytes[2];
  const count = bytes[3];
  const stride = blobVer >= 2 ? 19 : 18;
  const out: AddonEntry[] = [];
  for (let i = 0; i < count; i++) {
    const o = 4 + i * stride;
    if (o + stride > bytes.length) break;
    const uid = dv.getUint32(o, true);
    const type = bytes[o + 4];
    out.push({
      uid,
      type,
      battMv: dv.getUint16(o + 5, true),
      motorState: bytes[o + 7],
      detachEpoch: dv.getUint32(o + 8, true),
      heardAgoS: dv.getUint16(o + 12, true),
      paired: dv.getUint32(o + 14, true) !== 0,
      fired: blobVer >= 2 ? bytes[o + 18] !== 0 : false,
      name:
        (type === 1 ? 'CollarDT-' : 'Node-') +
        uid.toString(16).toUpperCase().padStart(8, '0'),
    });
  }
  return out;
}

/* ── Check-in cadence ladder ──────────────────────────────────────────── */
// Divisor chain (each rung divides the next, all divide 86400) — MUST match
// the firmware's config.h ladder and the website's CHECKIN_LADDER.
export const THREAD_CHECKIN_DEFAULT_S = 86400;

export const CHECKIN_LADDER = [
  { s: 300, label: '5 minutes' },
  { s: 900, label: '15 minutes' },
  { s: 1800, label: '30 minutes' },
  { s: 3600, label: '1 hour' },
  { s: 7200, label: '2 hours' },
  { s: 21600, label: '6 hours' },
  { s: 43200, label: '12 hours' },
  { s: 86400, label: '1 day' },
] as const;

/** Snap arbitrary seconds to the nearest rung at or below it. */
export function snapCheckin(sec: number): number {
  let r: number = CHECKIN_LADDER[0].s;
  for (const rung of CHECKIN_LADDER) if (rung.s <= sec) r = rung.s;
  return r;
}

export function checkinLabel(sec: number): string {
  const rung = CHECKIN_LADDER.find(r => r.s === sec);
  return rung ? rung.label : `${sec} s`;
}

/** "37 s" / "5 min" / "2 h 10 m" — heard-ago / uptime formatting. */
export function formatAge(s: number): string {
  if (s < 120) return `${s} s`;
  if (s < 7200) return `${Math.floor(s / 60)} min`;
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} m`;
}
