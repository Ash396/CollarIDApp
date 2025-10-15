import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ScheduleStackParamList } from "../navigation/ScheduleNavigator";
import { useSchedules } from "../context/SchedulesContext";
import * as PB from "../proto/message_pb.js";
import { Buffer } from "buffer";

type Nav = NativeStackNavigationProp<ScheduleStackParamList, "Schedules">;

export default function SchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const { schedules, addSchedule } = useSchedules();

  const handleAddSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      name: `New Schedule ${schedules.length + 1}`,
      window: { start_hour: 0, end_hour: 0 },
      gps: { enabled: true, sample_interval_min: 10 },
    };
    addSchedule(newSchedule);
  };

  const handleSendToDevice = () => {
    // Convert your schedule objects into protobuf-compatible structure
    const pbPacket = {
      schedules: schedules.map((s) => ({
        name: s.name,
        window: s.window,
        light: s.light,
        gps: s.gps,
        microphone: s.microphone,
        accelerometer: s.accelerometer,
      })),
    };

    try {
      // Encode to binary
      const encoded = PB.encodeScheduleConfigPacket(pbPacket);

      // Convert to Base64 for BLE
      const base64data = Buffer.from(encoded).toString("base64");

      console.log("📡 Encoded ScheduleConfigPacket:", pbPacket);
      console.log("Base64 Payload:", base64data.slice(0, 80) + "...");

      // In the real app, this is where we would call:
      // await sendConfig(device, pbPacket);

      Alert.alert("Packet Ready", "Protobuf config encoded successfully!");
    } catch (err) {
      console.error("Encoding error:", err);
      Alert.alert("Error", "Failed to encode protobuf packet.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SCHEDULES</Text>
      <Text style={styles.sub}>Configure sampling and time windows</Text>

      {schedules.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={styles.card}
          onPress={() => navigation.navigate("EditSchedule", { schedule: s })}
        >
          <Text style={styles.cardTitle}>{s.name}</Text>
          <Text style={styles.cardText}>
            {`${s.window.start_hour}:00 - ${s.window.end_hour}:00`}
          </Text>
          {s.gps && s.gps.enabled && (
            <Text style={styles.cardText}>
              GPS every {s.gps.sample_interval_min} min
            </Text>
          )}
          {s.light && s.light.enabled && (
            <Text style={styles.cardText}>
              Light every {s.light.sample_interval_min} min
            </Text>
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
        <Text style={styles.addText}>+ Add Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendButton} onPress={handleSendToDevice}>
        <Text style={styles.sendText}>SEND TO DEVICE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fdf8f3" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  sub: { fontSize: 16, color: "#444", marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 6 },
  cardText: { fontSize: 14, color: "#333" },
  addButton: { marginTop: 10 },
  addText: { color: "#999", fontWeight: "600" },
  sendButton: {
    backgroundColor: "#FDC996",
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    padding: 14,
  },
  sendText: { color: "white", fontWeight: "bold" },
});
