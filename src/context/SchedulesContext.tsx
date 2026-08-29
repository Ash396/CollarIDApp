import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Schedule } from '../navigation/ScheduleNavigator';
import { readSchedulesFromDevice } from '../ble/bleManager';
import { mapProtoSchedule } from '../utils/mapProtoSchedule';
import { appSchedulesEqual } from '../utils/scheduleEquality';

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
  /** Replace the whole draft set (loading a saved preset). */
  replaceDraft: (schedules: Schedule[]) => void;
  /** Throw away local edits and go back to what the collar reports. */
  discardDraft: () => void;

  /** True when the draft differs from the collar's stored config. */
  isDirty: boolean;
};

const SchedulesContext = createContext<SchedulesContextType | undefined>(
  undefined,
);

// Drafts survive app restarts, keyed per collar (the name carries the system
// UID, so the key is stable across phones; fall back to the BLE id).
const draftKey = (device: any) =>
  `draft.sched.${device?.name ?? device?.id ?? 'unknown'}`;

export function SchedulesProvider({ children }: { children: ReactNode }) {
  const [draftSchedules, setDraftSchedules] = useState<Schedule[]>([]);
  const [collarSchedules, setCollarSchedules] = useState<Schedule[]>([]);

  const [draftEngaged, setDraftEngagedState] = useState<boolean | null>(null);
  const [collarEngaged, setCollarEngaged] = useState<boolean | null>(null);

  // Persistence target for the currently-loaded collar.
  const storageKeyRef = useRef<string | null>(null);

  const persist = (schedules: Schedule[], engaged: boolean | null) => {
    const key = storageKeyRef.current;
    if (!key) return;
    AsyncStorage.setItem(key, JSON.stringify({ schedules, engaged })).catch(
      () => {},
    );
  };

  const clearSchedulesState = () => {
    setDraftSchedules([]);
    setCollarSchedules([]);
    setDraftEngagedState(null);
    setCollarEngaged(null);
  };

  /* ----------------------------------------------------------
   * Load from Collar (source of truth) + restore persisted draft
   * ---------------------------------------------------------- */
  const loadSchedulesFromDevice = async (device: any) => {
    try {
      console.log('📡 [Schedules] Reading schedule state…');
      storageKeyRef.current = draftKey(device);

      const res = await readSchedulesFromDevice(device);
      if (!res) {
        console.warn('⚠️ No schedule packet found (or not readable).');
        clearSchedulesState();
        return;
      }

      const mapped = (res.schedules ?? []).map(mapProtoSchedule);
      const engaged = Boolean(res.engaged);

      setCollarSchedules(mapped);
      setCollarEngaged(engaged);

      // A draft persisted for THIS collar survives disconnects and app
      // restarts. Restore it unless it matches what the collar now holds
      // (in which case it has been delivered — drop the stale copy).
      let restored = false;
      try {
        const raw = await AsyncStorage.getItem(storageKeyRef.current);
        if (raw) {
          const saved = JSON.parse(raw);
          const savedSchedules: Schedule[] = saved?.schedules ?? [];
          const savedEngaged: boolean | null = saved?.engaged ?? null;
          const differs =
            !appSchedulesEqual(savedSchedules, mapped) ||
            (savedEngaged !== null && savedEngaged !== engaged);
          if (differs) {
            setDraftSchedules(savedSchedules);
            setDraftEngagedState(savedEngaged ?? engaged);
            restored = true;
            console.log('📥 [Schedules] Restored persisted draft');
          } else {
            AsyncStorage.removeItem(storageKeyRef.current).catch(() => {});
          }
        }
      } catch (_) {
        /* unreadable persisted draft — fall through to collar state */
      }

      if (!restored) {
        setDraftSchedules(mapped);
        setDraftEngagedState(engaged);
      }
    } catch (err) {
      console.error('❌ Failed to load schedules:', err);
      clearSchedulesState();
    }
  };

  /* ----------------------------------------------------------
   * Draft Mutators (each persists the new draft)
   * ---------------------------------------------------------- */
  const setDraftEngaged = (v: boolean | null) => {
    setDraftEngagedState(v);
    persist(draftSchedules, v);
  };

  const updateSchedule = (id: string, updated: Schedule) => {
    setDraftSchedules(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, ...updated } : s));
      persist(next, draftEngaged);
      return next;
    });
  };

  const deleteSchedule = (id: string) => {
    setDraftSchedules(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next, draftEngaged);
      return next;
    });
  };

  const addSchedule = (schedule: Schedule) => {
    setDraftSchedules(prev => {
      const next = [...prev, schedule];
      persist(next, draftEngaged);
      return next;
    });
  };

  const replaceDraft = (schedules: Schedule[]) => {
    setDraftSchedules(schedules);
    persist(schedules, draftEngaged);
  };

  const discardDraft = () => {
    const back = JSON.parse(JSON.stringify(collarSchedules));
    setDraftSchedules(back);
    setDraftEngagedState(collarEngaged);
    const key = storageKeyRef.current;
    if (key) AsyncStorage.removeItem(key).catch(() => {});
  };

  const isDirty =
    collarEngaged !== null &&
    (!appSchedulesEqual(draftSchedules, collarSchedules) ||
      (draftEngaged !== null && draftEngaged !== collarEngaged));

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
        replaceDraft,
        discardDraft,
        isDirty,
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
