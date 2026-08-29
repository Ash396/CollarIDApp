import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
} from 'react';
import type { Device } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as PB from '../proto/collar_pb.js';
import { readRadioState } from '../ble/bleManager';
import { radioEqual } from '../utils/radioEquality';

type RadioConfigContextType = {
  draftRadioConfig: PB.RadioConfigPacket | null;
  deviceRadioConfig: PB.RadioConfigPacket | null;

  setDraftRadioConfig: (cfg: PB.RadioConfigPacket | null) => void;

  loadRadioFromDevice: (device: Device) => Promise<void>;
  /** Forget everything about the last collar (on disconnect). */
  clearRadioState: () => void;
  /** Throw away the local draft and go back to the device's config. */
  discardRadioDraft: () => void;

  /** True when a draft exists and differs from the device's config. */
  isDirty: boolean;
};

const RadioConfigContext = createContext<RadioConfigContextType | undefined>(
  undefined,
);

// Persisted per collar (device name carries the system UID).
const draftKey = (device: any) =>
  `draft.radio.${device?.name ?? device?.id ?? 'unknown'}`;

export function RadioConfigProvider({ children }: { children: ReactNode }) {
  const [draftRadioConfig, setDraftState] =
    useState<PB.RadioConfigPacket | null>(null);

  const [deviceRadioConfig, setDeviceRadioConfig] =
    useState<PB.RadioConfigPacket | null>(null);

  const storageKeyRef = useRef<string | null>(null);

  const persist = (cfg: PB.RadioConfigPacket | null) => {
    const key = storageKeyRef.current;
    if (!key) return;
    if (!cfg) {
      AsyncStorage.removeItem(key).catch(() => {});
      return;
    }
    const b64 = Buffer.from(PB.RadioConfigPacket.encode(cfg).finish()).toString(
      'base64',
    );
    AsyncStorage.setItem(key, b64).catch(() => {});
  };

  const setDraftRadioConfig = (cfg: PB.RadioConfigPacket | null) => {
    setDraftState(cfg);
    persist(cfg);
  };

  /* ----------------------------------------------------------
   * Load from Collar (source of truth) + restore persisted draft
   * ---------------------------------------------------------- */
  const loadRadioFromDevice = async (device: Device) => {
    try {
      console.log('📡 [Radio] Reading radio state…');
      storageKeyRef.current = draftKey(device);
      const decoded = await readRadioState(device);
      const raw = decoded?.radioConfigPacket ?? null;

      let deviceCopy: PB.RadioConfigPacket | null = null;
      if (raw) {
        const encoded = PB.RadioConfigPacket.encode(raw).finish();
        deviceCopy = PB.RadioConfigPacket.decode(encoded);
        setDeviceRadioConfig(deviceCopy);
      } else {
        console.warn('⚠️ [Radio] No radio config found.');
        setDeviceRadioConfig(null);
      }

      // Load is AUTHORITATIVE for the draft: the only unsent edits worth
      // keeping live in AsyncStorage under THIS collar's key (every edit is
      // persisted). Never fall back to the in-memory draft — that's how a
      // previous collar's draft used to leak into the next one and read as
      // phantom "unsent changes".
      try {
        const rawSaved = await AsyncStorage.getItem(storageKeyRef.current);
        if (rawSaved) {
          const saved = PB.RadioConfigPacket.decode(
            new Uint8Array(Buffer.from(rawSaved, 'base64')),
          );
          if (deviceCopy && radioEqual(saved, deviceCopy)) {
            // Delivered — drop the stale persisted copy.
            AsyncStorage.removeItem(storageKeyRef.current).catch(() => {});
          } else {
            setDraftState(saved);
            console.log('📥 [Radio] Restored persisted draft');
            return;
          }
        }
      } catch (_) {
        /* unreadable persisted draft — fall through */
      }

      if (deviceCopy) {
        setDraftState(
          PB.RadioConfigPacket.decode(
            PB.RadioConfigPacket.encode(deviceCopy).finish(),
          ),
        );
      } else {
        setDraftState(null);
      }
    } catch (err) {
      console.error('❌ [Radio] Failed to load radio config:', err);
    }
  };

  // On disconnect: nothing about the collar that just left may carry over
  // to the next one (the persisted per-collar draft stays on disk and is
  // restored if that same collar comes back).
  const clearRadioState = () => {
    storageKeyRef.current = null;
    setDraftState(null);
    setDeviceRadioConfig(null);
  };

  const discardRadioDraft = () => {
    const key = storageKeyRef.current;
    if (key) AsyncStorage.removeItem(key).catch(() => {});
    if (deviceRadioConfig) {
      setDraftState(
        PB.RadioConfigPacket.decode(
          PB.RadioConfigPacket.encode(deviceRadioConfig).finish(),
        ),
      );
    } else {
      setDraftState(null);
    }
  };

  const isDirty =
    !!draftRadioConfig &&
    !!deviceRadioConfig &&
    !radioEqual(draftRadioConfig, deviceRadioConfig);

  return (
    <RadioConfigContext.Provider
      value={{
        draftRadioConfig,
        deviceRadioConfig,
        setDraftRadioConfig,
        loadRadioFromDevice,
        clearRadioState,
        discardRadioDraft,
        isDirty,
      }}
    >
      {children}
    </RadioConfigContext.Provider>
  );
}

export function useRadioConfig() {
  const ctx = useContext(RadioConfigContext);
  if (!ctx) throw new Error('useRadioConfig must be used within provider.');
  return ctx;
}
