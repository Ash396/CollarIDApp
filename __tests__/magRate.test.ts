/**
 * Magnetometer rate mode (MagnetometerConfig.sample_rate_hz, fw
 * MAG_RATE_MIN_FW_BUILD+; collarID_thread docs/DESIGN_magnetometer_rate.md
 * §5 "App"), the model layer:
 *  - the regenerated protos carry the field on both messages,
 *  - the gate and the two clamps (the editor's save path, the Send path),
 *  - the packet builder puts the field on the wire only when non-zero, so
 *    an interval-mode schedule is byte-identical to one that predates it,
 *  - the read-back map, the preset shape and equality treat absent as 0,
 *  - the summary and the power term.
 */
import * as PB from '../src/proto/collar_pb.js';
import {
  MAG_RATE_HZ,
  MAG_RATE_MIN_FW_BUILD,
  OPTION_GATE_MIN_BUILD,
  bleFeatureGates,
  editorFeatureGates,
  fwGateNote,
  fwOptionsLine,
  magRateForCollar,
  magRateForGates,
} from '../src/utils/fw';
import { mapProtoSchedule } from '../src/utils/mapProtoSchedule';
import { appToPresetSchedule, presetToAppSchedule } from '../src/utils/presetShape';
import { appSchedulesEqual, schedulesEqual } from '../src/utils/scheduleEquality';
import { magnetometerText, scheduleSummaryLines } from '../src/utils/scheduleSummary';
import {
  SCHEDULE_PRESETS,
  applySchedulePreset,
  defaultScheduleSlot,
  matchingSchedulePreset,
} from '../src/utils/schedulePresets';
import {
  estimatePower,
  estimateScheduleSolarHours,
  magRateMw,
} from '../src/utils/powerEstimator';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const { buildSchedulePacketFromAppState } = require('../src/ble/bleManager');

/* ---------------- fixtures ---------------- */

/** A full-day slot with the magnetometer on, `over` on its block. */
const withMag = (over: Partial<NonNullable<Schedule['magnetometer']>> = {}): Schedule => ({
  id: '1',
  name: 'Schedule 1',
  ...defaultScheduleSlot(),
  magnetometer: { enabled: true, sampleIntervalS: 300, ...over },
});

const wireBytes = (draft: Schedule[]) =>
  Array.from(PB.BlePacket.encode(buildSchedulePacketFromAppState(draft, true)).finish());

/** The collar's echo of a draft, when its firmware knows every field. */
const echoOf = (draft: Schedule[]) =>
  PB.BlePacket.decode(PB.BlePacket.encode(buildSchedulePacketFromAppState(draft, true)).finish())
    .scheduleConfigPacket.schedules;

/** The echo of a collar predating the rate field: it drops what it does not
 *  know, so the magnetometer comes back without sample_rate_hz. */
const legacyEchoOf = (draft: Schedule[]) =>
  echoOf(draft).map((sc: any) => {
    if (!sc.magnetometer) return sc;
    const m = PB.MagnetometerConfig.toObject(sc.magnetometer);
    delete m.sampleRateHz;
    return PB.ScheduleConfig.create({ ...sc, magnetometer: PB.MagnetometerConfig.create(m) });
  });

/* ---------------- the wire ---------------- */

describe('regenerated protos carry sample_rate_hz', () => {
  it('ble.proto MagnetometerConfig field 3 round-trips, and absent reads as 0', () => {
    const bytes = PB.MagnetometerConfig.encode(
      PB.MagnetometerConfig.create({ enabled: true, sampleIntervalS: 60, sampleRateHz: 16 }),
    ).finish();
    const back = PB.MagnetometerConfig.decode(bytes);
    expect(back.sampleRateHz).toBe(16);
    expect(back.sampleIntervalS).toBe(60);
    // field 3, varint: tag 0x18
    expect(Array.from(bytes)).toContain(0x18);
    const legacy = PB.MagnetometerConfig.decode(
      PB.MagnetometerConfig.encode(PB.MagnetometerConfig.create({ enabled: true, sampleIntervalS: 60 })).finish(),
    );
    expect(legacy.sampleRateHz).toBe(0);
  });

  it('downlink.proto ConfigMagnetometer field 3 is optional: set round-trips, unset stays unset', () => {
    const set = PB.ConfigMagnetometer.decode(
      PB.ConfigMagnetometer.encode(PB.ConfigMagnetometer.create({ enabled: true, sampleRateHz: 4 })).finish(),
    );
    expect(set.sampleRateHz).toBe(4);
    expect(set.hasOwnProperty('sampleRateHz')).toBe(true);
    const unset = PB.ConfigMagnetometer.decode(
      PB.ConfigMagnetometer.encode(PB.ConfigMagnetometer.create({ enabled: true, sampleIntervalS: 60 })).finish(),
    );
    expect(unset.hasOwnProperty('sampleRateHz')).toBe(false);
    // and it rides in a schedule fragment of the config tunnel
    const frag = PB.ConfigFragment.decode(
      PB.ConfigFragment.encode(
        PB.ConfigFragment.create({
          cfgMagnetometer: PB.ConfigMagnetometer.create({ enabled: true, sampleRateHz: 8 }),
        }),
      ).finish(),
    );
    expect(frag.cfgMagnetometer?.sampleRateHz).toBe(8);
  });
});

describe('the packet builder', () => {
  it('puts the rate on the wire, and the read-back maps it into the app shape', () => {
    for (const hz of MAG_RATE_HZ) {
      const [sc] = echoOf([withMag({ sampleRateHz: hz })]);
      expect(sc.magnetometer?.sampleRateHz).toBe(hz);
      expect(sc.magnetometer?.sampleIntervalS).toBe(300);
      expect(mapProtoSchedule(sc, 0).magnetometer).toEqual({
        enabled: true,
        sampleIntervalS: 300,
        sampleRateHz: hz,
      });
    }
  });

  it('interval mode (rate 0 or absent) is byte-identical to a packet that predates the field', () => {
    // pbjs writes any field that is SET, 0 included, so the builder must
    // leave the field out rather than lean on the proto3 default.
    const zero = wireBytes([withMag({ sampleRateHz: 0 })]);
    const absent = wireBytes([withMag()]);
    expect(zero).toEqual(absent);
    // ... and equal to the two-field message the pre-rate generated code
    // could produce: no tag 0x18 anywhere in the magnetometer block.
    const magBlock = Array.from(
      PB.MagnetometerConfig.encode(
        buildSchedulePacketFromAppState([withMag({ sampleRateHz: 0 })], true)
          .scheduleConfigPacket!.schedules[0].magnetometer!,
      ).finish(),
    );
    expect(magBlock).toEqual(
      Array.from(
        PB.MagnetometerConfig.encode(
          PB.MagnetometerConfig.create({ enabled: true, sampleIntervalS: 300 }),
        ).finish(),
      ),
    );
    expect(magBlock).not.toContain(0x18);
    // a rate does change the bytes
    expect(wireBytes([withMag({ sampleRateHz: 4 })])).not.toEqual(absent);
  });

  it('a disabled magnetometer is stripped, rate or not', () => {
    const [sc] = echoOf([withMag({ enabled: false, sampleRateHz: 16 })]);
    expect(sc.magnetometer).toBeFalsy();
  });
});

/* ---------------- the gate and the clamps ---------------- */

describe('firmware gate', () => {
  it('opens exactly at MAG_RATE_MIN_FW_BUILD (firmware main build 425, set at the firmware merge)', () => {
    expect(MAG_RATE_MIN_FW_BUILD).toBe(425);
    expect(bleFeatureGates(MAG_RATE_MIN_FW_BUILD, 0).magRate).toBe(true);
    expect(bleFeatureGates(MAG_RATE_MIN_FW_BUILD - 1, 0).magRate).toBe(false);
    expect(bleFeatureGates(398, 0).magRate).toBe(false); // calibration, not the rate
    expect(bleFeatureGates(0, 0).magRate).toBe(false);
  });

  it('with no collar the editor offers the rates; a connected collar without a build does not', () => {
    expect(editorFeatureGates(0, 0).magRate).toBe(true);
    expect(editorFeatureGates(0, 0, true).magRate).toBe(false);
    expect(editorFeatureGates(MAG_RATE_MIN_FW_BUILD, 0, true).magRate).toBe(true);
    expect(editorFeatureGates(380, 0).magRate).toBe(false);
  });

  it('the rates are the powers of two the crystal divides exactly', () => {
    expect(MAG_RATE_HZ).toEqual([1, 2, 4, 8, 16]);
  });

  it('the firmware line names it, newest gate first, and the note under the control is the usual one', () => {
    expect(OPTION_GATE_MIN_BUILD[0]).toEqual({
      gate: 'magRate',
      minBuild: MAG_RATE_MIN_FW_BUILD,
      option: 'heading at 1 to 16 Hz',
    });
    expect(fwOptionsLine(398, bleFeatureGates(398, 0))).toBe(
      'Connected collar: firmware 398: heading at 1 to 16 Hz needs a firmware update',
    );
    expect(fwOptionsLine(MAG_RATE_MIN_FW_BUILD, bleFeatureGates(MAG_RATE_MIN_FW_BUILD, 0))).toBe(
      `Connected collar: firmware ${MAG_RATE_MIN_FW_BUILD}, all options available`,
    );
    expect(fwGateNote(398, MAG_RATE_MIN_FW_BUILD)).toBe(
      `Needs firmware ${MAG_RATE_MIN_FW_BUILD}+ — this collar reports 398.`,
    );
  });
});

describe('magRateForGates (the editor\'s save path)', () => {
  const open = bleFeatureGates(MAG_RATE_MIN_FW_BUILD, 0);
  const shut = bleFeatureGates(398, 0);
  it('keeps a legal rate above the gate and holds it to interval mode below', () => {
    for (const hz of MAG_RATE_HZ) {
      expect(magRateForGates({ enabled: true, sampleRateHz: hz }, open)).toBe(hz);
      expect(magRateForGates({ enabled: true, sampleRateHz: hz }, shut)).toBe(0);
    }
    expect(magRateForGates({ enabled: true, sampleRateHz: 0 }, open)).toBe(0);
    expect(magRateForGates({ enabled: true }, open)).toBe(0);
    expect(magRateForGates(undefined, open)).toBe(0);
  });
  it('a rate the collar cannot run is interval mode, as the firmware parses it', () => {
    expect(magRateForGates({ enabled: true, sampleRateHz: 3 }, open)).toBe(0);
    expect(magRateForGates({ enabled: true, sampleRateHz: 10 }, open)).toBe(0);
    expect(magRateForGates({ enabled: true, sampleRateHz: 32 }, open)).toBe(0);
  });
});

describe('magRateForCollar (the Send path)', () => {
  it('holds the rate only, and only when the gate is closed', () => {
    const s = withMag({ sampleRateHz: 8 });
    expect(magRateForCollar(s, { magRate: true })).toBe(s);
    const held = magRateForCollar(s, { magRate: false });
    expect(held.magnetometer).toEqual({ enabled: true, sampleIntervalS: 300, sampleRateHz: 0 });
    // the mic and everything else untouched
    expect(held.microphone).toBe(s.microphone);
    // already interval mode, or no magnetometer block: the same object back
    const interval = withMag({ sampleRateHz: 0 });
    expect(magRateForCollar(interval, { magRate: false })).toBe(interval);
    const noMag: Schedule = { id: 'z', name: 'Schedule 1', window: { startHour: 0, endHour: 23 } };
    expect(magRateForCollar(noMag, { magRate: false })).toBe(noMag);
  });
  it('what it sends verifies against the echo of a collar that predates the field', () => {
    const held = [magRateForCollar(withMag({ sampleRateHz: 8 }), { magRate: false })];
    expect(schedulesEqual(held, legacyEchoOf(held))).toBe(true);
    // unheld, the same collar's echo would not verify
    const unheld = [withMag({ sampleRateHz: 8 })];
    expect(schedulesEqual(unheld, legacyEchoOf(unheld))).toBe(false);
  });
});

/* ---------------- equality, shapes, presets ---------------- */

describe('equality', () => {
  it('a rate-0 draft equals a legacy echo (no field), and a rate change is seen', () => {
    const interval = [withMag({ sampleRateHz: 0 })];
    expect(schedulesEqual(interval, legacyEchoOf(interval))).toBe(true);
    expect(schedulesEqual([withMag()], legacyEchoOf(interval))).toBe(true);
    const rate = [withMag({ sampleRateHz: 4 })];
    expect(schedulesEqual(rate, echoOf(rate))).toBe(true);
    expect(schedulesEqual(rate, echoOf(interval))).toBe(false);
    expect(schedulesEqual(rate, echoOf([withMag({ sampleRateHz: 8 })]))).toBe(false);
    expect(appSchedulesEqual(rate, [withMag({ sampleRateHz: 0 })])).toBe(false);
    expect(appSchedulesEqual([withMag()], [withMag({ sampleRateHz: 0 })])).toBe(true);
  });
  it('a rate on a disabled magnetometer never reads as a change', () => {
    expect(
      appSchedulesEqual([withMag({ enabled: false, sampleRateHz: 16 })], [withMag({ enabled: false })]),
    ).toBe(true);
  });
});

describe('preset shape', () => {
  it('carries sample_rate_hz both ways, and an old preset without it reads as 0', () => {
    const p = appToPresetSchedule(withMag({ sampleRateHz: 2 }));
    expect(p.magnetometer).toEqual({ enabled: true, sample_interval_s: 300, sample_rate_hz: 2 });
    expect(presetToAppSchedule(p, 0).magnetometer).toEqual({
      enabled: true,
      sampleIntervalS: 300,
      sampleRateHz: 2,
    });
    const old = presetToAppSchedule({ magnetometer: { enabled: true, sample_interval_s: 60 } }, 0);
    expect(old.magnetometer).toEqual({ enabled: true, sampleIntervalS: 60, sampleRateHz: 0 });
    expect(appToPresetSchedule(withMag()).magnetometer.sample_rate_hz).toBe(0);
  });
});

describe('quick setups stay in interval mode', () => {
  it('the stock slot and every preset name rate 0', () => {
    expect(defaultScheduleSlot().magnetometer).toEqual({ enabled: false, sampleIntervalS: 60, sampleRateHz: 0 });
    for (const p of SCHEDULE_PRESETS) {
      expect(p.slot.magnetometer).toEqual({ enabled: false, sampleIntervalS: 60, sampleRateHz: 0 });
    }
  });
  it('a preset still reads as itself on any collar; the magnetometer at a rate is none of them', () => {
    const s: Schedule = { id: 'x', name: 'Schedule 1', window: { startHour: 0, endHour: 23 } };
    for (const p of SCHEDULE_PRESETS) {
      expect(matchingSchedulePreset(applySchedulePreset(s, p), bleFeatureGates(398, 0))).toBe(p.key);
      expect(matchingSchedulePreset(applySchedulePreset(s, p), bleFeatureGates(MAG_RATE_MIN_FW_BUILD, 0))).toBe(p.key);
      const at4 = applySchedulePreset(s, p);
      at4.magnetometer = { enabled: true, sampleIntervalS: 60, sampleRateHz: 4 };
      expect(matchingSchedulePreset(at4)).toBeNull();
    }
  });
});

/* ---------------- words ---------------- */

describe('plain-words summary', () => {
  it('"heading at 4 Hz" in rate mode, "heading every 5 min" on the interval', () => {
    expect(magnetometerText({ enabled: true, sampleIntervalS: 300, sampleRateHz: 4 })).toBe('heading at 4 Hz');
    expect(magnetometerText({ enabled: true, sampleIntervalS: 300, sampleRateHz: 16 })).toBe('heading at 16 Hz');
    expect(magnetometerText({ enabled: true, sampleIntervalS: 300, sampleRateHz: 0 })).toBe('heading every 5 min');
    expect(magnetometerText({ enabled: true, sampleIntervalS: 300 })).toBe('heading every 5 min');
    expect(magnetometerText({ enabled: true, sampleIntervalS: 3600 })).toBe('heading every 1 h');
    const lines = scheduleSummaryLines(withMag({ sampleRateHz: 4 }));
    expect(lines).toContain('🌡️ Heading at 4 Hz');
    expect(scheduleSummaryLines(withMag())).toContain('🌡️ Heading every 5 min');
    expect(scheduleSummaryLines(withMag({ enabled: false, sampleRateHz: 4 })).join('\n')).not.toMatch(/heading/i);
  });
});

/* ---------------- power ---------------- */

describe('power term (DESIGN_magnetometer_rate.md §3.5, mirrored from js/power-model.js)', () => {
  const MW: Record<number, number> = { 1: 0.029, 2: 0.052, 4: 0.099, 8: 0.192, 16: 0.38 };

  it('each rate adds its design estimate; interval mode and off add nothing', () => {
    for (const hz of MAG_RATE_HZ) expect(magRateMw({ enabled: true, sampleRateHz: hz })).toBe(MW[hz]);
    expect(magRateMw({ enabled: true, sampleRateHz: 0 })).toBe(0);
    expect(magRateMw({ enabled: true })).toBe(0);
    expect(magRateMw({ enabled: false, sampleRateHz: 16 })).toBe(0);
    expect(magRateMw(undefined)).toBe(0);
    expect(magRateMw({ enabled: true, sampleRateHz: 3 })).toBe(0); // not a rate the collar runs
  });

  it('reaches the total and its own component, scaled by the window', () => {
    // Components come back in solar hours: one mW is 24 / (215 * 0.8) sh.
    const perMw = 24 / (215 * 0.8);
    const off = estimatePower([withMag()]);
    expect(off.components.magnetometer).toBe(0);
    for (const hz of MAG_RATE_HZ) {
      const on = estimatePower([withMag({ sampleRateHz: hz })]);
      expect(on.components.magnetometer).toBeCloseTo(MW[hz] * perMw, 9);
      expect(on.totalSolarHours).toBeCloseTo(off.totalSolarHours + MW[hz] * perMw, 9);
      // the other components are untouched
      expect(on.components.baseline).toBe(off.components.baseline);
      expect(on.components.gps).toBe(off.components.gps);
      expect(estimateScheduleSolarHours(withMag({ sampleRateHz: hz }))).toBeCloseTo(
        estimateScheduleSolarHours(withMag()) + MW[hz] * perMw, 9,
      );
    }
    // a 6-hour window carries a quarter of the day's term
    const quarter = estimatePower([{ ...withMag({ sampleRateHz: 4 }), window: { startHour: 0, endHour: 5 } }]);
    expect(quarter.components.magnetometer).toBeCloseTo((MW[4] * perMw) / 4, 9);
  });
});
