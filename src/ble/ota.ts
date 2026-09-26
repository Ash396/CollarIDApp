/*
 * ota.ts — Main-processor (U5) firmware update over BLE, relayed through
 * the collar's radio module to the U5's SPI DFU consumer (collarID_thread
 * Core/Src/fw_update.cpp). Port of the website's js/u5-ota.js: the SAME
 * framing, pacing, restart and end-of-stream rules, so the two stay in step
 * (__tests__/ota.test.ts replays fixtures derived from u5-ota.js itself,
 * including a whole send() against a fake radio, write for write).
 *
 * Wire protocol (UpdateChar DFU framing, paced):
 *   enter:  protobuf BlePacket{schedule_config_packet{special_mode:1}}
 *   DATA:   [0x11][seq u32 LE][len u16 LE][payload][crc32]  — NO START
 *           frame (the legacy radio relay predates it); image metadata
 *           rides in-band as a 32 B stream header the U5 parses.
 *   pacing: the radio batches exactly 10 DATA frames, relays them to the
 *           U5 over SPI and only then publishes special_mode 2
 *           (READY_NEXT). Any write while a batch is in flight forces a
 *           full restart — so after every 10th frame (and after END) we
 *           MUST wait for READY_NEXT. special_mode 3 = restart from seq 0.
 *   verify: the U5 CRC-checks the whole staged image, swaps flash banks
 *           and reboots — the BLE link drops as its radio loses power.
 *           Reconnect and read the firmware version to confirm.
 *
 * Freshness trick: on a radio without NOTIFY the app polls the
 * characteristic. A stale READY_NEXT from the previous batch would unpace
 * us, but every accepted GATT write replaces the attribute value with the
 * written frame, so "value still equals my last write" = no verdict yet.
 *
 * Stream header (fw_update.cpp is the counterpart):
 *   [0..3]'U5FW' [4]ver=1 [5]target=0 [6..7]flags=0 [8..11]image_len
 *   [12..15]image_crc32 [16..23]git hash (NUL-padded) [24..27]reserved
 *   [28..31]crc32 of bytes 0..27
 *
 * The transport is an OtaLink (ble/bleManager.ts otaLinkForDevice): a
 * plain read / write / subscribe surface over react-native-ble-plx, so the
 * flow here never sees base64 or the native module, and the tests drive it
 * with a fake radio.
 */

export const FRAME_DATA = 0x11;
export const FRAME_END = 0x12;
export const HDR_LEN = 32;
/** Radio DFU_BATCH_PKTS — protocol constant. */
export const BATCH_PKTS = 10;
/** Proven on non-MTU-reporting links. */
export const MAX_PAYLOAD_FALLBACK = 96;
/* NOT the radio's DFU_MAX_PAYLOAD (244). The binding limit is the HCI event
 * that DELIVERS a write to the application: a vendor event carries at most
 * 255 parameter bytes, and the permit-req wrapper leaves ~248 for the frame.
 * A 244-payload frame is 255 bytes and cannot fit the event: the stack clips
 * it, the length check fails, and the radio RESTARTs on batch 0.
 *
 * 2026-08-08: capped at 182, the ONLY hardware-verified geometry. A 230 cap
 * passed the event-size ceilings but stalled REPEATABLY at the final partial
 * batch on a live collar (the U5's received counter froze at exactly HALF the
 * tail batch, twice). The radio->U5 SPI relay has no per-batch integrity
 * check; until that hop gets a CRC, stay on the geometry the bench proved. */
export const MAX_PAYLOAD_CAP = 182;
export const WRITE_TIMEOUT_MS = 12000;
/** The radio's own DFU inactivity timeout. */
export const BATCH_ACK_TIMEOUT_MS = 30000;
/* The post-END wait is NOT a batch wait and must not borrow its budget. Every
 * byte is already delivered; this is a best-effort "did the collar confirm?"
 * and no-ack is an expected outcome, because the U5's reboot drives
 * BLE_PWR_EN low and kills the radio mid-acknowledge. */
export const END_ACK_TIMEOUT_MS = 8000;
/* How long a post-END RESTART gets to prove itself benign: a collar that is
 * really verifying + bank-swapping kills the BLE link inside this window
 * when its reboot cuts the radio's power. */
export const RESTART_VERIFY_WATCH_MS = 15000;
/* UpdateChar on older radios is READ | WRITE — no NOTIFY — so the batch ack
 * can only be discovered by polling. Nothing competes for airtime while we
 * wait, so poll hard. */
export const ACK_POLL_MS = 40;
export const MTU_WAIT_MS = 4000;
export const MTU_POLL_MS = 100;
export const DFU_ENTER = 1;
export const DFU_READY = 2;
export const DFU_RESTART = 3;
export const MAX_RESTARTS = 2;
/** The radio's MTU publish: special_mode 0x4D54xxxx ('M','T', mtu). */
export const MTU_PUBLISH_TAG = 0x4d54;

/* Refuse a U5 BLE update up front when the collar's own version report says
 * it cannot work, instead of discovering that 90 seconds into a transfer.
 * Firmware from build 263 on reports "b<build> <hash>"; everything older
 * reports a bare git hash — and no build old enough to report a bare hash
 * is new enough to pass, so a bare hash IS the "update over USB-C first"
 * case. The bar is v1.14.0 (build 266), the first firmware whose wireless
 * update was validated on hardware. Below it, builds 241-257 have an updater
 * that erases the RUNNING bank when SWAP_BANK=1 — for those this gate is
 * what prevents a brick. Mirrors MIN_SAFE_U5_BLE_BUILD in the website's
 * update-device.html; it MUST equal the released build number. */
export const MIN_SAFE_U5_BLE_BUILD = 266;

/** A collar reporting `build` (0 = bare hash / unknown) may be updated over
 *  BLE. */
export function isU5BleSafe(build: number): boolean {
  return build >= MIN_SAFE_U5_BLE_BUILD;
}

/** The website's words for a blocked collar. */
export const U5_BLE_GATE_REASON =
  'This collar runs firmware older than v1.14.0, which cannot be updated safely over ' +
  'Bluetooth. Update it once over USB-C (the website’s Update Device page) — after that, ' +
  'every future update can be wireless.';

/* ── CRC-32 (poly 0xEDB88320 reflected, init 0xFFFFFFFF, final inversion) ── */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array, len?: number): number {
  let c = 0xffffffff;
  const n = len ?? bytes.length;
  for (let i = 0; i < n; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function le32(v: number): number[] {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
}

export function rd32le(b: Uint8Array, off: number): number {
  return (b[off] | (b[off + 1] << 8) | (b[off + 2] << 16) | (b[off + 3] << 24)) >>> 0;
}

/* ── special_mode frames ────────────────────────────────────────────── */

/** BlePacket{schedule_config_packet{special_mode:code}} — field 2 (msg),
 *  inner field 3 (varint); codes are < 128 so all varints are 1 byte. */
export function encodeSpecialMode(code: number): Uint8Array {
  return new Uint8Array([0x12, 0x02, 0x18, code]);
}

/** The special_mode a BlePacket carries, 0 when none. Hand-rolled: the
 *  radio's MTU publish is a 32-bit code, and a DATA frame read back from
 *  the characteristic must decode to 0, never throw. */
export function decodeSpecialMode(bytes: Uint8Array): number {
  let i = 0;
  function varint(): number {
    let v = 0;
    let s = 0;
    while (i < bytes.length) {
      const b = bytes[i++];
      v |= (b & 0x7f) << s;
      if (!(b & 0x80)) break;
      s += 7;
    }
    return v >>> 0;
  }
  function skip(wire: number, len?: number) {
    if (wire === 0) varint();
    else if (wire === 2) i += len ?? varint();
    else if (wire === 5) i += 4;
    else if (wire === 1) i += 8;
    else i = bytes.length;
  }
  while (i < bytes.length) {
    const tag = varint();
    const field = tag >>> 3;
    const wire = tag & 7;
    if (field === 2 && wire === 2) {
      const end = varint() + i;
      while (i < end) {
        const t2 = varint();
        const f2 = t2 >>> 3;
        const w2 = t2 & 7;
        if (f2 === 3 && w2 === 0) return varint();
        skip(w2);
      }
      return 0;
    }
    skip(wire);
  }
  return 0;
}

/** True for the radio's MTU publish. */
export function isMtuPublish(code: number): boolean {
  return code >>> 16 === MTU_PUBLISH_TAG;
}

/** The DATA payload an MTU publish allows: MTU - 14 (the 11 B frame wrap
 *  plus the 3 B ATT header), floored at 20 and capped at the proven 182. */
export function payloadForMtu(code: number): number {
  return Math.max(20, Math.min(MAX_PAYLOAD_CAP, (code & 0xffff) - 14));
}

/* ── The stream ─────────────────────────────────────────────────────── */

/** Header + image. The git hash rides as up to 8 ASCII bytes. */
export function buildStream(image: Uint8Array, gitHash: string): Uint8Array {
  const h = new Uint8Array(HDR_LEN);
  h[0] = 0x55;
  h[1] = 0x35;
  h[2] = 0x46;
  h[3] = 0x57; /* 'U5FW' */
  h[4] = 1; /* hdr_ver */
  h[5] = 0; /* target U5 */
  h.set(le32(image.length), 8);
  h.set(le32(crc32(image)), 12);
  const gh = String(gitHash || '').slice(0, 8);
  for (let i = 0; i < gh.length; i++) h[16 + i] = gh.charCodeAt(i) & 0x7f;
  h.set(le32(crc32(h, 28)), 28);
  const stream = new Uint8Array(HDR_LEN + image.length);
  stream.set(h, 0);
  stream.set(image, HDR_LEN);
  return stream;
}

/* Pad the image with 0xFF so header + image is a whole number of batches
 * and the END frame always lands on a batch boundary. The MkII Mesh radio
 * relay has failed at a PARTIAL final batch twice (2026-08-08 at payload
 * 230; then 2026-09-17 at 171 with a 2-frame, 254 B tail: RESTART 56 ms
 * after the last full batch's ack, twice in a row) and never at a full one —
 * the same 2026-09-17 image went through first time once padded. The collar
 * cannot tell: erased flash reads 0xFF, the U5 already fills its final
 * quad-word with 0xFF, and image_len / image_crc32 in the header cover the
 * padding. Costs at most one batch of airtime. Payload is only known after
 * DFU entry, so the stream is (re)built then, and again on a fallback. */
export function padToBatches(image: Uint8Array, payload: number): Uint8Array {
  const batch = payload * BATCH_PKTS;
  const pad = (batch - ((HDR_LEN + image.length) % batch)) % batch;
  if (!pad) return image;
  const out = new Uint8Array(image.length + pad);
  out.set(image, 0);
  out.fill(0xff, image.length);
  return out;
}

/** One DATA frame: [0x11][seq LE32][len LE16][chunk][crc32 of the rest]. */
export function buildDataFrame(seq: number, chunk: Uint8Array): Uint8Array {
  const f = new Uint8Array(7 + chunk.length + 4);
  f[0] = FRAME_DATA;
  f.set(le32(seq), 1);
  f[5] = chunk.length & 0xff;
  f[6] = (chunk.length >>> 8) & 0xff;
  f.set(chunk, 7);
  f.set(le32(crc32(f, 7 + chunk.length)), 7 + chunk.length);
  return f;
}

/** Sanity: a U5 app's vector table starts with an MSP inside the U595's
 *  2.4 MB SRAM (0x2010_0000+) and a reset vector in flash. A radio image
 *  mis-picked here would CRC "correctly" and brick past the rollback's
 *  reach — refuse anything that isn't clearly a U5 image. Throws the
 *  website's message. */
export function checkU5Image(bytes: Uint8Array): { sp: number; pc: number } {
  if (bytes.length < 100 * 1024) throw new Error('Too small to be a main-processor image');
  const sp = rd32le(bytes, 0);
  const pc = rd32le(bytes, 4);
  if (sp < 0x20100000 || sp > 0x20280000 || (pc & 0xff000000) !== 0x08000000) {
    throw new Error('Not a main-processor (U5) image — check the selected file');
  }
  return { sp, pc };
}

/* ── Diagnostic trace ───────────────────────────────────────────────── */
/* This flow bricked a collar in the field once and the only evidence was
 * "0%". Record enough to tell the failure modes apart afterwards — above
 * all whether the RADIO ever confirmed DFU mode. Read with getTrace() /
 * traceText(). Costs nothing when unused. */
type TraceEntry = { t: number; evt: string; [k: string]: unknown };
const trace: TraceEntry[] = [];
const tOrigin = Date.now();
function tr(evt: string, detail?: Record<string, unknown>) {
  trace.push({ t: Date.now() - tOrigin, evt, ...(detail || {}) });
  if (trace.length > 4000) trace.splice(0, 1000); /* bound, keep the tail */
}
export function getTrace(): TraceEntry[] {
  return trace.slice();
}
export function traceText(): string {
  return trace
    .map(e => {
      const { t, evt, ...rest } = e;
      return String(t).padStart(6) + ' ms  ' + evt.padEnd(16) + ' ' + JSON.stringify(rest);
    })
    .join('\n');
}
export function clearTrace() {
  trace.length = 0;
}
const hex = (b: Uint8Array, n?: number) =>
  Array.from(b.subarray(0, n ?? b.length))
    .map(x => x.toString(16).padStart(2, '0'))
    .join(' ');

/* ── The link ───────────────────────────────────────────────────────── */

/** What the flow needs from the update characteristic. */
export type OtaLink = {
  /** UpdateChar advertises NOTIFY (radios built after 2026-07-23). */
  canNotify: boolean;
  /** UpdateChar advertises WRITE_WITHOUT_RESPONSE. */
  canWriteNoResp: boolean;
  write(bytes: Uint8Array, withResponse: boolean): Promise<void>;
  read(): Promise<Uint8Array>;
  /** Start notifications; resolves once they are on. Returns the stop. */
  subscribe(onValue: (bytes: Uint8Array) => void): Promise<() => Promise<void>>;
  isConnected(): Promise<boolean>;
};

/** Radio capabilities, from the caps characteristic and the update
 *  characteristic's properties (probeRadioCaps in ble/bleManager.ts). */
export type RadioCaps = {
  /** 'legacy' = no caps characteristic (the frozen first-generation radio);
   *  'mesh' = the MkII Mesh radio; 'unknown' before a probe. */
  generation: 'legacy' | 'mesh' | 'unknown';
  capsFmt: number;
  capsBits: number;
  capsPresent: boolean;
  /** true | false | null = unknown. */
  otaCapable: boolean | null;
  fastDfu: boolean;
  canNotify: boolean;
  canWriteNoResp: boolean;
};

export const CAP_ADDON = 0x01;
export const CAP_DUALSLOT_OTA = 0x02;
export const CAP_FAST_DFU = 0x04;

/** Radio capabilities from the caps characteristic's bytes (null when the
 *  characteristic is absent) and the update characteristic's properties —
 *  the website's probeRadio, minus the GATT reads. fmt >= 2 makes the OTA
 *  and fast-DFU bits meaningful; on fmt 1 they are UNKNOWN, deliberately not
 *  treated as zero. NOTIFY only exists on the fast build, and that build is
 *  by construction dual-slot, so a notifying radio is positively current. */
export function radioCapsFrom(
  capsBytes: Uint8Array | null,
  props: { canNotify: boolean; canWriteNoResp: boolean },
): RadioCaps {
  const out: RadioCaps = {
    generation: 'unknown',
    capsFmt: 0,
    capsBits: 0,
    capsPresent: false,
    otaCapable: null,
    fastDfu: false,
    canNotify: false,
    canWriteNoResp: false,
  };
  if (capsBytes && capsBytes.length >= 4 && capsBytes[0] === 0x43 && capsBytes[1] === 0x50) {
    out.capsPresent = true;
    out.generation = 'mesh';
    out.capsFmt = capsBytes[2];
    out.capsBits = capsBytes[3];
    if (capsBytes[2] >= 2) {
      out.otaCapable = !!(capsBytes[3] & CAP_DUALSLOT_OTA);
      out.fastDfu = !!(capsBytes[3] & CAP_FAST_DFU);
    }
  } else {
    /* No caps characteristic: the frozen first-generation radio. Wired-only
     * by hardware, never OTA. */
    out.generation = 'legacy';
    out.otaCapable = false;
  }
  out.canNotify = props.canNotify;
  out.canWriteNoResp = props.canWriteNoResp;
  if (out.canNotify) {
    out.fastDfu = true;
    out.otaCapable = true;
  }
  return out;
}

export type UpdatePolicy = {
  u5: { allow: boolean; reason: string };
  wb: { allow: boolean; reason: string };
  headline: string;
};

/** Policy — the website's updatePolicy. The asymmetry is deliberate: the
 *  radio's own update stays open wherever it can physically work (it is the
 *  only way to make an old radio current); the main-processor update is
 *  what gets gated, and only when a better option is actually available
 *  right now — a radio that is both out of date AND upgradeable. Blocking a
 *  legacy or pre-copier radio would remove wireless updates permanently from
 *  collars that have no other remedy, buying no safety. */
export function updatePolicy(caps: RadioCaps): UpdatePolicy {
  const legacy = caps.generation === 'legacy';
  const noCopier = caps.otaCapable === false;

  let wb: { allow: boolean; reason: string };
  let headline: string | undefined;
  if (legacy) {
    headline = 'This radio module cannot be updated over Bluetooth';
    wb = { allow: false, reason: 'This module cannot be upgraded over the air.' };
  } else if (noCopier) {
    headline = 'This radio module cannot be updated over Bluetooth yet';
    wb = {
      allow: false,
      reason: 'This module cannot be upgraded over the air yet — one wired service visit enables it.',
    };
  } else {
    wb = {
      allow: true,
      reason:
        caps.otaCapable === null
          ? 'Radio age unconfirmed. Safe to try — an incapable module refuses it within seconds, having changed nothing.'
          : '',
    };
  }

  let u5: { allow: boolean; reason: string };
  if (caps.fastDfu) {
    headline = headline || 'Radio firmware is up to date';
    u5 = { allow: true, reason: '' };
  } else if (wb.allow && caps.otaCapable === true) {
    headline = headline || 'Radio firmware is out of date';
    u5 = { allow: false, reason: 'Update the radio first — this then runs several times faster.' };
  } else {
    headline = headline || (wb.allow ? 'Radio firmware may be out of date' : 'Radio firmware is out of date');
    u5 = { allow: true, reason: '' };
  }
  return { u5, wb, headline };
}

/* ── The send ───────────────────────────────────────────────────────── */

export class RestartRequest extends Error {
  isRestart = true;
  constructor() {
    super('restart');
  }
}

/** The operator cancelled. The radio idles by its own 30 s inactivity
 *  timeout; the next transfer starts from scratch (the U5 re-erases). */
export class OtaAborted extends Error {
  isAbort = true;
  constructor() {
    super('Update cancelled');
  }
}

export type SendResult = {
  /** Every byte reached the radio and END was written. */
  delivered: boolean;
  /** The collar acknowledged the final batch (it may reboot before it can). */
  confirmed: boolean;
};

export type SendOptions = {
  onProgress?: (sentBytes: number, totalBytes: number) => void;
  /** Polled before every frame; true stops the transfer (OtaAborted). */
  abortRequested?: () => boolean;
  caps?: RadioCaps | null;
  /** Injectable clock / sleep, for tests. */
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Timeouts, overridable for tests; defaults are the protocol's. */
  timing?: Partial<{
    batchAckTimeoutMs: number;
    endAckTimeoutMs: number;
    restartVerifyWatchMs: number;
    mtuWaitMs: number;
    ackPollMs: number;
    mtuPollMs: number;
  }>;
};

/* True once ANY batch has been acknowledged in the current send(). A restart
 * rewinds streamOnce and resets its local batchNo to 0, which used to make a
 * late failure print "your firmware is too old" after 580 KB had already
 * transferred fine. */
let anyBatchAcked = false;
/* Same thing, but NOT reset per send(): "has this app ever seen this collar
 * store a batch?". A retry after an aborted transfer needs a different
 * explanation than a first attempt, and this is what tells them apart. */
let everAcked = false;
/** Test hook: forget what earlier sends learned. */
export function resetSendMemory() {
  anyBatchAcked = false;
  everAcked = false;
}

type SinkValue = { code: number; bytes: string; t: number };
type Sink = { q: SinkValue[]; waiters: ((v: SinkValue) => void)[] };

/* Notification sink. Values are queued, not just latched: an ack can land
 * before we start waiting for it, and dropping that would stall the whole
 * transfer. */
function makeSink(): Sink {
  return { q: [], waiters: [] };
}
function sinkPush(s: Sink, v: Omit<SinkValue, 't'>, now: () => number) {
  const sv: SinkValue = { ...v, t: now() }; /* when it ARRIVED — see waitReady's `since` */
  const w = s.waiters.shift();
  if (w) w(sv);
  else s.q.push(sv);
}
function sinkNext(s: Sink, timeoutMs: number): Promise<SinkValue> {
  const first = s.q.shift();
  if (first) return Promise.resolve(first);
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>;
    const fn = (v: SinkValue) => {
      clearTimeout(timer);
      resolve(v);
    };
    timer = setTimeout(() => {
      const i = s.waiters.indexOf(fn);
      if (i >= 0) s.waiters.splice(i, 1);
      reject(new Error('notify timeout'));
    }, timeoutMs);
    s.waiters.push(fn);
  });
}

/** Send a U5 app image through the connected radio. Resolves once the relay
 *  is complete — the collar then CRC-verifies, swaps banks and reboots (the
 *  BLE link will drop). Throws on a refused image, a stalled or restarted
 *  transfer, or an abort. */
export async function sendU5Image(
  link: OtaLink,
  image: Uint8Array,
  gitHash: string,
  opts: SendOptions = {},
): Promise<SendResult> {
  anyBatchAcked = false;
  const now = opts.now || Date.now;
  const sleep = opts.sleep || ((ms: number) => new Promise<void>(r => setTimeout(r, ms)));
  const wantAbort = opts.abortRequested || (() => false);
  const onProgress = opts.onProgress;
  const T = {
    batchAckTimeoutMs: BATCH_ACK_TIMEOUT_MS,
    endAckTimeoutMs: END_ACK_TIMEOUT_MS,
    restartVerifyWatchMs: RESTART_VERIFY_WATCH_MS,
    mtuWaitMs: MTU_WAIT_MS,
    ackPollMs: ACK_POLL_MS,
    mtuPollMs: MTU_POLL_MS,
    ...(opts.timing || {}),
  };
  const bytes = image;

  const { sp, pc } = checkU5Image(bytes);

  let stream = buildStream(bytes, gitHash); /* rebuilt padded once the payload is known */

  /* Capability probe. Radios flashed after 2026-07-23 advertise NOTIFY and
   * WRITE_WITHOUT_RESP on UpdateChar; older ones do not, and must be polled
   * and written with response. Everything downstream branches on these. */
  const canNotify = !!link.canNotify;
  const noResp = !!link.canWriteNoResp;

  tr('send.begin', {
    imageBytes: bytes.length,
    streamBytes: stream.length,
    sp: '0x' + sp.toString(16),
    pc: '0x' + pc.toString(16),
    gitHash,
    canNotify,
    noResp,
  });

  const checkAbort = () => {
    if (wantAbort()) {
      tr('abort.requested');
      throw new OtaAborted();
    }
  };

  async function writeChar(b: Uint8Array, withResponse: boolean) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        link.write(b, withResponse),
        new Promise<void>((_, rej) => {
          timer = setTimeout(
            () => rej(new Error(`BLE write stalled (${b.length} B) — link or MTU problem`)),
            WRITE_TIMEOUT_MS,
          );
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  /* DATA frames go write-without-response when the radio allows it: the
   * batch boundary is already the flow-control point, and seq + CRC +
   * DFU_RESTART catch drops. Control writes (DFU_ENTER, END) stay
   * with-response — they are rare and their delivery must be certain. */
  const writeData = (b: Uint8Array) => writeChar(b, !noResp);

  /* Subscribe BEFORE entering DFU: the radio publishes its MTU from its main
   * loop right after dfu_enter_mode(), and a subscription set up afterwards
   * can miss it — which is exactly how we ended up on the 96 B fallback. */
  let sink: Sink | null = null;
  let stop: (() => Promise<void>) | null = null;
  if (canNotify) {
    sink = makeSink();
    const s = sink;
    try {
      stop = await link.subscribe(raw => {
        sinkPush(s, { code: decodeSpecialMode(raw), bytes: hex(raw, 8) }, now);
      });
      tr('notify.subscribed');
    } catch (e: any) {
      tr('notify.subscribeFailed', { err: e?.message });
      sink = null;
      stop = null;
    }
  }

  /* Wait for READY_NEXT after a full batch (or END). lastWrite is the exact
   * frame we just wrote: while the attribute still echoes it, the relay
   * round-trip (radio -> SPI -> U5 flash -> ack) hasn't finished.
   *
   * `since` is the moment the batch's last frame went out; a READY older
   * than that was queued before we asked anything, so it belongs to a
   * previous transfer and must not be spent here. (The retry-after-
   * interruption stall: a READY left over from the aborted transfer is
   * indistinguishable from a real ack, so batch 0 consumed it instantly and
   * every later batch waited on an ack already spent.) NOT a queue flush:
   * filtering by arrival time only ever rejects entries that provably
   * predate the request. */
  async function waitReady(lastWrite: Uint8Array | null, budgetMs: number | undefined, since: number) {
    const budget = budgetMs || T.batchAckTimeoutMs;
    const t0 = now();

    if (sink) {
      while (now() - t0 < budget) {
        let v: SinkValue;
        try {
          v = await sinkNext(sink, budget - (now() - t0));
        } catch (e) {
          break;
        }
        if (since && v.t && v.t < since) {
          tr('ack.stale', {
            via: 'notify',
            code: '0x' + v.code.toString(16),
            agedMs: since - v.t,
            note: 'queued before the frames it would acknowledge',
          });
          continue;
        }
        if (v.code === DFU_READY) {
          tr('ack.ready', { via: 'notify', ms: now() - t0 });
          return;
        }
        if (v.code === DFU_RESTART) {
          tr('ack.restart', { via: 'notify' });
          throw new RestartRequest();
        }
        tr('ack.other', { via: 'notify', bytes: v.bytes, code: '0x' + v.code.toString(16) });
      }
      tr('ack.timeout', { via: 'notify' });
      throw new Error(`Timed out waiting for the collar to store a batch (${Math.round(budget / 1000)} s)`);
    }

    let polls = 0;
    let lastSeen: string | null = null;
    while (now() - t0 < budget) {
      await sleep(T.ackPollMs);
      let b: Uint8Array;
      try {
        b = await link.read();
      } catch (e: any) {
        tr('ack.readFail', { err: e?.message, afterMs: now() - t0 });
        throw new Error('BLE read failed while waiting for the collar: ' + e?.message);
      }
      polls++;
      const h = hex(b, 8);
      if (h !== lastSeen) {
        tr('ack.read', { bytes: h, len: b.length });
        lastSeen = h;
      }
      if (lastWrite && b.length === lastWrite.length && b[0] === lastWrite[0]) continue;
      const code = decodeSpecialMode(b);
      if (code === DFU_READY) {
        tr('ack.ready', { polls, ms: now() - t0 });
        return;
      }
      if (code === DFU_RESTART) {
        tr('ack.restart', { polls });
        throw new RestartRequest();
      }
    }
    tr('ack.timeout', { polls, lastSeen });
    throw new Error(`Timed out waiting for the collar to store a batch (${Math.round(budget / 1000)} s)`);
  }

  /* One full pass of the stream (a RESTART rewinds to here, seq 0). */
  async function streamOnce(payload: number): Promise<SendResult> {
    let seq = 0;
    let inBatch = 0;
    let batchNo = 0;
    for (let off = 0; off < stream.length; off += payload, seq++) {
      checkAbort();
      const chunk = stream.subarray(off, Math.min(off + payload, stream.length));
      const f = buildDataFrame(seq, chunk);
      if (seq < 12) tr('frame.write', { seq, len: f.length, head: hex(f, 8) });
      await writeData(f);
      if (++inBatch === BATCH_PKTS) {
        const wroteAt = now();
        tr('batch.await', { batchNo, seqThrough: seq });
        try {
          await waitReady(f, undefined, wroteAt);
          anyBatchAcked = true;
          everAcked = true;
        } catch (e: any) {
          tr('batch.fail', { batchNo, err: e?.message, isRestart: !!e?.isRestart });
          /* Batch 0 never acking has TWO very different causes:
           *   - nothing has EVER acked on this app: the main processor has no
           *     BLE-update consumer, and USB-C is the answer.
           *   - it acked earlier and stopped: the firmware is demonstrably
           *     fine. Saying "too old" here is simply false. */
          if (batchNo === 0 && !anyBatchAcked && !e?.isRestart) {
            throw new Error(
              everAcked
                ? 'The collar accepted data earlier but stopped acknowledging this time. ' +
                  'It is most likely still finishing the interrupted transfer — leave it ' +
                  'for a minute, then try again.'
                : 'The collar stored nothing — its main-processor firmware is too old to ' +
                  'update over Bluetooth. Update it once over USB-C, then this flow works.',
            );
          }
          throw e;
        }
        inBatch = 0;
        batchNo++;
      }
      if (onProgress) onProgress(Math.min(off + payload, stream.length), stream.length);
    }
    const end = new Uint8Array([FRAME_END]);
    await writeChar(end, true); /* control write: always acked */
    const endWroteAt = now();

    /* Every byte is delivered at this point. The U5 now CRC-verifies, swaps
     * banks and reboots — and its reboot drives BLE_PWR_EN low, cutting the
     * RADIO's power part-way through acknowledging. So a RESTART, a timeout
     * or a dropped link HERE is the expected shape of success, not a fault.
     * Never rewind past END. */
    try {
      await waitReady(end, T.endAckTimeoutMs, endWroteAt);
      tr('end.acked', { note: 'collar confirmed the final batch' });
      return { delivered: true, confirmed: true };
    } catch (e: any) {
      if (e?.isRestart) {
        /* An explicit RESTART here is ambiguous: teardown noise from a
         * collar whose reboot is cutting the radio's power, or a live radio
         * that reset the session because the tail frames never validated.
         * Let the link arbitrate: a verifying collar drops the connection
         * within restartVerifyWatchMs; a failed transfer keeps it up. */
        const watchUntil = now() + T.restartVerifyWatchMs;
        let up = await link.isConnected();
        while (up && now() < watchUntil) {
          await sleep(500);
          up = await link.isConnected();
        }
        if (!up) {
          tr('end.restartThenDrop', { note: 'link died in the verify window — collar is rebooting' });
          return { delivered: true, confirmed: false };
        }
        tr('end.restartAlive', {
          note: 'radio still connected after the verify window — tail never landed, rewinding',
        });
        throw e;
      }
      tr('end.noAck', { err: e?.message, note: 'image fully delivered — collar is verifying/rebooting' });
      return { delivered: true, confirmed: false };
    }
  }

  try {
    /* Enter DFU mode — and CONFIRM it, because entering is not idempotent.
     * The protobuf DFU_ENTER begins 0x12, and 0x12 is also DFU_FRAME_END.
     * The radio routes EVERY UpdateChar write to the raw DFU parser while a
     * DFU session is active, so a DFU_ENTER sent while the radio still holds
     * a stale session from an interrupted transfer is parsed as END: the
     * radio drops to IDLE, emits one READY, and then every data frame lands
     * in the PROTOBUF parser and is silently discarded. So never assume an
     * enter landed: the MTU publish (0x4D54xxxx) is the one positive signal
     * that dfu_enter_mode() actually ran. Write DFU_ENTER, wait for the
     * publish; any other notification in the window is the stale session
     * being kicked — write DFU_ENTER again. Radios that cannot notify keep
     * the old behaviour exactly: one enter, no second write ever, 96 B
     * fallback. */
    let payload = MAX_PAYLOAD_FALLBACK;
    let mtuConfirmed = false;
    const applyMtu = (code: number) => {
      payload = payloadForMtu(code);
      mtuConfirmed = true;
    };

    /* Reused by the RESTART rewind below, and that reuse is load-bearing: a
     * radio-initiated restart leaves the radio ACTIVE, so a bare DFU_ENTER
     * hits the same 0x12-is-END collision. allowMtuResize is false on
     * rewinds so a re-published MTU cannot re-raise a payload the fallback
     * just lowered. */
    async function enterConfirmed(firstWindowMs: number, allowMtuResize: boolean): Promise<boolean> {
      const ENTER_TRIES = 3;
      let ok = false;
      for (let attempt = 0; attempt < ENTER_TRIES && !ok; attempt++) {
        if (attempt) await sleep(250); /* let the radio main loop settle */
        const wroteAt = now();
        await writeChar(encodeSpecialMode(DFU_ENTER), true);
        tr('dfuEnter.written', { attempt });
        const deadline = now() + (attempt === 0 ? firstWindowMs : 900);
        while (now() < deadline) {
          let v: SinkValue;
          try {
            v = await sinkNext(sink!, Math.max(50, deadline - now()));
          } catch (e) {
            break; /* window elapsed in silence */
          }
          /* Entries that predate OUR write are skimmed inside the window;
           * only a response that postdates it says anything about the
           * radio's current state. */
          if (v.t && v.t < wroteAt) {
            tr('dfuEnter.stale', { code: '0x' + v.code.toString(16) });
            continue;
          }
          if (isMtuPublish(v.code)) {
            if (allowMtuResize) applyMtu(v.code);
            else mtuConfirmed = true;
            ok = true;
            tr('dfuEnter.confirmed', { attempt, bytes: v.bytes, payload });
            break;
          }
          tr('dfuEnter.kicked', {
            attempt,
            code: '0x' + v.code.toString(16),
            note: 'stale DFU session responded — re-entering',
          });
          break; /* state advanced; write enter again */
        }
      }
      if (!ok) tr('dfuEnter.unconfirmed', { tries: ENTER_TRIES });
      return ok;
    }

    checkAbort();
    if (sink) {
      await enterConfirmed(T.mtuWaitMs, true);
    } else {
      await writeChar(encodeSpecialMode(DFU_ENTER), true);
      tr('dfuEnter.written');
      /* Wait for the MTU publish whenever the radio can actually NOTIFY —
       * canNotify is read from the characteristic itself, which is the
       * thing that determines whether an MTU can arrive. */
      const mtuDeadline = now() + (canNotify ? T.mtuWaitMs : 0);
      let i = 0;
      if (!canNotify) tr('mtu.skipped', { note: 'radio cannot notify — 96 B fallback' });
      while (now() < mtuDeadline) {
        await sleep(T.mtuPollMs);
        try {
          const raw = await link.read();
          const code = decodeSpecialMode(raw);
          tr('mtu.poll', { i: i++, bytes: hex(raw, 8), code: '0x' + code.toString(16) });
          if (isMtuPublish(code)) {
            applyMtu(code);
            break;
          }
        } catch (e: any) {
          tr('mtu.readErr', { i, err: e?.message });
          break;
        }
      }
    }
    /* THE decisive datum. Without the MTU publish we are about to write raw
     * 0x11 frames to a characteristic that, outside DFU mode, is the
     * protobuf CONFIG endpoint. A legacy radio publishes nothing, so this is
     * not proof of a fault by itself — but it is exactly the state to
     * capture when diagnosing a brick. */
    tr('mtu.result', {
      mtuConfirmed,
      payload,
      note: mtuConfirmed ? 'radio confirmed DFU mode' : 'NO DFU CONFIRMATION — streaming blind',
    });

    /* Stream, honoring radio-requested restarts a couple of times (a restart
     * also resets the U5's staging state, so a plain rewind is correct).
     * Before each retry, re-enter DFU mode: the radio's 30 s inactivity
     * timeout EXITS DFU entirely, and raw frames written outside DFU mode
     * are rejected as garbage protobuf. */
    stream = buildStream(padToBatches(bytes, payload), gitHash);
    tr('stream.padded', { payload, streamBytes: stream.length, batches: stream.length / (payload * BATCH_PKTS) });
    for (let attempt = 0; ; attempt++) {
      try {
        return await streamOnce(payload);
      } catch (e: any) {
        if (e?.isRestart && attempt < MAX_RESTARTS) {
          /* A restart before a single ack at an elevated payload means the
           * frames themselves are being refused — some ceiling below the
           * advertised MTU. The proven fallback always fits. Restarts AFTER
           * an ack keep the payload: the size is demonstrably fine. */
          if (!anyBatchAcked && payload > MAX_PAYLOAD_FALLBACK) {
            tr('payload.fallback', {
              from: payload,
              to: MAX_PAYLOAD_FALLBACK,
              note: 'restart before any ack at elevated payload',
            });
            payload = MAX_PAYLOAD_FALLBACK;
            stream = buildStream(padToBatches(bytes, payload), gitHash);
            tr('stream.padded', {
              payload,
              streamBytes: stream.length,
              batches: stream.length / (payload * BATCH_PKTS),
            });
          }
          checkAbort();
          if (sink) await enterConfirmed(900, false);
          else await writeChar(encodeSpecialMode(DFU_ENTER), true);
          await sleep(300);
          if (sink) sink.q.length = 0; /* drop pre-rewind acks */
          continue;
        }
        if (e?.isRestart) {
          /* Three attempts, and not ONE batch ever acknowledged: what a U5
           * with no BLE-update consumer looks like from here. */
          throw new Error(
            anyBatchAcked
              ? 'Transfer kept failing (the relay asked to restart three times)'
              : 'The collar stored nothing across three attempts — its main-processor ' +
                'firmware is older than Bluetooth updating. Update it once over USB-C; ' +
                'after that this flow works.',
          );
        }
        throw e;
      }
    }
  } finally {
    /* The collar reboots into the new image on success, so the link drops
     * under us — unsubscribing is best-effort on purpose. */
    if (stop) {
      try {
        await stop();
      } catch (_) {
        /* gone already */
      }
    }
  }
}
