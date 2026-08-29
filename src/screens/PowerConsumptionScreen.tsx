// PowerConsumptionScreen.tsx
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSchedules } from '../context/SchedulesContext';
import {
  estimatePower,
  estimateScheduleSolarHours,
  estimateMicBytesPerDay,
  MIC_UNAPPROVED_POWER_RATIO,
  SOLAR_CONDITIONS,
} from '../utils/powerEstimator';

function badgeColor(solarHours: number): string {
  if (solarHours < 1.5) return '#3CB371';
  if (solarHours < 3.0) return '#F2A900';
  return '#D9534F';
}

function badgeLabel(solarHours: number): string {
  if (solarHours < 1.5) return 'Good';
  if (solarHours < 3.0) return 'Moderate';
  return 'High';
}

const SD_CARD_SIZES = [
  { label: '32 GB', bytes: 32e9 },
  { label: '128 GB', bytes: 128e9 },
  { label: '256 GB', bytes: 256e9 },
  { label: '512 GB', bytes: 512e9 },
  { label: '2 TB', bytes: 2e12 },
];

// Human-friendly duration from a day count — avoids "1825 days" for 5 years.
function formatDuration(days: number): string {
  if (!isFinite(days) || days > 36500) return '>100 yr';
  if (days < 1) return `${Math.round(days * 24)} hr`;
  if (days < 30) return `${days.toFixed(1)} days`;
  if (days < 365) {
    const weeks = (days / 7).toFixed(1);
    if (days > 70) return `${weeks} weeks (${(days / 30.4).toFixed(1)} months)`;
    return `${weeks} weeks`;
  }
  if (days < 730) return `${(days / 30.4).toFixed(1)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

export default function PowerConsumptionScreen() {
  const { draftSchedules } = useSchedules();

  const schedules = draftSchedules;

  const estimate = useMemo(() => estimatePower(schedules), [schedules]);

  const { totalSolarHours, components } = estimate;
  const color = badgeColor(totalSolarHours);

  const micBytesPerDay = useMemo(
    () => schedules.reduce((sum, s) => sum + estimateMicBytesPerDay(s), 0),
    [schedules],
  );
  // Same draft on an unapproved SD card — mic power scales by the ratio.
  const unapprovedTotalSh =
    totalSolarHours + components.microphone * (MIC_UNAPPROVED_POWER_RATIO - 1);

  const perSchedule = schedules.map((s, idx) => ({
    id: s.id,
    name: `Schedule ${idx + 1}`,
    solarHours: estimateScheduleSolarHours(s),
  }));

  const compItems: { label: string; value: number; color: string }[] = [
    {
      label: 'Baseline (MCU + sensors)',
      value: components.baseline,
      color: '#4A90D9',
    },
    { label: 'GPS acquisition', value: components.gps, color: '#3CB371' },
    { label: 'Microphone', value: components.microphone, color: '#E0478A' },
    { label: 'Radio (LoRaWAN / LoRa)', value: components.lora, color: '#9B6DD6' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <Text style={styles.header}>POWER & SOLAR BUDGET</Text>
      <Text style={styles.sub}>
        Estimated solar exposure required per day based on your draft
        configuration.
      </Text>

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

      {/* CLIMATE VIABILITY LADDER — shared SOLAR_CONDITIONS (power model) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daylight Required by Condition</Text>
        {SOLAR_CONDITIONS.map(({ label, fraction, typicalMaxH }) => {
          const required = totalSolarHours / fraction;
          // Load vs a realistic day of that condition: green ≤60%, amber ≤
          // a full day, red = not viable in that climate.
          const load = required / typicalMaxH;
          const color =
            load <= 0.6 ? '#3CB371' : load <= 1 ? '#F2A900' : '#D9534F';
          return (
            <View key={label} style={styles.conditionRow}>
              <Text style={[styles.rowLabel, styles.conditionLabel]}>
                {label}
              </Text>
              <View style={styles.conditionBarTrack}>
                <View
                  style={[
                    styles.conditionBarFill,
                    {
                      width: `${Math.min(load, 1) * 100}%` as any,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.rowValue,
                  styles.conditionValue,
                  load > 1 && styles.infeasibleText,
                ]}
              >
                {required > 24 ? '>24' : required.toFixed(1)} h/day
              </Text>
            </View>
          );
        })}
        <Text style={styles.cardNote}>
          Hours of that condition needed per day for net-zero energy. A full
          bar means more than a typical day of that light — not viable there.
        </Text>
        {schedules.some(
          s => s.gps?.enabled && s.gps?.dynamicSamplingMode,
        ) && (
          <Text style={styles.cardNote}>
            Dynamic GPS assumes a 70% resting / 20% medium / 10% high activity
            split — size with headroom for a more active animal.
          </Text>
        )}
      </View>

      {/* PER SCHEDULE */}
      {perSchedule.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Schedule</Text>
          {perSchedule.map(s => (
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
        {compItems.map(c => {
          const pct =
            totalSolarHours > 0 ? (c.value / totalSolarHours) * 100 : 0;
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

      {/* SD CARD CAPACITY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SD Card Capacity</Text>
        {micBytesPerDay <= 0 ? (
          <Text style={styles.cardExplanation}>
            Microphone is disabled in all schedules — even a 32 GB card lasts
            effectively indefinitely on sensor and accelerometer data alone.
          </Text>
        ) : (
          <>
            <Text style={styles.cardExplanation}>
              Audio writes {(micBytesPerDay / 1e9).toFixed(2)} GB/day with your
              current configuration.
            </Text>
            <View style={{ marginTop: 8 }}>
              {SD_CARD_SIZES.map(c => (
                <View key={c.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{c.label}</Text>
                  <Text style={styles.rowValue}>
                    {formatDuration(c.bytes / micBytesPerDay)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {components.microphone > 0 && (
          <View style={styles.unapprovedNote}>
            <Text style={styles.unapprovedTitle}>Unapproved SD card?</Text>
            <Text style={styles.unapprovedBody}>
              The microphone estimate assumes the approved card (Kioxia
              Exceria Plus). On an unapproved card (e.g. SanDisk Extreme or
              Extreme Pro), the firmware keeps the card energised between
              every mic write to protect its flash controller — roughly 2x the
              microphone power while recording. That pushes the total to{' '}
              {unapprovedTotalSh.toFixed(2)} solar-hours/day instead of{' '}
              {totalSolarHours.toFixed(2)}.
            </Text>
          </View>
        )}

        <Text style={styles.cardNote}>
          Based on 16 kHz / 16-bit mono PCM audio (32 kB/s while recording).
          Card sizes use marketed capacity; subtract ~7% for exFAT overhead.
        </Text>
      </View>

      <Text style={styles.footnote}>
        Based on empirical measurements at 22 dBm TX, 100-byte payload. GPS
        acquisition: 10 s (low), 25 s (med), 40 s (high). 215 mW solar panel at
        80% charge efficiency.
      </Text>

      {/* EMPTY STATE */}
      {schedules.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>
            No draft schedules yet. Add a schedule to estimate power usage.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },

  header: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 6 },
  sub: { fontSize: 15, color: '#555', marginBottom: 18 },

  card: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#111' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },

  primaryValue: { fontSize: 32, fontWeight: '700', marginBottom: 6 },
  cardExplanation: { fontSize: 14, color: '#555', lineHeight: 20 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowLabel: { fontSize: 14, color: '#333' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#111' },

  cardNote: { fontSize: 12, color: '#999', marginTop: 8 },

  unapprovedNote: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDE3C2',
    borderRadius: 10,
    padding: 10,
  },
  unapprovedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 3,
  },
  unapprovedBody: { fontSize: 12, color: '#7C5A2E', lineHeight: 17 },

  componentRow: { marginVertical: 6 },
  componentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },

  footnote: { fontSize: 12, color: '#AAA', marginBottom: 24, lineHeight: 18 },

  center: { marginTop: 30, alignItems: 'center' },
  empty: { fontSize: 14, color: '#666', textAlign: 'center' },

  infeasibleText: { color: '#D9534F' },

  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 8,
  },
  conditionLabel: { width: 96 },
  conditionValue: { width: 76, textAlign: 'right' },
  conditionBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  conditionBarFill: { height: 5, borderRadius: 3 },

  scrollContent: {
    paddingBottom: 20,
  },
});
