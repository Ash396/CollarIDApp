import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSchedules } from '../context/SchedulesContext';

export default function EditScheduleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { schedule } = route.params;

  const { updateSchedule, deleteSchedule } = useSchedules();

  /* ---------------- STATE ---------------- */
  const [name, setName] = useState(schedule.name ?? '');

  const [startHour, setStartHour] = useState(schedule.window?.startHour ?? 0);
  const [endHour, setEndHour] = useState(schedule.window?.endHour ?? 0);

  /* GPS */
  const [gpsEnabled, setGpsEnabled] = useState(schedule.gps?.enabled ?? false);
  const [gpsInterval, setGpsInterval] = useState(
    String(schedule.gps?.sampleIntervalMin ?? ''),
  );
  const [gpsAccuracy, setGpsAccuracy] = useState(schedule.gps?.accuracy ?? 5);

  /* Light */
  const [lightEnabled, setLightEnabled] = useState(
    schedule.light?.enabled ?? true,
  );
  const [lightInterval, setLightInterval] = useState(
    String(schedule.light?.sampleIntervalMin ?? ''),
  );

  /* Environmental */
  const [envEnabled, setEnvEnabled] = useState(
    schedule.environmental?.enabled ?? true,
  );
  const [envInterval, setEnvInterval] = useState(
    String(schedule.environmental?.sampleIntervalMin ?? ''),
  );

  /* Particulate */
  const [partEnabled, setPartEnabled] = useState(
    schedule.particulate?.enabled ?? true,
  );
  const [partInterval, setPartInterval] = useState(
    String(schedule.particulate?.sampleIntervalMin ?? ''),
  );

  /* Microphone */
  const [micEnabled, setMicEnabled] = useState(
    schedule.microphone?.enabled ?? false,
  );
  const [micContinuous, setMicContinuous] = useState(
    schedule.microphone?.continuousMode ?? false,
  );
  const [micLength, setMicLength] = useState(
    String(schedule.microphone?.sampleLengthMin ?? ''),
  );
  const [micWindow, setMicWindow] = useState(
    String(schedule.microphone?.sampleWindowMin ?? ''),
  );

  /* Accelerometer */
  const [accelEnabled, setAccelEnabled] = useState(
    schedule.accelerometer?.enabled ?? false,
  );
  const [accelRate, setAccelRate] = useState(
    schedule.accelerometer?.sampleRate ?? 0,
  );
  const [accelSensitivity, setAccelSensitivity] = useState(
    schedule.accelerometer?.sensitivity ?? 0,
  );

   /* LoRaWAN */
  const [lorawanEnabled, setLorawanEnabled] = useState(
    schedule.lorawan?.enabled ?? false
  );
  const [lorawanInterval, setLorawanInterval] = useState(
    String(schedule.lorawan?.sendIntervalMin ?? '')
  );

  /* Magnetometer */
  const [magEnabled, setMagEnabled] = useState(
    schedule.magnetometer?.enabled ?? false
  );
  const [magIntervalS, setMagIntervalS] = useState(
    String(schedule.magnetometer?.sampleIntervalS ?? '')
  );
  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Invalid name', 'Please enter a schedule name.');
      return;
    }

    const updated = {
      ...schedule,
      name,
      window: { startHour, endHour },
      gps: {
        enabled: gpsEnabled,
        sampleIntervalMin: Number(gpsInterval),
        accuracy: gpsAccuracy,
      },
      light: {
        enabled: lightEnabled,
        sampleIntervalMin: Number(lightInterval),
      },
      environmental: {
        enabled: envEnabled,
        sampleIntervalMin: Number(envInterval),
      },
      particulate: {
        enabled: partEnabled,
        sampleIntervalMin: Number(partInterval),
      },
      microphone: {
        enabled: micEnabled,
        continuousMode: micContinuous,
        sampleLengthMin: Number(micLength),
        sampleWindowMin: Number(micWindow),
      },
      accelerometer: {
        enabled: accelEnabled,
        sampleRate: accelRate,
        sensitivity: accelSensitivity,
      },
      lorawan: {
        enabled: lorawanEnabled,
        sendIntervalMin: Number(lorawanInterval),
      },
      magnetometer: {
        enabled: magEnabled,
        sampleIntervalS: Number(magIntervalS),
      },
    };

    updateSchedule(schedule.id, updated);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSchedule(schedule.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  /* ---------------- CARD HELPER ---------------- */
  const renderCard = (
    title: string,
    children: React.ReactNode,
    enabled?: boolean,
    onToggle?: (val: boolean) => void,
  ) => {
    const dim = enabled === false;
    return (
      <View style={[styles.card, dim && styles.cardDisabled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {typeof enabled === 'boolean' && onToggle && (
            <Switch value={enabled} onValueChange={onToggle} />
          )}
        </View>
        <View style={{ opacity: dim ? 0.5 : 1 }}>{children}</View>
      </View>
    );
  };

  /* ---------------- RENDER ---------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>

      {/* NAME */}
      {renderCard(
        'Schedule Info',
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter schedule name"
            placeholderTextColor="#999"
          />
        </>,
      )}

      {/* TIME WINDOW */}
      {renderCard(
        '🕓 Time Window',
        <>
          <Text style={styles.label}>Start Hour</Text>
          <Picker
            selectedValue={startHour}
            onValueChange={v => setStartHour(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            {[...Array(24).keys()].map(h => (
              <Picker.Item key={h} label={`${h}:00`} value={h} />
            ))}
          </Picker>

          <Text style={styles.label}>End Hour</Text>
          <Picker
            selectedValue={endHour}
            onValueChange={v => setEndHour(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            {[...Array(24).keys()].map(h => (
              <Picker.Item key={h} label={`${h}:00`} value={h} />
            ))}
          </Picker>
        </>,
      )}

      {/* GPS */}
      {renderCard(
        '📍 GPS',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={gpsInterval}
            onChangeText={setGpsInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Accuracy (1–10)</Text>
          <Picker
            selectedValue={gpsAccuracy}
            onValueChange={v => setGpsAccuracy(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            {[...Array(10).keys()].map(a => (
              <Picker.Item key={a + 1} label={`${a + 1}`} value={a + 1} />
            ))}
          </Picker>
        </>,
        gpsEnabled,
        setGpsEnabled,
      )}

      {/* LIGHT */}
      {renderCard(
        '💡 Light',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={lightInterval}
            onChangeText={setLightInterval}
            placeholder="1–60 min"
            placeholderTextColor="#999"
          />
        </>,
        lightEnabled,
        setLightEnabled,
      )}

      {/* ENVIRONMENTAL */}
      {renderCard(
        '🌡️ Environmental',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={envInterval}
            onChangeText={setEnvInterval}
            placeholder="1–60 min"
            placeholderTextColor="#999"
          />
        </>,
        envEnabled,
        setEnvEnabled,
      )}

      {/* PARTICULATE */}
      {renderCard(
        '💨 Particulate',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={partInterval}
            onChangeText={setPartInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />
        </>,
        partEnabled,
        setPartEnabled,
      )}

      {/* MICROPHONE */}
      {renderCard(
        '🎙️ Microphone',
        <>
          <View style={styles.row}>
            <Text style={{ color: '#333' }}>Continuous Mode</Text>
            <Switch value={micContinuous} onValueChange={setMicContinuous} />
          </View>

          <Text style={styles.label}>Sample Window (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={micWindow}
            onChangeText={setMicWindow}
            placeholder="1–60 min"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Sample Length (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={micLength}
            onChangeText={setMicLength}
            placeholder={`1–${micWindow || '?'} min`}
            placeholderTextColor="#999"
          />
        </>,
        micEnabled,
        setMicEnabled,
      )}

      {/* ACCEL */}
      {renderCard(
        '🏃 Accelerometer',
        <>
          <Text style={styles.label}>Sample Rate</Text>
          <Picker
            selectedValue={accelRate}
            onValueChange={v => setAccelRate(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="25 Hz" value={0} />
            <Picker.Item label="50 Hz" value={1} />
          </Picker>

          <Text style={styles.label}>Sensitivity</Text>
          <Picker
            selectedValue={accelSensitivity}
            onValueChange={v => setAccelSensitivity(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="2G" value={0} />
            <Picker.Item label="4G" value={1} />
            <Picker.Item label="8G" value={2} />
          </Picker>
        </>,
        accelEnabled,
        setAccelEnabled,
      )}

      {/* LORAWAN */}
      {renderCard(
        '📡 LoRaWAN',
        <>
          <Text style={styles.label}>Send Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={lorawanInterval}
            onChangeText={setLorawanInterval}
            placeholder="e.g. 5–60"
            placeholderTextColor="#999"
            editable={lorawanEnabled}
          />
        </>,
        lorawanEnabled,
        setLorawanEnabled
      )}

      {/* MAGNETOMETER */}
      {renderCard(
        '🧲 Magnetometer',
        <>
          <Text style={styles.label}>Sample Interval (seconds)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={magIntervalS}
            onChangeText={setMagIntervalS}
            placeholder="e.g. 1–60"
            placeholderTextColor="#999"
            editable={magEnabled}
          />
        </>,
        magEnabled,
        setMagEnabled
      )}


      {/* BUTTONS */}
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
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
  title: { fontSize: 30, fontWeight: '700', color: '#111', marginBottom: 20 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDisabled: { backgroundColor: '#EEE' },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111',
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  saveButton: {
    backgroundColor: '#FDC996',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 17 },

  deleteButton: {
    backgroundColor: '#F87171',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  deleteText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});
