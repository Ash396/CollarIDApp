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
  window: { start_hour: number; end_hour: number };

  /* Sensor + System Configurations */
  light?: { enabled: boolean; sample_interval_min?: number };
  gps?: { enabled: boolean; sample_interval_min?: number; accuracy?: number };
  environmental?: { enabled: boolean; sample_interval_min?: number };
  particulate?: { enabled: boolean; sample_interval_min?: number };
  radio?: {
    enabled: boolean;
    transmit_interval_min?: number;
    tx_only_on_new_gps_fix?: boolean;
    tx_power_dbm?: number;
  };
  microphone?: {
    enabled: boolean;
    continuous_mode?: boolean;
    sample_length_min?: number;
    sample_window_min?: number;
  };
  accelerometer?: {
    enabled: boolean;
    sample_rate?: number;
    sensitivity?: number;
  };
  firmware?: { version?: string };
};

/* -----------------------------------------------------
 * Navigator Type
 * ----------------------------------------------------- */
export type ScheduleStackParamList = {
  Schedules: undefined;
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
