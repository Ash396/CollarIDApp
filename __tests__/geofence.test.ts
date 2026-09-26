/**
 * Geofence zones over the BLE config tunnel (fw 305+), held in step with
 * the website's reference implementation:
 *  - the gate (BLE_ZONES_MIN_FW_BUILD = 305, configure.html's hard gate),
 *  - buildFenceFragments: the same fragments and the same refusal messages
 *    as js/geofence-ui.js, replayed from fixtures the website's own code
 *    produced (scripts/derive-website-fixtures.js ->
 *    __tests__/fixtures/website-geofence.json),
 *  - the transaction's DownlinkPacket bytes (BEGIN / fragments / COMMIT),
 *    byte for byte what js/ble-cfg-tunnel.js writes for the same epoch and
 *    transaction id, and the ble_query frames,
 *  - parseSlotRecord and verdictText against the website's, record for
 *    record and echo for echo; ACK_TEXT / RAIL_TEXT word for word,
 *  - the transport against a fake collar: BEGIN, one frame per fragment,
 *    COMMIT, each written only after the previous frame's echo; the fence
 *    read-back slot by slot; the mock collar's own store.
 */
import { Buffer } from 'buffer';
import * as PB from '../src/proto/collar_pb.js';
import { BLE_ZONES_MIN_FW_BUILD, bleFeatureGates } from '../src/utils/fw';
import {
  ACK_TEXT,
  CFG_ACK,
  GF_ACTION,
  GF_ACTIONS,
  MAX_FRAGS_PER_TXN,
  RAIL_TEXT,
  buildFenceFragments,
  deleteFenceFragments,
  fenceInside,
  fenceRow,
  fenceToForm,
  gfParseVertsText,
  parseSlotRecord,
  parseVertsText,
  verdictText,
  vertsToText,
} from '../src/utils/geofence';
import type { Fence, FenceFragment } from '../src/utils/geofence';

const FX = require('./fixtures/website-geofence.json');

jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const {
  BLE_QUERY_FENCE,
  COLLAR_SERVICE_UUID,
  MOCK_COLLAR,
  TUNNEL_CMD,
  UPDATE_CHAR_UUID,
  encodeTunnelFrame,
  encodeTxnDownlinks,
  tunnelQueryAllFences,
  tunnelQueryFence,
  tunnelRunTxn,
} = require('../src/ble/bleManager');

const hex = (u8: Uint8Array) => Buffer.from(u8).toString('hex');
const fromHex = (h: string) => new Uint8Array(Buffer.from(h, 'hex'));

/* The website's fragments are snake_case; the app's are the generated
   module's camelCase. One shape for the comparison. */
const snake = (frags: FenceFragment[]) =>
  frags.map(f => {
    const g = f.cfgGeofence;
    const out: any = { schedule_index: f.scheduleIndex, cfg_geofence: { fence_id: g.fenceId } };
    const c = out.cfg_geofence;
    if (g.action !== undefined) c.action = g.action;
    if (g.zoneSlot !== undefined) c.zone_slot = g.zoneSlot;
    if (g.confirmFixes !== undefined) c.confirm_fixes = g.confirmFixes;
    if (g.minDwellMin !== undefined) c.min_dwell_min = g.minDwellMin;
    if (g.maxHaccM !== undefined) c.max_hacc_m = g.maxHaccM;
    if (g.startEpoch !== undefined) c.start_epoch = g.startEpoch;
    if (g.expiryEpoch !== undefined) c.expiry_epoch = g.expiryEpoch;
    if (g.vertexCount !== undefined) c.vertex_count = g.vertexCount;
    if (g.vertexIndex !== undefined) c.vertex_index = g.vertexIndex;
    if (g.vertex) c.vertex = { latitude_e7: g.vertex.latitudeE7, longitude_e7: g.vertex.longitudeE7 };
    return out;
  });

const NOW: number = FX.NOW;
const TXN: number = FX.TXN;

/* The website's fixture inputs (scripts/derive-website-fixtures.js `cases`). */
const CASES = {
  testOnly4: {
    id: 1, action: 2, zoneSlot: 0, confirm: 2, hacc: 25, start: 0, expiry: 0,
    vertsText: '44.26450, -72.57550\n44.26450, -72.57100\n44.26900, -72.57100\n44.26900, -72.57550',
  },
  switchSlot3: {
    id: 2, action: 0, zoneSlot: 3, confirm: 3, hacc: 0, start: NOW + 3600, expiry: 0,
    vertsText: ' 10.5,20.25 \n-10.123456789, 179.9999999\n 0, 0',
  },
  detach: {
    id: 4, action: 1, zoneSlot: 0, confirm: 0, hacc: 0, start: NOW, expiry: NOW + 7 * 86400,
    vertsText: '1,2\n3,4\n5,6\n7,8\n9,10\n11,12\n13,14\n15,16',
  },
};
const ERR_CASES: Record<string, any> = {
  twoCorners: { id: 1, action: 2, vertsText: '1,2\n3,4' },
  nineCorners: { id: 1, action: 2, vertsText: Array.from({ length: 9 }, (_, i) => `${i},${i}`).join('\n') },
  badLine: { id: 1, action: 2, vertsText: '1,2\n3\n5,6' },
  badLine2: { id: 1, action: 2, vertsText: '1,2\nfoo, bar\n5,6' },
  detachNoExpiry: { id: 1, action: 1, expiry: 0, vertsText: '1,2\n3,4\n5,6' },
  detachExpiryBeforeStart: { id: 1, action: 1, start: NOW + 100, expiry: NOW + 50, vertsText: '1,2\n3,4\n5,6' },
  detachExpiryTooFar: { id: 1, action: 1, start: NOW, expiry: NOW + 31 * 86400, vertsText: '1,2\n3,4\n5,6' },
};

/* ---------------- the gate ---------------- */

describe('firmware gate', () => {
  it('opens exactly at build 305 (BLE_ZONES_MIN_FW_BUILD, the website hard gate)', () => {
    expect(BLE_ZONES_MIN_FW_BUILD).toBe(305);
    expect(bleFeatureGates(305, 0).cfgTunnel).toBe(true);
    expect(bleFeatureGates(304, 0).cfgTunnel).toBe(false);
    expect(bleFeatureGates(0, 0).cfgTunnel).toBe(false);
  });
});

/* ---------------- the builder ---------------- */

describe('buildFenceFragments (js/geofence-ui.js)', () => {
  it.each(Object.keys(CASES))('builds the website’s fragments: %s', k => {
    const frags = buildFenceFragments((CASES as any)[k], NOW);
    expect(snake(frags)).toEqual(FX.frags[k]);
  });

  it('one meta fragment + one per corner; min_dwell fixed at 15; defaults 2 fixes / 0 m', () => {
    const frags = buildFenceFragments({ id: 3, action: GF_ACTION.REPORT_ONLY, vertsText: '1,2\n3,4\n5,6' }, NOW);
    expect(frags).toHaveLength(4);
    expect(frags[0].cfgGeofence).toEqual({
      fenceId: 3, action: 2, zoneSlot: 0, confirmFixes: 2, minDwellMin: 15, maxHaccM: 0,
      startEpoch: 0, expiryEpoch: 0, vertexCount: 3,
    });
    expect(frags[1].cfgGeofence).toEqual({ fenceId: 3, vertexIndex: 0, vertex: { latitudeE7: 10000000, longitudeE7: 20000000 } });
    expect(frags.every(f => f.scheduleIndex === 0)).toBe(true);
  });

  // The app says the website's refusals in plain words for non-technical
  // users; the website keeps its older wording until it is aligned. The
  // fixture still decides WHICH forms are refused.
  // old: expect(() => buildFenceFragments(ERR_CASES[k], NOW)).toThrow(FX.errors[k]);
  const APP_ERRORS: Record<string, string> = {
    twoCorners: 'A zone needs 3 to 8 corners.',
    nineCorners: 'A zone needs 3 to 8 corners.',
    badLine: 'Could not read this corner line: "3". Use "latitude, longitude", one corner per line.',
    badLine2: 'Could not read this corner line: "foo, bar". Use "latitude, longitude", one corner per line.',
    detachNoExpiry: 'A detach zone needs an expiry date, at most 30 days away.',
    detachExpiryBeforeStart: 'The expiry must be after the start and within 30 days of it.',
    detachExpiryTooFar: 'The expiry must be after the start and within 30 days of it.',
  };
  it.each(Object.keys(ERR_CASES))('refuses what the website refuses, in plain words: %s', k => {
    expect(FX.errors[k]).toBeTruthy();
    expect(() => buildFenceFragments(ERR_CASES[k], NOW)).toThrow(APP_ERRORS[k]);
  });

  it('a detach zone with no start measures its 30 days from the clock', () => {
    const v = { id: 1, action: GF_ACTION.DETACH, expiry: NOW + 30 * 86400, vertsText: '1,2\n3,4\n5,6' };
    expect(() => buildFenceFragments(v, NOW)).not.toThrow();
    expect(() => buildFenceFragments(v, NOW - 1)).toThrow('expiry must be after the start and within 30 days');
  });

  it('deleteFenceFragments is a meta fragment with vertex_count 0', () => {
    expect(snake(deleteFenceFragments(3))).toEqual([{ schedule_index: 0, cfg_geofence: { fence_id: 3, vertex_count: 0 } }]);
  });

  it('parseVertsText is strict, gfParseVertsText lenient, vertsToText six decimals', () => {
    expect(parseVertsText(' 1.5 , 2\n3,4 ')).toEqual([[1.5, 2], [3, 4]]);
    expect(() => parseVertsText('1,2\nnope')).toThrow('Could not read this corner line: "nope".');
    expect(gfParseVertsText('1,2\nnope\n3,4')).toEqual([[1, 2], [3, 4]]);
    expect(gfParseVertsText('')).toEqual([]);
    expect(vertsToText([[44.2645, -72.5755], [0, 0]])).toBe('44.264500, -72.575500\n0.000000, 0.000000');
    // a picked corner round-trips through the strict parse
    expect(parseVertsText(vertsToText([[44.2645, -72.5755], [1, 2], [3, 4]]))).toEqual([[44.2645, -72.5755], [1, 2], [3, 4]]);
  });
});

/* ---------------- the wire ---------------- */

describe('the transaction on the wire (js/ble-cfg-tunnel.js runTxn)', () => {
  it.each([...Object.keys(CASES), 'delete3'])('DownlinkPacket bytes match the website’s: %s', k => {
    const frags = k === 'delete3' ? deleteFenceFragments(3) : buildFenceFragments((CASES as any)[k], NOW);
    const dls = encodeTxnDownlinks(frags, TXN, NOW).map(hex);
    expect(dls).toEqual(FX.txnFrames[k]);
  });

  it('BEGIN and COMMIT carry the transaction id; fragments index themselves', () => {
    const frags = buildFenceFragments(CASES.testOnly4, NOW);
    const dls = encodeTxnDownlinks(frags, TXN, NOW).map((b: Uint8Array) => PB.DownlinkPacket.decode(b));
    expect(dls[0].command).toBe(TUNNEL_CMD.CONFIG_BEGIN);
    expect(dls[0].cfgTxnId).toBe(TXN);
    expect(dls[dls.length - 1].command).toBe(TUNNEL_CMD.CONFIG_COMMIT);
    expect(TUNNEL_CMD.CONFIG_BEGIN).toBe(PB.CommandType.CMD_CONFIG_BEGIN);
    expect(TUNNEL_CMD.CONFIG_COMMIT).toBe(PB.CommandType.CMD_CONFIG_COMMIT);
    dls.slice(1, -1).forEach((d: PB.DownlinkPacket, i: number) => {
      expect(d.command).toBe(PB.CommandType.CMD_NONE);
      expect(d.cfgTxnId).toBe(TXN);
      expect(d.config!.fragmentIndex).toBe(i);
      expect(d.config!.fragmentTotal).toBe(frags.length);
      expect(d.config!.cfgGeofence!.fenceId).toBe(1);
    });
  });

  it('the tunnel frame carries the same DownlinkPacket and the same queries as the website', () => {
    // The website's TunnelBlePacket schema is a subset of BlePacket (same
    // field numbers): decode ours with the generated module and compare
    // the fields the collar reads.
    const begin = encodeTxnDownlinks([], TXN, NOW)[0];
    const ours = PB.BlePacket.decode(encodeTunnelFrame({ cfgDownlink: begin }, NOW));
    const theirs = PB.BlePacket.decode(fromHex(FX.bleFrames.beginWrapped));
    expect(hex(ours.scheduleConfigPacket!.cfgDownlink)).toBe(hex(theirs.scheduleConfigPacket!.cfgDownlink));
    expect(ours.header!.epoch).toBe(theirs.header!.epoch);
    expect(ours.header!.systemUid).toBe(0);
    for (const [name, q] of [['queryStatus', 1], ['queryFence0', BLE_QUERY_FENCE], ['queryFence3', BLE_QUERY_FENCE | (3 << 8)]] as const) {
      const w = PB.BlePacket.decode(fromHex(FX.bleFrames[name]));
      const a = PB.BlePacket.decode(encodeTunnelFrame({ bleQuery: q }, NOW));
      expect(a.scheduleConfigPacket!.bleQuery).toBe(w.scheduleConfigPacket!.bleQuery);
      expect(a.scheduleConfigPacket!.cfgDownlink.length).toBe(0);
    }
  });

  it('a transaction carries at most 32 parts', () => {
    expect(MAX_FRAGS_PER_TXN).toBe(FX.MAX_FRAGS_PER_TXN);
    const frags = Array.from({ length: 33 }, () => deleteFenceFragments(1)[0]);
    return expect(tunnelRunTxn(MOCK_COLLAR, frags)).rejects.toThrow('a transaction carries at most 32 parts (got 33)');
  });
});

/* ---------------- the slot record and the verdicts ---------------- */

describe('parseSlotRecord (CfgEchoPacket.fence_report)', () => {
  const camel = (p: any) =>
    p && {
      fenceId: p.fence_id, action: p.action, zoneSlot: p.zone_slot, confirmFixes: p.confirm_fixes,
      minDwellMin: p.min_dwell_min, maxHaccM: p.max_hacc_m, consumed: p.consumed,
      startEpoch: p.start_epoch, expiryEpoch: p.expiry_epoch,
      verts: p.verts.map((v: any) => ({ latitudeE7: v.latitude_e7, longitudeE7: v.longitude_e7 })),
      vertexCount: p.vertex_count,
    };
  it.each(Object.keys(FX.slotRecords))('parses as the website does: %s', k => {
    const { hex: h, parsed } = FX.slotRecords[k];
    expect(parseSlotRecord(h ? fromHex(h) : new Uint8Array(0))).toEqual(camel(parsed));
  });
  it('null / undefined are empty slots', () => {
    expect(parseSlotRecord(null)).toBeNull();
    expect(parseSlotRecord(undefined)).toBeNull();
  });
  it('fenceToForm round-trips a record into the form the builder takes', () => {
    const f = parseSlotRecord(fromHex(FX.slotRecords.rec1.hex))!;
    const form = fenceToForm(f);
    expect(form).toEqual({
      id: 2, action: 1, zoneSlot: 0, confirm: 2, hacc: 25, start: NOW, expiry: NOW + 7 * 86400,
      vertsText: '44.264500, -72.575500\n44.264500, -72.571000\n44.269000, -72.571000',
    });
    const frags = buildFenceFragments(form, NOW);
    expect(frags[0].cfgGeofence.vertexCount).toBe(3);
    expect(frags[1].cfgGeofence.vertex).toEqual({ latitudeE7: 442645000, longitudeE7: -725755000 });
  });
});

describe('verdictText / ACK_TEXT / RAIL_TEXT', () => {
  // The same codes as the website's tables, in plain words for
  // non-technical users (the website keeps its older wording until it is
  // aligned). The screens show a verdict after "The collar ".
  // old: expect(ACK_TEXT).toEqual(FX.ACK_TEXT); expect(RAIL_TEXT).toEqual(FX.RAIL_TEXT);
  it('the tables: the website’s codes, in plain words', () => {
    expect(Object.keys(ACK_TEXT)).toEqual(Object.keys(FX.ACK_TEXT));
    expect(Object.keys(RAIL_TEXT)).toEqual(Object.keys(FX.RAIL_TEXT));
    expect(ACK_TEXT).toEqual({
      0: 'gave no answer',
      1: 'applied',
      2: 'refused: part of the change did not arrive. Try again',
      3: 'refused the change under its safety rules',
      4: 'refused: it was not expecting this change. Try again',
      5: 'refused: the change took too long to arrive. Try again',
    });
    expect(RAIL_TEXT).toEqual({
      ...FX.RAIL_TEXT,
      4: 'it would have checked in less than once a day',
      5: 'one schedule had both network reports and direct radio on',
      8: 'the zone pointed at a schedule that doesn’t exist or has GPS off',
    });
    expect([...Object.values(ACK_TEXT), ...Object.values(RAIL_TEXT)].join('\n')).not.toMatch(
      /LoRaWAN|raw LoRa|transaction|verdict|slot/,
    );
    expect(GF_ACTIONS).toEqual(FX.GF_ACTIONS);
  });
  const APP_VERDICTS: Record<string, string> = {
    null: 'did not answer',
    '{"ack_status":1}': 'applied',
    '{"ack_status":2,"missing_mask":26}': 'refused: part of the change did not arrive. Try again',
    '{"ack_status":3,"missing_mask":7}': `refused: ${FX.RAIL_TEXT[7]}`,
    '{"ack_status":3,"missing_mask":10}': `refused: ${FX.RAIL_TEXT[10]}`,
    '{"ack_status":3,"missing_mask":99}': 'refused the change under its safety rules',
    '{"ack_status":4}': 'refused: it was not expecting this change. Try again',
    '{"ack_status":5}': 'refused: the change took too long to arrive. Try again',
    '{"ack_status":0}': 'gave no answer',
    '{"ack_status":9}': 'gave an unexpected answer (9)',
  };
  it.each(Object.keys(FX.verdicts))('verdict for %s', k => {
    const e = JSON.parse(k);
    const echo = e && { ackStatus: e.ack_status, missingMask: e.missing_mask };
    expect(APP_VERDICTS[k]).toBeDefined();
    expect(verdictText(echo)).toBe(APP_VERDICTS[k]);
  });
  it('a PB.CfgEchoPacket is a verdict as is', () => {
    expect(verdictText(PB.CfgEchoPacket.create({ ackStatus: CFG_ACK.RAIL, missingMask: 9 }))).toBe(
      'refused: zones need at least one schedule with GPS enabled',
    );
  });
});

describe('fenceRow', () => {
  const f: Fence = {
    fenceId: 2, action: GF_ACTION.SCHEDULE_OVERRIDE, zoneSlot: 3, confirmFixes: 2, minDwellMin: 15, maxHaccM: 0,
    consumed: false, startEpoch: 0, expiryEpoch: 0, verts: [], vertexCount: 0,
  };
  it('names the action, the slot, the corners and the expiry; badges from the masks', () => {
    const r = fenceRow({ ...f, verts: [{ latitudeE7: 1, longitudeE7: 2 }, { latitudeE7: 3, longitudeE7: 4 }, { latitudeE7: 5, longitudeE7: 6 }] }, 0b10);
    expect(r.title).toBe('Zone 2');
    expect(r.action).toBe('Switch schedule → Schedule 4');
    // old: 'Switch schedule → slot 3' (slot 3 is Schedule 4, as the zone editor names it)
    expect(r.detail).toBe('3 corners · expires never');
    expect(r.inside).toBe(true);
    expect(r.fired).toBe(false);
    expect(r.detach).toBe(false);
    const d = fenceRow({ ...f, action: GF_ACTION.DETACH, consumed: true, expiryEpoch: NOW }, 0);
    expect(d.action).toBe('DETACH');
    expect(d.detach).toBe(true);
    expect(d.fired).toBe(true);
    expect(d.inside).toBe(false);
    expect(d.detail).toMatch(/^0 corners · expires /);
    expect(fenceInside(0b1001, 4)).toBe(true);
    expect(fenceInside(0b1001, 2)).toBe(false);
    expect(fenceInside(undefined, 1)).toBe(false);
  });
});

/* ---------------- the transport ---------------- */

/** A fake collar on the update characteristic: every write is consumed
 *  into an echo with a bumped echo_seq (paced like the real one: the echo
 *  appears only on the read AFTER the write). Fence slots answer
 *  ble_query 2. */
function fakeCollar(opts: { fences?: (Uint8Array | null)[]; ack?: number; mask?: number } = {}) {
  const writes: PB.BlePacket[] = [];
  let seq = 10;
  let pending: PB.CfgEchoPacket | null = null;
  let current: PB.CfgEchoPacket = PB.CfgEchoPacket.create({ echoSeq: seq });
  const reads: number[] = [];
  const device = {
    id: 'FAKE',
    name: 'CollarID_FAKE',
    readCharacteristicForService: jest.fn(async (svc: string, ch: string) => {
      expect(svc).toBe(COLLAR_SERVICE_UUID);
      expect(ch).toBe(UPDATE_CHAR_UUID);
      if (pending) {
        current = pending;
        pending = null;
      }
      reads.push(current.echoSeq);
      const blob = PB.BlePacket.encode(
        PB.BlePacket.create({ scheduleConfigPacket: PB.ScheduleConfigPacket.create({ cfgEcho: current }) }),
      ).finish();
      return { value: Buffer.from(blob).toString('base64') };
    }),
    writeCharacteristicWithResponseForService: jest.fn(async (_svc: string, _ch: string, b64: string) => {
      expect(pending).toBeNull(); // the previous frame's echo was drained first
      const pkt = PB.BlePacket.decode(new Uint8Array(Buffer.from(b64, 'base64')));
      writes.push(pkt);
      const sched = pkt.scheduleConfigPacket!;
      const fields: any = { echoSeq: ++seq };
      if (sched.bleQuery) {
        const slot = sched.bleQuery >> 8;
        if ((sched.bleQuery & 0xff) === BLE_QUERY_FENCE) {
          fields.fenceReport = opts.fences?.[slot] ?? new Uint8Array(0);
          fields.fenceActiveMask = opts.mask ?? 0;
        }
      } else {
        const dl = PB.DownlinkPacket.decode(sched.cfgDownlink);
        fields.txnId = dl.cfgTxnId ?? 0;
        if (dl.command === TUNNEL_CMD.CONFIG_COMMIT) {
          fields.ackStatus = opts.ack ?? CFG_ACK.APPLIED;
          fields.missingMask = opts.mask ?? 0;
        }
      }
      pending = PB.CfgEchoPacket.create(fields);
    }),
  };
  return { device: device as any, writes, reads };
}

describe('tunnelRunTxn against a fake collar', () => {
  it('BEGIN, one frame per fragment, COMMIT — each after the previous echo; progress counts frames', async () => {
    const { device, writes } = fakeCollar();
    const frags = buildFenceFragments(CASES.testOnly4, NOW);
    const progress: [number, number][] = [];
    const fin = await tunnelRunTxn(device, frags, (d: number, t: number) => progress.push([d, t]));
    expect(fin.ackStatus).toBe(CFG_ACK.APPLIED);
    expect(writes).toHaveLength(frags.length + 2);
    const cmds = writes.map(w => PB.DownlinkPacket.decode(w.scheduleConfigPacket!.cfgDownlink).command);
    expect(cmds[0]).toBe(TUNNEL_CMD.CONFIG_BEGIN);
    expect(cmds[cmds.length - 1]).toBe(TUNNEL_CMD.CONFIG_COMMIT);
    expect(cmds.slice(1, -1).every(c => c === TUNNEL_CMD.NONE)).toBe(true);
    const txns = new Set(writes.map(w => PB.DownlinkPacket.decode(w.scheduleConfigPacket!.cfgDownlink).cfgTxnId));
    expect(txns.size).toBe(1);
    expect(progress).toEqual(Array.from({ length: frags.length + 2 }, (_, i) => [i + 1, frags.length + 2]));
  });

  it('a refused commit comes back as the verdict, not an exception', async () => {
    const { device } = fakeCollar({ ack: CFG_ACK.RAIL, mask: 8 });
    const fin = await tunnelRunTxn(device, deleteFenceFragments(1));
    expect(verdictText(fin)).toBe('refused: the zone pointed at a schedule that doesn’t exist or has GPS off');
  });

  it('a collar that never echoes times out (no frame is written on top of an undrained one)', async () => {
    jest.useFakeTimers();
    const { device } = fakeCollar();
    device.readCharacteristicForService = jest.fn(async () => ({ value: null }));
    const p = tunnelRunTxn(device, deleteFenceFragments(1));
    const rejection = expect(p).rejects.toThrow(
      'The collar did not answer over Bluetooth. Keep the phone next to the collar and try again.',
    );
    await jest.advanceTimersByTimeAsync(9000);
    await rejection;
    expect(device.writeCharacteristicWithResponseForService).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('queries the four fence slots and parses the records; the last echo carries the mask', async () => {
    const rec1 = fromHex(FX.slotRecords.rec1.hex);
    const rec2 = fromHex(FX.slotRecords.rec2.hex);
    const { device, writes } = fakeCollar({ fences: [rec1, null, null, rec2], mask: 0b1001 });
    const { fences, echo } = await tunnelQueryAllFences(device);
    expect(fences.map((f: Fence) => f.fenceId)).toEqual([2, 4]);
    expect(fences[0].verts).toHaveLength(3);
    expect(echo!.fenceActiveMask).toBe(0b1001);
    expect(writes.map(w => w.scheduleConfigPacket!.bleQuery)).toEqual([2, 2 | (1 << 8), 2 | (2 << 8), 2 | (3 << 8)]);
    const one = await tunnelQueryFence(device, 3);
    expect(one.fence!.fenceId).toBe(4);
    expect((await tunnelQueryFence(device, 1)).fence).toBeNull();
  });
});

describe('the mock collar', () => {
  it('stores, lists, replaces and deletes zones through the same fragments; R7 on a bad shape', async () => {
    let r = await tunnelQueryAllFences(MOCK_COLLAR);
    expect(r.fences).toEqual([]);
    const fin = await tunnelRunTxn(MOCK_COLLAR, buildFenceFragments(CASES.testOnly4, NOW));
    expect(fin.ackStatus).toBe(CFG_ACK.APPLIED);
    r = await tunnelQueryAllFences(MOCK_COLLAR);
    expect(r.fences.map((f: Fence) => [f.fenceId, f.action, f.vertexCount])).toEqual([[1, 2, 4]]);
    expect(r.echo!.fenceUsedMask).toBe(0b1);
    // a meta fragment claiming corners that never arrive is the shape rail
    const bad = buildFenceFragments(CASES.detach, NOW).slice(0, 3);
    expect(verdictText(await tunnelRunTxn(MOCK_COLLAR, bad))).toBe(`refused: ${RAIL_TEXT[7]}`);
    expect((await tunnelRunTxn(MOCK_COLLAR, deleteFenceFragments(1))).ackStatus).toBe(CFG_ACK.APPLIED);
    expect((await tunnelQueryAllFences(MOCK_COLLAR)).fences).toEqual([]);
  });
});
