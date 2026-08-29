import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FwRelease, fwDisplayLabel, getFwReleases } from "../utils/fwReleases";

interface CollarCardProps {
  name: string;
  battery?: number;
  sdRemaining?: number;
  sdTotal?: number;
  connected: boolean;
  lastUpdate?: string;
  firmwareVersion?: string;
  hwDiag?: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onEnterDfu?: () => void;
}

// Boot HW-diagnostic bitmask (SystemStatePacket.hw_diag, bit set = fault,
// bit 7 = diagnostics ran). Same order as firmware hw_diag.h. Index = fault
// bit; bit 7 is the validity flag, so index 7 is a hole and the microphone
// (fw 306+) reports on bit 8.
const DIAG_NAMES = [
  "accelerometer",
  "magnetometer",
  "light sensor",
  "environmental (BME688)",
  "GPS",
  "particulate",
  "LoRa radio",
  "",
  "microphone",
];

function hwDiagFaultNames(diag?: number): string | null {
  const faults =
    diag != null && diag & 0x80 ? diag & ~0x80 & 0x1ff : 0;
  if (!faults) return null;
  return DIAG_NAMES.filter((_, i) => faults & (1 << i)).join(", ");
}

export default function CollarCard({
  name,
  battery,
  sdRemaining,
  sdTotal,
  connected,
  lastUpdate,
  firmwareVersion,
  hwDiag,
  onConnect,
  onDisconnect,
  onEnterDfu,
}: CollarCardProps) {
  // SDCardState reports BYTES (uint64). Same GiB math as the website's
  // formatGB(), so both surfaces show the same number for the same card.
  const formatSD = (bytes?: number | null) => {
    if (bytes == null || !Number.isFinite(bytes)) return "—";
    return (bytes / 1024 ** 3).toFixed(1) + " GB";
  };

  const faultNames = connected ? hwDiagFaultNames(hwDiag) : null;

  // Map "b329 <hash>" to the website-style release label once the changelog
  // list is available (cached for offline field use).
  const [fwReleases, setFwReleases] = useState<FwRelease[]>([]);
  useEffect(() => {
    let alive = true;
    getFwReleases().then(r => {
      if (alive) setFwReleases(r);
    });
    return () => {
      alive = false;
    };
  }, []);
  const fwLabel = fwDisplayLabel(firmwareVersion, fwReleases);

  return (
    <View
      style={[
        styles.card,
        connected ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.statusText}>
          {connected ? "🟢 Connected" : "⚪ Discovered"}
        </Text>
      </View>

      <Text style={styles.meta}>
        Battery: {battery ?? "—"}% | SD: {formatSD(sdRemaining)} /{" "}
        {formatSD(sdTotal)}
      </Text>
      {connected && firmwareVersion ? (
        <Text style={styles.meta}>Firmware: {fwLabel}</Text>
      ) : null}
      {lastUpdate && (
        <Text style={styles.meta}>Last seen: {lastUpdate}</Text>
      )}

      {faultNames && (
        <View style={styles.diagBox}>
          <Text style={styles.diagTitle}>Hardware issue detected</Text>
          <Text style={styles.diagText}>
            The collar's boot self-test failed for: {faultNames}. It keeps
            working, but the affected subsystem(s) won't record until
            serviced.
          </Text>
        </View>
      )}

      {connected ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={onDisconnect}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dfuButton]}
            onPress={onEnterDfu}
          >
            <Text style={styles.buttonText}>DFU</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={onConnect}
        >
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  activeCard: {
    backgroundColor: "#fff",
    borderColor: "#f8b26a",
    borderWidth: 1.5,
  },
  inactiveCard: {
    backgroundColor: "#fdf8f4",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontWeight: "700",
    fontSize: 18,
    color: "black"
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  meta: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  diagBox: {
    marginTop: 10,
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  diagTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 2,
  },
  diagText: {
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 17,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  connectButton: {
    alignSelf: "center",
    backgroundColor: "#f8b26a",
  },
  disconnectButton: {
    flex: 1,
    backgroundColor: "#b22222",
  },
  dfuButton: {
    backgroundColor: "#f8b26a",
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
