import * as PB from "../proto/message_pb";
import type { Schedule } from "../navigation/ScheduleNavigator";

export function mapProtoSchedule(p: PB.ScheduledConfig, index: number): Schedule {
  return {
    id: index.toString(),
    name: `Schedule ${index + 1}`,

    window: {
      startHour: p.window?.startHour ?? 0,
      endHour: p.window?.endHour ?? 0,
    },

    light: p.light
    ? {
        enabled: Boolean(p.light.enabled),
        sampleIntervalMin: p.light.sampleIntervalMin ?? undefined,
        }
    : undefined,

    gps: p.gps
    ? {
        enabled: Boolean(p.gps.enabled),
        sampleIntervalMin: p.gps.sampleIntervalMin ?? undefined,
        accuracy: p.gps.accuracy ?? undefined,
        }
    : undefined,

    environmental: p.environmental
    ? {
        enabled: Boolean(p.environmental.enabled),
        sampleIntervalMin: p.environmental.sampleIntervalMin ?? undefined,
        }
    : undefined,

    particulate: p.particulate
    ? {
        enabled: Boolean(p.particulate.enabled),
        sampleIntervalMin: p.particulate.sampleIntervalMin ?? undefined,
        }
    : undefined,

    microphone: p.microphone
    ? {
        enabled: Boolean(p.microphone.enabled),
        continuousMode: Boolean(p.microphone.continuousMode),
        sampleLengthMin: p.microphone.sampleLengthMin ?? undefined,
        sampleWindowMin: p.microphone.sampleWindowMin ?? undefined,
        }
    : undefined,

    accelerometer: p.accelerometer
    ? {
        enabled: Boolean(p.accelerometer.enabled),
        sampleRate: p.accelerometer.sampleRate ?? undefined,
        sensitivity: p.accelerometer.sensitivity ?? undefined,
        }
    : undefined,
    
    lorawan: {
      enabled: Boolean(p.lorawanEnabled),
      sendIntervalMin: p.lorawanSendIntervalMin ?? undefined,
    },

    magnetometer: p.magnetometer
      ? {
          enabled: Boolean(p.magnetometer.enabled),
          sampleIntervalS: p.magnetometer.sampleIntervalS ?? undefined,
        }
      : undefined,
  };
}
