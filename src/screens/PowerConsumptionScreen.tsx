// PowerConsumptionScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSchedules } from "../context/SchedulesContext";
import { estimateMultiScheduleSolar, estimateScheduleSolar } from "../utils/powerEstimator";

function solarColor(hours: number): string {
  if (hours < 1) return "#3CB371"; // green
  if (hours < 3) return "#F2A900"; // yellow
  if (hours < 5) return "#FF8C00"; // orange
  return "#D9534F"; // red
}

function labelFromShare(share: number): string {
  if (share < 0.15) return "Low";
  if (share < 0.35) return "Medium";
  if (share < 0.6) return "High";
  return "Very High";
}

export default function PowerConsumptionScreen() {
  const { draftSchedules, collarSchedules } = useSchedules();

  // Toggle mode
  const [mode, setMode] = useState<"draft" | "collar">("draft");

  const schedules = mode === "draft" ? draftSchedules : collarSchedules;

  // ---- Total solar-hours (sum of all schedules)
  const estimate = useMemo(
    () => estimateMultiScheduleSolar(schedules),
    [schedules]
  );

  const totalHours = estimate.totalSolarHours;
  const color = solarColor(totalHours);

  // ---- Per-schedule solar hours (using your current estimator)
  const perSchedule = schedules.map((s) => ({
    id: s.id,
    name: s.name ?? "Schedule",
    value: estimateScheduleSolar(s).totalSolarHours
  }));

  // ---- Convert object → array for UI
  const componentsArray = [
    { key: "gps", label: "GPS", value: estimate.components.gps },
    { key: "lora", label: "LoRa Transmission", value: estimate.components.lora },
    { key: "particulate", label: "Particulate Sensor", value: estimate.components.particulate },
    { key: "microphone", label: "Microphone", value: estimate.components.microphone },
    { key: "accelerometer", label: "Accelerometer", value: estimate.components.accelerometer },
    { key: "lightEnv", label: "Light + Environmental", value: estimate.components.lightEnv },
  ];

  const totalComponentPower = componentsArray.reduce((s, c) => s + c.value, 0);

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <Text style={styles.header}>POWER & SOLAR BUDGET</Text>
      <Text style={styles.sub}>
        Estimated solar-hours required per day based on {mode === "draft" ? "your draft schedules" : "the collar's schedules"}.
      </Text>

      {/* TOGGLE */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setMode("draft")}
          style={[styles.toggleButton, mode === "draft" && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, mode === "draft" && styles.toggleTextActive]}>
            Draft
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode("collar")}
          style={[styles.toggleButton, mode === "collar" && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, mode === "collar" && styles.toggleTextActive]}>
            On Collar
          </Text>
        </TouchableOpacity>
      </View>

      {/* TOTAL SOLAR HOURS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Required Solar Hours</Text>
        <Text style={[styles.solarValue, { color }]}>
          {totalHours.toFixed(1)} hrs/day
        </Text>
        <Text style={styles.cardExplanation}>
          Hours of strong sunlight needed to offset daily energy usage.
        </Text>
      </View>

      {/* PER SCHEDULE */}
      {perSchedule.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Schedule</Text>
          {perSchedule.map((s) => (
            <View key={s.id} style={styles.row}>
              <Text style={styles.rowLabel}>{s.name}</Text>
              <Text style={styles.rowValue}>{s.value.toFixed(1)} hrs/day</Text>
            </View>
          ))}
        </View>
      )}

      {/* POWER BREAKDOWN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Power Breakdown</Text>
        {componentsArray.map((c) => {
          const share = totalComponentPower === 0 ? 0 : c.value / totalComponentPower;
          return (
            <View key={c.key} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowTag}>{labelFromShare(share)}</Text>
              </View>
              <Text style={styles.rowValue}>{(share * 100).toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>

      {/* EMPTY STATE */}
      {schedules.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>
            No schedules available. Connect to a collar to load schedule data.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },

  header: { fontSize: 26, fontWeight: "700", color: "#111", marginBottom: 6 },
  sub: { fontSize: 15, color: "#555", marginBottom: 18 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: "#FDC996",
  },

  toggleText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "white",
  },

  card: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardTitle: { fontSize: 17, fontWeight: "600", marginBottom: 8 },

  solarValue: { fontSize: 28, fontWeight: "700", marginBottom: 8 },

  cardExplanation: { fontSize: 14, color: "#555", lineHeight: 20 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },

  rowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },

  rowLabel: { fontSize: 14, color: "#333" },

  rowValue: { fontSize: 14, fontWeight: "600", color: "#111" },

  rowTag: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#EEE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },

  center: { marginTop: 30, alignItems: "center" },

  empty: { fontSize: 14, color: "#666", textAlign: "center" },
});
