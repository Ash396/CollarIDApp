#!/usr/bin/env node
/*
 * Derive the test fixtures that hold this app's zone (geofence) and
 * main-processor OTA code in step with the website's reference
 * implementations:
 *
 *   collaridwebsite/js/geofence-ui.js     buildFenceFragments (validation
 *                                          messages, fragment vocabulary)
 *   collaridwebsite/js/ble-cfg-tunnel.js  the tunnel's DownlinkPacket wire
 *                                          bytes, parseSlotRecord, verdictText,
 *                                          ACK_TEXT / RAIL_TEXT
 *   collaridwebsite/js/u5-ota.js          crc32, the U5FW stream header,
 *                                          padToBatches, the special-mode
 *                                          frames, and a full send() against
 *                                          a fake radio (every write hashed)
 *
 * The website's code is run as is (vm) and its outputs written to
 * __tests__/fixtures/website-geofence.json and website-u5-ota.json, which
 * __tests__/geofence.test.ts and __tests__/ota.test.ts replay against the
 * app's port. Re-run whenever either reference file changes:
 *
 *   NODE_PATH=$PWD/node_modules node scripts/derive-website-fixtures.js \
 *       [path/to/collaridwebsite]
 *
 * (NODE_PATH so protobufjs's full build resolves for the website's
 * reflection-based schema; the app itself only bundles protobufjs/minimal.)
 */
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), path = require('path');
const WEB = process.argv[2] || '/Users/chwalek/dev/collaridwebsite';
const OUT_DIR = path.join(__dirname, '..', '__tests__', 'fixtures');
const protobuf = require('protobufjs');

// ---------------- geofence-ui.js: buildFenceFragments ----------------
const gfSrc = fs.readFileSync(path.join(WEB, 'js/geofence-ui.js'), 'utf8');
const gfCtx = { window: {}, document: {}, localStorage: {}, console };
vm.createContext(gfCtx);
vm.runInContext(gfSrc + '\n;this.__gf = { buildFenceFragments, fencesFromConfig, gfParseVertsText, GF_ACTIONS };', gfCtx);
const GF = gfCtx.__gf;

const NOW = 1700000000;
const cases = {
  testOnly4: { id: 1, action: 2, zoneSlot: 0, confirm: 2, hacc: 25, start: 0, expiry: 0,
    vertsText: '44.26450, -72.57550\n44.26450, -72.57100\n44.26900, -72.57100\n44.26900, -72.57550' },
  switchSlot3: { id: 2, action: 0, zoneSlot: 3, confirm: 3, hacc: 0, start: NOW + 3600, expiry: 0,
    vertsText: ' 10.5,20.25 \n-10.123456789, 179.9999999\n 0, 0' },
  detach: { id: 4, action: 1, zoneSlot: 0, confirm: 0, hacc: 0, start: NOW, expiry: NOW + 7 * 86400,
    vertsText: '1,2\n3,4\n5,6\n7,8\n9,10\n11,12\n13,14\n15,16' },
};
const frags = {};
for (const [k, v] of Object.entries(cases)) frags[k] = GF.buildFenceFragments(v);
const errors = {};
const errCases = {
  twoCorners: { id: 1, action: 2, vertsText: '1,2\n3,4' },
  nineCorners: { id: 1, action: 2, vertsText: Array.from({ length: 9 }, (_, i) => `${i},${i}`).join('\n') },
  badLine: { id: 1, action: 2, vertsText: '1,2\n3\n5,6' },
  badLine2: { id: 1, action: 2, vertsText: '1,2\nfoo, bar\n5,6' },
  detachNoExpiry: { id: 1, action: 1, expiry: 0, vertsText: '1,2\n3,4\n5,6' },
  detachExpiryBeforeStart: { id: 1, action: 1, start: NOW + 100, expiry: NOW + 50, vertsText: '1,2\n3,4\n5,6' },
  detachExpiryTooFar: { id: 1, action: 1, start: NOW, expiry: NOW + 31 * 86400, vertsText: '1,2\n3,4\n5,6' },
};
for (const [k, v] of Object.entries(errCases)) {
  try { GF.buildFenceFragments(v); errors[k] = null; } catch (e) { errors[k] = e.message; }
}

// ---------------- ble-cfg-tunnel.js: schema, parseSlotRecord, verdictText ----------------
const btSrc = fs.readFileSync(path.join(WEB, 'js/ble-cfg-tunnel.js'), 'utf8');
const btCtx = { protobuf, console, setTimeout, Date };
vm.createContext(btCtx);
vm.runInContext(btSrc + '\n;this.__bt = BleTunnel;', btCtx);
const BT = btCtx.__bt;
const root = protobuf.parse(BT.SCHEMA, { keepCase: true }).root;
const Dl = root.lookupType('DownlinkPacket'), Ble = root.lookupType('TunnelBlePacket');
const hex = u8 => Buffer.from(u8).toString('hex');
const TXN = 12345;
function dlHex(fields) { return hex(Dl.encode(Dl.create(fields)).finish()); }
function frameHex(sched) {
  return hex(Ble.encode(Ble.create({ header: { system_uid: 0, epoch: NOW }, schedule_config_packet: sched })).finish());
}
const txnFrames = {};
for (const [k, fr] of Object.entries(frags)) {
  const out = [];
  out.push(dlHex({ epoch: NOW, command: BT.CMD.CONFIG_BEGIN, cfg_txn_id: TXN }));
  fr.forEach((f, i) => out.push(dlHex({ epoch: NOW, command: BT.CMD.NONE, cfg_txn_id: TXN,
    config: { ...f, fragment_index: i, fragment_total: fr.length } })));
  out.push(dlHex({ epoch: NOW, command: BT.CMD.CONFIG_COMMIT, cfg_txn_id: TXN }));
  txnFrames[k] = out;
}
const deleteFrag = [{ schedule_index: 0, cfg_geofence: { fence_id: 3, vertex_count: 0 } }];
txnFrames.delete3 = [
  dlHex({ epoch: NOW, command: BT.CMD.CONFIG_BEGIN, cfg_txn_id: TXN }),
  dlHex({ epoch: NOW, command: BT.CMD.NONE, cfg_txn_id: TXN, config: { ...deleteFrag[0], fragment_index: 0, fragment_total: 1 } }),
  dlHex({ epoch: NOW, command: BT.CMD.CONFIG_COMMIT, cfg_txn_id: TXN }),
];
const bleFrames = {
  beginWrapped: frameHex({ cfg_downlink: Dl.encode(Dl.create({ epoch: NOW, command: BT.CMD.CONFIG_BEGIN, cfg_txn_id: TXN })).finish() }),
  queryStatus: frameHex({ ble_query: 1 }),
  queryFence0: frameHex({ ble_query: 2 | (0 << 8) }),
  queryFence3: frameHex({ ble_query: 2 | (3 << 8) }),
};

// slot record: build from the documented layout, parse with the website's parser
function slotRecord(f) {
  const n = f.verts.length;
  const b = new Uint8Array(17 + n * 8);
  const dv = new DataView(b.buffer);
  b[0] = 1; b[1] = f.fence_id; b[2] = f.action; b[3] = f.zone_slot; b[4] = f.confirm_fixes;
  b[5] = f.min_dwell_min; b[6] = f.max_hacc_m; b[7] = n; b[8] = f.consumed ? 1 : 0;
  dv.setUint32(9, f.start_epoch, true); dv.setUint32(13, f.expiry_epoch, true);
  f.verts.forEach((v, k) => { dv.setInt32(17 + k * 8, v[0], true); dv.setInt32(21 + k * 8, v[1], true); });
  return b;
}
const rec1 = slotRecord({ fence_id: 2, action: 1, zone_slot: 0, confirm_fixes: 2, min_dwell_min: 15, max_hacc_m: 25,
  consumed: true, start_epoch: NOW, expiry_epoch: NOW + 7 * 86400, verts: [[442645000, -725755000], [442645000, -725710000], [442690000, -725710000]] });
const rec2 = slotRecord({ fence_id: 4, action: 0, zone_slot: 3, confirm_fixes: 3, min_dwell_min: 15, max_hacc_m: 0,
  consumed: false, start_epoch: 0, expiry_epoch: 0, verts: [[105000000, 202500000], [-101234568, 1799999999], [0, 0], [10000000, 20000000]] });
const slotRecords = {
  rec1: { hex: hex(rec1), parsed: BT.parseSlotRecord(rec1) },
  rec2: { hex: hex(rec2), parsed: BT.parseSlotRecord(rec2) },
  empty: { hex: '', parsed: BT.parseSlotRecord(new Uint8Array(0)) },
  short: { hex: hex(rec1.subarray(0, 16)), parsed: BT.parseSlotRecord(rec1.subarray(0, 16)) },
  badVersion: { hex: '02' + hex(rec1).slice(2), parsed: BT.parseSlotRecord(Buffer.from('02' + hex(rec1).slice(2), 'hex')) },
  // a record whose vertex count claims more than the bytes carry: parser keeps what fits
  truncatedVerts: { hex: hex(rec2.subarray(0, 17 + 2 * 8 + 4)), parsed: BT.parseSlotRecord(rec2.subarray(0, 17 + 2 * 8 + 4)) },
};
const verdicts = {};
for (const e of [null, { ack_status: 1 }, { ack_status: 2, missing_mask: 0x1a }, { ack_status: 3, missing_mask: 7 },
  { ack_status: 3, missing_mask: 10 }, { ack_status: 3, missing_mask: 99 }, { ack_status: 4 }, { ack_status: 5 }, { ack_status: 0 }, { ack_status: 9 }]) {
  verdicts[JSON.stringify(e)] = BT.verdictText(e);
}

// ---------------- u5-ota.js: framing ----------------
const otaSrc = fs.readFileSync(path.join(WEB, 'js/u5-ota.js'), 'utf8')
  .replace('return { send, crc32,', 'return { buildStream, padToBatches, encodeSpecialMode, decodeSpecialMode, send, crc32,');
const otaCtx = { console, setTimeout, clearTimeout, Date };
vm.createContext(otaCtx);
vm.runInContext(otaSrc + '\n;this.__ota = U5Ota;', otaCtx);
const OTA = otaCtx.__ota;

// deterministic pseudo image: xorshift32
function prngImage(len, seed) {
  const out = new Uint8Array(len); let x = seed >>> 0;
  for (let i = 0; i < len; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; out[i] = x & 0xff; }
  // valid U5 vector table: SP 0x20120000, PC 0x08010001
  out.set([0x00, 0x00, 0x12, 0x20, 0x01, 0x00, 0x01, 0x08], 0);
  return out;
}
const img = prngImage(100 * 1024 + 37, 0xC0FFEE);
const sha = u8 => crypto.createHash('sha256').update(Buffer.from(u8)).digest('hex');
const ota = {
  crc32: { '123456789': OTA.crc32(Buffer.from('123456789')), empty: OTA.crc32(new Uint8Array(0)), imgCrc: OTA.crc32(img),
    imgFirst28: OTA.crc32(img, 28) },
  imageLen: img.length, imageSha256: sha(img),
  header: hex(OTA.buildStream(img, 'abc1234def').subarray(0, 32)),
  headerNoHash: hex(OTA.buildStream(img, '').subarray(0, 32)),
  streamSha256: sha(OTA.buildStream(img, 'abc1234def')),
  padded: { p96: OTA.padToBatches(img, 96).length, p171: OTA.padToBatches(img, 171).length, p182: OTA.padToBatches(img, 182).length },
  paddedSha256: { p182: sha(OTA.padToBatches(img, 182)) },
  specialMode: { enter: hex(OTA.encodeSpecialMode(1)), ready: hex(OTA.encodeSpecialMode(2)), restart: hex(OTA.encodeSpecialMode(3)) },
  decodeSpecialMode: {
    enter: OTA.decodeSpecialMode(OTA.encodeSpecialMode(1)),
    // an MTU publish 0x4D54xxxx as the radio encodes it (varint special_mode)
    mtu185: hex((() => { const v = 0x4D540000 | 185; const b = []; let x = v >>> 0; while (x >= 0x80) { b.push((x & 0x7f) | 0x80); x >>>= 7; } b.push(x); return new Uint8Array([0x12, b.length + 1, 0x18, ...b]); })()),
    empty: OTA.decodeSpecialMode(new Uint8Array(0)),
    junk: OTA.decodeSpecialMode(new Uint8Array([0x11, 0, 0, 0, 0, 5, 0])),
  },
};
ota.decodeSpecialMode.mtu185Value = OTA.decodeSpecialMode(Buffer.from(ota.decodeSpecialMode.mtu185, 'hex'));

// end-to-end: drive the website's send() with a fake notify-capable radio and hash every write
async function e2e(opts) {
  const writes = []; const log = [];
  let dataCount = 0, listeners = [];
  const encSM = code => { const b = []; let x = code >>> 0; while (x >= 0x80) { b.push((x & 0x7f) | 0x80); x >>>= 7; } b.push(x); return new Uint8Array([0x12, b.length + 1, 0x18, ...b]); };
  const push = code => { const raw = encSM(code); listeners.forEach(l => l({ target: { value: { buffer: raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) } } })); };
  const ch = {
    properties: { notify: opts.notify, writeWithoutResponse: opts.noResp },
    addEventListener: (_n, l) => listeners.push(l), removeEventListener: () => {},
    startNotifications: async () => {}, stopNotifications: async () => {},
    writeValueWithResponse: async b => { await onWrite(b, true); },
    writeValueWithoutResponse: async b => { await onWrite(b, false); },
    readValue: async () => ({ buffer: lastRead.buffer }),
    service: { device: { gatt: { connected: true } } },
  };
  let lastRead = OTA.encodeSpecialMode(0);
  let restartAt = opts.restartAt;
  async function onWrite(b, withResp) {
    const u = new Uint8Array(b);
    writes.push(hex(u));
    if (u.length === 4 && u[0] === 0x12 && u[3] === 1) { // DFU_ENTER
      dataCount = 0; log.push('enter');
      if (opts.notify) setTimeout(() => push(0x4D540000 | opts.mtu), 1);
      else lastRead = encSM(0x4D540000 | opts.mtu);
      return;
    }
    if (u[0] === 0x11) {
      dataCount++;
      if (restartAt != null && dataCount === restartAt) { restartAt = null; log.push('restart@' + dataCount); dataCount = 0;
        if (opts.notify) setTimeout(() => push(3), 1); else lastRead = encSM(3); return; }
      if (dataCount % 10 === 0) { if (opts.notify) setTimeout(() => push(2), 1); else lastRead = encSM(2); }
      else lastRead = u;
      return;
    }
    if (u.length === 1 && u[0] === 0x12) { log.push('end'); if (opts.notify) setTimeout(() => { push(2); }, 1); else lastRead = encSM(2); return; }
  }
  const progress = [];
  const res = await OTA.send(ch, img, 'abc1234def', (s, t) => progress.push([s, t]), { caps: { generation: 'wb5m' } });
  const h = crypto.createHash('sha256'); writes.forEach(w => h.update(w + '\n'));
  return { res, writes: writes.length, writesSha256: h.digest('hex'), first: writes.slice(0, 3), last: writes.slice(-2), log, lastProgress: progress[progress.length - 1] };
}
(async () => {
  ota.e2e = {
    notify185: await e2e({ notify: true, noResp: true, mtu: 185 }),
    notify247: await e2e({ notify: true, noResp: true, mtu: 247 }),
    pollLegacy: await e2e({ notify: false, noResp: false, mtu: 0 }),
    notifyWithResp: await e2e({ notify: true, noResp: false, mtu: 185 }),
    notifyRestart5: await e2e({ notify: true, noResp: true, mtu: 247, restartAt: 5 }),
    notifyRestart25: await e2e({ notify: true, noResp: true, mtu: 247, restartAt: 25 }),
  };
  // ---------------- ble-cfg-tunnel.js: beacon key frames (feat/radio-keys) ----------------
  // Only when the website checkout carries them (the branch, until merged).
  if (typeof BT.beaconKeySetFields === 'function') {
    const key = Buffer.from('13fa2ccb237dd8d8b4957185cc53d4e8', 'hex');   // beacon/vectors.json frames[0].dev_key (kcv 2b1a1e)
    const fixedNow = () => NOW;
    const setF = BT.beaconKeySetFields(new Uint8Array(key), 7);
    const clrF = BT.beaconKeyClearFields();
    setF.epoch = NOW; clrF.epoch = NOW;
    const bkErrors = {};
    for (const [k, fn] of Object.entries({
      shortKey: () => BT.beaconKeySetFields(new Uint8Array(15), 1),
      gen0: () => BT.beaconKeySetFields(new Uint8Array(16), 0),
      gen256: () => BT.beaconKeySetFields(new Uint8Array(16), 256),
      genFrac: () => BT.beaconKeySetFields(new Uint8Array(16), 1.5),
      commandSlot: () => BT.beaconKeySetFields(new Uint8Array(16), 1, 1),
      clearCommandSlot: () => BT.beaconKeyClearFields(1),
    })) { try { fn(); bkErrors[k] = null; } catch (e) { bkErrors[k] = e.message; } }
    const echoOf = fields => ({ beacon_key: fields });
    const reports = {
      absent: BT.beaconKeyReport({ echo_seq: 1 }),
      empty: BT.beaconKeyReport(echoOf({})),
      keyed: BT.beaconKeyReport(echoOf({ state: 1, gen: 7, kcv: Buffer.from('2b1a1e', 'hex'), result: 1, tx_counter: 0x07000003 })),
      fallback: BT.beaconKeyReport(echoOf({ state: 2, gen: 3, kcv: Buffer.from('aabbcc', 'hex'), result: 0, tx_counter: 0x03ffffff })),
    };
    const texts = {};
    for (const r of [null, { supported: false }, ...Object.values(reports)]) {
      texts[JSON.stringify(r)] = { state: BT.beaconKeyStateText(r), result: r ? BT.beaconKeyResultText(r) : null };
    }
    for (const result of [0, 1, 2, 3, 4, 5, 9]) texts[`result:${result}`] = BT.beaconKeyResultText({ supported: true, result });
    const bk = {
      NOW, keyHex: key.toString('hex'), gen: 7,
      BEACON_KEY: BT.BEACON_KEY,
      setFields: { ...setF, beacon_key: { ...setF.beacon_key, key: key.toString('hex') } },
      clearFields: clrF,
      setHex: dlHex(setF), clearHex: dlHex(clrF),
      setFrameHex: frameHex({ cfg_downlink: Dl.encode(Dl.create(setF)).finish() }),
      errors: bkErrors, reports, texts,
      STATE_TEXT: [0, 1, 2].map(state => BT.beaconKeyStateText({ supported: true, state })),
      UNSUPPORTED_TEXT: BT.beaconKeyStateText({ supported: false }),
    };
    void fixedNow;
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'website-beacon-key.json'), JSON.stringify(bk, null, 2) + '\n');
  }

  const gfOut = { NOW, TXN, GF_ACTIONS: GF.GF_ACTIONS, frags, errors, txnFrames, bleFrames, slotRecords, verdicts,
    ACK_TEXT: BT.ACK_TEXT, RAIL_TEXT: BT.RAIL_TEXT, MAX_FRAGS_PER_TXN: BT.MAX_FRAGS_PER_TXN };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'website-geofence.json'), JSON.stringify(gfOut, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT_DIR, 'website-u5-ota.json'), JSON.stringify(ota, null, 2) + '\n');
  console.log('wrote', OUT_DIR);
})().catch(e => { console.error(e); process.exit(1); });
