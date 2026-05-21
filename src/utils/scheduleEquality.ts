import * as PB from '../proto/collar_pb.js';
import type { Schedule } from '../navigation/ScheduleNavigator';
import { mapProtoSchedule } from './mapProtoSchedule';

function normalizeScheduleApp(s: Schedule) {
  return {
    window: { startHour: s.window.startHour ?? 0, endHour: s.window.endHour ?? 0 },
    light: { enabled: !!s.light?.enabled, sampleIntervalMin: s.light?.sampleIntervalMin ?? 0 },
    environmental: { enabled: !!s.environmental?.enabled, sampleIntervalMin: s.environmental?.sampleIntervalMin ?? 0 },
    particulate: { enabled: !!s.particulate?.enabled, sampleIntervalMin: s.particulate?.sampleIntervalMin ?? 0 },
    gps: { enabled: !!s.gps?.enabled, sampleIntervalMin: s.gps?.sampleIntervalMin ?? 0, accuracy: s.gps?.accuracy ?? 0 },
    microphone: {
      enabled: !!s.microphone?.enabled,
      continuousMode: !!s.microphone?.continuousMode,
      sampleLengthMin: s.microphone?.sampleLengthMin ?? 0,
      sampleWindowMin: s.microphone?.sampleWindowMin ?? 0,
    },
    accelerometer: {
      enabled: !!s.accelerometer?.enabled,
      sampleRate: s.accelerometer?.sampleRate ?? 0,
      sensitivity: s.accelerometer?.sensitivity ?? 0,
    },
    magnetometer: { enabled: !!s.magnetometer?.enabled, sampleIntervalS: s.magnetometer?.sampleIntervalS ?? 0 },
    lorawan: { enabled: !!s.lorawan?.enabled, sendIntervalMin: s.lorawan?.sendIntervalMin ?? 0 },
    lora: { enabled: !!s.lora?.enabled, sendIntervalMin: s.lora?.sendIntervalMin ?? 0 },
  };
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
