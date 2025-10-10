import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface CollarCardProps {
  name: string;
  battery?: number;
  engaged?: boolean;
  lastSync?: string;
  connected?: boolean;
  onPress?: () => void;
}

export default function CollarCard({
  name,
  battery,
  engaged,
  lastSync,
  connected,
  onPress,
}: CollarCardProps) {
  return (
    <View
      style={[
        styles.card,
        connected ? styles.activeCard : styles.inactiveCard,
      ]}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.battery}>
          {battery != null ? `${battery.toFixed(0)}% 🔋` : "--"}
        </Text>
      </View>

      <Text style={styles.status}>
        Status: {engaged ? "Engaged" : "Disengaged"}
      </Text>
      <Text style={styles.status}>Last sync: {lastSync ?? "N/A"}</Text>

      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, connected ? styles.disconnect : styles.connect]}
      >
        <Text style={styles.buttonText}>
          {connected ? "DISCONNECT" : "CONNECT"}
        </Text>
      </TouchableOpacity>
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
  activeCard: { backgroundColor: "#fff" },
  inactiveCard: { backgroundColor: "#eee" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "700", fontSize: 18 },
  battery: { fontSize: 16 },
  status: { fontSize: 15, marginTop: 4 },
  button: {
    alignSelf: "center",
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  connect: { backgroundColor: "#777" },
  disconnect: { backgroundColor: "#f8b26a" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
