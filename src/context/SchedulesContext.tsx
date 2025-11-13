import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Schedule } from "../navigation/ScheduleNavigator";

type SchedulesContextType = {
  schedules: Schedule[];
  updateSchedule: (id: string, updated: Schedule) => void;
  deleteSchedule: (id: string) => void;
  addSchedule: (schedule: Schedule) => void;
};

const SchedulesContext = createContext<SchedulesContextType | undefined>(
  undefined
);

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([
  {
    id: "1",
    name: "Day Mode",
    window: { startHour: 6, endHour: 20 },
    light: { enabled: true, sampleIntervalMin: 30 },
    gps: { enabled: true, sampleIntervalMin: 20 },
  },
  {
    id: "2",
    name: "Night Mode",
    window: { startHour: 20, endHour: 6 },
    gps: { enabled: true, sampleIntervalMin: 10 },
    microphone: { enabled: true, continuousMode: true },
  },
]);

  const updateSchedule = (id: string, updated: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const addSchedule = (schedule: Schedule) => {
    setSchedules((prev) => [...prev, schedule]);
  };

  return (
    <SchedulesContext.Provider
      value={{ schedules, updateSchedule, deleteSchedule, addSchedule }}
    >
      {children}
    </SchedulesContext.Provider>
  );
}

export function useSchedules() {
  const context = useContext(SchedulesContext);
  if (!context)
    throw new Error("useSchedules must be used within SchedulesProvider");
  return context;
}
