/**
 * Pure-logic coverage for the add-on/DT protocol, firmware gating, and the
 * preset shape converters (app <-> website snake_case).
 */
import {
  DT_CMD,
  buildDtDirectCmd,
  buildDtFwdCmd,
  parseDtInfo,
  parseLocalDevices,
  snapCheckin,
  checkinLabel,
  CHECKIN_LADDER,
} from '../src/utils/dt';
import { parseFwBuild, bleFeatureGates } from '../src/utils/fw';
import {
  appToPresetSchedule,
  presetToAppSchedule,
} from '../src/utils/presetShape';
import { appSchedulesEqual } from '../src/utils/scheduleEquality';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

describe('DT command frames', () => {
  it('builds a 12-byte direct DtBleCmdV1_t', () => {
    const f = buildDtDirectCmd(DT_CMD.ARM, 0x01020304, 0x0a0b0c0d);
    expect(f.length).toBe(12);
    expect([f[0], f[1], f[2], f[3]]).toEqual([0x44, 0x54, 1, DT_CMD.ARM]);
    // param LE
    expect([f[4], f[5], f[6], f[7]]).toEqual([0x04, 0x03, 0x02, 0x01]);
    // sender epoch LE
    expect([f[8], f[9], f[10], f[11]]).toEqual([0x0d, 0x0c, 0x0b, 0x0a]);
  });

  it('builds a 16-byte relayed DtBleFwdV1_t with target uid', () => {
    const f = buildDtFwdCmd(0xa1b2c3d4, DT_CMD.PAIR, 0, 1234);
    expect(f.length).toBe(16);
    expect([f[0], f[1], f[2], f[3]]).toEqual([0x44, 0x54, 1, DT_CMD.PAIR]);
    expect([f[12], f[13], f[14], f[15]]).toEqual([0xd4, 0xc3, 0xb2, 0xa1]);
  });
});

describe('parseDtInfo', () => {
  function blob(len: number): Uint8Array {
    const b = new Uint8Array(len);
    const dv = new DataView(b.buffer);
    b[0] = 0x44;
    b[1] = 0x54;
    b[2] = 5;
    b[3] = 1;
    b[4] = 4; // fw 1.4
    for (let i = 0; i < 8; i++) b[5 + i] = 'deadbeef'.charCodeAt(i);
    dv.setUint32(13, 3600, true); // uptime
    dv.setUint32(17, 1767225600, true); // detach epoch
    dv.setUint16(21, 2987, true); // batt mV
    b[23] = 1; // detaching
    if (len >= 30) {
      dv.setUint32(24, 1767000000, true); // rtc
      b[28] = 1; // add-on mode
      b[29] = 0; // not fired
    }
    if (len >= 34) dv.setUint32(30, 0x1234abcd, true);
    if (len >= 37) {
      dv.setUint16(34, 2860, true);
      dv.setInt8(36, 21);
    }
    if (len >= 38) b[37] = 1;
    if (len >= 42) dv.setUint32(38, 86400, true);
    return b;
  }

  it('parses a full v5 blob', () => {
    const info = parseDtInfo(blob(42))!;
    expect(info.fw).toBe('1.4');
    expect(info.gitHash).toBe('deadbeef');
    expect(info.uptimeS).toBe(3600);
    expect(info.detachEpoch).toBe(1767225600);
    expect(info.battMv).toBe(2987);
    expect(info.motorState).toBe(1);
    expect(info.rtcEpoch).toBe(1767000000);
    expect(info.mode).toBe(1);
    expect(info.fired).toBe(false);
    expect(info.pairedUid).toBe(0x1234abcd);
    expect(info.loadedMv).toBe(2860);
    expect(info.dieTempC).toBe(21);
    expect(info.autoDetachOn).toBe(true);
    expect(info.checkinIntervalS).toBe(86400);
  });

  it('reports nulls for fields the firmware predates (v0 blob)', () => {
    const info = parseDtInfo(blob(24))!;
    expect(info.battMv).toBe(2987);
    expect(info.rtcEpoch).toBeNull();
    expect(info.pairedUid).toBeNull();
    expect(info.autoDetachOn).toBeNull();
    expect(info.checkinIntervalS).toBeNull();
  });

  it('rejects a non-DT payload', () => {
    expect(parseDtInfo(new Uint8Array(24))).toBeNull();
    expect(parseDtInfo(new Uint8Array([0x44, 0x54, 1]))).toBeNull();
  });
});

describe('parseLocalDevices', () => {
  it('parses a v2 blob with two entries', () => {
    const b = new Uint8Array(4 + 2 * 19);
    const dv = new DataView(b.buffer);
    b[0] = 0x44;
    b[1] = 0x4c;
    b[2] = 2; // blob version -> 19 B stride
    b[3] = 2;
    // entry 0: paired detachment, fired
    dv.setUint32(4, 0xa1b2c3d4, true);
    b[8] = 1;
    dv.setUint16(9, 3104, true);
    b[11] = 0;
    dv.setUint32(12, 1767225600, true);
    dv.setUint16(16, 42, true);
    dv.setUint32(18, 1, true); // paired
    b[22] = 1; // fired
    // entry 1: unpaired node
    const o = 4 + 19;
    dv.setUint32(o, 0x00c0ffee, true);
    b[o + 4] = 2;
    dv.setUint16(o + 5, 2900, true);
    dv.setUint32(o + 14, 0, true);
    const list = parseLocalDevices(b)!;
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe('CollarDT-A1B2C3D4');
    expect(list[0].paired).toBe(true);
    expect(list[0].fired).toBe(true);
    expect(list[0].detachEpoch).toBe(1767225600);
    expect(list[1].name).toBe('Node-00C0FFEE');
    expect(list[1].paired).toBe(false);
  });

  it('rejects a non-DL payload', () => {
    expect(parseLocalDevices(new Uint8Array([1, 2, 3, 4]))).toBeNull();
  });
});

describe('check-in ladder', () => {
  it('snaps to the rung at or below', () => {
    expect(snapCheckin(86400)).toBe(86400);
    expect(snapCheckin(4000)).toBe(3600);
    expect(snapCheckin(1)).toBe(300);
  });
  it('labels rungs', () => {
    expect(checkinLabel(300)).toBe('5 minutes');
    expect(checkinLabel(1234)).toBe('1234 s');
    expect(CHECKIN_LADDER[CHECKIN_LADDER.length - 1].s).toBe(86400);
  });
});

describe('firmware gating', () => {
  it('parses b### version strings', () => {
    expect(parseFwBuild('b306 6ca907b')).toBe(306);
    expect(parseFwBuild('b306 6ca907b dirty')).toBe(306);
    expect(parseFwBuild('1.14.2')).toBe(0);
    expect(parseFwBuild(undefined)).toBe(0);
  });
  it('gates features on build + caps', () => {
    expect(bleFeatureGates(306, 1)).toEqual({
      cfgTunnel: true,
      factoryReset: true,
      threadAddons: true,
      micFormat: false,
      micRateExt: false,
    });
    expect(bleFeatureGates(304, 0)).toEqual({
      cfgTunnel: false,
      factoryReset: false,
      threadAddons: false,
      micFormat: false,
      micRateExt: false,
    });
  });
  it('keeps the extended-rate gate closed on every real firmware', () => {
    // The 48/96/192 kHz clocks watchdog-crashed b341 (RM0456 ratio) and are
    // clamped from b342 — no shipped build may open this gate until the
    // PLL3 kernel redesign lands and this test names its build number.
    expect(bleFeatureGates(340, 0)).toMatchObject({ micFormat: true, micRateExt: false });
    expect(bleFeatureGates(341, 0)).toMatchObject({ micFormat: true, micRateExt: false });
    expect(bleFeatureGates(342, 0)).toMatchObject({ micFormat: true, micRateExt: false });
  });
  it('opens the microphone format gate exactly at build 338', () => {
    expect(bleFeatureGates(337, 0).micFormat).toBe(false);
    expect(bleFeatureGates(338, 0).micFormat).toBe(true);
    // An unparsable/absent firmware string reports build 0, which must gate
    // off rather than default open.
    expect(bleFeatureGates(0, 0).micFormat).toBe(false);
  });
});

describe('preset shape converters', () => {
  const appSchedule: Schedule = {
    id: 'x',
    name: 'Schedule 1',
    window: { startHour: 6, endHour: 18 },
    gps: {
      enabled: true,
      sampleIntervalMin: 30,
      accuracy: 10,
      dynamicSamplingMode: true,
      mediumMotionVedbaThresholdX100: 25,
      mediumMotionGpsIntervalMin: 12,
      highMotionVedbaThresholdX100: 90,
      highMotionGpsIntervalMin: 4,
      lorawanTxOnGpsFix: true,
      loraTxOnGpsFix: false,
    },
    light: { enabled: true, sampleIntervalMin: 15 },
    environmental: { enabled: false, sampleIntervalMin: 5 },
    particulate: { enabled: false, sampleIntervalMin: 15 },
    microphone: {
      enabled: true,
      continuousMode: false,
      sampleLengthMin: 2,
      sampleWindowMin: 20,
    },
    accelerometer: { enabled: true, sampleRate: 1, sensitivity: 2 },
    magnetometer: { enabled: true, sampleIntervalS: 120 },
    lorawan: { enabled: true, sendIntervalMin: 45 },
    lora: { enabled: false, sendIntervalMin: 60 },
  };

  it('round-trips app -> website shape -> app', () => {
    const wire = appToPresetSchedule(appSchedule);
    // website-side keys, spot-checked
    expect(wire.window.start_hour).toBe(6);
    expect(wire.gps.medium_motion_vedba_threshold_x100).toBe(25);
    expect(wire.gps.lorawan_tx_on_gps_fix).toBe(true);
    expect(wire.magnetometer.sample_interval_s).toBe(120);
    expect(wire.lorawan_enabled).toBe(true);
    expect(wire.lorawan_send_interval_min).toBe(45);

    const back = presetToAppSchedule(wire, 0);
    expect(appSchedulesEqual([back], [appSchedule])).toBe(true);
  });

  it('fills defaults for a minimized website preset', () => {
    const back = presetToAppSchedule(
      { window: { start_hour: 0, end_hour: 23 }, lorawan_enabled: true },
      0,
    );
    expect(back.gps?.enabled).toBe(false);
    expect(back.lorawan?.enabled).toBe(true);
    expect(back.lorawan?.sendIntervalMin).toBe(60);
    expect(back.microphone?.sampleWindowMin).toBe(10);
  });
});
