import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Device } from 'react-native-ble-plx';
import * as PB from '../proto/collar_pb.js';
import { readRadioState } from '../ble/bleManager';

type RadioConfigContextType = {
  draftRadioConfig: PB.RadioConfigPacket | null;
  deviceRadioConfig: PB.RadioConfigPacket | null;

  setDraftRadioConfig: (cfg: PB.RadioConfigPacket | null) => void;

  loadRadioFromDevice: (device: Device) => Promise<void>;
};

const RadioConfigContext = createContext<RadioConfigContextType | undefined>(
  undefined,
);

export function RadioConfigProvider({ children }: { children: ReactNode }) {
  const [draftRadioConfig, setDraftRadioConfig] =
    useState<PB.RadioConfigPacket | null>(null);

  const [deviceRadioConfig, setDeviceRadioConfig] =
    useState<PB.RadioConfigPacket | null>(null);

  /* ----------------------------------------------------------
   * Load from Collar (source of truth)
   * ---------------------------------------------------------- */
  const loadRadioFromDevice = async (device: Device) => {
    try {
      console.log('📡 [Radio] Reading radio state…');
      const decoded = await readRadioState(device);
      const raw = decoded?.radioConfigPacket ?? null;

      if (!raw) {
        console.warn('⚠️ [Radio] No radio config found.');
        setDeviceRadioConfig(null);
        setDraftRadioConfig(null);
        return;
      }

      console.log('📥 [Radio] Loaded radio config:', raw);

      const deviceCopy = PB.RadioConfigPacket.fromObject(
        PB.RadioConfigPacket.toObject(raw, { defaults: true }),
      );
      const draftCopy = PB.RadioConfigPacket.fromObject(
        PB.RadioConfigPacket.toObject(raw, { defaults: true }),
      );

      setDeviceRadioConfig(deviceCopy);
      setDraftRadioConfig(prev => prev ?? draftCopy);
    } catch (err) {
      console.error('❌ [Radio] Failed to load radio config:', err);
    }
  };

  return (
    <RadioConfigContext.Provider
      value={{
        draftRadioConfig,
        deviceRadioConfig,
        setDraftRadioConfig,
        loadRadioFromDevice,
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
