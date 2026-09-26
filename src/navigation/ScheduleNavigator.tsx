import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SchedulesScreen from '../screens/SchedulesScreen';
import EditScheduleScreen from '../screens/EditScheduleScreen';
import SavedSchedulesScreen from '../screens/SavedSchedulesScreen';
import ZonesScreen from '../screens/ZonesScreen';
import EditZoneScreen from '../screens/EditZoneScreen';
import type { FenceForm } from '../utils/geofence';

/* -----------------------------------------------------
 * Shared Schedule Type
 * ----------------------------------------------------- */
export type Schedule = {
  id: string;
  /** Derived positional label ("Schedule N") — not user-editable. */
  name: string;
  window: { startHour: number; endHour: number };

  /* Sensor + System Configurations */
  light?: { enabled: boolean; sampleIntervalMin?: number };
  gps?: {
    enabled: boolean;
    sampleIntervalMin?: number;
    accuracy?: number;
    /* Dynamic (activity-based) sampling — thresholds are VeDBA in 0.01 g
     * units; the base interval above applies while the animal is still. */
    dynamicSamplingMode?: boolean;
    mediumMotionVedbaThresholdX100?: number;
    mediumMotionGpsIntervalMin?: number;
    highMotionVedbaThresholdX100?: number;
    highMotionGpsIntervalMin?: number;
    /* Transmit on every new GPS fix (per radio type). Lives on GPSConfig in
     * the proto, not on the radio fields. */
    lorawanTxOnGpsFix?: boolean;
    loraTxOnGpsFix?: boolean;
  };
  environmental?: { enabled: boolean; sampleIntervalMin?: number };
  particulate?: { enabled: boolean; sampleIntervalMin?: number };
  microphone?: {
    enabled: boolean;
    continuousMode?: boolean;
    sampleLengthMin?: number;
    sampleWindowMin?: number;
    /** MicSampleRate: 0 = 16 kHz (default), 1 = 8 kHz. Needs fw 338+. */
    sampleRate?: number;
    /** MicBitDepth: 0 = 16-bit (default), 1 = 8-bit. Needs fw 338+. */
    bitDepth?: number;
    /** MicSensitivity: 0 = Low (baseline), 1 = +6 dB, 2 = +12 dB. Fw 349+. */
    sensitivity?: number;
    /** MicCodec: 0 = WAV, 1 = FLAC (lossless, 16-bit at 8/16 kHz only — the
     *  collar records WAV at higher rates). Fw 380+. New slots start at 1
     *  (defaultScheduleSlot), and so does a mic switched on in the editor
     *  from off (slotMicCodec); on a mic that is on, absent still means 0,
     *  the proto3 default and what a collar predating the field records. */
    codec?: number;
    /** Low bits dropped from every sample before storing, 0-4. Lossy, ~6 dB
     *  of noise floor per bit; only affects FLAC takes. Fw 380+. */
    lsbDrop?: number;
  };
  accelerometer?: {
    enabled: boolean;
    sampleRate?: number;
    sensitivity?: number;
  };
  lorawan?: {
    enabled: boolean;
    sendIntervalMin?: number;
  };
  lora?: {
    enabled: boolean;
    sendIntervalMin?: number;
  };
  magnetometer?: {
    enabled: boolean;
    sampleIntervalS?: number;
    /** MagnetometerConfig.sample_rate_hz: 0 = interval mode (sampleIntervalS
     *  above), else 1 / 2 / 4 / 8 / 16 Hz. Fw MAG_RATE_MIN_FW_BUILD+; absent
     *  means 0, the proto3 default and what a collar predating the field
     *  runs. */
    sampleRateHz?: number;
  };
};

/* -----------------------------------------------------
 * Navigator Type
 * ----------------------------------------------------- */
export type ScheduleStackParamList = {
  Schedules: { device?: any } | undefined;
  EditSchedule: { schedule: Schedule; index: number };
  SavedSchedules: undefined;
  /** Geofence zones on the connected collar (utils/geofence.ts). */
  Zones: undefined;
  /** Add a zone, or edit one the collar holds (re-sent to the same slot). */
  EditZone: { form?: FenceForm } | undefined;
};

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

/* -----------------------------------------------------
 * Navigator Component
 * ----------------------------------------------------- */
export default function ScheduleNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Schedules" component={SchedulesScreen} />
      <Stack.Screen name="EditSchedule" component={EditScheduleScreen} />
      <Stack.Screen name="SavedSchedules" component={SavedSchedulesScreen} />
      <Stack.Screen name="Zones" component={ZonesScreen} />
      <Stack.Screen name="EditZone" component={EditZoneScreen} />
    </Stack.Navigator>
  );
}
