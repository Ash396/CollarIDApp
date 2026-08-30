import * as PB from "../proto/collar_pb.js";
import type { Schedule } from "../navigation/ScheduleNavigator";

export function mapProtoSchedule(p: PB.ScheduleConfig, index: number): Schedule {
  const lorawanEnabled = Boolean(p.lorawanEnabled);
  const lorawanInterval = p.lorawanSendIntervalMin ?? undefined;

  const loraEnabled = Boolean(p.loraEnabled);
  const loraInterval = p.loraSendIntervalMin ?? undefined;

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
        dynamicSamplingMode: Boolean(p.gps.dynamicSamplingMode),
        mediumMotionVedbaThresholdX100:
          p.gps.mediumMotionVedbaThresholdX100 ?? undefined,
        mediumMotionGpsIntervalMin:
          p.gps.mediumMotionGpsIntervalMin ?? undefined,
        highMotionVedbaThresholdX100:
          p.gps.highMotionVedbaThresholdX100 ?? undefined,
        highMotionGpsIntervalMin: p.gps.highMotionGpsIntervalMin ?? undefined,
        lorawanTxOnGpsFix: Boolean(p.gps.lorawanTxOnGpsFix),
        loraTxOnGpsFix: Boolean(p.gps.loraTxOnGpsFix),
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
        sampleRate: p.microphone.sampleRate ?? 0,
        bitDepth: p.microphone.bitDepth ?? 0,
        sensitivity: p.microphone.sensitivity ?? 0,
        }
    : undefined,

    accelerometer: p.accelerometer
    ? {
        enabled: Boolean(p.accelerometer.enabled),
        sampleRate: p.accelerometer.sampleRate ?? undefined,
        sensitivity: p.accelerometer.sensitivity ?? undefined,
        }
    : undefined,

    lorawan: (lorawanEnabled || lorawanInterval !== undefined)
      ? { enabled: lorawanEnabled, sendIntervalMin: lorawanInterval }
      : undefined,


    lora: (loraEnabled || loraInterval !== undefined)
      ? { enabled: loraEnabled, sendIntervalMin: loraInterval }
      : undefined,

    magnetometer: p.magnetometer
      ? {
          enabled: Boolean(p.magnetometer.enabled),
          sampleIntervalS: p.magnetometer.sampleIntervalS ?? undefined,
        }
      : undefined,
  };
}
