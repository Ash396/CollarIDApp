import React, { useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  Schedule,
  ScheduleStackParamList,
} from '../navigation/ScheduleNavigator';
import { useSchedules } from '../context/SchedulesContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { buildSchedulePacketFromAppState, sendConfig } from '../ble/bleManager';
import { estimateScheduleSolarHours } from '../utils/powerEstimator';
import { useDevice } from '../context/DeviceContext';
import { verifyWrite } from '../utils/verifyWrite';
import { schedulesEqual } from '../utils/scheduleEquality';
import { readSchedulesFromDevice } from '../ble/bleManager';
import { Swipeable } from 'react-native-gesture-handler';

type Nav = NativeStackNavigationProp<ScheduleStackParamList, 'Schedules'>;

// Returns the [i, j] indices of the first overlapping schedule pair, or
// null if none overlap. end_hour is INCLUSIVE per the firmware contract
// (matches windowHours() in powerEstimator), so a window start..end covers
// the half-open hour range [start, end + 1); a window with end < start
// wraps past midnight.
function findOverlappingSchedules(
  schedules: Schedule[],
): [number, number] | null {
  const intervals = schedules.map(s => {
    const start = s.window.startHour;
    const end = s.window.endHour;
    return end >= start
      ? [[start, end + 1]]
      : [
          [start, 24],
          [0, end + 1],
        ];
  });

  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      for (const [aStart, aEnd] of intervals[i]) {
        for (const [bStart, bEnd] of intervals[j]) {
          if (aStart < bEnd && bStart < aEnd) {
            return [i, j];
          }
        }
      }
    }
  }

  return null;
}

export default function SchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const { device } = useDevice();
  const { loadRadioFromDevice } = useRadioConfig();

  const {
    draftSchedules,
    addSchedule,
    deleteSchedule,
    loadSchedulesFromDevice,
    clearSchedulesState,
    draftEngaged,
    collarEngaged,
    setDraftEngaged,
    discardDraft,
    isDirty,
  } = useSchedules();

  // Switch always needs a boolean
  const effectiveDraftEngaged = draftEngaged ?? collarEngaged ?? false;

  // Prevent re-loading from device repeatedly due to device object identity changes
  const lastLoadedId = useRef<string | null>(null);
  
  const overlapPair = findOverlappingSchedules(draftSchedules);
  const hasOverlaps = overlapPair !== null;

  useEffect(() => {
    const id = device?.id;
    if (!id) {
      lastLoadedId.current = null;
      clearSchedulesState();
    }
  }, [device?.id]);

  useEffect(() => {
    const id = device?.id;
    if (!id || !device) return;

    if (lastLoadedId.current === id) return;
    lastLoadedId.current = id;

    (async () => {
      try {
        clearSchedulesState();
        await loadSchedulesFromDevice(device);
        await loadRadioFromDevice(device);
      } catch (err) {
        console.error('❌ Failed to load schedules/radio:', err);
      }
    })();
  }, [device?.id]);

  // Capped at 4 (not the firmware's 5) so a fully-loaded config stays under
  // the WB15's ~300-byte ATT value cap — same limit as the website
  // configurator; a 5th schedule forces a fragile long/prepared write.
  const MAX_SCHEDULES = 4;

  const handleAddSchedule = () => {
    if (draftSchedules.length >= MAX_SCHEDULES) {
      Alert.alert(
        'Maximum 4 schedules',
        'A fully-loaded config with more than 4 schedules exceeds what deployed collars can accept in a single Bluetooth write.',
      );
      return;
    }

    // Defaults match the website configurator's defaultSchedule().
    const newSchedule = {
      id: Date.now().toString(),
      name: `Schedule ${draftSchedules.length + 1}`,
      window: { startHour: 0, endHour: 23 },

      gps: {
        enabled: false,
        sampleIntervalMin: 20,
        accuracy: 5,
        dynamicSamplingMode: false,
        mediumMotionVedbaThresholdX100: 20,
        mediumMotionGpsIntervalMin: 10,
        highMotionVedbaThresholdX100: 100,
        highMotionGpsIntervalMin: 5,
        lorawanTxOnGpsFix: false,
        loraTxOnGpsFix: false,
      },
      light: { enabled: false, sampleIntervalMin: 10 },
      environmental: { enabled: false, sampleIntervalMin: 5 },
      particulate: { enabled: false, sampleIntervalMin: 15 },
      microphone: {
        enabled: false,
        continuousMode: false,
        sampleLengthMin: 1,
        sampleWindowMin: 10,
      },
      accelerometer: {
        enabled: false,
        sampleRate: 0,
        sensitivity: 0,
      },
      lorawan: {
        enabled: false,
        sendIntervalMin: 60,
      },
      lora: {
        enabled: false,
        sendIntervalMin: 60,
      },
      magnetometer: {
        enabled: false,
        sampleIntervalS: 60,
      },
    };

    addSchedule(newSchedule);
  };

  const handleSendToDevice = async () => {
    try {
      if (!device) {
        Alert.alert('No Device', 'You must connect to a collar first.');
        return;
      }

      if (overlapPair) {
        Alert.alert(
          'Overlapping Schedules',
          `Schedule ${overlapPair[0] + 1} overlaps with Schedule ${
            overlapPair[1] + 1
          }. Please resolve schedule conflicts before sending to the collar.`,
        );
        return;
      }

      const result = await verifyWrite({
        draft: { schedules: draftSchedules, engaged: effectiveDraftEngaged },

        write: async () => {
          const packet = buildSchedulePacketFromAppState(
            draftSchedules,
            effectiveDraftEngaged,
          );
          await sendConfig(device, packet);
        },

        read: async () => await readSchedulesFromDevice(device),

        equal: (draft, readback) => {
          if (!readback) return false;
          return (
            schedulesEqual(draft.schedules, readback.schedules) &&
            draft.engaged === Boolean(readback.engaged)
          );
        },
      });

      if (result.ok || result.reason === 'mismatch') {
        await loadSchedulesFromDevice(device);
        if (!effectiveDraftEngaged) {
          // The engaged flag rides along in the schedule packet, but a
          // disengaged device won't act on the schedule.
          Alert.alert(
            'Schedule sent — device not engaged',
            'The schedule was saved to the device, but it is currently disengaged and will not run the schedule or collect data. Turn on "System engaged" and send again to start it.',
          );
        } else {
          Alert.alert('Success', 'Schedules updated successfully.');
        }
      } else {
        Alert.alert(
          'Warning',
          'Schedules were sent but could not be verified from the device.',
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send schedule config.');
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>SCHEDULES</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SavedSchedules' as any)}
        >
          <Text style={styles.savedLink}>💾 Saved</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>
        Configure sampling and time windows for {device?.name ?? 'Collar'}
      </Text>

      {/* Unsaved-draft indicator — the draft (persisted across restarts)
          differs from what the collar last reported. */}
      {isDirty && (
        <View style={styles.draftBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.draftTitle}>Unsent changes</Text>
            <Text style={styles.draftText}>
              This draft differs from the collar's stored config. Send to
              apply, or discard to go back to what the collar holds.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.discardBtn}
            onPress={() =>
              Alert.alert(
                'Discard draft?',
                "Throw away local edits and reload the collar's config?",
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: discardDraft,
                  },
                ],
              )
            }
          >
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.engagedRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.engagedTitle}>System engaged</Text>
          <Text style={styles.engagedSub}>
            Device:{' '}
            {collarEngaged === null ? '—' : collarEngaged ? 'ON' : 'OFF'} •
            Draft: {draftEngaged === null ? '—' : draftEngaged ? 'ON' : 'OFF'}
          </Text>
        </View>
        <Switch
          value={effectiveDraftEngaged}
          onValueChange={v => setDraftEngaged(v)}
        />
      </View>

      {hasOverlaps && overlapPair && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Overlapping schedules</Text>
          <Text style={styles.warningText}>
            Schedule {overlapPair[0] + 1} overlaps with Schedule{' '}
            {overlapPair[1] + 1}. Drafts can overlap, but schedules must not
            overlap before sending to the collar.
          </Text>
        </View>
      )}

      {draftSchedules.length === 0 && (
        <Text style={{ color: '#777', marginBottom: 20 }}>
          No schedules loaded from device.
        </Text>
      )}

      {draftSchedules.map((s, idx) => {
        const isDisabled = !(
          s.gps?.enabled ||
          s.light?.enabled ||
          s.environmental?.enabled ||
          s.particulate?.enabled ||
          s.microphone?.enabled ||
          s.accelerometer?.enabled ||
          s.magnetometer?.enabled ||
          s.lorawan?.enabled ||
          s.lora?.enabled
        );

        const shEstimate = estimateScheduleSolarHours(s);

        const renderRightActions = () => (
          <TouchableOpacity
            style={styles.deleteSwipeButton}
            onPress={() => {
              Alert.alert(
                'Delete Schedule',
                `Are you sure you want to delete Schedule ${idx + 1}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteSchedule(s.id),
                  },
                ],
              );
            }}
          >
            <Text style={styles.deleteSwipeText}>Delete</Text>
          </TouchableOpacity>
        );

        return (
          <Swipeable key={s.id} renderRightActions={renderRightActions}>
            <TouchableOpacity
              style={[styles.card, isDisabled && styles.disabledCard]}
              onPress={() =>
                navigation.navigate('EditSchedule', { schedule: s, index: idx })
              }
            >
              <Text style={styles.cardTitle}>Schedule {idx + 1}</Text>
              <Text style={styles.cardText}>
                🕓 {s.window.startHour}:00 – {s.window.endHour}:00
              </Text>

              <Text style={styles.cardText}>
                ☀️ {shEstimate.toFixed(2)} sh/day
              </Text>

              <View style={styles.detailsContainer}>
                {s.gps?.enabled && (
                  <Text style={styles.cardDetail}>
                    📍 GPS: every {s.gps.sampleIntervalMin} min (accuracy{' '}
                    {s.gps.accuracy ?? 'N/A'})
                    {s.gps.dynamicSamplingMode ? ' · dynamic' : ''}
                  </Text>
                )}
                {s.light?.enabled && (
                  <Text style={styles.cardDetail}>
                    💡 Light: every {s.light.sampleIntervalMin} min
                  </Text>
                )}
                {s.environmental?.enabled && (
                  <Text style={styles.cardDetail}>
                    🌡️ Env: every {s.environmental.sampleIntervalMin} min
                  </Text>
                )}
                {s.particulate?.enabled && (
                  <Text style={styles.cardDetail}>
                    💨 Particulate: every {s.particulate.sampleIntervalMin} min
                  </Text>
                )}
                {s.microphone?.enabled && (
                  <Text style={styles.cardDetail}>
                    🎙️ Microphone:{' '}
                    {s.microphone.continuousMode ? 'continuous' : 'windowed'}
                  </Text>
                )}
                {s.accelerometer?.enabled && (
                  <Text style={styles.cardDetail}>
                    🏃 Accelerometer:{' '}
                    {s.accelerometer.sampleRate === 0 ? '25Hz' : '50Hz'},{' '}
                    {['2G', '4G', '8G'][s.accelerometer.sensitivity ?? 0]}
                  </Text>
                )}
                {s.lorawan?.enabled && (
                  <Text style={styles.cardDetail}>
                    📡 LoRaWAN:{' '}
                    {s.gps?.enabled && s.gps?.lorawanTxOnGpsFix
                      ? 'on every GPS fix'
                      : `every ${s.lorawan.sendIntervalMin ?? '?'} min`}
                  </Text>
                )}
                {s.lora?.enabled && (
                  <Text style={styles.cardDetail}>
                    📡 LoRa:{' '}
                    {s.gps?.enabled && s.gps?.loraTxOnGpsFix
                      ? 'on every GPS fix'
                      : `every ${s.lora.sendIntervalMin ?? '?'} min`}
                  </Text>
                )}
                {s.magnetometer?.enabled && (
                  <Text style={styles.cardDetail}>
                    🧲 Magnetometer: every{' '}
                    {Math.max(1, Math.round((s.magnetometer.sampleIntervalS ?? 60) / 60))}{' '}
                    min
                  </Text>
                )}

                {isDisabled && (
                  <Text style={[styles.cardDetail, { color: '#888' }]}>
                    No sensors enabled
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Swipeable>
        );
      })}

      <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
        <Text style={styles.addText}>+ Add Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sendButton, hasOverlaps && styles.sendButtonDisabled]}
        onPress={handleSendToDevice}
      >
        <Text style={styles.sendText}>SEND TO DEVICE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  savedLink: { fontSize: 15, color: '#4A90D9', fontWeight: '600' },

  draftBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  draftTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8' },
  draftText: { fontSize: 12, color: '#1E40AF', marginTop: 2 },
  discardBtn: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  discardText: { color: '#1D4ED8', fontWeight: '700', fontSize: 13 },
  sub: {
    fontSize: 16,
    color: '#555',
    fontWeight: '400',
    marginBottom: 20,
  },

  engagedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  engagedTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  engagedSub: { marginTop: 2, fontSize: 13, color: '#666' },

  card: {
    backgroundColor: '#FAFAFA',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledCard: { backgroundColor: '#EEE' },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    marginBottom: 8,
  },
  detailsContainer: { marginTop: 4, gap: 3 },
  cardDetail: { fontSize: 14, color: '#444' },
  addButton: { marginTop: 10, alignItems: 'center' },
  addText: { color: '#777', fontWeight: '600', fontSize: 15 },
  sendButton: {
    backgroundColor: '#FDC996',
    borderRadius: 12,
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  deleteSwipeButton: {
    backgroundColor: '#F87171',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    borderRadius: 16,
    marginBottom: 16,
  },
  deleteSwipeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  warningBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#9A3412',
  },
  sendButtonDisabled: {
    backgroundColor: '#DDD',
  },
});
