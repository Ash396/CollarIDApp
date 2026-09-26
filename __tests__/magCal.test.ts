/**
 * Magnetometer calibration over the BLE config tunnel (fw 398+):
 *  - the gate (MAG_CAL_MIN_FW_BUILD) and the wire vocabulary pinned to the
 *    regenerated protos (CommandType 20/21, CfgEchoPacket.mag_cal, the
 *    MagCal* enums value for value),
 *  - the tunnel frames (a command frame, a status query) and the echo parse,
 *  - the transport against a fake characteristic: baseline, write, wait for
 *    the consumption echo, one operation at a time,
 *  - the flow against a fake collar (the website's test/run.mjs cases):
 *    start / progress / done, an older run ignored, abort, unsupported
 *    firmware, a run already going is followed, the backstop,
 *  - the words for every outcome.
 */
import { Buffer } from 'buffer';
import * as PB from '../src/proto/collar_pb.js';
import { MAG_CAL_MIN_FW_BUILD, bleFeatureGates } from '../src/utils/fw';
import {
  MAG_CAL,
  MAG_CAL_STALLED_MSG,
  MAG_CAL_UNSUPPORTED_MSG,
  MAG_CMD,
  magCalEnded,
  magCalInForce,
  magCalLastLine,
  magCalOutcome,
  runMagCal,
} from '../src/utils/magCal';
import type { MagCalEcho, MagCalReport } from '../src/utils/magCal';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const {
  BLE_QUERY_STATUS,
  COLLAR_SERVICE_UUID,
  UPDATE_CHAR_UUID,
  MOCK_COLLAR,
  encodeDownlinkCommand,
  encodeTunnelFrame,
  magCalIo,
  parseCfgEcho,
  tunnelQueryStatus,
  tunnelSendCommand,
} = require('../src/ble/bleManager');

const { STATE: S, VERDICT: V, REASON: R } = MAG_CAL;

/* ---------------- the gate and the wire vocabulary ---------------- */

describe('firmware gate', () => {
  it('opens exactly at build 398 (MAG_CAL_MIN_FW_BUILD, as on the website)', () => {
    expect(MAG_CAL_MIN_FW_BUILD).toBe(398);
    expect(bleFeatureGates(398, 0).magCal).toBe(true);
    expect(bleFeatureGates(397, 0).magCal).toBe(false);
    expect(bleFeatureGates(0, 0).magCal).toBe(false);
  });
});

describe('regenerated protos carry the calibration', () => {
  it('CommandType names CMD_MAG_CALIBRATE 20 and CMD_MAG_CALIBRATE_ABORT 21 (19 is the beacon key set)', () => {
    expect(PB.CommandType.CMD_MAG_CALIBRATE).toBe(MAG_CMD.CALIBRATE);
    expect(PB.CommandType.CMD_MAG_CALIBRATE_ABORT).toBe(MAG_CMD.ABORT);
    expect(MAG_CMD).toEqual({ CALIBRATE: 20, ABORT: 21 });
    // old (before the radio-keys protos): expect(Object.values(PB.CommandType)).not.toContain(19);
    expect(PB.CommandType.CMD_BEACON_KEY_SET).toBe(19);
    expect(PB.CommandType.CMD_BEACON_KEY_CLEAR).toBe(22);
  });

  it("the flow's tables are ble.proto's MagCal* enums, value for value", () => {
    const prefixed = (t: Record<string, number>, p: string) =>
      Object.fromEntries(Object.entries(t).map(([k, v]) => [p + k, v]));
    expect(PB.MagCalState).toEqual(prefixed(S, 'MAG_CAL_STATE_'));
    expect(PB.MagCalVerdict).toEqual(prefixed(V, 'MAG_CAL_VERDICT_'));
    expect(PB.MagCalReason).toEqual(prefixed(R, 'MAG_CAL_REASON_'));
  });

  it('CfgEchoPacket.mag_cal (16) round-trips every field', () => {
    const echo = PB.CfgEchoPacket.create({
      echoSeq: 7,
      magCal: PB.MagCalReport.create({
        state: S.DONE,
        run: 3,
        progressPct: 100,
        sectorsHit: 26,
        verdict: V.FAIR,
        reason: R.RESIDUAL_HIGH,
        fieldUtX10: 505,
        residualPermille: 61,
      }),
    });
    const back = PB.CfgEchoPacket.decode(PB.CfgEchoPacket.encode(echo).finish());
    expect(back.echoSeq).toBe(7);
    expect(PB.MagCalReport.toObject(back.magCal!)).toEqual({
      state: S.DONE,
      run: 3,
      progressPct: 100,
      sectorsHit: 26,
      verdict: V.FAIR,
      reason: R.RESIDUAL_HIGH,
      fieldUtX10: 505,
      residualPermille: 61,
    });
    // field 16 on the wire (tag = 16 << 3 | 2 = 0x82 0x01)
    const bytes = PB.CfgEchoPacket.encode(echo).finish();
    expect(Array.from(bytes)).toEqual(expect.arrayContaining([0x82, 0x01]));
  });
});

/* ---------------- the frames and the echo parse ---------------- */

describe('tunnel frames', () => {
  it('a command frame is a BlePacket carrying one DownlinkPacket in cfg_downlink', () => {
    const frame = encodeTunnelFrame({ cfgDownlink: encodeDownlinkCommand(MAG_CMD.CALIBRATE) });
    const pkt = PB.BlePacket.decode(frame);
    const sched = pkt.scheduleConfigPacket!;
    expect(sched.cfgDownlink.length).toBeGreaterThan(0);
    expect(sched.bleQuery).toBe(0);
    expect(sched.schedules).toEqual([]);
    const dl = PB.DownlinkPacket.decode(sched.cfgDownlink);
    expect(dl.command).toBe(PB.CommandType.CMD_MAG_CALIBRATE);
    expect(dl.epoch).toBeGreaterThan(1700000000);
    expect(dl.config).toBeFalsy(); // no transaction
  });

  it('a status query is ble_query = 1 and nothing else', () => {
    const pkt = PB.BlePacket.decode(encodeTunnelFrame({ bleQuery: BLE_QUERY_STATUS }));
    expect(BLE_QUERY_STATUS).toBe(1);
    expect(pkt.scheduleConfigPacket!.bleQuery).toBe(1);
    expect(pkt.scheduleConfigPacket!.cfgDownlink.length).toBe(0);
  });

  it('parseCfgEcho: an echo needs echo_seq; a plain schedule blob or junk is null', () => {
    const withEcho = PB.BlePacket.encode(
      PB.BlePacket.create({
        scheduleConfigPacket: PB.ScheduleConfigPacket.create({
          cfgEcho: PB.CfgEchoPacket.create({ echoSeq: 5, scheduleCount: 2 }),
        }),
      }),
    ).finish();
    expect(parseCfgEcho(withEcho)!.echoSeq).toBe(5);
    const plain = PB.BlePacket.encode(
      PB.BlePacket.create({
        scheduleConfigPacket: PB.ScheduleConfigPacket.create({ engaged: true, schedules: [] }),
      }),
    ).finish();
    expect(parseCfgEcho(plain)).toBeNull();
    const seq0 = PB.BlePacket.encode(
      PB.BlePacket.create({
        scheduleConfigPacket: PB.ScheduleConfigPacket.create({
          cfgEcho: PB.CfgEchoPacket.create({ echoSeq: 0 }),
        }),
      }),
    ).finish();
    expect(parseCfgEcho(seq0)).toBeNull();
    expect(parseCfgEcho(new Uint8Array([0xff, 0xff, 0xff]))).toBeNull();
  });
});

/* ---------------- the transport, against a fake characteristic ---------------- */

/** A collar's update characteristic: reads answer the current blob; a
 *  write is "consumed" on the next read, which then carries an echo with a
 *  bumped echo_seq (and the reply's mag_cal), the way the firmware does. */
function fakeChar(reply: (frame: any) => MagCalReport | null) {
  let seq = 0;
  let pending: any = null;
  let report: MagCalReport | null = null;
  const log: { op: string; frame?: any }[] = [];
  const blob = () =>
    Buffer.from(
      PB.BlePacket.encode(
        PB.BlePacket.create({
          scheduleConfigPacket: PB.ScheduleConfigPacket.create({
            cfgEcho: seq
              ? PB.CfgEchoPacket.create({
                  echoSeq: seq,
                  magCal: report ? PB.MagCalReport.create(report) : null,
                })
              : null,
          }),
        }),
      ).finish(),
    ).toString('base64');
  const device = {
    id: 'FAKE',
    readCharacteristicForService: jest.fn(async (svc: string, ch: string) => {
      expect(svc).toBe(COLLAR_SERVICE_UUID);
      expect(ch).toBe(UPDATE_CHAR_UUID);
      log.push({ op: 'read' });
      if (pending) {
        report = reply(pending);
        pending = null;
        seq++;
      }
      return { value: blob() };
    }),
    writeCharacteristicWithResponseForService: jest.fn(async (svc: string, ch: string, b64: string) => {
      expect(svc).toBe(COLLAR_SERVICE_UUID);
      expect(ch).toBe(UPDATE_CHAR_UUID);
      const sched = PB.BlePacket.decode(Buffer.from(b64, 'base64')).scheduleConfigPacket!;
      const frame = sched.cfgDownlink.length
        ? { cmd: PB.DownlinkPacket.decode(sched.cfgDownlink).command }
        : { query: sched.bleQuery };
      if (pending) throw new Error('a second frame landed before the first was consumed');
      pending = frame;
      log.push({ op: 'write', frame });
    }),
  };
  return { device, log };
}

describe('tunnel transport', () => {
  it('a command: baseline read, one write, then the echo that consumed it', async () => {
    const rep: MagCalReport = {
      state: S.COLLECTING, run: 1, progressPct: 0, sectorsHit: 0,
      verdict: 0, reason: 0, fieldUtX10: 0, residualPermille: 0,
    };
    const { device, log } = fakeChar(f => (f.cmd === MAG_CMD.CALIBRATE ? rep : null));
    const echo = await tunnelSendCommand(device as any, MAG_CMD.CALIBRATE);
    expect(echo.echoSeq).toBe(1);
    expect(PB.MagCalReport.toObject(echo.magCal!)).toEqual(rep);
    expect(log.map(l => l.op)).toEqual(['read', 'write', 'read']);
    expect(log[1].frame).toEqual({ cmd: MAG_CMD.CALIBRATE });
  });

  it('a status query writes ble_query 1 and paces on echo_seq', async () => {
    const { device, log } = fakeChar(() => null);
    const first = await tunnelQueryStatus(device as any);
    const second = await tunnelQueryStatus(device as any);
    expect(first.echoSeq).toBe(1);
    expect(second.echoSeq).toBe(2);
    expect(log.filter(l => l.op === 'write').map(l => l.frame)).toEqual([
      { query: 1 },
      { query: 1 },
    ]);
  });

  it('two operations started together never share the mailbox', async () => {
    const { device, log } = fakeChar(() => null);
    const [a, b] = await Promise.all([
      tunnelQueryStatus(device as any),
      tunnelSendCommand(device as any, MAG_CMD.CALIBRATE),
    ]);
    expect(a.echoSeq).toBe(1);
    expect(b.echoSeq).toBe(2);
    expect(log.map(l => l.op)).toEqual(['read', 'write', 'read', 'read', 'write', 'read']);
  });

  it('a read that throws (link dropped) surfaces, and the next operation still runs', async () => {
    const { device } = fakeChar(() => null);
    const read = device.readCharacteristicForService as jest.Mock;
    read.mockRejectedValueOnce(new Error('Device disconnected'));
    await expect(tunnelQueryStatus(device as any)).rejects.toThrow('Device disconnected');
    await expect(tunnelQueryStatus(device as any)).resolves.toMatchObject({ echoSeq: 1 });
  });

  it('magCalIo(device) is the two tunnel calls; the mock collar answers in memory', async () => {
    const { device, log } = fakeChar(() => null);
    const io = magCalIo(device as any);
    await io.status();
    await io.command(MAG_CMD.ABORT);
    expect(log.filter(l => l.op === 'write').map(l => l.frame)).toEqual([
      { query: 1 },
      { cmd: MAG_CMD.ABORT },
    ]);

    const mock = magCalIo(MOCK_COLLAR);
    const started = await mock.command(MAG_CMD.CALIBRATE);
    expect(started!.magCal).toMatchObject({ state: S.COLLECTING, run: 1, progressPct: 0 });
    const ups: MagCalReport[] = [];
    const res = await runMagCal(mock, { sleep: async () => {}, onUpdate: r => ups.push(r) });
    expect(res.outcome.inForce).toBe(true);
    expect(res.adopted).toBe(true); // it was already collecting
    expect(ups.map(r => r.progressPct)).toEqual([25, 50, 75, 100, 100]);
  });
});

/* ---------------- the flow, against a fake collar ---------------- */

/* The website's fake collar (test/run.mjs): each frame answers with an echo
   whose mag_cal is `reply(kind, index)`. An injectable clock makes the 2 s
   pacing instant and observable. */
function clock() {
  let t = 0;
  return {
    now: () => t,
    sleep: async (ms: number) => {
      t += ms;
    },
  };
}
function collar(reply: (kind: string | number, i: number) => MagCalReport | null, c: ReturnType<typeof clock>) {
  const log: { kind: string | number; t: number }[] = [];
  let busy = false;
  let overlap = false;
  const frame = async (kind: string | number): Promise<MagCalEcho> => {
    if (log.length > 500) throw new Error('runaway: the flow never stopped writing');
    if (busy) overlap = true;
    busy = true;
    log.push({ kind, t: c.now() });
    for (let k = 0; k < 20; k++) await null;
    const r = reply(kind, log.length - 1);
    busy = false;
    return { echoSeq: log.length, magCal: r };
  };
  return {
    io: { status: () => frame('status'), command: (cmd: number) => frame(cmd) },
    log,
    overlap: () => overlap,
  };
}
const rep = (state: number, runNo: number, pct: number, extra: Partial<MagCalReport> = {}): MagCalReport => ({
  state, run: runNo, progressPct: pct, sectorsHit: Math.round(pct / 4),
  verdict: 0, reason: 0, fieldUtX10: 0, residualPermille: 0, ...extra,
});
async function run(reply: (kind: string | number, i: number) => MagCalReport | null, opts: any = {}) {
  const c = clock();
  const col = collar(reply, c);
  const ups: MagCalReport[] = [];
  let res: any;
  let err: any;
  try {
    res = await runMagCal(col.io, { now: c.now, sleep: c.sleep, onUpdate: r => ups.push(r), ...opts });
  } catch (e) {
    err = e;
  }
  return { res, err, ups, log: col.log, kinds: col.log.map(l => l.kind), overlap: col.overlap() };
}

describe('runMagCal', () => {
  it('a run: one status, one start, then status polls until the verdict, never two frames in flight', async () => {
    const script = [
      null, rep(S.COLLECTING, 1, 0), rep(S.COLLECTING, 1, 40), rep(S.COLLECTING, 1, 85),
      rep(S.FITTING, 1, 100),
      rep(S.DONE, 1, 100, { verdict: V.GOOD, fieldUtX10: 512, residualPermille: 18 }),
    ];
    const o = await run((k, i) => script[i]);
    expect(o.err).toBeUndefined();
    expect(o.kinds).toEqual(['status', 20, 'status', 'status', 'status', 'status']);
    expect(o.overlap).toBe(false);
    // polls are paced about every 2 s, and the ring follows progress_pct
    const gaps = o.log.map((l, i) => (i >= 3 && l.kind === 'status' ? l.t - o.log[i - 1].t : Infinity));
    expect(gaps.every(g => g >= MAG_CAL.POLL_MS)).toBe(true);
    expect(o.ups.map(r => r.progressPct)).toEqual([0, 40, 85, 100, 100]);
    // a good fit ends in force, with its field and fit error in the words
    expect(o.res.outcome).toMatchObject({ inForce: true, tone: 'good', title: 'Calibrated — good' });
    expect(o.res.outcome.detail).toMatch(/51\.2 µT/);
    expect(o.res.outcome.detail).toMatch(/1\.8 %/);
    expect(o.res.adopted).toBe(false);
  });

  it("an older run's report is ignored by its run number", async () => {
    // The collar still shows an earlier run (run 2, DONE) when the start is
    // echoed; that verdict must not be taken for this run's.
    const script = [
      rep(S.DONE, 2, 100, { verdict: V.GOOD, fieldUtX10: 480 }),
      rep(S.DONE, 2, 100, { verdict: V.GOOD, fieldUtX10: 480 }),
      rep(S.COLLECTING, 3, 20),
      rep(S.DONE, 3, 100, { verdict: V.FAIR, reason: R.RESIDUAL_HIGH, fieldUtX10: 505, residualPermille: 61 }),
    ];
    const o = await run((k, i) => script[i]);
    expect(o.err).toBeUndefined();
    expect(o.ups.every(r => r.run === 3)).toBe(true);
    expect(o.res.report.run).toBe(3);
    expect(o.res.outcome.inForce).toBe(true);
    expect(o.res.outcome.tone).toBe('fair');
    expect(o.res.outcome.title).toMatch(/^Calibrated — fair/);
    expect(o.res.outcome.detail).toMatch(/scattered/);
  });

  it('Abort sends CMD_MAG_CALIBRATE_ABORT once, as the next frame, then polls to the end, not in force', async () => {
    // Abort asked on the third look; the collar's echo of the abort frame
    // still says COLLECTING (it acts on it a moment later) and the next
    // poll says ABORTED. One abort frame, then back to polling.
    let polls = 0;
    let aborted = false;
    const o = await run(
      (k, i) => {
        if (k === 21) {
          aborted = true;
          return rep(S.COLLECTING, 1, 30);
        }
        return i === 0 ? null : aborted ? rep(S.ABORTED, 1, 30) : rep(S.COLLECTING, 1, 30);
      },
      { abortRequested: () => ++polls > 2 },
    );
    expect(o.err).toBeUndefined();
    expect(o.kinds).toEqual(['status', 20, 'status', 'status', 21, 'status']);
    expect(o.overlap).toBe(false);
    expect(o.res.outcome).toMatchObject({ tone: 'aborted', inForce: false, title: 'Calibration stopped' });
    expect(o.res.outcome.detail).toMatch(/stays in force/);
  });

  it('firmware without calibration (no mag_cal ever) fails in words after a few polls, and stops writing', async () => {
    const o = await run(() => null);
    expect(o.err).toBeDefined();
    expect(o.err.message).toBe(MAG_CAL_UNSUPPORTED_MSG);
    expect(o.err.message).toMatch(/firmware does not support it/);
    expect(o.kinds.length).toBe(2 + MAG_CAL.START_POLLS);
    expect(o.kinds).not.toContain(21);
  });

  it('a run already going (the website, another phone) is followed, not restarted', async () => {
    const script = [rep(S.COLLECTING, 4, 50), rep(S.COLLECTING, 4, 75), rep(S.DONE, 4, 100, { verdict: V.GOOD, fieldUtX10: 499 })];
    const o = await run((k, i) => script[i]);
    expect(o.err).toBeUndefined();
    expect(o.kinds).not.toContain(20);
    expect(o.res.adopted).toBe(true);
    expect(o.res.outcome.inForce).toBe(true);
  });

  it('a run already fitting is followed too, not restarted', async () => {
    const script = [rep(S.FITTING, 5, 100), rep(S.DONE, 5, 100, { verdict: V.FAIR, reason: R.TIMEOUT, fieldUtX10: 488, residualPermille: 22 })];
    const o = await run((k, i) => script[i]);
    expect(o.err).toBeUndefined();
    expect(o.kinds).not.toContain(20);
    expect(o.res.adopted).toBe(true);
    expect(o.res.report.run).toBe(5);
    expect(o.res.outcome.tone).toBe('fair');
  });

  it("the backstop outlasts the collar's longest run: 120 s capture, the fit, up to 30 s to save", () => {
    expect(MAG_CAL.MAX_MS).toBeGreaterThanOrEqual((120 + 30 + 10) * 1000);
    expect(MAG_CAL.POLL_MS).toBe(2000);
  });

  it('a collar that never finishes is given up on at the backstop, not polled forever', async () => {
    const o = await run((k, i) => (i === 0 ? null : rep(S.COLLECTING, 1, 10)));
    expect(o.err).toBeDefined();
    expect(o.err.message).toBe(MAG_CAL_STALLED_MSG);
    expect(o.kinds.length).toBeLessThanOrEqual(MAG_CAL.MAX_MS / MAG_CAL.POLL_MS + 4);
  });
});

/* ---------------- the words ---------------- */

describe('outcome wording', () => {
  const out = (state: number, verdict: number, reason: number, extra: Partial<MagCalReport> = {}) =>
    magCalOutcome({ ...rep(state, 1, 100), verdict, reason, ...extra });

  it('in force exactly when DONE and GOOD or FAIR', () => {
    for (const st of Object.values(S)) {
      for (const v of Object.values(V)) {
        expect(magCalInForce({ ...rep(st, 1, 0), verdict: v })).toBe(
          st === S.DONE && (v === V.GOOD || v === V.FAIR),
        );
      }
    }
    expect(magCalEnded(rep(S.COLLECTING, 1, 0))).toBe(false);
    expect(magCalEnded(rep(S.FITTING, 1, 0))).toBe(false);
    expect(magCalEnded(rep(S.DONE, 1, 0))).toBe(true);
    expect(magCalEnded(rep(S.FAILED, 1, 0))).toBe(true);
    expect(magCalEnded(rep(S.ABORTED, 1, 0))).toBe(true);
  });

  it('good / fair — you can repeat / not enough rotation — try again / magnetic disturbance / sensor fault — contact the team / storage', () => {
    expect(out(S.DONE, V.GOOD, R.NONE, { fieldUtX10: 503, residualPermille: 18 })).toMatchObject({
      inForce: true, tone: 'good', title: 'Calibrated — good',
    });
    expect(out(S.DONE, V.FAIR, R.TIMEOUT)).toMatchObject({
      inForce: true, tone: 'fair', title: 'Calibrated — fair, you can repeat',
    });
    expect(out(S.DONE, V.FAIR, R.TIMEOUT).detail).toMatch(/time ran out/);
    expect(out(S.FAILED, V.RETRY, R.NOT_ENOUGH_ROTATION)).toMatchObject({
      inForce: false, tone: 'retry', title: 'Not enough rotation — try again',
    });
    expect(out(S.FAILED, V.RETRY, R.NOT_ENOUGH_ROTATION).detail).toMatch(/figure-8s, then a full roll about each axis/);
    expect(out(S.FAILED, V.RETRY, R.TIMEOUT).title).toBe('Not enough rotation in time — try again');
    expect(out(S.DONE, V.RETRY, R.FIELD_OUT_OF_RANGE, { fieldUtX10: 912 })).toMatchObject({
      inForce: false, tone: 'retry', title: 'Magnetic disturbance — try again elsewhere',
    });
    expect(out(S.DONE, V.RETRY, R.FIELD_OUT_OF_RANGE, { fieldUtX10: 912 }).detail).toMatch(/91\.2 µT/);
    expect(out(S.DONE, V.RETRY, R.RESIDUAL_HIGH).title).toBe('Readings too scattered — try again');
    expect(out(S.FAILED, V.RETRY, R.SENSOR_FAULT)).toMatchObject({
      inForce: false, tone: 'fault', title: 'Magnetometer fault — contact the team',
    });
    expect(out(S.FAILED, V.RETRY, R.STORAGE)).toMatchObject({
      inForce: false, tone: 'fault', title: 'Not saved — SD card problem',
    });
    expect(out(S.ABORTED, V.NONE, R.NONE)).toMatchObject({ inForce: false, tone: 'aborted', title: 'Calibration stopped' });
    expect(out(S.FAILED, V.RETRY, R.NONE)).toMatchObject({ inForce: false, tone: 'retry', title: 'Not calibrated — try again' });
    expect(magCalOutcome(null)).toMatchObject({ inForce: false, tone: 'fault', title: 'No result' });
  });

  it('every outcome that is not in force says the previous calibration stays', () => {
    for (const st of [S.FAILED, S.ABORTED, S.DONE]) {
      for (const r of Object.values(R)) {
        const o = out(st, st === S.DONE ? V.RETRY : V.NONE, r);
        expect(o.inForce).toBe(false);
        expect(o.detail).toMatch(/previous calibration, if any, stays in force/);
      }
    }
  });

  it('the calibration words never mention assembling the collar, batteries, housings or sound', () => {
    const { MAG_CAL_STEPS, MAG_CAL_LED_LINE } = require('../src/components/MagCalModal');
    const all = [
      ...MAG_CAL_STEPS,
      MAG_CAL_LED_LINE,
      ...[S.DONE, S.FAILED, S.ABORTED].flatMap(st =>
        Object.values(R).flatMap(r => Object.values(V).map(v => out(st, v, r))),
      ).flatMap(o => [o.title, o.detail]),
    ].join('\n');
    expect(all).not.toMatch(/assembl|batter|housing|sound|buzz|beep|WB5M|WB15/i);
    expect(MAG_CAL_STEPS.join(' ')).toMatch(/slowly through every orientation: a few slow figure-8s, then a full roll about each axis/);
    expect(MAG_CAL_STEPS.join(' ')).toMatch(/[Aa]way from metal and electronics/);
    expect(MAG_CAL_LED_LINE).toMatch(/pulses cyan while it collects/);
    expect(MAG_CAL_LED_LINE).toMatch(/two green flashes, then blue/);
    expect(MAG_CAL_LED_LINE).toMatch(/two red flashes/);
  });

  it("the card's last-run line", () => {
    expect(magCalLastLine(null)).toBe('');
    expect(magCalLastLine(rep(S.IDLE, 0, 0))).toBe('');
    expect(magCalLastLine(rep(S.COLLECTING, 1, 40))).toMatch(/running on the collar/);
    expect(magCalLastLine(rep(S.FITTING, 1, 100))).toMatch(/running on the collar/);
    expect(magCalLastLine({ ...rep(S.DONE, 2, 100), verdict: V.GOOD })).toBe('Last run: Calibrated — good');
    expect(magCalLastLine({ ...rep(S.FAILED, 2, 100), verdict: V.RETRY, reason: R.NOT_ENOUGH_ROTATION }))
      .toBe('Last run: Not enough rotation — try again');
  });
});
