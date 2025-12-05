// PowerConsumptionScreen.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSchedules } from "../context/SchedulesContext";
import { estimateSystemSolarHours } from "../utils/powerEstimator";

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
  const { schedules } = useSchedules();

  const estimate = useMemo(
    () => estimateSystemSolarHours(schedules),
    [schedules]
  );

  const hours = estimate.totalSolarHoursPerDay;
  const color = solarColor(hours);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>POWER & SOLAR BUDGET</Text>
      <Text style={styles.sub}>
        Estimate how many solar-hours per day are needed for your current
        schedules.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Required Solar Hours</Text>
        <Text style={[styles.solarValue, { color }]}>
          {hours.toFixed(1)} hrs/day
        </Text>
        <Text style={styles.cardExplanation}>
          This is a rough estimate of how many hours of good sunlight the collar
          needs each day to break even with your current configuration.
        </Text>
      </View>

      {estimate.perSchedule.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Schedule</Text>
          {estimate.perSchedule.map((s) => (
            <View key={s.id ?? s.name} style={styles.row}>
              <Text style={styles.rowLabel}>{s.name ?? "Schedule"}</Text>
              <Text style={styles.rowValue}>
                {s.solarHoursPerDay.toFixed(1)} hrs/day
              </Text>
            </View>
          ))}
          <Text style={styles.hint}>
            The overall requirement uses the most power-hungry schedule as a
            baseline.
          </Text>
        </View>
      )}

      {estimate.components.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Power Breakdown</Text>
          {estimate.components.map((c) => (
            <View key={c.key} style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowTag}>{labelFromShare(c.share)}</Text>
              </View>
              <Text style={styles.rowValue}>
                {(c.share * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
          <Text style={styles.hint}>
            This breakdown is based on the heaviest schedule and is meant to
            highlight which settings contribute most to power draw (e.g., GPS,
            particulate, microphone).
          </Text>
        </View>
      )}

      {estimate.perSchedule.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>
            No schedules loaded. Connect to a collar and load schedules to see
            power estimates.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    color: "#555",
    marginBottom: 18,
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
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  solarValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardExplanation: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowLabel: {
    fontSize: 14,
    color: "#333",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  rowTag: {
    fontSize: 12,
    color: "#555",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#EEE",
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },
  center: {
    marginTop: 30,
    alignItems: "center",
  },
  empty: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
