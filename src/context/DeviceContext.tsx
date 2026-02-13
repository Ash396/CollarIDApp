import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Device } from "react-native-ble-plx";

type DeviceContextType = {
  device: Device | null;
  setDevice: (d: Device | null) => void;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<Device | null>(null);
  return (
    <DeviceContext.Provider value={{ device, setDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used within DeviceProvider.");
  return ctx;
}
