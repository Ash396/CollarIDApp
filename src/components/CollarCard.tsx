import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface CollarCardProps {
  name: string;
  battery?: number;
  sdRemaining?: number;
  sdTotal?: number;
  connected: boolean;
  lastUpdate?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onEnterDfu?: () => void;
}

export default function CollarCard({
  name,
  battery,
  sdRemaining,
  sdTotal,
  connected,
  lastUpdate,
  onConnect,
  onDisconnect,
  onEnterDfu,
}: CollarCardProps) {
  const formatSD = (mb?: number | null) => {
    if (mb == null) return "—";
    return (mb / 1000).toFixed(2) + " GB";
  };

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
      {lastUpdate && (
        <Text style={styles.meta}>Last seen: {lastUpdate}</Text>
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
