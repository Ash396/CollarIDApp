import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from 'react';

import type { Schedule } from '../navigation/ScheduleNavigator';
import { readInitialState, subscribeToUpdates } from '../ble/bleManager';
import { mapProtoSchedule } from '../utils/mapProtoSchedule';

type SchedulesContextType = {
  draftSchedules: Schedule[];
  collarSchedules: Schedule[];
  loadSchedulesFromDevice: (device: any) => Promise<void>;
  subscribeToScheduleUpdates: (device: any) => void;

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

  const updateSubscriptionRef = useRef<any>(null);

  /* ----------------------------------------------------------
   * Initial Load from Collar
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log('📡 [Schedules] Reading initial schedule state…');
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
      setDraftSchedules(mapped); // initial draft = collar truth
    } catch (err) {
      console.error('❌ Failed to load schedules:', err);
    }
  };

  /* ----------------------------------------------------------
   * Live BLE Updates (overwrite both states)
   * ---------------------------------------------------------- */
  const subscribeToScheduleUpdates = (device: any) => {
    updateSubscriptionRef.current?.remove();
    if (!device) return;
    updateSubscriptionRef.current = subscribeToUpdates(device, pkt => {
      if (pkt?.scheduleConfigPacket?.schedules) {
        const mapped = pkt.scheduleConfigPacket.schedules.map(mapProtoSchedule);
        console.log('🔔 [Schedules] LIVE update:', mapped);

        setCollarSchedules(mapped);
        setDraftSchedules(mapped); // BLE truth overrides draft
      }
    });
  };

  useEffect(() => {
    return () => {
      updateSubscriptionRef.current?.remove();
    };
  }, []);

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

export function useSchedules() {
  const ctx = useContext(SchedulesContext);
  if (!ctx) throw new Error('useSchedules must be used within provider.');
  return ctx;
}
