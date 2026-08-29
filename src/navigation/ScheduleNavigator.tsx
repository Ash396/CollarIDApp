import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SchedulesScreen from '../screens/SchedulesScreen';
import EditScheduleScreen from '../screens/EditScheduleScreen';
import SavedSchedulesScreen from '../screens/SavedSchedulesScreen';

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
  };
};

/* -----------------------------------------------------
 * Navigator Type
 * ----------------------------------------------------- */
export type ScheduleStackParamList = {
  Schedules: { device?: any } | undefined;
  EditSchedule: { schedule: Schedule; index: number };
  SavedSchedules: undefined;
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
    </Stack.Navigator>
  );
}
