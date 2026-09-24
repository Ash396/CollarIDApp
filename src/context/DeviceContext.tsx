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
  /** header.system_uid from the collar's BLE status packet (the U5's
   *  HAL_GetUIDw0, the number the CollarID server keys the collar by); null
   *  until a status packet has been read, or when it carried 0. See
   *  utils/collarUid.ts. */
  systemUid: number | null;
  setSystemUid: (uid: number | null) => void;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDeviceState] = useState<Device | null>(null);
  const [fwBuild, setFwBuild] = useState(0);
  const [caps, setCaps] = useState(0);
  const [systemUid, setSystemUidState] = useState<number | null>(null);

  // Nothing about the collar that just left may carry over to the next one.
  const setDevice = (d: Device | null) => {
    setDeviceState(d);
    // The UID is re-read from each collar's own status packet, which comes
    // after setDevice() on connect — never inherit the previous collar's.
    setSystemUidState(null);
    if (!d) {
      setFwBuild(0);
      setCaps(0);
    }
  };

  const setSystemUid = (uid: number | null) =>
    setSystemUidState(uid && uid > 0 ? uid : null);

  // old: value={{ device, setDevice, fwBuild, setFwBuild, caps, setCaps }}
  return (
    <DeviceContext.Provider
      value={{
        device,
        setDevice,
        fwBuild,
        setFwBuild,
        caps,
        setCaps,
        systemUid,
        setSystemUid,
      }}
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
