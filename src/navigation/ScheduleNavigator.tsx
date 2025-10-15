import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SchedulesScreen from "../screens/SchedulesScreen";
import EditScheduleScreen from "../screens/EditScheduleScreen";

export type Schedule = {
  id: string;
  name: string;
  window: { start_hour: number; end_hour: number };
  light?: { enabled: boolean; sample_interval_min?: number };
  gps?: { enabled: boolean; sample_interval_min?: number };
  microphone?: { enabled: boolean; continuous_mode?: boolean };
  accelerometer?: { enabled: boolean };
};

export type ScheduleStackParamList = {
  Schedules: undefined;
  EditSchedule: { schedule: Schedule };
};

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export default function ScheduleNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Schedules" component={SchedulesScreen} />
      <Stack.Screen name="EditSchedule" component={EditScheduleScreen} />
    </Stack.Navigator>
  );
}
