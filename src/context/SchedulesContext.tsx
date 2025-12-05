import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";

import type { Schedule } from "../navigation/ScheduleNavigator";
import {
  readInitialState,
  subscribeToUpdates,
} from "../ble/bleManager";
import { mapProtoSchedule } from "../utils/mapProtoSchedule";

/* ----------------------------------------------------------
 * Context Type
 * ---------------------------------------------------------- */

type SchedulesContextType = {
  schedules: Schedule[];
  loadSchedulesFromDevice: (device: any) => Promise<void>;
  subscribeToScheduleUpdates: (device: any) => void;
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
  const updateSubscriptionRef = useRef<any>(null);

  /* ----------------------------------------------------------
   * Load schedules (initial read)
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log("📡 [Schedules] Reading initial schedule state…");

      const decoded = await readInitialState(device);
      const raw = decoded?.scheduleConfigPacket?.schedules;

      if (!raw) {
        console.warn("⚠️ No schedules found.");
        setSchedules([]);
        return;
      }

      const mapped = raw.map((proto, index) =>
        mapProtoSchedule(proto, index)
      );

      console.log("📥 [Schedules] Initial schedules:", mapped);
      setSchedules(mapped);
    } catch (err) {
      console.error("❌ Failed to load schedules:", err);
    }
  };

  /* ----------------------------------------------------------
   * Live updates via UPDATE characteristic
   * ---------------------------------------------------------- */
  const subscribeToScheduleUpdates = (device: any) => {
    // Remove previous subscription if any
    updateSubscriptionRef.current?.remove();

    updateSubscriptionRef.current = subscribeToUpdates(device, (pkt) => {
      if (pkt?.scheduleConfigPacket?.schedules) {
        console.log("🔔 [Schedules] LIVE update:", pkt);

        const mapped = pkt.scheduleConfigPacket.schedules.map(
          mapProtoSchedule
        );

        setSchedules(mapped);
      }
    });
  };

  /* ----------------------------------------------------------
   * Cleanup on unmount
   * ---------------------------------------------------------- */
  useEffect(() => {
    return () => {
      updateSubscriptionRef.current?.remove();
    };
  }, []);

  /* ----------------------------------------------------------
   * Mutators
   * ---------------------------------------------------------- */

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
      value={{
        schedules,
        loadSchedulesFromDevice,
        subscribeToScheduleUpdates,
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
  const ctx = useContext(SchedulesContext);
  if (!ctx) throw new Error("useSchedules must be used within provider.");
  return ctx;
}
