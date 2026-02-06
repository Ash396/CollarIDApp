import React, { useEffect, useState } from 'react';
import type { Device } from 'react-native-ble-plx';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ScheduleStackParamList } from '../navigation/ScheduleNavigator';
import { useSchedules } from '../context/SchedulesContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import {
  buildSchedulePacketFromAppState,
  sendConfig,
  connectToCollar,
  sendRadioConfig,
} from '../ble/bleManager';
import { estimateScheduleSolar } from '../utils/powerEstimator';

type Nav = NativeStackNavigationProp<ScheduleStackParamList, 'Schedules'>;

export default function SchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { device: initialDevice } = route.params || {};
  const [device, setDevice] = useState<Device | null>(initialDevice ?? null);
  const { loadRadioFromDevice } = useRadioConfig();

  const {
    draftSchedules,
    addSchedule,
    loadSchedulesFromDevice,
    subscribeToScheduleUpdates,
  } = useSchedules();

  useEffect(() => {
    if (!initialDevice) return;

    (async () => {
      let d: any = initialDevice;

      if (!(await d.isConnected())) {
        d = await connectToCollar(d);
      }

      if (!d) return;

      setDevice(d);

      console.log('🔔 Subscribing to live schedule updates…');
      subscribeToScheduleUpdates(d);
    })();

    return () => {
      console.log('🔕 Unsubscribing from schedule updates');
      subscribeToScheduleUpdates(null); // removes previous subscription in context
    };
  }, [initialDevice]);

  /* ------------------------------------------------------------------
   * Connect if needed + Load schedules once
   * ------------------------------------------------------------------ */
  useEffect(() => {
    async function load() {
      try {
        let d: any = device ?? initialDevice;

        if (!d) {
          console.warn('⚠️ No device passed to SchedulesScreen');
          return;
        }

        // Ensure connected
        if (!(await d.isConnected())) {
          d = await connectToCollar(d);
        }

        if (!d) return;

        setDevice(d);

        // Load schedules + radio from BLE device
        await loadSchedulesFromDevice(d);
        await loadRadioFromDevice(d);
      } catch (err) {
        console.error('❌ Failed to load schedules/radio:', err);
      }
    }

    load();
  }, [initialDevice]);

  /* ---------------------------------------------------------
   * Add New Schedule Locally
   * --------------------------------------------------------- */
  const handleAddSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      name: `New Schedule ${draftSchedules.length + 1}`,
      window: { startHour: 8, endHour: 20 },
      gps: { enabled: true, sampleIntervalMin: 10, accuracy: 5 },
    };
    addSchedule(newSchedule);
  };

  /* ---------------------------------------------------------
   * Send Updated Schedule Packet to the Device
   * --------------------------------------------------------- */
  const handleSendToDevice = async () => {
    try {
      if (!initialDevice) {
        Alert.alert('No Device', 'You must connect to a collar first.');
        return;
      }

      const packet = buildSchedulePacketFromAppState(draftSchedules);
      const ack = await sendConfig(initialDevice, packet);

      if (ack) Alert.alert('✅ Success', 'Schedule sent and acknowledged!');
      else Alert.alert('⚠️ Sent', 'Sent to device but no ACK received.');
    } catch (err) {
      Alert.alert('Error', 'Failed to send schedule config.');
      console.error(err);
    }
  };

  /* ---------------------------------------------------------
   * RENDER
   * --------------------------------------------------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SCHEDULES</Text>
      <Text style={styles.sub}>
        Configure sampling and time windows for{' '}
        {device?.name ?? initialDevice?.name ?? 'Collar'}
      </Text>

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

/* ---------------- STYLES ---------------- */
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
