import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from 'react';

import type { Device } from 'react-native-ble-plx';
import * as PB from '../proto/collar_pb.js';
import { readRadioState, subscribeToRadioUpdates } from '../ble/bleManager';

type RadioConfigContextType = {
  draftRadioConfig: PB.RadioConfigPacket | null;
  deviceRadioConfig: PB.RadioConfigPacket | null;

  setDraftRadioConfig: (cfg: PB.RadioConfigPacket | null) => void;

  loadRadioFromDevice: (device: Device) => Promise<void>;
  subscribeToRadioStateUpdates: (device: Device | null) => void;
};

const RadioConfigContext = createContext<RadioConfigContextType | undefined>(
  undefined,
);

export function RadioConfigProvider({ children }: { children: ReactNode }) {
  const [draftRadioConfig, setDraftRadioConfig] =
    useState<PB.RadioConfigPacket | null>(null);

  const [deviceRadioConfig, setDeviceRadioConfig] =
    useState<PB.RadioConfigPacket | null>(null);

  const radioSubscriptionRef = useRef<any>(null);

  /* ----------------------------------------------------------
   * Initial Load from Collar
   * ---------------------------------------------------------- */
  const loadRadioFromDevice = async (device: Device) => {
    try {
      console.log('📡 [Radio] Reading initial radio state…');
      const decoded = await readRadioState(device);
      const raw = decoded?.radioConfigPacket ?? null;

      if (!raw) {
        console.warn('⚠️ [Radio] No radio config found.');
        setDeviceRadioConfig(null);
        setDraftRadioConfig(null);
        return;
      }

      console.log('📥 [Radio] Loaded radio config:', raw);

      setDeviceRadioConfig(raw);
      setDraftRadioConfig(raw); // initial draft = collar truth
    } catch (err) {
      console.error('❌ [Radio] Failed to load radio config:', err);
    }
  };

  /* ----------------------------------------------------------
   * Live BLE Updates (overwrite both states)
   * ---------------------------------------------------------- */
  const subscribeToRadioStateUpdates = (device: Device | null) => {
    radioSubscriptionRef.current?.remove();
    if (!device) return;

    radioSubscriptionRef.current = subscribeToRadioUpdates(device, pkt => {
      if (pkt?.radioConfigPacket) {
        console.log('🔔 [Radio] LIVE update:', pkt.radioConfigPacket);

        setDeviceRadioConfig(pkt.radioConfigPacket);
        setDraftRadioConfig(pkt.radioConfigPacket); // BLE truth overrides draft
      }
    });
  };

  useEffect(() => {
    return () => {
      radioSubscriptionRef.current?.remove();
    };
  }, []);

  return (
    <RadioConfigContext.Provider
      value={{
        draftRadioConfig,
        deviceRadioConfig,
        setDraftRadioConfig,
        loadRadioFromDevice,
        subscribeToRadioStateUpdates,
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
