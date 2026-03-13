import React, { createContext, useContext, useState, ReactNode } from 'react';

import type { Schedule } from '../navigation/ScheduleNavigator';
import { readSchedulesFromDevice } from '../ble/bleManager';
import { mapProtoSchedule } from '../utils/mapProtoSchedule';

type SchedulesContextType = {
  draftSchedules: Schedule[];
  collarSchedules: Schedule[];

  // engaged flag (system on/off)
  draftEngaged: boolean | null;
  collarEngaged: boolean | null;
  setDraftEngaged: (v: boolean | null) => void;

  loadSchedulesFromDevice: (device: any) => Promise<void>;
  clearSchedulesState: () => void;

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

  const [draftEngaged, setDraftEngaged] = useState<boolean | null>(null);
  const [collarEngaged, setCollarEngaged] = useState<boolean | null>(null);

  const clearSchedulesState = () => {
    setDraftSchedules([]);
    setCollarSchedules([]);
    setDraftEngaged(null);
    setCollarEngaged(null);
  };

  /* ----------------------------------------------------------
   * Load from Collar (source of truth)
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log('📡 [Schedules] Reading schedule state…');

      const res = await readSchedulesFromDevice(device);
      if (!res) {
        console.warn('⚠️ No schedule packet found (or not readable).');
        setCollarSchedules([]);
        setCollarEngaged(null);
        setDraftSchedules([]);
        setDraftEngaged(null);
        return;
      }

      const mapped = (res.schedules ?? []).map(mapProtoSchedule);
      const engaged = Boolean(res.engaged);

      console.log('📥 [Schedules] Loaded schedules:', mapped);

      // Current connected collar is the source of truth
      setCollarSchedules(mapped);
      setCollarEngaged(engaged);
      setDraftSchedules(mapped);
      setDraftEngaged(engaged);
    } catch (err) {
      console.error('❌ Failed to load schedules:', err);
      setCollarSchedules([]);
      setCollarEngaged(null);
      setDraftSchedules([]);
      setDraftEngaged(null);
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
        draftEngaged,
        collarEngaged,
        setDraftEngaged,
        loadSchedulesFromDevice,
        clearSchedulesState,
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
