import React, { createContext, useContext, useState, ReactNode } from "react";
import { readRadioState } from "../ble/bleManager";
import * as PB from "../proto/message_pb.js";

type RadioConfigContextType = {
  radioConfig: PB.RadioConfigPacket | null;
  setRadioConfig: (cfg: PB.RadioConfigPacket | null) => void;
  loadRadioFromDevice: (device: any) => Promise<void>;
};

const RadioConfigContext = createContext<RadioConfigContextType | undefined>(undefined);

export function RadioConfigProvider({ children }: { children: ReactNode }) {
  const [radioConfig, setRadioConfig] = useState<PB.RadioConfigPacket | null>(null);

  const loadRadioFromDevice = async (device: any) => {
    try {
      console.log("📡 [Radio] Reading initial radio config…");
      const decoded = await readRadioState(device);
      const raw = decoded?.radioConfigPacket ?? null;

      if (!raw) {
        console.warn("⚠️ [Radio] No radio config found.");
        setRadioConfig(null);
        return;
      }

      console.log("📥 [Radio] Loaded radio config:", raw);
      setRadioConfig(raw);
    } catch (err) {
      console.error("❌ [Radio] Failed to load radio config:", err);
    }
  };

  return (
    <RadioConfigContext.Provider value={{ radioConfig, setRadioConfig, loadRadioFromDevice }}>
      {children}
    </RadioConfigContext.Provider>
  );
}

export function useRadioConfig() {
  const ctx = useContext(RadioConfigContext);
  if (!ctx) throw new Error("useRadioConfig must be used within provider.");
  return ctx;
}
