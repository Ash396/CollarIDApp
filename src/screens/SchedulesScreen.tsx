import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ScheduleStackParamList } from "../navigation/ScheduleNavigator";
import { useSchedules } from "../context/SchedulesContext";
import { buildSchedulePacketFromAppState, sendConfig } from "../ble/bleManager";


type Nav = NativeStackNavigationProp<ScheduleStackParamList, "Schedules">;

export default function SchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { device } = route.params || {};
  const { schedules, addSchedule } = useSchedules();

  const handleAddSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      name: `New Schedule ${schedules.length + 1}`,
      window: { start_hour: 8, end_hour: 20 },
      gps: { enabled: true, sample_interval_min: 10 },
      // you can add light/microphone/etc here if you store them in context
    };
    addSchedule(newSchedule);
  };

  const handleSendToDevice = async () => {
    try {
      const packet = buildSchedulePacketFromAppState(schedules);
      const ack = await sendConfig(device, packet);

      if (ack) Alert.alert("✅ Success", "Schedule sent and acknowledged!");
      else Alert.alert("⚠️ Sent", "Sent to device but no ACK received.");
    } catch (err) {
      Alert.alert("Error", "Failed to send schedule config.");
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
          {s.gps?.enabled && (
            <Text style={styles.cardText}>
              GPS every {s.gps.sample_interval_min} min
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
