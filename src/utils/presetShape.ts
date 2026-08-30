// Saved-preset schedule shape converters.
//
// The server stores presets in the WEBSITE configurator's shape — snake_case
// keys matching the proto field names (window.start_hour, gps.sample_interval_min,
// lorawan_enabled, ...). The app's internal Schedule type is camelCase with
// radio settings nested under lorawan/lora. Converting at the preset boundary
// keeps presets fully interchangeable between the app and configure.html.
import type { Schedule } from '../navigation/ScheduleNavigator';

/** App Schedule -> website snake_case preset schedule. Always emits the full
 *  shape (like the website's readModalSchedule) so a preset saved from the
 *  app looks identical to one saved from the web. */
export function appToPresetSchedule(s: Schedule): any {
  return {
    window: {
      start_hour: s.window.startHour ?? 0,
      end_hour: s.window.endHour ?? 23,
    },
    gps: {
      enabled: !!s.gps?.enabled,
      sample_interval_min: s.gps?.sampleIntervalMin ?? 20,
      accuracy: s.gps?.accuracy ?? 5,
      dynamic_sampling_mode: !!s.gps?.dynamicSamplingMode,
      medium_motion_vedba_threshold_x100:
        s.gps?.mediumMotionVedbaThresholdX100 ?? 20,
      medium_motion_gps_interval_min: s.gps?.mediumMotionGpsIntervalMin ?? 10,
      high_motion_vedba_threshold_x100:
        s.gps?.highMotionVedbaThresholdX100 ?? 100,
      high_motion_gps_interval_min: s.gps?.highMotionGpsIntervalMin ?? 5,
      lorawan_tx_on_gps_fix: !!s.gps?.lorawanTxOnGpsFix,
      lora_tx_on_gps_fix: !!s.gps?.loraTxOnGpsFix,
    },
    light: {
      enabled: !!s.light?.enabled,
      sample_interval_min: s.light?.sampleIntervalMin ?? 10,
    },
    environmental: {
      enabled: !!s.environmental?.enabled,
      sample_interval_min: s.environmental?.sampleIntervalMin ?? 5,
    },
    particulate: {
      enabled: !!s.particulate?.enabled,
      sample_interval_min: s.particulate?.sampleIntervalMin ?? 15,
    },
    microphone: {
      enabled: !!s.microphone?.enabled,
      continuous_mode: !!s.microphone?.continuousMode,
      sample_length_min: s.microphone?.sampleLengthMin ?? 1,
      sample_window_min: s.microphone?.sampleWindowMin ?? 10,
      // snake_case keys matching the website's preset shape, so a preset
      // saved in one editor keeps its audio format when loaded in the other.
      sample_rate: s.microphone?.sampleRate ?? 0,
      bit_depth: s.microphone?.bitDepth ?? 0,
      sensitivity: s.microphone?.sensitivity ?? 0,
    },
    accelerometer: {
      enabled: !!s.accelerometer?.enabled,
      sample_rate: s.accelerometer?.sampleRate ?? 0,
      sensitivity: s.accelerometer?.sensitivity ?? 0,
    },
    magnetometer: {
      enabled: !!s.magnetometer?.enabled,
      sample_interval_s: s.magnetometer?.sampleIntervalS ?? 60,
    },
    lorawan_enabled: !!s.lorawan?.enabled,
    lorawan_send_interval_min: s.lorawan?.sendIntervalMin ?? 60,
    lora_enabled: !!s.lora?.enabled,
    lora_send_interval_min: s.lora?.sendIntervalMin ?? 60,
  };
}

/** Website snake_case preset schedule -> app Schedule. Tolerant of missing
 *  sub-objects (device-sourced sets are minimized: proto3 omits disabled
 *  sensors), falling back to the same defaults the website editor uses. */
export function presetToAppSchedule(x: any, index: number): Schedule {
  const w = x?.window || {};
  const gps = x?.gps || {};
  return {
    id: `preset-${Date.now()}-${index}`,
    name: `Schedule ${index + 1}`,
    window: {
      startHour: Number(w.start_hour ?? 0),
      endHour: Number(w.end_hour ?? 23),
    },
    gps: {
      enabled: !!gps.enabled,
      sampleIntervalMin: Number(gps.sample_interval_min ?? 20),
      accuracy: Number(gps.accuracy ?? 5),
      dynamicSamplingMode: !!gps.dynamic_sampling_mode,
      mediumMotionVedbaThresholdX100: Number(
        gps.medium_motion_vedba_threshold_x100 ?? 20,
      ),
      mediumMotionGpsIntervalMin: Number(
        gps.medium_motion_gps_interval_min ?? 10,
      ),
      highMotionVedbaThresholdX100: Number(
        gps.high_motion_vedba_threshold_x100 ?? 100,
      ),
      highMotionGpsIntervalMin: Number(gps.high_motion_gps_interval_min ?? 5),
      lorawanTxOnGpsFix: !!gps.lorawan_tx_on_gps_fix,
      loraTxOnGpsFix: !!gps.lora_tx_on_gps_fix,
    },
    light: {
      enabled: !!x?.light?.enabled,
      sampleIntervalMin: Number(x?.light?.sample_interval_min ?? 10),
    },
    environmental: {
      enabled: !!x?.environmental?.enabled,
      sampleIntervalMin: Number(x?.environmental?.sample_interval_min ?? 5),
    },
    particulate: {
      enabled: !!x?.particulate?.enabled,
      sampleIntervalMin: Number(x?.particulate?.sample_interval_min ?? 15),
    },
    microphone: {
      enabled: !!x?.microphone?.enabled,
      continuousMode: !!x?.microphone?.continuous_mode,
      sampleLengthMin: Number(x?.microphone?.sample_length_min ?? 1),
      sampleWindowMin: Number(x?.microphone?.sample_window_min ?? 10),
      sampleRate: Number(x?.microphone?.sample_rate ?? 0),
      bitDepth: Number(x?.microphone?.bit_depth ?? 0),
      sensitivity: Number(x?.microphone?.sensitivity ?? 0),
    },
    accelerometer: {
      enabled: !!x?.accelerometer?.enabled,
      sampleRate: Number(x?.accelerometer?.sample_rate ?? 0),
      sensitivity: Number(x?.accelerometer?.sensitivity ?? 0),
    },
    magnetometer: {
      enabled: !!x?.magnetometer?.enabled,
      sampleIntervalS: Number(x?.magnetometer?.sample_interval_s ?? 60),
    },
    lorawan: {
      enabled: !!x?.lorawan_enabled,
      sendIntervalMin: Number(x?.lorawan_send_interval_min ?? 60),
    },
    lora: {
      enabled: !!x?.lora_enabled,
      sendIntervalMin: Number(x?.lora_send_interval_min ?? 60),
    },
  };
}
