import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SchedulesScreen from "../screens/SchedulesScreen";
import EditScheduleScreen from "../screens/EditScheduleScreen";

/* -----------------------------------------------------
 * Shared Schedule Type
 * ----------------------------------------------------- */
export type Schedule = {
  id: string;
  name: string;
  window: { startHour: number; endHour: number };

  /* Sensor + System Configurations */
  light?: { enabled: boolean; sampleIntervalMin?: number };
  gps?: { enabled: boolean; sampleIntervalMin?: number; accuracy?: number };
  environmental?: { enabled: boolean; sampleIntervalMin?: number };
  particulate?: { enabled: boolean; sampleIntervalMin?: number };
  microphone?: {
    enabled: boolean;
    continuousMode?: boolean;
    sampleLengthMin?: number;
    sampleWindowMin?: number;
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
  EditSchedule: { schedule: Schedule };
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
    </Stack.Navigator>
  );
}
