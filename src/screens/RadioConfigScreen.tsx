import React, { useMemo, useState } from 'react';
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

/**
 * Dummy UI only (no schedules, no BLE, no protobuf).
 * Matches EditScheduleScreen styling and conditional behavior.
 */

type RadioRegion = 'REGION_US915' | 'REGION_AU915' | 'REGION_EU868';
type RadioAuth = 'AUTH_OTAA' | 'AUTH_ABP';

const isHex = (s: string) => /^[0-9a-fA-F]*$/.test(s);
const cleanHex = (s: string) => s.replace(/[^0-9a-fA-F]/g, '').toUpperCase();

function toUnixEpochSecondsFromLocal(dateStr: string, timeStr: string): number | undefined {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM (24h)
  if (!dateStr || !timeStr) return undefined;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!m || !t) return undefined;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(t[1]);
  const minute = Number(t[2]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return undefined;
  }
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;
  if (hour < 0 || hour > 23) return undefined;
  if (minute < 0 || minute > 59) return undefined;

  const d = new Date(year, month - 1, day, hour, minute, 0);
  const seconds = Math.floor(d.getTime() / 1000);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export default function RadioConfigScreen() {
  /* ---------------- LoRaWAN ---------------- */
  const [lorawanRegion, setLorawanRegion] = useState<RadioRegion>('REGION_US915');
  const [lorawanAuth, setLorawanAuth] = useState<RadioAuth>('AUTH_OTAA');

  // OTAA credentials (hex strings)
  const [devEui, setDevEui] = useState('');
  const [joinEui, setJoinEui] = useState('');
  const [appKey, setAppKey] = useState('');
  const [nwkKey, setNwkKey] = useState('');

  // ABP credentials (hex strings)
  const [devAddr, setDevAddr] = useState('');
  const [nwkSKey, setNwkSKey] = useState('');
  const [appSKey, setAppSKey] = useState('');
  const [fNwkSIntKey, setFNwkSIntKey] = useState('');
  const [sNwkSIntKey, setSNwkSIntKey] = useState('');

  const [txOnlyOnNewGps, setTxOnlyOnNewGps] = useState(false);
  const [lorawanTransmitInterval, setLorawanTransmitInterval] = useState(''); // min
  const [lorawanTxPowerDbm, setLorawanTxPowerDbm] = useState(14); // 0..23

  /* ---------------- LoRa ---------------- */
  const [loraSF, setLoraSF] = useState<'SF7' | 'SF8' | 'SF9' | 'SF10' | 'SF11' | 'SF12'>('SF7');
  const [loraBW, setLoraBW] = useState<'125' | '250' | '500'>('125'); // kHz
  const [loraCR, setLoraCR] = useState<'4/5' | '4/6' | '4/7' | '4/8'>('4/5');
  const [loraTxPowerDbm, setLoraTxPowerDbm] = useState(14); // 0..26
  const [syncWordHex, setSyncWordHex] = useState(''); // 2 hex chars

  /* ---------------- Lost Mode ---------------- */
  const [lostModeEnabled, setLostModeEnabled] = useState(false);

  // date/time entry (dummy -> will convert to epoch)
  const [activationDate, setActivationDate] = useState(''); // YYYY-MM-DD
  const [activationTime, setActivationTime] = useState(''); // HH:MM
  const [lostModeTransmitInterval, setLostModeTransmitInterval] = useState(''); // min
  const [lostModeTxPowerDbm, setLostModeTxPowerDbm] = useState(14); // 0..26

  const activationEpochPreview = useMemo(() => {
    const epoch = toUnixEpochSecondsFromLocal(activationDate, activationTime);
    return epoch;
  }, [activationDate, activationTime]);

  /* ---------------- CARD HELPER (copied style) ---------------- */
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

  /* ---------------- Validation helpers ---------------- */
  const requireHexLen = (label: string, value: string, hexLen: number) => {
    if (value.length !== hexLen || !isHex(value)) {
      Alert.alert('Invalid field', `${label} must be exactly ${hexLen} hex characters.`);
      return false;
    }
    return true;
  };

  const requirePositiveNumber = (label: string, raw: string) => {
    const n = Number(raw);
    if (!raw.trim() || !Number.isFinite(n) || n <= 0) {
      Alert.alert('Invalid value', `${label} must be a number greater than 0.`);
      return false;
    }
    return true;
  };

  const handleSave = () => {
    // Dummy save: validate + show summary

    // LoRaWAN credentials
    if (lorawanAuth === 'AUTH_OTAA') {
      if (
        !requireHexLen('devEui', devEui, 16) ||
        !requireHexLen('joinEui', joinEui, 16) ||
        !requireHexLen('appKey', appKey, 32) ||
        !requireHexLen('nwkKey', nwkKey, 32)
      ) {
        return;
      }
    } else {
      if (
        !requireHexLen('devAddr', devAddr, 8) ||
        !requireHexLen('nwkSKey', nwkSKey, 32) ||
        !requireHexLen('appSKey', appSKey, 32) ||
        !requireHexLen('fNwkSIntKey', fNwkSIntKey, 32) ||
        !requireHexLen('sNwkSIntKey', sNwkSIntKey, 32)
      ) {
        return;
      }
    }

    // LoRaWAN tx only on new GPS -> require interval if ON
    if (txOnlyOnNewGps) {
      if (!requirePositiveNumber('LoRaWAN transmitInterval (min)', lorawanTransmitInterval)) return;
    }

    // LoRa sync word: 2 hex chars -> integer 0..255 conceptually
    if (syncWordHex.trim()) {
      const v = syncWordHex.trim();
      if (v.length !== 2 || !isHex(v)) {
        Alert.alert('Invalid value', 'syncWord must be exactly 2 hex characters (00–FF).');
        return;
      }
    }

    // Lost mode if enabled -> require fields
    if (lostModeEnabled) {
      const epoch = toUnixEpochSecondsFromLocal(activationDate, activationTime);
      if (epoch === undefined) {
        Alert.alert('Invalid value', 'Activation date/time must be valid (YYYY-MM-DD and HH:MM).');
        return;
      }
      if (!requirePositiveNumber('Lost Mode transmit interval (min)', lostModeTransmitInterval)) return;
    }

    const syncWordInt = syncWordHex.trim()
      ? parseInt(syncWordHex.trim(), 16)
      : undefined;

    const summaryLines = [
      `LoRaWAN region: ${lorawanRegion}`,
      `LoRaWAN auth: ${lorawanAuth}`,
      `txOnlyOnNewGpsFix: ${txOnlyOnNewGps ? 'ON' : 'OFF'}`,
      `LoRaWAN txPowerDbm: ${lorawanTxPowerDbm}`,
      `LoRa SF/BW/CR: ${loraSF} / ${loraBW}kHz / CR ${loraCR}`,
      `LoRa txPowerDbm: ${loraTxPowerDbm}`,
      `LoRa syncWord: ${syncWordHex.trim() ? `0x${syncWordHex.trim()} (${syncWordInt})` : '(empty)'}`,
      `Lost Mode: ${lostModeEnabled ? 'ON' : 'OFF'}`,
      ...(lostModeEnabled
        ? [
            `activationEpoch: ${activationEpochPreview}`,
            `lost transmitIntervalMin: ${lostModeTransmitInterval}`,
            `lost txPowerDbm: ${lostModeTxPowerDbm}`,
          ]
        : []),
    ];

    Alert.alert('Saved (dummy)', summaryLines.join('\n'));
  };

  /* ---------------- RENDER ---------------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Radio Config</Text>

      {/* ---------------- LoRaWAN ---------------- */}
      {renderCard(
        '📡 LoRaWAN',
        <>
          <Text style={styles.label}>Region</Text>
          <Picker
            selectedValue={lorawanRegion}
            onValueChange={v => setLorawanRegion(v)}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="US915" value="REGION_US915" />
            <Picker.Item label="AU915" value="REGION_AU915" />
            <Picker.Item label="EU868" value="REGION_EU868" />
          </Picker>

          <Text style={styles.label}>Auth</Text>
          <Picker
            selectedValue={lorawanAuth}
            onValueChange={v => setLorawanAuth(v)}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="OTAA" value="AUTH_OTAA" />
            <Picker.Item label="ABP" value="AUTH_ABP" />
          </Picker>

          {/* Credentials */}
          {lorawanAuth === 'AUTH_OTAA' ? (
            <>
              <Text style={styles.subHeader}>OTAA Credentials</Text>

              <Text style={styles.label}>devEui (16 hex)</Text>
              <TextInput
                style={styles.input}
                value={devEui}
                onChangeText={t => setDevEui(cleanHex(t).slice(0, 16))}
                placeholder="0123456789ABCDEF"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>joinEui (16 hex)</Text>
              <TextInput
                style={styles.input}
                value={joinEui}
                onChangeText={t => setJoinEui(cleanHex(t).slice(0, 16))}
                placeholder="0123456789ABCDEF"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>appKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={appKey}
                onChangeText={t => setAppKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>nwkKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={nwkKey}
                onChangeText={t => setNwkKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </>
          ) : (
            <>
              <Text style={styles.subHeader}>ABP Credentials</Text>

              <Text style={styles.label}>devAddr (8 hex)</Text>
              <TextInput
                style={styles.input}
                value={devAddr}
                onChangeText={t => setDevAddr(cleanHex(t).slice(0, 8))}
                placeholder="8 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>nwkSKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={nwkSKey}
                onChangeText={t => setNwkSKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>appSKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={appSKey}
                onChangeText={t => setAppSKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>fNwkSIntKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={fNwkSIntKey}
                onChangeText={t => setFNwkSIntKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>sNwkSIntKey (32 hex)</Text>
              <TextInput
                style={styles.input}
                value={sNwkSIntKey}
                onChangeText={t => setSNwkSIntKey(cleanHex(t).slice(0, 32))}
                placeholder="32 hex chars"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </>
          )}

          {/* txOnlyOnNewGps */}
          <View style={styles.row}>
            <Text style={{ color: '#333', fontWeight: '500' }}>
              Tx Only On New GPS Fix
            </Text>
            <Switch value={txOnlyOnNewGps} onValueChange={setTxOnlyOnNewGps} />
          </View>

          <Text style={styles.label}>Transmit Interval (minutes)</Text>
          <TextInput
            style={[styles.input, !txOnlyOnNewGps && styles.inputDisabled]}
            keyboardType="numeric"
            value={lorawanTransmitInterval}
            onChangeText={setLorawanTransmitInterval}
            placeholder="> 0"
            placeholderTextColor="#999"
            editable={txOnlyOnNewGps}
          />

          <Text style={styles.label}>TX Power (dBm) [0–23]</Text>
          <Picker
            selectedValue={lorawanTxPowerDbm}
            onValueChange={v => setLorawanTxPowerDbm(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            {Array.from({ length: 24 }, (_, i) => i).map(p => (
              <Picker.Item key={p} label={`${p} dBm`} value={p} />
            ))}
          </Picker>
        </>,
      )}

      {/* ---------------- LoRa ---------------- */}
      {renderCard(
        '📻 LoRa',
        <>
          <Text style={styles.label}>Radio Spreading Factor</Text>
          <Picker
            selectedValue={loraSF}
            onValueChange={v => setLoraSF(v)}
            itemStyle={{ color: '#111' }}
          >
            {(['SF7', 'SF8', 'SF9', 'SF10', 'SF11', 'SF12'] as const).map(sf => (
              <Picker.Item key={sf} label={sf} value={sf} />
            ))}
          </Picker>

          <Text style={styles.label}>Radio Bandwidth (kHz)</Text>
          <Picker
            selectedValue={loraBW}
            onValueChange={v => setLoraBW(v)}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="125 kHz" value="125" />
            <Picker.Item label="250 kHz" value="250" />
            <Picker.Item label="500 kHz" value="500" />
          </Picker>

          <Text style={styles.label}>Radio Coding Rate</Text>
          <Picker
            selectedValue={loraCR}
            onValueChange={v => setLoraCR(v)}
            itemStyle={{ color: '#111' }}
          >
            <Picker.Item label="CR 4/5" value="4/5" />
            <Picker.Item label="CR 4/6" value="4/6" />
            <Picker.Item label="CR 4/7" value="4/7" />
            <Picker.Item label="CR 4/8" value="4/8" />
          </Picker>

          <Text style={styles.label}>TX Power (dBm) [0–26]</Text>
          <Picker
            selectedValue={loraTxPowerDbm}
            onValueChange={v => setLoraTxPowerDbm(Number(v))}
            itemStyle={{ color: '#111' }}
          >
            {Array.from({ length: 27 }, (_, i) => i).map(p => (
              <Picker.Item key={p} label={`${p} dBm`} value={p} />
            ))}
          </Picker>

          <Text style={styles.label}>syncWord (2 hex chars)</Text>
          <TextInput
            style={styles.input}
            value={syncWordHex}
            onChangeText={t => setSyncWordHex(cleanHex(t).slice(0, 2))}
            placeholder="e.g. 12 (00–FF)"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          <Text style={styles.helper}>
            Stored as byte (0–255). Preview:{' '}
            {syncWordHex.trim().length === 2 && isHex(syncWordHex)
              ? `0x${syncWordHex} = ${parseInt(syncWordHex, 16)}`
              : '—'}
          </Text>
        </>,
      )}

      {/* ---------------- Lost Mode ---------------- */}
      {renderCard(
        '🚨 Lost Mode',
        <>
          {lostModeEnabled && (
            <>
              <Text style={styles.label}>Activation Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={activationDate}
                onChangeText={setActivationDate}
                placeholder="2026-02-06"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Activation Time (HH:MM, 24h)</Text>
              <TextInput
                style={styles.input}
                value={activationTime}
                onChangeText={setActivationTime}
                placeholder="13:45"
                placeholderTextColor="#999"
              />

              <Text style={styles.helper}>
                Epoch preview:{' '}
                {activationEpochPreview !== undefined ? activationEpochPreview : '—'}
              </Text>

              <Text style={styles.label}>Transmit Interval (minutes)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={lostModeTransmitInterval}
                onChangeText={setLostModeTransmitInterval}
                placeholder="> 0"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>TX Power (dBm) [0–26]</Text>
              <Picker
                selectedValue={lostModeTxPowerDbm}
                onValueChange={v => setLostModeTxPowerDbm(Number(v))}
                itemStyle={{ color: '#111' }}
              >
                {Array.from({ length: 27 }, (_, i) => i).map(p => (
                  <Picker.Item key={p} label={`${p} dBm`} value={p} />
                ))}
              </Picker>
            </>
          )}
        </>,
        lostModeEnabled,
        setLostModeEnabled,
      )}

      {/* SAVE */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES (match EditScheduleScreen) ---------------- */
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

  subHeader: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },

  helper: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },

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
  inputDisabled: {
    backgroundColor: '#F2F2F2',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    alignItems: 'center',
  },

  saveButton: {
    backgroundColor: '#FDC996',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
});
