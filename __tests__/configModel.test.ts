/**
 * Pure-logic coverage for the website-parity update:
 *  - regenerated protos carry the new fields end-to-end,
 *  - the schedule packet builder minimizes disabled sensors,
 *  - equality survives that minimization,
 *  - the power model matches js/power-model.js semantics.
 */
import * as PB from '../src/proto/collar_pb.js';
import { mapProtoSchedule } from '../src/utils/mapProtoSchedule';
import { schedulesEqual } from '../src/utils/scheduleEquality';
import { radioEqual } from '../src/utils/radioEquality';
import {
  estimatePower,
  collarWarnings,
  SOLAR_CONDITIONS,
} from '../src/utils/powerEstimator';
import type { Schedule } from '../src/navigation/ScheduleNavigator';

// bleManager pulls in the BLE native module; stub it for pure-logic tests.
jest.mock('react-native-ble-plx', () => ({
  BleManager: class {},
  State: { PoweredOn: 'PoweredOn' },
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { buildSchedulePacketFromAppState } = require('../src/ble/bleManager');

const fullSchedule = (over: Partial<Schedule> = {}): Schedule => ({
  id: '1',
  name: 'Schedule 1',
  window: { startHour: 0, endHour: 11 },
  gps: {
    enabled: true,
    sampleIntervalMin: 20,
    accuracy: 5,
    dynamicSamplingMode: true,
    mediumMotionVedbaThresholdX100: 20,
    mediumMotionGpsIntervalMin: 10,
    highMotionVedbaThresholdX100: 100,
    highMotionGpsIntervalMin: 5,
    lorawanTxOnGpsFix: true,
    loraTxOnGpsFix: false,
  },
  light: { enabled: false, sampleIntervalMin: 10 },
  environmental: { enabled: true, sampleIntervalMin: 5 },
  particulate: { enabled: false, sampleIntervalMin: 15 },
  microphone: {
    enabled: false,
    continuousMode: false,
    sampleLengthMin: 1,
    sampleWindowMin: 10,
  },
  accelerometer: { enabled: true, sampleRate: 1, sensitivity: 2 },
  magnetometer: { enabled: false, sampleIntervalS: 60 },
  lorawan: { enabled: true, sendIntervalMin: 60 },
  lora: { enabled: false, sendIntervalMin: 60 },
  ...over,
});

describe('regenerated protos', () => {
  it('round-trips the dynamic-GPS fields on ScheduleConfig', () => {
    const msg = PB.ScheduleConfig.create({
      window: { startHour: 1, endHour: 2 },
      gps: PB.GPSConfig.create({
        enabled: true,
        sampleIntervalMin: 20,
        accuracy: 10,
        dynamicSamplingMode: true,
        mediumMotionVedbaThresholdX100: 25,
        mediumMotionGpsIntervalMin: 10,
        highMotionVedbaThresholdX100: 120,
        highMotionGpsIntervalMin: 4,
        lorawanTxOnGpsFix: true,
        loraTxOnGpsFix: true,
      }),
    });
    const decoded = PB.ScheduleConfig.decode(
      PB.ScheduleConfig.encode(msg).finish(),
    );
    const gps = decoded.gps!;
    expect(gps.dynamicSamplingMode).toBe(true);
    expect(gps.mediumMotionVedbaThresholdX100).toBe(25);
    expect(gps.mediumMotionGpsIntervalMin).toBe(10);
    expect(gps.highMotionVedbaThresholdX100).toBe(120);
    expect(gps.highMotionGpsIntervalMin).toBe(4);
    expect(gps.lorawanTxOnGpsFix).toBe(true);
    expect(gps.loraTxOnGpsFix).toBe(true);

    const mapped = mapProtoSchedule(decoded, 0);
    expect(mapped.gps?.dynamicSamplingMode).toBe(true);
    expect(mapped.gps?.highMotionGpsIntervalMin).toBe(4);
  });

  it('round-trips rx_listen and mortality on RadioConfigPacket', () => {
    const msg = PB.RadioConfigPacket.create({
      loRaConfig: PB.LoRaConfig.create({
        frequency: 915,
        syncWord: 0x12,
        rxListen: true,
      }),
      mortalityEnabled: true,
      mortalityConfig: PB.Mortality_config.create({
        triggerDurationHours: 48,
        transmitIntervalMin: 240,
      }),
    });
    const decoded = PB.RadioConfigPacket.decode(
      PB.RadioConfigPacket.encode(msg).finish(),
    );
    expect(decoded.loRaConfig.rxListen).toBe(true);
    expect(decoded.mortalityEnabled).toBe(true);
    expect(decoded.mortalityConfig.triggerDurationHours).toBe(48);
    expect(decoded.mortalityConfig.transmitIntervalMin).toBe(240);
  });

  it('exposes the BLE config tunnel + hw_diag fields', () => {
    // Not used by the app yet, but the schema must carry them so future
    // tunnel work (and hw_diag display) decodes collar blobs correctly.
    const pkt = PB.ScheduleConfigPacket.decode(
      PB.ScheduleConfigPacket.encode(
        PB.ScheduleConfigPacket.create({ bleQuery: 1 }),
      ).finish(),
    );
    expect(pkt.bleQuery).toBe(1);
    const sys = PB.SystemStatePacket.decode(
      PB.SystemStatePacket.encode(
        PB.SystemStatePacket.create({ hwDiag: 0x81 }),
      ).finish(),
    );
    expect(sys.hwDiag).toBe(0x81);
  });
});

describe('buildSchedulePacketFromAppState', () => {
  it('strips disabled sensors (website minimizeSchedule parity)', () => {
    const packet = buildSchedulePacketFromAppState([fullSchedule()], true);
    const wire = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish());
    const sched = wire.scheduleConfigPacket.schedules[0];

    // Disabled sensors are absent from the wire entirely.
    expect(sched.light).toBeFalsy();
    expect(sched.particulate).toBeFalsy();
    expect(sched.microphone).toBeFalsy();
    expect(sched.magnetometer).toBeFalsy();
    // Enabled ones survive with their settings.
    expect(sched.environmental.sampleIntervalMin).toBe(5);
    expect(sched.gps.dynamicSamplingMode).toBe(true);
    expect(sched.gps.lorawanTxOnGpsFix).toBe(true);
    expect(sched.accelerometer.sampleRate).toBe(1);
    expect(sched.lorawanEnabled).toBe(true);
    expect(sched.lorawanSendIntervalMin).toBe(60);
    expect(sched.loraEnabled).toBe(false);
    expect(sched.loraSendIntervalMin).toBe(0);
  });

  it('drops TX-on-fix when the matching radio is off', () => {
    const s = fullSchedule({
      lorawan: { enabled: false, sendIntervalMin: 60 },
    });
    const packet = buildSchedulePacketFromAppState([s], true);
    const sched = packet.scheduleConfigPacket.schedules[0];
    expect(sched.gps.lorawanTxOnGpsFix).toBe(false);
  });
});

describe('schedulesEqual', () => {
  it('treats a minimized readback as equal to the draft', () => {
    const draft = [fullSchedule()];
    const packet = buildSchedulePacketFromAppState(draft, true);
    const readback = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish())
      .scheduleConfigPacket.schedules;
    expect(schedulesEqual(draft, readback)).toBe(true);
  });

  it('flags a real difference', () => {
    const draft = [fullSchedule()];
    const packet = buildSchedulePacketFromAppState(
      [fullSchedule({ gps: { ...fullSchedule().gps!, sampleIntervalMin: 30 } })],
      true,
    );
    const readback = PB.BlePacket.decode(PB.BlePacket.encode(packet).finish())
      .scheduleConfigPacket.schedules;
    expect(schedulesEqual(draft, readback)).toBe(false);
  });
});

describe('radioEqual', () => {
  const base = () =>
    PB.RadioConfigPacket.create({
      loRaConfig: PB.LoRaConfig.create({ frequency: 915, rxListen: false }),
      mortalityEnabled: false,
    });

  it('detects rx_listen changes', () => {
    const a = base();
    const b = base();
    b.loRaConfig.rxListen = true;
    expect(radioEqual(a, b)).toBe(false);
  });

  it('detects mortality changes', () => {
    const a = base();
    const b = base();
    b.mortalityEnabled = true;
    b.mortalityConfig = PB.Mortality_config.create({
      triggerDurationHours: 48,
      transmitIntervalMin: 240,
    });
    expect(radioEqual(a, b)).toBe(false);
    expect(radioEqual(a, base())).toBe(true);
  });
});

describe('power model (js/power-model.js parity)', () => {
  const PANEL = 215 * 0.8; // panel_mw * charge_eff
  const toSh = (mw: number) => (mw * 24) / PANEL;

  it('weights dynamic GPS by the 70/20/10 activity split', () => {
    const s = fullSchedule({
      window: { startHour: 0, endHour: 23 },
      environmental: { enabled: false, sampleIntervalMin: 5 },
      accelerometer: { enabled: false, sampleRate: 0, sensitivity: 0 },
      lorawan: { enabled: false, sendIntervalMin: 60 },
    });
    const { components } = estimatePower([s]);
    // fix rate = 0.7/(20*60) + 0.2/(10*60) + 0.1/(5*60), medium accuracy 25 s
    const fixHz = 0.7 / 1200 + 0.2 / 600 + 0.1 / 300;
    const expected = toSh(36.3 * 25 * fixHz);
    expect(components.gps).toBeCloseTo(expected, 6);
  });

  it('couples radio cost to the GPS fix rate under TX-on-fix', () => {
    const s = fullSchedule({ window: { startHour: 0, endHour: 23 } });
    const { components } = estimatePower([s]);
    const fixHz = 0.7 / 1200 + 0.2 / 600 + 0.1 / 300;
    const expected = toSh(40.3 * 6.3 * fixHz);
    expect(components.lora).toBeCloseTo(expected, 6);
  });

  it('counts raw LoRa as radio cost (not just LoRaWAN)', () => {
    const s = fullSchedule({
      window: { startHour: 0, endHour: 23 },
      gps: { enabled: false },
      lorawan: { enabled: false, sendIntervalMin: 60 },
      lora: { enabled: true, sendIntervalMin: 30 },
    });
    const { components } = estimatePower([s]);
    const expected = toSh((40.3 * 6.3) / (30 * 60));
    expect(components.lora).toBeCloseTo(expected, 6);
  });

  it('ships the shared solar-conditions ladder', () => {
    expect(SOLAR_CONDITIONS.map(c => c.label)).toEqual([
      'Full sun',
      'Partly cloudy',
      'Overcast',
      'Open shade',
      'Dense canopy',
    ]);
  });

  it('warns on fast radio + mic like collar-vocab.js', () => {
    const w = collarWarnings(
      fullSchedule({
        microphone: {
          enabled: true,
          continuousMode: true,
          sampleLengthMin: 60,
          sampleWindowMin: 60,
        },
        lorawan: { enabled: true, sendIntervalMin: 5 },
      }),
    );
    expect(w).toHaveLength(2);
    expect(w[0]).toMatch(/Continuous audio/);
    expect(w[1]).toMatch(/Transmitting more often/);
  });
});
