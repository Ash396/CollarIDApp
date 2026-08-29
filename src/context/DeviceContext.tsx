import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Device } from "react-native-ble-plx";

type DeviceContextType = {
  device: Device | null;
  setDevice: (d: Device | null) => void;
  /** Numeric firmware build parsed from the collar's "b### <hash>" version
   *  string; 0 = unknown/legacy. BLE feature gates key off this. */
  fwBuild: number;
  setFwBuild: (b: number) => void;
  /** Capability byte from the caps characteristic (0 when absent).
   *  Bit 0 = Thread add-on relay available. */
  caps: number;
  setCaps: (c: number) => void;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDeviceState] = useState<Device | null>(null);
  const [fwBuild, setFwBuild] = useState(0);
  const [caps, setCaps] = useState(0);

  // Nothing about the collar that just left may carry over to the next one.
  const setDevice = (d: Device | null) => {
    setDeviceState(d);
    if (!d) {
      setFwBuild(0);
      setCaps(0);
    }
  };

  return (
    <DeviceContext.Provider
      value={{ device, setDevice, fwBuild, setFwBuild, caps, setCaps }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used within DeviceProvider.");
  return ctx;
}
