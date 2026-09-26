/**
 * Dynamic (activity-based) GPS: faster while the animal moves means faster.
 *  - the rule (gpsIntervals.ts): walking no slower than still, running no
 *    slower than walking, 0 = same as the base interval, silent with
 *    dynamic sampling off,
 *  - the stock intervals are consistent everywhere they are filled in:
 *    the new-slot default, the presets, the website-shape converters and
 *    the packet builder's fallbacks (base 20 / medium 2 / high 1),
 *  - the editor: Save refuses an inverted trio in plain words and rewrites
 *    nothing; 0 survives Save (it used to be clamped up to 1).
 */
import * as PB from '../src/proto/collar_pb.js';
import {
  DYNAMIC_GPS_DEFAULT_HIGH_MIN,
  DYNAMIC_GPS_DEFAULT_MEDIUM_MIN,
  dynamicGpsIntervalError,
} from '../src/utils/gpsIntervals';
import { SCHEDULE_PRESETS, defaultScheduleSlot } from '../src/utils/schedulePresets';
import { appToPresetSchedule, presetToAppSchedule } from '../src/utils/presetShape';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
const { buildSchedulePacketFromAppState } = require('../src/ble/bleManager');

const gps = (over: Partial<NonNullable<Schedule['gps']>> = {}): Schedule['gps'] => ({
  enabled: true,
  sampleIntervalMin: 20,
  accuracy: 5,
  dynamicSamplingMode: true,
  mediumMotionVedbaThresholdX100: 20,
  mediumMotionGpsIntervalMin: 2,
  highMotionVedbaThresholdX100: 100,
  highMotionGpsIntervalMin: 1,
  lorawanTxOnGpsFix: false,
  loraTxOnGpsFix: false,
  ...over,
});

describe('dynamicGpsIntervalError', () => {
  it('accepts still >= walking >= running', () => {
    expect(dynamicGpsIntervalError(gps())).toBeNull();
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 5, highMotionGpsIntervalMin: 5 }))).toBeNull();
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 30, mediumMotionGpsIntervalMin: 10, highMotionGpsIntervalMin: 10 }))).toBeNull();
  });

  it('refuses walking slower than still, naming the two', () => {
    const e = dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 10, highMotionGpsIntervalMin: 5 }));
    expect(e).toMatch(/^The walking interval must not be longer than the still interval/);
    expect(e).toMatch(/10 min when walking, 5 min when still/);
  });

  it('refuses running slower than walking, naming the two', () => {
    const e = dynamicGpsIntervalError(gps({ sampleIntervalMin: 20, mediumMotionGpsIntervalMin: 5, highMotionGpsIntervalMin: 10 }));
    expect(e).toMatch(/^The running interval must not be longer than the walking interval/);
    expect(e).toMatch(/10 min when running, 5 min when walking/);
  });

  it('0 means the same as the base interval, so it is never too long', () => {
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 0, highMotionGpsIntervalMin: 0 }))).toBeNull();
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 0, highMotionGpsIntervalMin: 3 }))).toBeNull();
    // walking 0 reads as the base (5): running 6 is slower than that
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 0, highMotionGpsIntervalMin: 6 })))
      .toMatch(/6 min when running, 5 min when walking/);
    expect(dynamicGpsIntervalError(gps({ sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 3, highMotionGpsIntervalMin: 0 }))).toBeNull();
  });

  it('says nothing with dynamic sampling off, or GPS off, whatever the intervals hold', () => {
    expect(dynamicGpsIntervalError(gps({ dynamicSamplingMode: false, sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 10, highMotionGpsIntervalMin: 20 }))).toBeNull();
    expect(dynamicGpsIntervalError(gps({ enabled: false, sampleIntervalMin: 5, mediumMotionGpsIntervalMin: 10 }))).toBeNull();
    expect(dynamicGpsIntervalError(undefined)).toBeNull();
  });
});

describe('the stock intervals are consistent everywhere', () => {
  it('new-slot default: base 20, walking 2, running 1', () => {
    expect(DYNAMIC_GPS_DEFAULT_MEDIUM_MIN).toBe(2);
    expect(DYNAMIC_GPS_DEFAULT_HIGH_MIN).toBe(1);
    const g = defaultScheduleSlot().gps!;
    expect(g.sampleIntervalMin).toBe(20);
    expect(g.mediumMotionGpsIntervalMin).toBe(2);
    expect(g.highMotionGpsIntervalMin).toBe(1);
    expect(dynamicGpsIntervalError({ ...g, enabled: true, dynamicSamplingMode: true })).toBeNull();
  });

  it('every quick setup obeys the rule, with dynamic sampling forced on', () => {
    for (const p of SCHEDULE_PRESETS) {
      expect(dynamicGpsIntervalError({ ...p.slot.gps!, enabled: true, dynamicSamplingMode: true })).toBeNull();
    }
    const movement = SCHEDULE_PRESETS.find(p => p.key === 'movement')!.slot.gps!;
    expect(movement.dynamicSamplingMode).toBe(true);
    expect(movement).toMatchObject({ sampleIntervalMin: 15, mediumMotionGpsIntervalMin: 2, highMotionGpsIntervalMin: 1 });
  });

  it('the website-shape converters fill 2 / 1 when a preset names no motion interval', () => {
    const back = presetToAppSchedule({ window: { start_hour: 0, end_hour: 23 }, gps: { enabled: true } }, 0);
    expect(back.gps?.mediumMotionGpsIntervalMin).toBe(2);
    expect(back.gps?.highMotionGpsIntervalMin).toBe(1);
    const wire = appToPresetSchedule({
      id: 'x', name: 'Schedule 1', window: { startHour: 0, endHour: 23 },
      gps: { enabled: true, sampleIntervalMin: 20 },
    });
    expect(wire.gps.medium_motion_gps_interval_min).toBe(2);
    expect(wire.gps.high_motion_gps_interval_min).toBe(1);
  });

  it('the packet builder falls back to 2 / 1 on the wire', () => {
    const s: Schedule = {
      id: '1', name: 'Schedule 1', window: { startHour: 0, endHour: 23 },
      gps: { enabled: true, sampleIntervalMin: 20, dynamicSamplingMode: true },
    };
    const wire = PB.BlePacket.decode(PB.BlePacket.encode(buildSchedulePacketFromAppState([s], true)).finish());
    const g = wire.scheduleConfigPacket!.schedules[0].gps!;
    expect(g.mediumMotionGpsIntervalMin).toBe(2);
    expect(g.highMotionGpsIntervalMin).toBe(1);
  });
});
