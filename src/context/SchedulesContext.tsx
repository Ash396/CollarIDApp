import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

import type { Schedule } from '../navigation/ScheduleNavigator';
import { readInitialState } from '../ble/bleManager';
import { mapProtoSchedule } from '../utils/mapProtoSchedule';

type SchedulesContextType = {
  draftSchedules: Schedule[];
  collarSchedules: Schedule[];
  loadSchedulesFromDevice: (device: any) => Promise<void>;

  // draft mutators
  updateSchedule: (id: string, updated: Schedule) => void;
  deleteSchedule: (id: string) => void;
  addSchedule: (schedule: Schedule) => void;
};

const SchedulesContext = createContext<SchedulesContextType | undefined>(
  undefined,
);

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [draftSchedules, setDraftSchedules] = useState<Schedule[]>([]);
  const [collarSchedules, setCollarSchedules] = useState<Schedule[]>([]);

  /* ----------------------------------------------------------
   * Load from Collar (source of truth)
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log('📡 [Schedules] Reading schedule state…');
      const decoded = await readInitialState(device);
      const raw = decoded?.scheduleConfigPacket?.schedules;

      if (!raw) {
        console.warn('⚠️ No schedules found.');
        setDraftSchedules([]);
        setCollarSchedules([]);
        return;
      }

      const mapped = raw.map(mapProtoSchedule);
      console.log('📥 [Schedules] Loaded schedules:', mapped);

      setCollarSchedules(mapped);
      setDraftSchedules(mapped); // reset draft to device truth on load
    } catch (err) {
      console.error('❌ Failed to load schedules:', err);
    }
  };

  /* ----------------------------------------------------------
   * Draft Mutators
   * ---------------------------------------------------------- */
  const updateSchedule = (id: string, updated: Schedule) => {
    setDraftSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updated } : s)),
    );
  };

  const deleteSchedule = (id: string) => {
    setDraftSchedules(prev => prev.filter(s => s.id !== id));
  };

  const addSchedule = (schedule: Schedule) => {
    setDraftSchedules(prev => [...prev, schedule]);
  };

  return (
    <SchedulesContext.Provider
      value={{
        draftSchedules,
        collarSchedules,
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

export function useSchedules() {
  const ctx = useContext(SchedulesContext);
  if (!ctx) throw new Error('useSchedules must be used within provider.');
  return ctx;
}
