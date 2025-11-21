import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Schedule } from "../navigation/ScheduleNavigator";
import { readInitialState } from "../ble/bleManager";
import { mapProtoSchedule } from "../utils/mapProtoSchedule";

/* ----------------------------------------------------------
 * Context Type
 * ---------------------------------------------------------- */
type SchedulesContextType = {
  schedules: Schedule[];
  loadSchedulesFromDevice: (device: any) => Promise<void>;
  updateSchedule: (id: string, updated: Schedule) => void;
  deleteSchedule: (id: string) => void;
  addSchedule: (schedule: Schedule) => void;
};

/* ----------------------------------------------------------
 * Context Setup
 * ---------------------------------------------------------- */
const SchedulesContext = createContext<SchedulesContextType | undefined>(
  undefined
);

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  /* ----------------------------------------------------------
   * Load schedules from BLE device
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log("📡 [Schedules] Reading initial schedule state from device…");

      const decoded = await readInitialState(device);
      const raw = decoded?.scheduleConfigPacket?.schedules;

      if (!raw) {
        console.warn("⚠️ No schedules found on device.");
        setSchedules([]);
        return;
      }

      const mapped: Schedule[] = raw.map((protoSchedule, index) =>
        mapProtoSchedule(protoSchedule, index)
      );

      console.log("📥 [Schedules] Loaded schedules from device:", mapped);
      setSchedules(mapped);
    } catch (err) {
      console.error("❌ Failed to load schedules from BLE:", err);
    }
  };

  /* ----------------------------------------------------------
   * Update a single schedule
   * ---------------------------------------------------------- */
  const updateSchedule = (id: string, updated: Schedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  /* ----------------------------------------------------------
   * Delete
   * ---------------------------------------------------------- */
  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  /* ----------------------------------------------------------
   * Add
   * ---------------------------------------------------------- */
  const addSchedule = (schedule: Schedule) => {
    setSchedules((prev) => [...prev, schedule]);
  };

  return (
    <SchedulesContext.Provider
      value={{
        schedules,
        loadSchedulesFromDevice,
        updateSchedule,
        deleteSchedule,
        addSchedule,
      }}
    >
      {children}
    </SchedulesContext.Provider>
  );
}

/* ----------------------------------------------------------
 * Hook
 * ---------------------------------------------------------- */
export function useSchedules() {
  const context = useContext(SchedulesContext);
  if (!context) {
    throw new Error("useSchedules must be used within SchedulesProvider");
  }
  return context;
}
