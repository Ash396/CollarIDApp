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
import type { ScheduleStackParamList } from '../navigation/ScheduleNavigator';
import { useSchedules } from '../context/SchedulesContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import { buildSchedulePacketFromAppState, sendConfig } from '../ble/bleManager';
import { estimateScheduleSolar } from '../utils/powerEstimator';
import { useDevice } from '../context/DeviceContext';
import { verifyWrite } from '../utils/verifyWrite';
import { schedulesEqual } from '../utils/scheduleEquality';
import { readSchedulesFromDevice } from '../ble/bleManager';

type Nav = NativeStackNavigationProp<ScheduleStackParamList, 'Schedules'>;

export default function SchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const { device } = useDevice();
  const { loadRadioFromDevice } = useRadioConfig();

  const {
    draftSchedules,
    addSchedule,
    loadSchedulesFromDevice,
    clearSchedulesState,
    draftEngaged,
    collarEngaged,
    setDraftEngaged,
  } = useSchedules();

  // Switch always needs a boolean
  const effectiveDraftEngaged = draftEngaged ?? collarEngaged ?? false;

  // Prevent re-loading from device repeatedly due to device object identity changes
  const lastLoadedId = useRef<string | null>(null);

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

  const handleAddSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      name: `New Schedule ${draftSchedules.length + 1}`,
      window: { startHour: 0, endHour: 0 },

      gps: { enabled: false, sampleIntervalMin: 10, accuracy: 5 },
      light: { enabled: false, sampleIntervalMin: 10 },
      environmental: { enabled: false, sampleIntervalMin: 10 },
      particulate: { enabled: false, sampleIntervalMin: 10 },
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
        sendIntervalMin: 10,
      },
      lora: {
        enabled: false,
        sendIntervalMin: 10,
      },
      magnetometer: {
        enabled: false,
        sampleIntervalS: 10,
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

      if (result.ok) {
        await loadSchedulesFromDevice(device);
        Alert.alert('✅ Success', 'Schedules verified on device!');
      } else if (result.reason === 'mismatch') {
        await loadSchedulesFromDevice(device);
        Alert.alert(
          '⚠️ Sent, but mismatch',
          'Device schedule packet differs from what you sent (may be clamped).',
        );
      } else {
        Alert.alert(
          '⚠️ Sent, but not verified',
          'Could not read schedule config back from device.',
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send schedule config.');
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SCHEDULES</Text>
      <Text style={styles.sub}>
        Configure sampling and time windows for {device?.name ?? 'Collar'}
      </Text>

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

      {draftSchedules.length === 0 && (
        <Text style={{ color: '#777', marginBottom: 20 }}>
          No schedules loaded from device.
        </Text>
      )}

      {draftSchedules.map(s => {
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

        const solarEstimate = estimateScheduleSolar(s).totalSolarHours;

        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.card, isDisabled && styles.disabledCard]}
            onPress={() => navigation.navigate('EditSchedule', { schedule: s })}
          >
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardText}>
              🕓 {s.window.startHour}:00 – {s.window.endHour}:00
            </Text>

            <Text style={styles.cardText}>
              ☀️ {solarEstimate.toFixed(1)} solar-hours / day
            </Text>

            <View style={styles.detailsContainer}>
              {s.gps?.enabled && (
                <Text style={styles.cardDetail}>
                  📍 GPS: every {s.gps.sampleIntervalMin} min (accuracy{' '}
                  {s.gps.accuracy ?? 'N/A'})
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
                  📡 LoRaWAN: every {s.lorawan.sendIntervalMin ?? '?'} min
                </Text>
              )}
              {s.lora?.enabled && (
                <Text style={styles.cardDetail}>
                  📡 LoRa: every {s.lora.sendIntervalMin ?? '?'} min
                </Text>
              )}

              {s.magnetometer?.enabled && (
                <Text style={styles.cardDetail}>
                  🧲 Magnetometer: every {s.magnetometer.sampleIntervalS ?? '?'}{' '}
                  s
                </Text>
              )}

              {isDisabled && (
                <Text style={[styles.cardDetail, { color: '#888' }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
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
});
