/**
 * Lost-mode beacon encryption keys over the BLE tunnel (utils/beaconKey.ts,
 * ble/bleManager.ts tunnelSetBeaconKey / tunnelClearBeaconKey), held in
 * step with the website's js/ble-cfg-tunnel.js through fixtures its own
 * code produced (scripts/derive-website-fixtures.js run against the
 * feat/radio-keys checkout -> __tests__/fixtures/website-beacon-key.json):
 *  - the gate (RADIO_KEYS_MIN_FW_BUILD, the placeholder) and the wire
 *    vocabulary pinned to the regenerated protos (CommandType 19 / 22,
 *    BeaconKeySet on DownlinkPacket 11, BeaconKeyReport on CfgEchoPacket
 *    15, the enums value for value),
 *  - the SET and CLEAR DownlinkPacket bytes, byte for byte the website's
 *    for the same epoch, key and generation; the refusals word for word,
 *  - the echo's report and every text the card shows, from the fixtures,
 *  - AES-128 and the key check value against FIPS-197 and the public
 *    beacon vectors,
 *  - the provisioning flow against a fake collar and a fake server: a new
 *    key, the reissue, the server's refusals (503 / 409 / 422), a KCV that
 *    does not match the key (nothing written), REJECTED_GEN, a collar that
 *    echoes another generation, a server that will not record it; the
 *    clear flow with and without the server; the mock collar end to end.
 */
import { Buffer } from 'buffer';
import * as PB from '../src/proto/collar_pb.js';
import { RADIO_KEYS_MIN_FW_BUILD, bleFeatureGates } from '../src/utils/fw';
import { ApiError, serverStatusText } from '../src/utils/api';
import { aes128EncryptBlock, kcvHex } from '../src/utils/aes128';
import {
  BEACON_KEY,
  BEACON_KEY_CMD,
  BEACON_KEY_NO_REPORT,
  BEACON_KEY_RESULT_TEXT,
  BEACON_KEY_STATE_TEXT,
  BEACON_KEY_UNSUPPORTED_TEXT,
  beaconKeyBadge,
  beaconKeyClearFields,
  beaconKeyReport,
  beaconKeyResultText,
  beaconKeySetFields,
  beaconKeyStateText,
  beaconKeyStatusLine,
  clearBeaconKey,
  provisionBeaconKey,
  serverKeyLine,
} from '../src/utils/beaconKey';
import type { BeaconKeyApi, BeaconKeyEcho, BeaconKeyIo } from '../src/utils/beaconKey';

const FX = require('./fixtures/website-beacon-key.json');

jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const {
  MOCK_COLLAR,
  beaconKeyIo,
  encodeDownlinkPacket,
  tunnelClearBeaconKey,
  tunnelSetBeaconKey,
} = require('../src/ble/bleManager');

const hex = (u8: Uint8Array) => Buffer.from(u8).toString('hex');
const fromHex = (h: string) => new Uint8Array(Buffer.from(h, 'hex'));
const KEY = fromHex(FX.keyHex);
const GEN: number = FX.gen;
const NOW: number = FX.NOW;
const { STATE: S, RESULT: R } = BEACON_KEY;

/* ---------------- the gate and the wire vocabulary ---------------- */

describe('firmware gate', () => {
  it('is the placeholder until the firmware merge (RADIO_KEYS_MIN_FW_BUILD = 9999, as on the website)', () => {
    expect(RADIO_KEYS_MIN_FW_BUILD).toBe(9999);
    expect(bleFeatureGates(RADIO_KEYS_MIN_FW_BUILD, 0).beaconKey).toBe(true);
    expect(bleFeatureGates(RADIO_KEYS_MIN_FW_BUILD - 1, 0).beaconKey).toBe(false);
    expect(bleFeatureGates(0, 0).beaconKey).toBe(false);
  });
});

describe('regenerated protos carry the beacon key', () => {
  it('CommandType names CMD_BEACON_KEY_SET 19 and CMD_BEACON_KEY_CLEAR 22', () => {
    expect(PB.CommandType.CMD_BEACON_KEY_SET).toBe(BEACON_KEY_CMD.SET);
    expect(PB.CommandType.CMD_BEACON_KEY_CLEAR).toBe(BEACON_KEY_CMD.CLEAR);
    expect(BEACON_KEY_CMD).toEqual({ SET: 19, CLEAR: 22 });
  });

  it("the flow's tables are the protos' enums, value for value; the website's constants", () => {
    expect(PB.BeaconKeySlot).toEqual({ BEACON_KEY_SLOT_BEACON: 0, BEACON_KEY_SLOT_COMMAND: 1 });
    expect(PB.BeaconKeyState).toEqual({ BEACON_KEY_STATE_NONE: 0, BEACON_KEY_STATE_KEYED: 1, BEACON_KEY_STATE_FALLBACK: 2 });
    expect(PB.BeaconKeyResult).toEqual({
      BEACON_KEY_RESULT_NONE: 0,
      BEACON_KEY_RESULT_APPLIED: 1,
      BEACON_KEY_RESULT_CLEARED: 2,
      BEACON_KEY_RESULT_REJECTED_GEN: 3,
      BEACON_KEY_RESULT_REJECTED_ARG: 4,
      BEACON_KEY_RESULT_STORE_ERROR: 5,
    });
    expect(BEACON_KEY).toEqual(FX.BEACON_KEY);
  });

  it('BeaconKeySet rides DownlinkPacket.beacon_key (11); BeaconKeyReport rides CfgEchoPacket.beacon_key (15)', () => {
    const dl = PB.DownlinkPacket.encode(
      PB.DownlinkPacket.create({ command: 19, beaconKey: PB.BeaconKeySet.create({ slot: 0, gen: 3, key: KEY }) }),
    ).finish();
    expect(Array.from(dl)).toEqual(expect.arrayContaining([0x5a])); // field 11, wire type 2
    const back = PB.DownlinkPacket.decode(dl);
    expect(back.beaconKey!.gen).toBe(3);
    expect(hex(back.beaconKey!.key as Uint8Array)).toBe(FX.keyHex);
    const echo = PB.CfgEchoPacket.encode(
      PB.CfgEchoPacket.create({
        echoSeq: 4,
        beaconKey: PB.BeaconKeyReport.create({ state: 1, gen: 7, kcv: fromHex('2b1a1e'), result: 1, txCounter: 0x07000003 }),
      }),
    ).finish();
    expect(Array.from(echo)).toEqual(expect.arrayContaining([0x7a])); // field 15, wire type 2
    const r = PB.CfgEchoPacket.decode(echo);
    expect(PB.BeaconKeyReport.toObject(r.beaconKey!)).toMatchObject({ state: 1, gen: 7, result: 1, txCounter: 0x07000003 });
    expect(Array.from(r.beaconKey!.kcv as Uint8Array)).toEqual([0x2b, 0x1a, 0x1e]);
  });
});

/* ---------------- the frames ---------------- */

describe('the SET and CLEAR frames (js/ble-cfg-tunnel.js beaconKeySetFields / beaconKeyClearFields)', () => {
  const fields = (f: any) => ({
    epoch: NOW,
    command: f.command,
    beaconKey: PB.BeaconKeySet.create(f.beaconKey),
  });

  it('the DownlinkPacket bytes match the website’s for the same epoch, key and generation', () => {
    expect(hex(encodeDownlinkPacket(fields(beaconKeySetFields(KEY, GEN))))).toBe(FX.setHex);
    expect(hex(encodeDownlinkPacket(fields(beaconKeyClearFields())))).toBe(FX.clearHex);
    // and the plain fields, as the website builds them
    const f = beaconKeySetFields(KEY, GEN);
    expect({ command: f.command, beacon_key: { slot: f.beaconKey.slot, gen: f.beaconKey.gen, key: hex(f.beaconKey.key) } }).toEqual({
      command: FX.setFields.command,
      beacon_key: FX.setFields.beacon_key,
    });
    expect({ command: beaconKeyClearFields().command, beacon_key: beaconKeyClearFields().beaconKey }).toEqual({
      command: FX.clearFields.command,
      beacon_key: FX.clearFields.beacon_key,
    });
  });

  it.each(Object.keys(FX.errors))('refuses with the website’s words: %s', k => {
    const fn: Record<string, () => unknown> = {
      shortKey: () => beaconKeySetFields(new Uint8Array(15), 1),
      gen0: () => beaconKeySetFields(new Uint8Array(16), 0),
      gen256: () => beaconKeySetFields(new Uint8Array(16), 256),
      genFrac: () => beaconKeySetFields(new Uint8Array(16), 1.5),
      commandSlot: () => beaconKeySetFields(new Uint8Array(16), 1, 1),
      clearCommandSlot: () => beaconKeyClearFields(1),
    };
    expect(fn[k]).toThrow(FX.errors[k]);
  });

  it('tunnelSetBeaconKey writes the SET frame once, waits the long echo, and keeps nothing', async () => {
    const writes: Uint8Array[] = [];
    let seq = 1;
    let pending: PB.CfgEchoPacket | null = null;
    let current = PB.CfgEchoPacket.create({ echoSeq: seq });
    const device: any = {
      readCharacteristicForService: jest.fn(async () => {
        if (pending) {
          current = pending;
          pending = null;
        }
        const blob = PB.BlePacket.encode(
          PB.BlePacket.create({ scheduleConfigPacket: PB.ScheduleConfigPacket.create({ cfgEcho: current }) }),
        ).finish();
        return { value: Buffer.from(blob).toString('base64') };
      }),
      writeCharacteristicWithResponseForService: jest.fn(async (_s: string, _c: string, b64: string) => {
        const pkt = PB.BlePacket.decode(new Uint8Array(Buffer.from(b64, 'base64')));
        writes.push(pkt.scheduleConfigPacket!.cfgDownlink);
        const dl = PB.DownlinkPacket.decode(pkt.scheduleConfigPacket!.cfgDownlink);
        const keyed = dl.command === 19;
        pending = PB.CfgEchoPacket.create({
          echoSeq: ++seq,
          beaconKey: PB.BeaconKeyReport.create(
            keyed
              ? { state: 1, gen: dl.beaconKey!.gen, kcv: fromHex(kcvHex(dl.beaconKey!.key as Uint8Array)), result: 1 }
              : { state: 0, gen: 3, result: 2 },
          ),
        });
      }),
    };
    const key = new Uint8Array(KEY);
    const echo = await tunnelSetBeaconKey(device, key, GEN);
    expect(writes).toHaveLength(1);
    const dl = PB.DownlinkPacket.decode(writes[0]);
    expect(dl.command).toBe(19);
    expect(dl.beaconKey!.gen).toBe(GEN);
    expect(hex(dl.beaconKey!.key as Uint8Array)).toBe(FX.keyHex);
    expect(beaconKeyReport(echo)).toEqual({ supported: true, state: 1, gen: GEN, kcv: '2b1a1e', result: 1, txCounter: 0 });
    const cleared = await tunnelClearBeaconKey(device);
    expect(PB.DownlinkPacket.decode(writes[1]).command).toBe(22);
    expect(PB.DownlinkPacket.decode(writes[1]).beaconKey!.slot).toBe(0);
    expect(beaconKeyReport(cleared)).toMatchObject({ state: 0, gen: 3, kcv: '', result: 2 });
  });
});

/* ---------------- the report and the words ---------------- */

describe('the report and the words', () => {
  const camel = (r: any) => ({ supported: r.supported, state: r.state, gen: r.gen, kcv: r.kcv, result: r.result, txCounter: r.tx_counter });
  const echoOf = (f: any): BeaconKeyEcho => ({ beaconKey: f && { ...f, kcv: f.kcv ? fromHex(f.kcv) : undefined, txCounter: f.tx_counter } });

  it('beaconKeyReport: absent = unsupported; present and empty = unkeyed; keyed and fallback as the website parses them', () => {
    expect(beaconKeyReport({ beaconKey: null })).toEqual(camel(FX.reports.absent));
    expect(beaconKeyReport(null)).toEqual(camel(FX.reports.absent));
    expect(beaconKeyReport({ beaconKey: {} })).toEqual(camel(FX.reports.empty));
    expect(beaconKeyReport(echoOf({ state: 1, gen: 7, kcv: '2b1a1e', result: 1, tx_counter: 0x07000003 }))).toEqual(camel(FX.reports.keyed));
    expect(beaconKeyReport(echoOf({ state: 2, gen: 3, kcv: 'aabbcc', result: 0, tx_counter: 0x03ffffff }))).toEqual(camel(FX.reports.fallback));
  });

  // The app says these in plain words for non-technical users (no
  // generation, no KCV, no "plaintext"); the website's card (FX) keeps its
  // older wording until it is aligned. What stays pinned to the website is
  // the shape: the same states and results have words, the same report
  // picks the unsupported text, and the same results say nothing.
  // old: it('the state and result texts are the website’s, word for word', ...)
  //      expect([0, 1, 2].map(st => BEACON_KEY_STATE_TEXT[st])).toEqual(FX.STATE_TEXT);
  //      expect(BEACON_KEY_UNSUPPORTED_TEXT).toBe(FX.UNSUPPORTED_TEXT);
  //      beaconKeyResultText({ result }) === FX.texts[`result:${result}`] for 0..5, 9
  it('the state and result texts: the website’s states and results, in plain words', () => {
    expect(FX.STATE_TEXT).toHaveLength(3);
    expect([0, 1, 2].map(st => BEACON_KEY_STATE_TEXT[st])).toEqual([
      'Off: the collar sends its lost-mode beacon unencrypted, as collars always have.',
      'On: the collar’s lost-mode beacon is encrypted.',
      'Needs updating: the collar has a key it can no longer use, so its lost-mode beacon is not encrypted ' +
        'for now. Install keys again to fix this.',
    ]);
    expect(BEACON_KEY_UNSUPPORTED_TEXT).toBe('This collar’s software cannot encrypt its beacon. Update the collar first.');
    for (const result of [0, 1, 2, 3, 4, 5, 9]) {
      // '' exactly where the website says nothing
      expect(beaconKeyResultText({ result }) === '').toBe(FX.texts[`result:${result}`] === '');
    }
    expect(beaconKeyResultText({ result: 9 })).toBe('unexpected answer from the collar (9)');
    expect(BEACON_KEY_RESULT_TEXT[3]).toMatch(/rotate keys on the website, then install again/);
    for (const r of Object.values(FX.reports) as any[]) {
      const t = FX.texts[JSON.stringify(r)];
      expect(t.state === FX.UNSUPPORTED_TEXT).toBe(!r.supported);
      expect(beaconKeyStateText(camel(r))).toBe(r.supported ? BEACON_KEY_STATE_TEXT[r.state] : BEACON_KEY_UNSUPPORTED_TEXT);
      if (r.supported) expect(beaconKeyResultText(camel(r))).toBe(BEACON_KEY_RESULT_TEXT[r.result]);
    }
    expect(beaconKeyStateText(null)).toBe(BEACON_KEY_UNSUPPORTED_TEXT);
  });

  it('the badge and the status line (renderBeaconKeyCard)', () => {
    expect(beaconKeyBadge(null)).toBe('Not read yet');
    expect(beaconKeyBadge(camel(FX.reports.absent))).toBe('Not supported');
    expect(beaconKeyBadge(camel(FX.reports.empty))).toBe('Encryption: off');
    expect(beaconKeyBadge(camel(FX.reports.keyed))).toBe('Encryption: on');
    expect(beaconKeyBadge(camel(FX.reports.fallback))).toBe('Encryption: needs updating');
    expect(beaconKeyStatusLine(null)).toBe('Waiting for the collar to report its encryption status.');
    expect(beaconKeyStatusLine(camel(FX.reports.keyed))).toBe(
      `${BEACON_KEY_STATE_TEXT[1]} Beacons sent with this key: 3. Last change: key installed; used from the next beacon.`,
    );
    expect(beaconKeyStatusLine(camel(FX.reports.empty))).toBe(BEACON_KEY_STATE_TEXT[0]);
    expect(beaconKeyStatusLine(camel(FX.reports.absent))).toBe(BEACON_KEY_UNSUPPORTED_TEXT);
    // No generation, KCV or plaintext in anything the card shows.
    for (const r of Object.values(FX.reports) as any[]) {
      expect(`${beaconKeyBadge(camel(r))} ${beaconKeyStatusLine(camel(r))}`).not.toMatch(/generation|KCV|plaintext/i);
    }
  });

  it('the server line: provisioned / issued / cleared / none, stale, no key store', () => {
    const base = { uid: '0x00000001', state: 'none', keyed: false, gen: 0, kcv: null, stale: false, kek_configured: true };
    expect(serverKeyLine({ ...base })).toBe('Server record: no key issued for this collar.');
    expect(serverKeyLine({ ...base, state: 'provisioned', keyed: true, gen: 7, kcv: '2b1a1e' })).toBe(
      'Server record: key installed on this collar.',
    );
    expect(serverKeyLine({ ...base, state: 'issued', keyed: true, gen: 2, kcv: 'abcdef' })).toMatch(/issued but the collar never confirmed it/);
    expect(serverKeyLine({ ...base, state: 'cleared' })).toBe('Server record: no key (encryption off).');
    expect(serverKeyLine({ ...base, state: 'provisioned', keyed: true, gen: 1, kcv: 'abcdef', stale: true })).toMatch(
      /This collar’s key is out of date: install keys again\.$/,
    );
    expect(serverKeyLine({ ...base, kek_configured: false })).toMatch(/^The CollarID server is not set up to issue keys yet/);
    expect(serverKeyLine(null)).toBe('');
  });
});

/* ---------------- AES-128 / KCV ---------------- */

describe('AES-128 and the key check value', () => {
  it('FIPS-197 C.1', () => {
    const key = fromHex('000102030405060708090a0b0c0d0e0f');
    const pt = fromHex('00112233445566778899aabbccddeeff');
    expect(hex(aes128EncryptBlock(key, pt))).toBe('69c4e0d86a7b0430d8cdb78070b4c55a');
  });
  it('the public beacon vectors: dev_key -> kcv', () => {
    // CollarID_protobufs/beacon/vectors.json frames[0] and the fixture key
    expect(kcvHex(fromHex('13fa2ccb237dd8d8b4957185cc53d4e8'))).toBe('2b1a1e');
    expect(kcvHex(KEY)).toBe(FX.reports.keyed.kcv);
  });
  it('refuses wrong sizes', () => {
    expect(() => kcvHex(new Uint8Array(15))).toThrow('16-byte key');
    expect(() => aes128EncryptBlock(new Uint8Array(16), new Uint8Array(3))).toThrow('16-byte blocks');
  });
});

/* ---------------- the flows ---------------- */

/** A fake collar with the firmware's rules, and a log of what it was told. */
function fakeCollar(init: Partial<{ state: number; gen: number; kcv: string; supported: boolean }> = {}) {
  const k = { supported: init.supported ?? true, state: init.state ?? 0, gen: init.gen ?? 0, kcv: init.kcv ?? '', result: 0 };
  const log: string[] = [];
  const echo = (): BeaconKeyEcho =>
    k.supported ? { beaconKey: { state: k.state, gen: k.gen, kcv: k.kcv ? fromHex(k.kcv) : new Uint8Array(0), result: k.result, txCounter: (k.gen << 24) >>> 0 } } : { beaconKey: null };
  const io: BeaconKeyIo = {
    status: async () => {
      log.push('status');
      return echo();
    },
    set: async (key, gen) => {
      log.push(`set gen ${gen} kcv ${kcvHex(key)}`);
      if (gen <= k.gen) k.result = 3;
      else {
        k.state = 1;
        k.gen = gen;
        k.kcv = kcvHex(key);
        k.result = 1;
      }
      return echo();
    },
    clear: async () => {
      log.push('clear');
      k.state = 0;
      k.kcv = '';
      k.result = 2;
      return echo();
    },
  };
  return { io, log, k };
}

/** A fake server: one owner at `ownerGen`, keys derived by a toy rule. */
function fakeServer(opts: { ownerGen?: number; last?: { gen: number; kcv: string; key: string } | null; kek?: boolean; issueError?: ApiError; provisionedError?: ApiError; clearError?: ApiError } = {}) {
  const calls: any[] = [];
  let last = opts.last ?? null;
  const keyFor = (gen: number) => {
    const b = new Uint8Array(16);
    b[0] = gen;
    b[15] = 0xa5;
    return hex(b);
  };
  const status = (): any => ({
    uid: '0x0025001C', state: last ? 'issued' : 'none', keyed: !!last, gen: last?.gen ?? 0, kcv: last?.kcv ?? null,
    stale: false, kek_configured: opts.kek ?? true, generations_left: 255 - (last?.gen ?? 0),
  });
  const api: BeaconKeyApi = {
    status: async uid => {
      calls.push(['status', uid]);
      return status();
    },
    issue: async (uid, echo) => {
      calls.push(['issue', uid, echo]);
      if (opts.issueError) throw opts.issueError;
      if (last && echo.collar_gen === last.gen && echo.collar_kcv === last.kcv) {
        return { uid, gen: last.gen, kcv: last.kcv, keys: [{ slot: 'beacon', gen: last.gen, key: last.key, kcv: last.kcv }], action: 'reissue' };
      }
      const gen = Math.max(last?.gen ?? 0, echo.collar_gen, (opts.ownerGen ?? 1) - 1) + 1;
      const key = keyFor(gen);
      last = { gen, kcv: kcvHex(fromHex(key)), key };
      return { uid, gen, kcv: last.kcv, keys: [{ slot: 'beacon', gen, key, kcv: last.kcv }], action: 'new' };
    },
    provisioned: async (uid, echo) => {
      calls.push(['provisioned', uid, echo]);
      if (opts.provisionedError) throw opts.provisionedError;
      return { ...status(), state: 'provisioned' };
    },
    clear: async uid => {
      calls.push(['clear', uid]);
      if (opts.clearError) throw opts.clearError;
      last = null;
      return { ...status(), state: 'cleared' };
    },
  };
  return { api, calls, keyFor };
}

describe('provisionBeaconKey', () => {
  it('a fresh collar: echo read, key issued at generation 1, written, confirmed, recorded', async () => {
    const c = fakeCollar();
    const s = fakeServer();
    const progress: string[] = [];
    const res = await provisionBeaconKey(c.io, s.api, '0x0025001C', { onProgress: t => progress.push(t) });
    expect(s.calls[0]).toEqual(['issue', '0x0025001C', { collar_gen: 0, collar_kcv: '' }]);
    expect(c.log).toEqual(['status', `set gen 1 kcv ${kcvHex(fromHex(s.keyFor(1)))}`]);
    expect(s.calls[1]).toEqual(['provisioned', '0x0025001C', { gen: 1, kcv: kcvHex(fromHex(s.keyFor(1))) }]);
    expect(res.gen).toBe(1);
    expect(res.kcv).toBe(kcvHex(fromHex(s.keyFor(1))));
    expect(res.action).toBe('new');
    expect(res.report).toMatchObject({ state: 1, gen: 1, result: 1 });
    expect(res.server!.state).toBe('provisioned');
    expect(progress).toEqual([
      'checking the collar…',
      'asking the server for a key…',
      'installing the key on the collar…',
      'key confirmed by the collar; telling the server…',
    ]);
    // no key bytes anywhere in what the flow returned
    expect(JSON.stringify(res)).not.toMatch(new RegExp(s.keyFor(1)));
  });

  it('a keyed collar: the next generation above its own and the owner’s', async () => {
    const c = fakeCollar({ state: 1, gen: 4, kcv: 'aabbcc' });
    const s = fakeServer({ ownerGen: 9 });
    const res = await provisionBeaconKey(c.io, s.api, '0x0025001C');
    expect(s.calls[0][2]).toEqual({ collar_gen: 4, collar_kcv: 'aabbcc' });
    expect(res.gen).toBe(9);
    expect(c.k.gen).toBe(9);
  });

  it('the exact echo of the last issue gets the same key again (reissue)', async () => {
    const key = fakeServer().keyFor(5);
    const kcv = kcvHex(fromHex(key));
    const c = fakeCollar({ state: 1, gen: 5, kcv });
    const s = fakeServer({ last: { gen: 5, kcv, key } });
    // the collar refuses gen 5 (not above its own) — but a reissue writes
    // the same generation; the firmware answers REJECTED_GEN. The website
    // does the same; the flow reports it as the collar's words.
    await expect(provisionBeaconKey(c.io, s.api, '0x0025001C')).rejects.toThrow(BEACON_KEY_RESULT_TEXT[3]);
    expect(s.calls[0][2]).toEqual({ collar_gen: 5, collar_kcv: kcv });
    expect(s.calls.map(x => x[0])).toEqual(['issue']);
  });

  it('firmware without the key store: nothing asked of the server', async () => {
    const c = fakeCollar({ supported: false });
    const s = fakeServer();
    await expect(provisionBeaconKey(c.io, s.api, '0x0025001C')).rejects.toThrow(BEACON_KEY_NO_REPORT);
    expect(s.calls).toEqual([]);
    expect(c.log).toEqual(['status']);
  });

  it.each([
    [new ApiError(503, 'HTTP 503', 'RADIO_MASTER_KEK not configured on the server — beacon keys cannot be issued or rotated'), /^the CollarID server is not set up to issue keys yet\. Ask your administrator$/],
    [new ApiError(409, 'HTTP 409', 'the generations under this master are used up'), /^the server has no new key for this collar\. Ask your administrator to rotate keys \(details: the generations under this master are used up\)$/],
    [new ApiError(422, 'HTTP 422', 'collar_gen must be 0..255'), /^the server did not accept the collar’s answer \(details: collar_gen must be 0\.\.255\)$/],
    [new ApiError(403, 'HTTP 403'), /this collar is not on your CollarID account, so you cannot install its keys/],
    [new ApiError(0, 'Cannot reach server. Check your connection.'), /Cannot reach server/],
  ])('the server’s refusal, in the operator’s words: %s', async (err, words) => {
    const c = fakeCollar();
    const s = fakeServer({ issueError: err as ApiError });
    await expect(provisionBeaconKey(c.io, s.api, '0x0025001C')).rejects.toThrow(words as RegExp);
    expect(c.log).toEqual(['status']); // nothing written
  });

  it('a server KCV that does not match its key: nothing is written', async () => {
    const c = fakeCollar();
    const s = fakeServer();
    const api: BeaconKeyApi = {
      ...s.api,
      issue: async () => ({ uid: 'x', gen: 2, kcv: '000000', keys: [{ slot: 'beacon', gen: 2, key: s.keyFor(2), kcv: '000000' }], action: 'new' }),
    };
    await expect(provisionBeaconKey(c.io, api, '0x0025001C')).rejects.toThrow(
      'the key from the server failed its check; nothing was written to the collar',
    );
    expect(c.log).toEqual(['status']);
  });

  it('an unusable key set (short key, bad generation) is refused before the write', async () => {
    const c = fakeCollar();
    const s = fakeServer();
    const api: BeaconKeyApi = {
      ...s.api,
      issue: async () => ({ uid: 'x', gen: 2, kcv: '', keys: [{ slot: 'beacon', gen: 2, key: 'abcd', kcv: '' }], action: 'new' }),
    };
    await expect(provisionBeaconKey(c.io, api, '0x0025001C')).rejects.toThrow(
      'the server sent a key the app cannot use; nothing was written to the collar',
    );
    const api2: BeaconKeyApi = {
      ...s.api,
      issue: async () => ({ uid: 'x', gen: 0, kcv: '', keys: [{ slot: 'beacon', gen: 0, key: s.keyFor(1), kcv: '' }], action: 'new' }),
    };
    await expect(provisionBeaconKey(c.io, api2, '0x0025001C')).rejects.toThrow(
      'the server sent a key the app cannot use; nothing was written to the collar',
    );
    expect(c.log).toEqual(['status', 'status']);
  });

  it('the collar echoes another generation or KCV: named on both sides, not recorded', async () => {
    const c = fakeCollar();
    const s = fakeServer();
    const io: BeaconKeyIo = {
      ...c.io,
      set: async (key, gen) => ({ beaconKey: { state: 1, gen: gen + 1, kcv: fromHex(kcvHex(key)), result: 1 } }),
    };
    await expect(provisionBeaconKey(io, s.api, '0x0025001C')).rejects.toThrow(
      'the key on the collar does not match the one the server issued. Try again',
    );
    expect(s.calls.map(x => x[0])).toEqual(['issue']);
  });

  it('the collar’s store error and REJECTED_ARG are its own words', async () => {
    const c = fakeCollar();
    const s = fakeServer();
    const io: BeaconKeyIo = { ...c.io, set: async () => ({ beaconKey: { state: 0, gen: 0, result: 5 } }) };
    await expect(provisionBeaconKey(io, s.api, '0x0025001C')).rejects.toThrow(BEACON_KEY_RESULT_TEXT[5]);
    const io2: BeaconKeyIo = { ...c.io, set: async () => ({ beaconKey: { state: 0, gen: 0, result: 4 } }) };
    await expect(provisionBeaconKey(io2, fakeServer().api, '0x0025001C')).rejects.toThrow(BEACON_KEY_RESULT_TEXT[4]);
  });

  it('a server that will not record the echo (409) names both sides; the collar keeps its key', async () => {
    const c = fakeCollar();
    const s = fakeServer({ provisionedError: new ApiError(409, 'HTTP 409', 'collar echoes gen 1 kcv 111111; the server issued gen 2 kcv 222222. Issue again and re-write.') });
    await expect(provisionBeaconKey(c.io, s.api, '0x0025001C')).rejects.toThrow(
      /^the collar has the new key, but the server would not record it: collar echoes gen 1 kcv 111111; the server issued gen 2 kcv 222222/,
    );
    expect(c.k.state).toBe(1);
  });
});

describe('clearBeaconKey', () => {
  it('CLEAR, then the server is told; the report is the collar’s', async () => {
    const c = fakeCollar({ state: 1, gen: 3, kcv: 'aabbcc' });
    const s = fakeServer({ last: { gen: 3, kcv: 'aabbcc', key: '00' } });
    const progress: string[] = [];
    const res = await clearBeaconKey(c.io, s.api, '0x0025001C', { onProgress: t => progress.push(t) });
    expect(c.log).toEqual(['clear']);
    expect(s.calls).toEqual([['clear', '0x0025001C']]);
    expect(res.serverCleared).toBe(true);
    expect(res.report).toMatchObject({ state: 0, gen: 3, kcv: '', result: 2 });
    expect(progress).toEqual(['removing the key from the collar…', 'key removed ✓ telling the server…', 'key removed ✓ server record cleared ✓']);
  });

  it('signed out (no server): the collar is cleared and the words say it is no longer encrypted', async () => {
    const c = fakeCollar({ state: 1, gen: 3, kcv: 'aabbcc' });
    const progress: string[] = [];
    const res = await clearBeaconKey(c.io, null, null, { onProgress: t => progress.push(t) });
    expect(res.serverCleared).toBe(false);
    expect(progress[progress.length - 1]).toBe('key removed ✓ beacon no longer encrypted');
  });

  it('a server that still records a key is named; a 404 is fine', async () => {
    const c = fakeCollar({ state: 1, gen: 3, kcv: 'aabbcc' });
    const s = fakeServer({ clearError: new ApiError(500, serverStatusText(500)) });
    await expect(clearBeaconKey(c.io, s.api, '0x0025001C')).rejects.toThrow(
      'the collar’s beacon is no longer encrypted, but the server still lists a key for it and may raise alerts ' +
        'about unencrypted beacons. The CollarID server can’t do this right now. Try again later.',
    );
    const s2 = fakeServer({ clearError: new ApiError(404, 'HTTP 404') });
    expect((await clearBeaconKey(fakeCollar({ state: 1, gen: 1, kcv: 'aa' }).io, s2.api, '0x0025001C')).serverCleared).toBe(false);
  });

  it('firmware without the key store, or a collar that did not clear, is an error', async () => {
    await expect(clearBeaconKey(fakeCollar({ supported: false }).io, null, null)).rejects.toThrow(BEACON_KEY_NO_REPORT);
    const io: BeaconKeyIo = { ...fakeCollar().io, clear: async () => ({ beaconKey: { state: 1, gen: 2, result: 5 } }) };
    await expect(clearBeaconKey(io, null, null)).rejects.toThrow(BEACON_KEY_RESULT_TEXT[5]);
  });
});

describe('the mock collar', () => {
  it('walks the whole flow with the real KCV: provision, reissue refused by generation, clear', async () => {
    const io = beaconKeyIo(MOCK_COLLAR);
    const s = fakeServer();
    expect(beaconKeyReport(await io.status())).toMatchObject({ supported: true, state: S.NONE, gen: 0, kcv: '' });
    const res = await provisionBeaconKey(io, s.api, '0x0025001C');
    expect(res.gen).toBe(1);
    expect(beaconKeyReport(await io.status())).toMatchObject({ state: S.KEYED, gen: 1, kcv: res.kcv, result: R.APPLIED });
    const again = await provisionBeaconKey(io, fakeServer({ ownerGen: 3 }).api, '0x0025001C');
    expect(again.gen).toBe(3);
    const cleared = await clearBeaconKey(io, null, null);
    expect(cleared.report).toMatchObject({ state: S.NONE, gen: 3, kcv: '', result: R.CLEARED });
    // an all-zero key is refused by the collar's own rule
    expect(beaconKeyReport(await io.set(new Uint8Array(16), 9)).result).toBe(R.REJECTED_ARG);
  });
});
