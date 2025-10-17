import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSchedules } from "../context/SchedulesContext";

export default function EditScheduleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { schedule } = route.params;
  const { updateSchedule, deleteSchedule } = useSchedules();

  /* ---------------- TIME WINDOW ---------------- */
  const [startHour, setStartHour] = useState(schedule.window?.start_hour ?? 0);
  const [endHour, setEndHour] = useState(schedule.window?.end_hour ?? 0);

  /* ---------------- GPS ---------------- */
  const [gpsEnabled, setGpsEnabled] = useState(schedule.gps?.enabled ?? false);
  const [gpsInterval, setGpsInterval] = useState(String(schedule.gps?.sample_interval_min ?? 10));
  const [gpsAccuracy, setGpsAccuracy] = useState(schedule.gps?.accuracy ?? 5);

  /* ---------------- LIGHT ---------------- */
  const [lightEnabled, setLightEnabled] = useState(schedule.light?.enabled ?? true);
  const [lightInterval, setLightInterval] = useState(String(schedule.light?.sample_interval_min ?? 30));

  /* ---------------- ENVIRONMENTAL ---------------- */
  const [envEnabled, setEnvEnabled] = useState(schedule.environmental?.enabled ?? true);
  const [envInterval, setEnvInterval] = useState(String(schedule.environmental?.sample_interval_min ?? 5));

  /* ---------------- PARTICULATE ---------------- */
  const [partEnabled, setPartEnabled] = useState(schedule.particulate?.enabled ?? true);
  const [partInterval, setPartInterval] = useState(String(schedule.particulate?.sample_interval_min ?? 15));

  /* ---------------- RADIO ---------------- */
  const [radioEnabled, setRadioEnabled] = useState(schedule.radio?.enabled ?? false);
  const [radioInterval, setRadioInterval] = useState(String(schedule.radio?.transmit_interval_min ?? 60));
  const [radioTxOnlyOnGps, setRadioTxOnlyOnGps] = useState(schedule.radio?.tx_only_on_new_gps_fix ?? false);
  const [radioPower, setRadioPower] = useState(String(schedule.radio?.tx_power_dbm ?? 0));

  /* ---------------- MICROPHONE ---------------- */
  const [micEnabled, setMicEnabled] = useState(schedule.microphone?.enabled ?? false);
  const [micContinuous, setMicContinuous] = useState(schedule.microphone?.continuous_mode ?? false);
  const [micLength, setMicLength] = useState(String(schedule.microphone?.sample_length_min ?? 0));
  const [micWindow, setMicWindow] = useState(String(schedule.microphone?.sample_window_min ?? 0));

  /* ---------------- ACCELEROMETER ---------------- */
  const [accelEnabled, setAccelEnabled] = useState(schedule.accelerometer?.enabled ?? false);
  const [accelRate, setAccelRate] = useState(schedule.accelerometer?.sample_rate ?? 0);
  const [accelSensitivity, setAccelSensitivity] = useState(schedule.accelerometer?.sensitivity ?? 0);

  /* ---------------- VALIDATION & SAVE ---------------- */
  const handleSave = () => {
    const numStart = Number(startHour);
    const numEnd = Number(endHour);
    const numGpsInt = Number(gpsInterval);
    const numLightInt = Number(lightInterval);
    const numEnvInt = Number(envInterval);
    const numPartInt = Number(partInterval);
    const numRadioInt = Number(radioInterval);
    const numMicLen = Number(micLength);
    const numMicWin = Number(micWindow);
    const numPower = Number(radioPower);

    // validation
    if (numStart < 0 || numStart > 23 || numEnd < 0 || numEnd > 23) {
      Alert.alert("Invalid time", "Hours must be between 0 and 23");
      return;
    }

    const intervals = [numGpsInt, numLightInt, numEnvInt, numPartInt, numRadioInt];
    if (intervals.some((v) => v <= 0)) {
      Alert.alert("Invalid interval", "Sampling/transmit intervals must be positive");
      return;
    }

    const updated = {
      ...schedule,
      window: { start_hour: numStart, end_hour: numEnd },
      gps: { enabled: gpsEnabled, sample_interval_min: numGpsInt, accuracy: gpsAccuracy },
      light: { enabled: lightEnabled, sample_interval_min: numLightInt },
      environmental: { enabled: envEnabled, sample_interval_min: numEnvInt },
      particulate: { enabled: partEnabled, sample_interval_min: numPartInt },
      radio: {
        enabled: radioEnabled,
        region: 0,
        auth: 0,
        transmit_interval_min: numRadioInt,
        tx_only_on_new_gps_fix: radioTxOnlyOnGps,
        tx_power_dbm: numPower,
      },
      microphone: {
        enabled: micEnabled,
        continuous_mode: micContinuous,
        sample_length_min: numMicLen,
        sample_window_min: numMicWin,
      },
      accelerometer: {
        enabled: accelEnabled,
        sample_rate: accelRate,
        sensitivity: accelSensitivity,
      },
      firmware: schedule.firmware ?? { version: "1.0.0" },
    };

    updateSchedule(schedule.id, updated);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Schedule",
      `Are you sure you want to delete "${schedule.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSchedule(schedule.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>

      {/* 🕓 TIME WINDOW */}
      <Text style={styles.section}>🕓 Time Window</Text>
      <Text>Start Hour</Text>
      <Picker selectedValue={startHour} onValueChange={setStartHour}>
        {[...Array(24).keys()].map((h) => (
          <Picker.Item key={h} label={`${h}`} value={h} />
        ))}
      </Picker>
      <Text>End Hour</Text>
      <Picker selectedValue={endHour} onValueChange={setEndHour}>
        {[...Array(24).keys()].map((h) => (
          <Picker.Item key={h} label={`${h}`} value={h} />
        ))}
      </Picker>

      {/* 📍 GPS */}
      <Text style={styles.section}>📍 GPS</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={gpsEnabled} onValueChange={setGpsEnabled} /></View>
      <Text>Sample Interval (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={gpsInterval} onChangeText={setGpsInterval} />
      <Text>Accuracy (1–10)</Text>
      <Picker selectedValue={gpsAccuracy} onValueChange={setGpsAccuracy}>
        {[...Array(10).keys()].map((a) => (
          <Picker.Item key={a + 1} label={`${a + 1}`} value={a + 1} />
        ))}
      </Picker>

      {/* 💡 LIGHT */}
      <Text style={styles.section}>💡 Light</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={lightEnabled} onValueChange={setLightEnabled} /></View>
      <Text>Sample Interval (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={lightInterval} onChangeText={setLightInterval} />

      {/* 🌡️ ENVIRONMENTAL */}
      <Text style={styles.section}>🌡️ Environmental</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={envEnabled} onValueChange={setEnvEnabled} /></View>
      <Text>Sample Interval (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={envInterval} onChangeText={setEnvInterval} />

      {/* 💨 PARTICULATE */}
      <Text style={styles.section}>💨 Particulate</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={partEnabled} onValueChange={setPartEnabled} /></View>
      <Text>Sample Interval (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={partInterval} onChangeText={setPartInterval} />

      {/* 📡 RADIO */}
      <Text style={styles.section}>📡 Radio</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={radioEnabled} onValueChange={setRadioEnabled} /></View>
      <Text>Transmit Interval (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={radioInterval} onChangeText={setRadioInterval} />
      <View style={styles.row}><Text>Tx only on new GPS fix</Text><Switch value={radioTxOnlyOnGps} onValueChange={setRadioTxOnlyOnGps} /></View>
      <Text>Tx Power (dBm)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={radioPower} onChangeText={setRadioPower} />

      {/* 🎙️ MICROPHONE */}
      <Text style={styles.section}>🎙️ Microphone</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={micEnabled} onValueChange={setMicEnabled} /></View>
      <View style={styles.row}><Text>Continuous Mode</Text><Switch value={micContinuous} onValueChange={setMicContinuous} /></View>
      <Text>Sample Length (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={micLength} onChangeText={setMicLength} />
      <Text>Sample Window (min)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={micWindow} onChangeText={setMicWindow} />

      {/* 🏃 ACCELEROMETER */}
      <Text style={styles.section}>🏃 Accelerometer</Text>
      <View style={styles.row}><Text>Enabled</Text><Switch value={accelEnabled} onValueChange={setAccelEnabled} /></View>
      <Text>Sample Rate</Text>
      <Picker selectedValue={accelRate} onValueChange={setAccelRate}>
        <Picker.Item label="25 Hz" value={0} />
        <Picker.Item label="50 Hz" value={1} />
      </Picker>
      <Text>Sensitivity</Text>
      <Picker selectedValue={accelSensitivity} onValueChange={setAccelSensitivity}>
        <Picker.Item label="2G" value={0} />
        <Picker.Item label="4G" value={1} />
        <Picker.Item label="8G" value={2} />
      </Picker>

      {/* Buttons */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>DELETE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 18, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  saveButton: {
    backgroundColor: "#FDC996",
    borderRadius: 8,
    marginTop: 24,
    padding: 14,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 },
  deleteButton: {
    backgroundColor: "#F87171",
    borderRadius: 8,
    marginTop: 10,
    padding: 14,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
