// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import type { ScheduleStackParamList } from "../navigation/ScheduleNavigator";
// import { useSchedules } from "../context/SchedulesContext";
// import { buildSchedulePacketFromAppState, sendConfig } from "../ble/bleManager";


// type Nav = NativeStackNavigationProp<ScheduleStackParamList, "Schedules">;

// export default function SchedulesScreen() {
//   const navigation = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const { device } = route.params || {};
//   const { schedules, addSchedule } = useSchedules();

//   const handleAddSchedule = () => {
//     const newSchedule = {
//       id: Date.now().toString(),
//       name: `New Schedule ${schedules.length + 1}`,
//       window: { start_hour: 8, end_hour: 20 },
//       gps: { enabled: true, sample_interval_min: 10 },
//       // you can add light/microphone/etc here if you store them in context
//     };
//     addSchedule(newSchedule);
//   };

//   const handleSendToDevice = async () => {
//     try {
//       const packet = buildSchedulePacketFromAppState(schedules);
//       const ack = await sendConfig(device, packet);

//       if (ack) Alert.alert("✅ Success", "Schedule sent and acknowledged!");
//       else Alert.alert("⚠️ Sent", "Sent to device but no ACK received.");
//     } catch (err) {
//       Alert.alert("Error", "Failed to send schedule config.");
//     }
//   };


//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>SCHEDULES</Text>
//       <Text style={styles.sub}>
//         Configure sampling and time windows
//         {device?.name ? ` for ${device.name}` : ""}
//       </Text>

//       {schedules.map((s) => (
//         <TouchableOpacity
//           key={s.id}
//           style={styles.card}
//           onPress={() => navigation.navigate("EditSchedule", { schedule: s })}
//         >
//           <Text style={styles.cardTitle}>{s.name}</Text>
//           <Text style={styles.cardText}>
//             {`${s.window.start_hour}:00 - ${s.window.end_hour}:00`}
//           </Text>
//           {s.gps?.enabled && (
//             <Text style={styles.cardText}>
//               GPS every {s.gps.sample_interval_min} min
//             </Text>
//           )}
//         </TouchableOpacity>
//       ))}

//       <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
//         <Text style={styles.addText}>+ Add Schedule</Text>
//       </TouchableOpacity>

//       {/* <TouchableOpacity style={styles.sendButton} onPress={handleSendToDevice}> */}
//       <TouchableOpacity style={styles.sendButton}>
//         <Text style={styles.sendText}>SEND TO DEVICE</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#FFFFFF", // unified with Home
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#111111",
//     marginBottom: 8,
//     letterSpacing: 0.5,
//   },
//   sub: {
//     fontSize: 16,
//     color: "#555555",
//     fontWeight: "400",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#FAFAFA",
//     padding: 18,
//     borderRadius: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#111111",
//     marginBottom: 4,
//   },
//   cardText: {
//     fontSize: 14,
//     color: "#333333",
//     fontWeight: "400",
//   },
//   addButton: {
//     marginTop: 12,
//     alignItems: "center",
//   },
//   addText: {
//     color: "#777777",
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   sendButton: {
//     backgroundColor: "#FDC996",
//     borderRadius: 12,
//     marginTop: 28,
//     alignItems: "center",
//     paddingVertical: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//   },
//   sendText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 16,
//     letterSpacing: 0.5,
//   },
// });
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
      <Text style={styles.sub}>
        Configure sampling and time windows for {device?.name ?? "Collar"}
      </Text>

      {schedules.map((s) => {
        const isDisabled =
          !(
            s.gps?.enabled ||
            s.light?.enabled ||
            s.environmental?.enabled ||
            s.particulate?.enabled ||
            s.radio?.enabled ||
            s.microphone?.enabled ||
            s.accelerometer?.enabled
          );

        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.card, isDisabled && styles.disabledCard]}
            onPress={() => navigation.navigate("EditSchedule", { schedule: s })}
          >
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardText}>
              🕓 {s.window.start_hour}:00 – {s.window.end_hour}:00
            </Text>

            <View style={styles.detailsContainer}>
              {s.gps?.enabled && (
                <Text style={styles.cardDetail}>
                  📍 GPS: every {s.gps.sample_interval_min} min (accuracy{" "}
                  {s.gps.accuracy ?? "N/A"})
                </Text>
              )}
              {s.light?.enabled && (
                <Text style={styles.cardDetail}>
                  💡 Light: every {s.light.sample_interval_min} min
                </Text>
              )}
              {s.environmental?.enabled && (
                <Text style={styles.cardDetail}>
                  🌡️ Environmental: every{" "}
                  {s.environmental.sample_interval_min} min
                </Text>
              )}
              {s.particulate?.enabled && (
                <Text style={styles.cardDetail}>
                  💨 Particulate: every {s.particulate.sample_interval_min} min
                </Text>
              )}
              {s.radio?.enabled && (
                <Text style={styles.cardDetail}>
                  📡 Radio: every {s.radio.transmit_interval_min} min, power{" "}
                  {s.radio.tx_power_dbm ?? 0} dBm
                </Text>
              )}
              {s.microphone?.enabled && (
                <Text style={styles.cardDetail}>
                  🎙️ Microphone:{" "}
                  {s.microphone.continuous_mode ? "continuous" : "windowed"}{" "}
                  mode
                </Text>
              )}
              {s.accelerometer?.enabled && (
                <Text style={styles.cardDetail}>
                  🏃 Accelerometer:{" "}
                  {s.accelerometer.sample_rate === 0 ? "25Hz" : "50Hz"},{" "}
                  {["2G", "4G", "8G"][s.accelerometer.sensitivity ?? 0]}
                </Text>
              )}

              {isDisabled && (
                <Text style={[styles.cardDetail, { color: "#888" }]}>
                  No sensors enabled
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
        <Text style={styles.addText}>+ Add Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendButton} onPress={handleSendToDevice}>
        <Text style={styles.sendText}>SEND TO DEVICE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 16,
    color: "#555",
    fontWeight: "400",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FAFAFA",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledCard: {
    backgroundColor: "#EEE",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 4,
    gap: 3,
  },
  cardDetail: {
    fontSize: 14,
    color: "#444",
  },
  addButton: { marginTop: 10, alignItems: "center" },
  addText: { color: "#777", fontWeight: "600", fontSize: 15 },
  sendButton: {
    backgroundColor: "#FDC996",
    borderRadius: 12,
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sendText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
