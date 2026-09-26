/**
 * Main-processor firmware update over BLE (ble/ota.ts), held in step with
 * the website's js/u5-ota.js through fixtures its own code produced
 * (scripts/derive-website-fixtures.js -> __tests__/fixtures/
 * website-u5-ota.json):
 *  - the framing: crc32, the U5FW stream header, padToBatches, DATA frames,
 *    the special-mode frames and their decode (MTU publish included),
 *  - a whole send() against the same fake radio the website's send() was
 *    driven with: every write hashed in order, the write count, the
 *    result — for a notifying radio at MTU 185 and 247, a legacy polled
 *    radio, a with-response notifying radio, and two radio restarts (one
 *    before any ack, which drops the payload to 96; one after, which
 *    keeps it),
 *  - the end-of-stream rules: no ack = delivered, restart-then-drop =
 *    delivered, restart-and-alive = rewind,
 *  - the image sanity check, the too-old diagnoses, abort, the radio
 *    capability probe and the update policy, the safe-build gate,
 *  - the firmware API calls.
 */
import { Buffer } from 'buffer';
import * as PB from '../src/proto/collar_pb.js';
import {
  BATCH_PKTS,
  DFU_ENTER,
  DFU_READY,
  DFU_RESTART,
  MAX_PAYLOAD_CAP,
  MAX_PAYLOAD_FALLBACK,
  MIN_SAFE_U5_BLE_BUILD,
  MTU_PUBLISH_TAG,
  OtaAborted,
  buildDataFrame,
  buildStream,
  checkU5Image,
  crc32,
  decodeSpecialMode,
  encodeSpecialMode,
  isMtuPublish,
  isU5BleSafe,
  padToBatches,
  payloadForMtu,
  radioCapsFrom,
  resetSendMemory,
  U5_BLE_GATE_REASON,
  sendU5Image,
  updatePolicy,
} from '../src/ble/ota';
import type { OtaLink, RadioCaps } from '../src/ble/ota';

const FX = require('./fixtures/website-u5-ota.json');
const crypto = require('crypto');

const hex = (u8: Uint8Array) => Buffer.from(u8).toString('hex');
const sha = (u8: Uint8Array) => crypto.createHash('sha256').update(Buffer.from(u8)).digest('hex');

/* The fixture image: xorshift32 bytes with a valid U5 vector table — the
   same generator as the derivation script. */
function prngImage(len: number, seed: number): Uint8Array {
  const out = new Uint8Array(len);
  let x = seed >>> 0;
  for (let i = 0; i < len; i++) {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out[i] = x & 0xff;
  }
  out.set([0x00, 0x00, 0x12, 0x20, 0x01, 0x00, 0x01, 0x08], 0);
  return out;
}
const IMG = prngImage(100 * 1024 + 37, 0xc0ffee);

/** A special-mode frame with a full varint (the radio's MTU publish is a
 *  32-bit code; encodeSpecialMode only covers codes < 128). */
function specialMode(code: number): Uint8Array {
  const b: number[] = [];
  let x = code >>> 0;
  while (x >= 0x80) {
    b.push((x & 0x7f) | 0x80);
    x >>>= 7;
  }
  b.push(x);
  return new Uint8Array([0x12, b.length + 1, 0x18, ...b]);
}

/* ---------------- framing ---------------- */

describe('framing (js/u5-ota.js)', () => {
  it('the fixture image is the one the website saw', () => {
    expect(IMG.length).toBe(FX.imageLen);
    expect(sha(IMG)).toBe(FX.imageSha256);
  });

  it('crc32: the standard check value, the empty string, the image', () => {
    expect(crc32(Buffer.from('123456789'))).toBe(FX.crc32['123456789']);
    expect(crc32(Buffer.from('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array(0))).toBe(FX.crc32.empty);
    expect(crc32(IMG)).toBe(FX.crc32.imgCrc);
    expect(crc32(IMG, 28)).toBe(FX.crc32.imgFirst28);
  });

  it('the U5FW stream header, with and without a hash; the whole stream', () => {
    const s = buildStream(IMG, 'abc1234def');
    expect(hex(s.subarray(0, 32))).toBe(FX.header);
    expect(s.length).toBe(32 + IMG.length);
    expect(sha(s)).toBe(FX.streamSha256);
    expect(hex(buildStream(IMG, '').subarray(0, 32))).toBe(FX.headerNoHash);
    // the header's fields, by hand
    expect(Buffer.from(s.subarray(0, 4)).toString('ascii')).toBe('U5FW');
    expect(s[4]).toBe(1);
    expect(s[5]).toBe(0);
    expect(new DataView(s.buffer, s.byteOffset).getUint32(8, true)).toBe(IMG.length);
    expect(new DataView(s.buffer, s.byteOffset).getUint32(12, true)).toBe(crc32(IMG));
    expect(Buffer.from(s.subarray(16, 24)).toString('ascii')).toBe('abc1234d');
    expect(new DataView(s.buffer, s.byteOffset).getUint32(28, true)).toBe(crc32(s, 28));
  });

  it('padToBatches: header + image a whole number of batches, 0xFF fill, none when already whole', () => {
    expect(padToBatches(IMG, 96).length).toBe(FX.padded.p96);
    expect(padToBatches(IMG, 171).length).toBe(FX.padded.p171);
    expect(padToBatches(IMG, 182).length).toBe(FX.padded.p182);
    const p = padToBatches(IMG, 182);
    expect(sha(p)).toBe(FX.paddedSha256.p182);
    expect((32 + p.length) % (182 * BATCH_PKTS)).toBe(0);
    expect(p.subarray(IMG.length).every(b => b === 0xff)).toBe(true);
    const whole = new Uint8Array(96 * BATCH_PKTS * 3 - 32);
    expect(padToBatches(whole, 96)).toBe(whole);
  });

  it('a DATA frame: tag, seq LE32, len LE16, chunk, crc32 of the rest', () => {
    const chunk = new Uint8Array([1, 2, 3, 4, 5]);
    const f = buildDataFrame(0x01020304, chunk);
    expect(Array.from(f.subarray(0, 7))).toEqual([0x11, 0x04, 0x03, 0x02, 0x01, 0x05, 0x00]);
    expect(Array.from(f.subarray(7, 12))).toEqual([1, 2, 3, 4, 5]);
    const dv = new DataView(f.buffer);
    expect(dv.getUint32(12, true)).toBe(crc32(f, 12));
    expect(f.length).toBe(11 + chunk.length);
  });

  it('special-mode frames encode and decode as the website’s; a DATA frame decodes to 0', () => {
    expect(hex(encodeSpecialMode(DFU_ENTER))).toBe(FX.specialMode.enter);
    expect(hex(encodeSpecialMode(DFU_READY))).toBe(FX.specialMode.ready);
    expect(hex(encodeSpecialMode(DFU_RESTART))).toBe(FX.specialMode.restart);
    expect(decodeSpecialMode(encodeSpecialMode(1))).toBe(FX.decodeSpecialMode.enter);
    expect(hex(specialMode((MTU_PUBLISH_TAG << 16) | 185))).toBe(FX.decodeSpecialMode.mtu185);
    expect(decodeSpecialMode(specialMode((MTU_PUBLISH_TAG << 16) | 185))).toBe(FX.decodeSpecialMode.mtu185Value);
    expect(decodeSpecialMode(new Uint8Array(0))).toBe(FX.decodeSpecialMode.empty);
    expect(decodeSpecialMode(new Uint8Array([0x11, 0, 0, 0, 0, 5, 0]))).toBe(FX.decodeSpecialMode.junk);
    // the frame is exactly BlePacket{schedule_config_packet{special_mode}}
    const pkt = PB.BlePacket.decode(encodeSpecialMode(DFU_ENTER));
    expect(pkt.scheduleConfigPacket!.specialMode).toBe(DFU_ENTER);
    expect(hex(PB.BlePacket.encode(PB.BlePacket.create({ scheduleConfigPacket: { specialMode: 1 } })).finish())).toBe(
      FX.specialMode.enter,
    );
  });

  it('the MTU publish sizes the payload: MTU - 14, floored at 20, capped at 182', () => {
    expect(isMtuPublish((MTU_PUBLISH_TAG << 16) | 185)).toBe(true);
    expect(isMtuPublish(DFU_READY)).toBe(false);
    expect(payloadForMtu((MTU_PUBLISH_TAG << 16) | 185)).toBe(171);
    expect(payloadForMtu((MTU_PUBLISH_TAG << 16) | 247)).toBe(MAX_PAYLOAD_CAP);
    expect(payloadForMtu((MTU_PUBLISH_TAG << 16) | 23)).toBe(20);
    expect(MAX_PAYLOAD_CAP).toBe(182);
    expect(MAX_PAYLOAD_FALLBACK).toBe(96);
  });

  it('checkU5Image refuses a small image and a radio image, with the website’s words', () => {
    expect(() => checkU5Image(new Uint8Array(1000))).toThrow('This file is too small to be collar software.');
    const wb = new Uint8Array(200 * 1024);
    wb.set([0x00, 0x20, 0x02, 0x20, 0x01, 0x00, 0x01, 0x08], 0); // SP in the radio's 192 KB RAM
    expect(() => checkU5Image(wb)).toThrow('This file is not collar software. Check that the right file was picked.');
    const badPc = new Uint8Array(200 * 1024);
    badPc.set([0x00, 0x00, 0x12, 0x20, 0x01, 0x00, 0x01, 0x20], 0);
    expect(() => checkU5Image(badPc)).toThrow('This file is not collar software');
    expect(checkU5Image(IMG)).toEqual({ sp: 0x20120000, pc: 0x08010001 });
  });

  it('the safe-build gate is v1.14.0 = build 266; a bare hash (0) is blocked', () => {
    expect(MIN_SAFE_U5_BLE_BUILD).toBe(266);
    expect(isU5BleSafe(266)).toBe(true);
    expect(isU5BleSafe(265)).toBe(false);
    expect(isU5BleSafe(0)).toBe(false);
  });
});

/* ---------------- the fake radio ---------------- */

type FakeOpts = {
  notify: boolean;
  noResp: boolean;
  mtu: number;
  /** DFU_RESTART instead of the ack once, when this many DATA frames are in. */
  restartAt?: number;
  /** DFU_RESTART once per DFU entry, when this many DATA frames are in
   *  (so every attempt restarts and nothing is ever acknowledged). */
  restartEvery?: number;
  /** After END: 'ready' (default), 'silent', 'restart-drop', 'restart-alive'. */
  after?: 'ready' | 'silent' | 'restart-drop' | 'restart-alive';
  /** Never acknowledge a batch. */
  deaf?: boolean;
};

/** The derivation script's fake radio, on the app's OtaLink surface. */
function fakeRadio(opts: FakeOpts) {
  const writes: string[] = [];
  const log: string[] = [];
  let listener: ((b: Uint8Array) => void) | null = null;
  let dataCount = 0;
  let restartAt = opts.restartAt;
  let restartArmed = !!opts.restartEvery;
  let lastRead = specialMode(0);
  let connected = true;
  const push = (code: number) => setTimeout(() => listener?.(specialMode(code)), 1);
  const answer = (code: number) => {
    if (opts.notify) push(code);
    else lastRead = specialMode(code);
  };
  const link: OtaLink = {
    canNotify: opts.notify,
    canWriteNoResp: opts.noResp,
    write: async (u, withResponse) => {
      writes.push(hex(u));
      if (u.length === 4 && u[0] === 0x12 && u[3] === DFU_ENTER) {
        expect(withResponse).toBe(true);
        dataCount = 0;
        restartArmed = !!opts.restartEvery;
        log.push('enter');
        answer((MTU_PUBLISH_TAG << 16) | opts.mtu);
        return;
      }
      if (u[0] === 0x11) {
        expect(withResponse).toBe(!opts.noResp);
        dataCount++;
        if ((restartAt != null && dataCount === restartAt) || (restartArmed && dataCount === opts.restartEvery)) {
          restartAt = undefined;
          restartArmed = false;
          log.push('restart@' + dataCount);
          dataCount = 0;
          answer(DFU_RESTART);
          return;
        }
        if (dataCount % 10 === 0) {
          if (!opts.deaf) answer(DFU_READY);
        } else lastRead = u;
        return;
      }
      if (u.length === 1 && u[0] === 0x12) {
        expect(withResponse).toBe(true);
        log.push('end');
        const after = opts.after ?? 'ready';
        if (after === 'ready') answer(DFU_READY);
        else if (after === 'restart-drop') {
          answer(DFU_RESTART);
          setTimeout(() => {
            connected = false;
          }, 5);
        } else if (after === 'restart-alive') answer(DFU_RESTART);
        /* 'silent': nothing */
      }
    },
    read: async () => lastRead,
    subscribe: async cb => {
      listener = cb;
      return async () => {
        listener = null;
      };
    },
    isConnected: async () => connected,
  };
  return { link, writes, log };
}

function writesSha(writes: string[]): string {
  const h = crypto.createHash('sha256');
  writes.forEach(w => h.update(w + '\n'));
  return h.digest('hex');
}

const fastSleep = (ms: number) => new Promise<void>(r => setTimeout(r, Math.min(ms, 2)));
const quick = { sleep: fastSleep, timing: { endAckTimeoutMs: 200, batchAckTimeoutMs: 300, restartVerifyWatchMs: 60, mtuWaitMs: 200 } };

describe('sendU5Image against the website’s fake radio, write for write', () => {
  beforeEach(() => resetSendMemory());

  const e2e = async (name: string, opts: FakeOpts) => {
    const { link, writes, log } = fakeRadio(opts);
    const progress: [number, number][] = [];
    const res = await sendU5Image(link, IMG, 'abc1234def', { ...quick, onProgress: (s, t) => progress.push([s, t]) });
    const fx = FX.e2e[name];
    expect(res).toEqual(fx.res);
    expect(log).toEqual(fx.log);
    expect(writes.length).toBe(fx.writes);
    expect(writes.slice(0, 3)).toEqual(fx.first);
    expect(writes.slice(-2)).toEqual(fx.last);
    expect(writesSha(writes)).toBe(fx.writesSha256);
    expect(progress[progress.length - 1]).toEqual(fx.lastProgress);
    return { writes, log };
  };

  it('notifying radio, MTU 185: payload 171, one enter, 600 frames', () =>
    e2e('notify185', { notify: true, noResp: true, mtu: 185 }));
  it('notifying radio, MTU 247: payload capped at 182', () =>
    e2e('notify247', { notify: true, noResp: true, mtu: 247 }));
  it('legacy polled radio: 96 B fallback, every frame with response', () =>
    e2e('pollLegacy', { notify: false, noResp: false, mtu: 0 }));
  it('notifying radio without write-without-response: same frames, with response', () =>
    e2e('notifyWithResp', { notify: true, noResp: false, mtu: 185 }));
  it('a restart before any ack drops the payload to 96 and re-enters', () =>
    e2e('notifyRestart5', { notify: true, noResp: true, mtu: 247, restartAt: 5 }));
  it('a restart after an ack keeps the payload and rewinds to seq 0', () =>
    e2e('notifyRestart25', { notify: true, noResp: true, mtu: 247, restartAt: 25 }));
});

describe('the end of the stream', () => {
  beforeEach(() => resetSendMemory());

  it('no ack after END is delivered, unconfirmed (the collar is rebooting)', async () => {
    const { link } = fakeRadio({ notify: true, noResp: true, mtu: 185, after: 'silent' });
    expect(await sendU5Image(link, IMG, 'h', quick)).toEqual({ delivered: true, confirmed: false });
  });

  it('a restart after END with the link dropping is the reboot, not a fault', async () => {
    const { link, log } = fakeRadio({ notify: true, noResp: true, mtu: 185, after: 'restart-drop' });
    expect(await sendU5Image(link, IMG, 'h', quick)).toEqual({ delivered: true, confirmed: false });
    expect(log.filter(l => l === 'enter')).toHaveLength(1); // never rewound
  });

  it('a restart after END with the link alive rewinds (the tail never landed)', async () => {
    const { link, log } = fakeRadio({ notify: true, noResp: true, mtu: 185, after: 'restart-alive' });
    await expect(sendU5Image(link, IMG, 'h', quick)).rejects.toThrow(
      'The update kept failing (the collar asked to start over three times). Keep the phone next to the collar and try again.',
    );
    expect(log.filter(l => l === 'end')).toHaveLength(3);
  });
});

describe('failures the operator must be told apart', () => {
  beforeEach(() => resetSendMemory());

  it('a collar that never stores a batch: too old, update over USB-C', async () => {
    const { link } = fakeRadio({ notify: true, noResp: true, mtu: 185, deaf: true });
    await expect(sendU5Image(link, IMG, 'h', quick)).rejects.toThrow(
      /^The collar did not accept the update: its software is too old to update over Bluetooth\. Update it once with a USB-C cable/,
    );
  });

  it('a collar that stored a batch earlier and now stops: finishing the interrupted transfer', async () => {
    const first = fakeRadio({ notify: true, noResp: true, mtu: 185 });
    await sendU5Image(first.link, IMG, 'h', quick);
    const { link } = fakeRadio({ notify: true, noResp: true, mtu: 185, deaf: true });
    await expect(sendU5Image(link, IMG, 'h', quick)).rejects.toThrow(
      /took the update earlier but stopped answering this time/,
    );
  });

  it('three restarts and never an ack: older than Bluetooth updating', async () => {
    const { link, log } = fakeRadio({ notify: true, noResp: true, mtu: 185, restartEvery: 3 });
    await expect(sendU5Image(link, IMG, 'h', quick)).rejects.toThrow(
      /^The collar did not accept the update in three attempts: its software is too old to update over Bluetooth/,
    );
    expect(log.filter(l => l.startsWith('restart@'))).toHaveLength(3);
    expect(log.filter(l => l === 'enter')).toHaveLength(3);
  });

  it('an abort stops at the next frame with OtaAborted; nothing more is written', async () => {
    const { link, writes } = fakeRadio({ notify: true, noResp: true, mtu: 185 });
    let stop = false;
    await expect(
      sendU5Image(link, IMG, 'h', {
        ...quick,
        abortRequested: () => stop,
        onProgress: sent => {
          if (sent > 20 * 171) stop = true;
        },
      }),
    ).rejects.toBeInstanceOf(OtaAborted);
    const n = writes.length;
    expect(n).toBeGreaterThan(20);
    expect(n).toBeLessThan(40);
    expect(writes[n - 1]).not.toBe('12'); // no END
  });

  it('a refused image never touches the radio', async () => {
    const { link, writes } = fakeRadio({ notify: true, noResp: true, mtu: 185 });
    await expect(sendU5Image(link, new Uint8Array(10), 'h', quick)).rejects.toThrow('too small to be collar software');
    expect(writes).toEqual([]);
  });
});

/* ---------------- the radio probe and the policy ---------------- */

describe('radioCapsFrom / updatePolicy (the website’s probeRadio / updatePolicy)', () => {
  const props = (canNotify: boolean, canWriteNoResp = canNotify) => ({ canNotify, canWriteNoResp });

  it('no caps characteristic = the legacy radio: wired-only, never OTA; U5 still allowed', () => {
    const caps = radioCapsFrom(null, props(false));
    expect(caps.generation).toBe('legacy');
    expect(caps.otaCapable).toBe(false);
    const p = updatePolicy(caps);
    expect(p.wb.allow).toBe(false);
    expect(p.u5.allow).toBe(true);
    expect(p.headline).toBe('The collar’s Bluetooth radio software cannot be updated wirelessly');
  });

  it('fmt 1 caps: OTA unknown, U5 allowed, radio "safe to try"', () => {
    const caps = radioCapsFrom(new Uint8Array([0x43, 0x50, 1, 0x01]), props(false));
    expect(caps.generation).toBe('mesh');
    expect(caps.otaCapable).toBeNull();
    const p = updatePolicy(caps);
    expect(p.wb.allow).toBe(true);
    expect(p.wb.reason).toMatch(/^Could not confirm the Bluetooth radio’s version\. It is safe to try/);
    expect(p.u5.allow).toBe(true);
    expect(p.headline).toBe('Bluetooth radio software may be out of date');
  });

  it('fmt 2, dual-slot but not fast: update the radio first', () => {
    const p = updatePolicy(radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x03]), props(false)));
    expect(p.u5.allow).toBe(false);
    expect(p.u5.reason).toBe(
      'Update the Bluetooth radio software first (on the website’s Update Device page); this update then runs several times faster.',
    );
    expect(p.headline).toBe('Bluetooth radio software is out of date');
  });

  it('fmt 2 without the copier: radio blocked, U5 allowed', () => {
    const p = updatePolicy(radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x01]), props(false)));
    expect(p.wb.allow).toBe(false);
    expect(p.u5.allow).toBe(true);
    expect(p.headline).toBe('The collar’s Bluetooth radio software cannot be updated wirelessly yet');
  });

  it('a notifying radio is positively current whatever its caps say', () => {
    const caps = radioCapsFrom(new Uint8Array([0x43, 0x50, 1, 0x01]), props(true));
    expect(caps.fastDfu).toBe(true);
    expect(caps.otaCapable).toBe(true);
    const p = updatePolicy(caps);
    expect(p.u5.allow).toBe(true);
    expect(p.headline).toBe('Bluetooth radio software is up to date');
    const legacyButNotifies = radioCapsFrom(null, props(true));
    expect(updatePolicy(legacyButNotifies).u5.allow).toBe(true);
  });

  it('user-facing words never name the radio modules', () => {
    const all: RadioCaps[] = [
      radioCapsFrom(null, props(false)),
      radioCapsFrom(new Uint8Array([0x43, 0x50, 1, 0]), props(false)),
      radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x03]), props(false)),
      radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x01]), props(false)),
      radioCapsFrom(new Uint8Array([0x43, 0x50, 2, 0x07]), props(true)),
    ];
    for (const c of all) {
      const p = updatePolicy(c);
      expect(`${p.headline} ${p.u5.reason} ${p.wb.reason}`).not.toMatch(/WB5M|WB15/);
      // plain words for non-technical users
      expect(`${p.headline} ${p.u5.reason} ${p.wb.reason}`).not.toMatch(/firmware|module|main.processor|\bU5\b/i);
    }
    expect(U5_BLE_GATE_REASON).not.toMatch(/firmware|main.processor|\bU5\b/i);
  });
});

/* ---------------- the firmware API ---------------- */

describe('firmware images from the server (update-device.html u5bGetImage)', () => {
  const api = require('../src/utils/api');
  const Keychain = require('react-native-keychain');
  const originalFetch = (globalThis as any).fetch;
  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
  });

  it('lists GET /firmware?target=u5 and downloads GET /firmware/{id}/download as bytes, with the token', async () => {
    Keychain.__reset();
    const calls: any[] = [];
    (globalThis as any).fetch = jest.fn(async (url: string, init: any) => {
      calls.push([url, init]);
      if (url.endsWith('/auth/login')) return { ok: true, status: 200, json: async () => ({ token: 'tok', role: 'user' }) } as any;
      if (url.includes('/firmware?target=u5')) {
        return { ok: true, status: 200, json: async () => [{ id: 7, version: 'v1.21.0', target: 'u5', filename: 'v1_21_0.bin', file_size: 600000 }] } as any;
      }
      if (url.endsWith('/firmware/7/download')) {
        return { ok: true, status: 200, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer } as any;
      }
      throw new Error('unexpected ' + url);
    }) as any;
    await api.login('u', 'p');
    const list = await api.listFirmware('u5');
    expect(list[0].version).toBe('v1.21.0');
    expect(calls[1][0]).toBe('https://api.collarid.org/firmware?target=u5');
    expect(calls[1][1].headers.Authorization).toBe('Bearer tok');
    const bytes = await api.downloadFirmware(7);
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
    expect(calls[2][0]).toBe('https://api.collarid.org/firmware/7/download');
    expect(calls[2][1].headers.Authorization).toBe('Bearer tok');
    await api.logout();
  });
});
