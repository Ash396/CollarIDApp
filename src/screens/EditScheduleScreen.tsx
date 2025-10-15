import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { ScheduleStackParamList } from "../navigation/ScheduleNavigator";
import { useSchedules } from "../context/SchedulesContext";

type EditRoute = RouteProp<ScheduleStackParamList, "EditSchedule">;

export default function EditScheduleScreen() {
  const route = useRoute<EditRoute>();
  const navigation = useNavigation();
  const { updateSchedule, deleteSchedule } = useSchedules();
  const [schedule, setSchedule] = useState(route.params.schedule);

  const handleSave = () => {
    updateSchedule(schedule.id, schedule);
    navigation.goBack();
  };

  const handleDelete = () => {
    deleteSchedule(schedule.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>EDIT SCHEDULE</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Schedule Name</Text>
        <TextInput
          style={styles.input}
          value={schedule.name}
          onChangeText={(v) => setSchedule({ ...schedule, name: v })}
          placeholder="Enter a name"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Time Window</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(schedule.window.start_hour)}
          onChangeText={(v) =>
            setSchedule({
              ...schedule,
              window: { ...schedule.window, start_hour: Number(v) },
            })
          }
          placeholder="Start Hour (0–23)"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(schedule.window.end_hour)}
          onChangeText={(v) =>
            setSchedule({
              ...schedule,
              window: { ...schedule.window, end_hour: Number(v) },
            })
          }
          placeholder="End Hour (0–23)"
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity onPress={handleSave} style={styles.save}>
          <Text style={styles.btnText}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.delete}>
          <Text style={styles.btnText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fdf8f3" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  save: {
    flex: 1,
    backgroundColor: "#FDC996",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  delete: {
    flex: 1,
    backgroundColor: "#999",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
  },
  btnText: { color: "white", fontWeight: "bold" },
});
