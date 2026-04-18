// PowerConsumptionScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSchedules } from "../context/SchedulesContext";
import { estimatePower, estimateScheduleSolarHours } from "../utils/powerEstimator";

function badgeColor(solarHours: number): string {
  if (solarHours < 1.5) return "#3CB371";
  if (solarHours < 3.0) return "#F2A900";
  return "#D9534F";
}

function badgeLabel(solarHours: number): string {
  if (solarHours < 1.5) return "Good";
  if (solarHours < 3.0) return "Moderate";
  return "High";
}

export default function PowerConsumptionScreen() {
  const { draftSchedules, collarSchedules } = useSchedules();

  const [mode, setMode] = useState<"draft" | "collar">("draft");
  const schedules = mode === "draft" ? draftSchedules : collarSchedules;

  const estimate = useMemo(() => estimatePower(schedules), [schedules]);

  const { totalSolarHours, components } = estimate;
  const color = badgeColor(totalSolarHours);

  const perSchedule = schedules.map((s) => ({
    id: s.id,
    name: s.name ?? "Schedule",
    solarHours: estimateScheduleSolarHours(s),
  }));

  const compItems: { label: string; value: number; color: string }[] = [
    { label: "Baseline (MCU + sensors)", value: components.baseline,   color: "#4A90D9" },
    { label: "GPS acquisition",          value: components.gps,        color: "#3CB371" },
    { label: "Microphone",               value: components.microphone, color: "#E0478A" },
    { label: "LoRaWAN",                  value: components.lora,       color: "#9B6DD6" },
  ];

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <Text style={styles.header}>POWER & SOLAR BUDGET</Text>
      <Text style={styles.sub}>
        Estimated solar exposure required per day based on{" "}
        {mode === "draft" ? "your draft schedules" : "the collar's schedules"}.
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

      {/* TOTAL */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Required Solar Exposure</Text>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{badgeLabel(totalSolarHours)}</Text>
          </View>
        </View>
        <Text style={[styles.primaryValue, { color }]}>
          {totalSolarHours.toFixed(2)} hrs/day
        </Text>
        <Text style={styles.cardExplanation}>
          Hours of direct sunlight needed to offset daily energy usage.
        </Text>
      </View>

      {/* PER SCHEDULE */}
      {perSchedule.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Schedule</Text>
          {perSchedule.map((s) => (
            <View key={s.id} style={styles.row}>
              <Text style={styles.rowLabel}>{s.name}</Text>
              <Text style={styles.rowValue}>{s.solarHours.toFixed(2)} sh</Text>
            </View>
          ))}
          <Text style={styles.cardNote}>
            Incremental only — baseline is shared across all schedules.
          </Text>
        </View>
      )}

      {/* COMPONENT BREAKDOWN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Component Breakdown</Text>
        {compItems.map((c) => {
          const pct = totalSolarHours > 0 ? (c.value / totalSolarHours) * 100 : 0;
          return (
            <View key={c.label} style={styles.componentRow}>
              <View style={styles.componentLabelRow}>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowValue}>
                  {c.value.toFixed(2)} sh ({pct.toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%` as any, backgroundColor: c.color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footnote}>
        Based on empirical measurements at 22 dBm TX, 100-byte payload. GPS acquisition: 10 s (low), 25 s (med), 40 s (high).
        215 mW solar panel at 80% charge efficiency.
      </Text>

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
  toggleActive: { backgroundColor: "#FDC996" },
  toggleText: { fontSize: 14, color: "#555", fontWeight: "600" },
  toggleTextActive: { color: "white" },

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
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: "600" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#FFF" },

  primaryValue: { fontSize: 32, fontWeight: "700", marginBottom: 6 },
  cardExplanation: { fontSize: 14, color: "#555", lineHeight: 20 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  rowLabel: { fontSize: 14, color: "#333" },
  rowValue: { fontSize: 14, fontWeight: "600", color: "#111" },

  cardNote: { fontSize: 12, color: "#999", marginTop: 8 },

  componentRow: { marginVertical: 6 },
  componentLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },

  footnote: { fontSize: 12, color: "#AAA", marginBottom: 24, lineHeight: 18 },

  center: { marginTop: 30, alignItems: "center" },
  empty: { fontSize: 14, color: "#666", textAlign: "center" },
});
