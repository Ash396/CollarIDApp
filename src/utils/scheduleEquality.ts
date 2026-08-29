import * as PB from '../proto/collar_pb.js';
import type { Schedule } from '../navigation/ScheduleNavigator';
import { mapProtoSchedule } from './mapProtoSchedule';

// Normalization mirrors the wire format: disabled sensors are stripped from
// the packet entirely (see minimizeSchedule in bleManager), so a disabled
// sensor's parameters never round-trip. Zero them on both sides or every
// send would false-alarm as a mismatch.
function normalizeScheduleApp(s: Schedule) {
  const gpsOn = !!s.gps?.enabled;
  const dynOn = gpsOn && !!s.gps?.dynamicSamplingMode;
  return {
    window: { startHour: s.window.startHour ?? 0, endHour: s.window.endHour ?? 0 },
    light: {
      enabled: !!s.light?.enabled,
      sampleIntervalMin: s.light?.enabled ? s.light?.sampleIntervalMin ?? 0 : 0,
    },
    environmental: {
      enabled: !!s.environmental?.enabled,
      sampleIntervalMin: s.environmental?.enabled ? s.environmental?.sampleIntervalMin ?? 0 : 0,
    },
    particulate: {
      enabled: !!s.particulate?.enabled,
      sampleIntervalMin: s.particulate?.enabled ? s.particulate?.sampleIntervalMin ?? 0 : 0,
    },
    gps: {
      enabled: gpsOn,
      sampleIntervalMin: gpsOn ? s.gps?.sampleIntervalMin ?? 0 : 0,
      accuracy: gpsOn ? s.gps?.accuracy ?? 0 : 0,
      dynamicSamplingMode: dynOn,
      mediumMotionVedbaThresholdX100: dynOn ? s.gps?.mediumMotionVedbaThresholdX100 ?? 0 : 0,
      mediumMotionGpsIntervalMin: dynOn ? s.gps?.mediumMotionGpsIntervalMin ?? 0 : 0,
      highMotionVedbaThresholdX100: dynOn ? s.gps?.highMotionVedbaThresholdX100 ?? 0 : 0,
      highMotionGpsIntervalMin: dynOn ? s.gps?.highMotionGpsIntervalMin ?? 0 : 0,
      lorawanTxOnGpsFix: gpsOn && !!s.lorawan?.enabled && !!s.gps?.lorawanTxOnGpsFix,
      loraTxOnGpsFix: gpsOn && !!s.lora?.enabled && !!s.gps?.loraTxOnGpsFix,
    },
    microphone: {
      enabled: !!s.microphone?.enabled,
      continuousMode: !!s.microphone?.enabled && !!s.microphone?.continuousMode,
      sampleLengthMin: s.microphone?.enabled ? s.microphone?.sampleLengthMin ?? 0 : 0,
      sampleWindowMin: s.microphone?.enabled ? s.microphone?.sampleWindowMin ?? 0 : 0,
      // Must be normalized, not omitted. Omit them and a real 8 kHz change
      // never reads as dirty, so Send appears to do nothing; include them
      // without the `?? 0` and a collar that predates the fields (which
      // echoes nothing back) compares unequal forever, leaving the draft
      // permanently dirty and the verify-after-write reporting a false
      // failure.
      sampleRate: s.microphone?.enabled ? s.microphone?.sampleRate ?? 0 : 0,
      bitDepth: s.microphone?.enabled ? s.microphone?.bitDepth ?? 0 : 0,
    },
    accelerometer: {
      enabled: !!s.accelerometer?.enabled,
      sampleRate: s.accelerometer?.enabled ? s.accelerometer?.sampleRate ?? 0 : 0,
      sensitivity: s.accelerometer?.enabled ? s.accelerometer?.sensitivity ?? 0 : 0,
    },
    magnetometer: {
      enabled: !!s.magnetometer?.enabled,
      sampleIntervalS: s.magnetometer?.enabled ? s.magnetometer?.sampleIntervalS ?? 0 : 0,
    },
    lorawan: {
      enabled: !!s.lorawan?.enabled,
      sendIntervalMin: s.lorawan?.enabled ? s.lorawan?.sendIntervalMin ?? 0 : 0,
    },
    lora: {
      enabled: !!s.lora?.enabled,
      sendIntervalMin: s.lora?.enabled ? s.lora?.sendIntervalMin ?? 0 : 0,
    },
  };
}

/** Compare two app-shaped schedule sets (draft vs collar / persisted vs
 *  fresh) under the same wire-level normalization as the BLE verify path,
 *  so a stray disabled-sensor parameter never reads as "unsaved changes". */
export function appSchedulesEqual(a: Schedule[], b: Schedule[]): boolean {
  const byWindow = (
    x: ReturnType<typeof normalizeScheduleApp>,
    y: ReturnType<typeof normalizeScheduleApp>,
  ) =>
    x.window.startHour - y.window.startHour ||
    x.window.endHour - y.window.endHour;
  const A = a.map(normalizeScheduleApp).sort(byWindow);
  const B = b.map(normalizeScheduleApp).sort(byWindow);
  return JSON.stringify(A) === JSON.stringify(B);
}

export function schedulesEqual(
  draft: Schedule[],
  readbackProto: PB.ScheduleConfig[],
) {
  const readbackApp = readbackProto.map(mapProtoSchedule);

  // Order-independent compare keyed on the time window. The schedule name is
  // a derived positional label ("Schedule N"), not part of the device
  // config, so it must not factor into equality.
  const byWindow = (
    x: ReturnType<typeof normalizeScheduleApp>,
    y: ReturnType<typeof normalizeScheduleApp>,
  ) =>
    x.window.startHour - y.window.startHour ||
    x.window.endHour - y.window.endHour;

  const A = draft.map(normalizeScheduleApp).sort(byWindow);
  const B = readbackApp.map(normalizeScheduleApp).sort(byWindow);

  return JSON.stringify(A) === JSON.stringify(B);
}
