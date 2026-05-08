import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as PB from '../proto/collar_pb.js';
import { useRadioConfig } from '../context/RadioConfigContext';
import { hexByteToInt, hexToBytes, bytesToHex } from '../utils/protoUtils';
import StyledPicker from '../components/StyledPicker';

type RadioRegion = 'REGION_US915' | 'REGION_AU915' | 'REGION_EU868';
type RadioAuth = 'AUTH_OTAA' | 'AUTH_ABP';

const isHex = (s: string) => /^[0-9a-fA-F]*$/.test(s);
const cleanHex = (s: string) => s.replace(/[^0-9a-fA-F]/g, '').toUpperCase();

function toUnixEpochSecondsFromLocal(
  dateStr: string,
  timeStr: string,
): number | undefined {
  if (!dateStr || !timeStr) return undefined;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!m || !t) return undefined;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(t[1]);
  const minute = Number(t[2]);

  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;
  if (hour < 0 || hour > 23) return undefined;
  if (minute < 0 || minute > 59) return undefined;

  const d = new Date(year, month - 1, day, hour, minute, 0);
  const seconds = Math.floor(d.getTime() / 1000);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function fromUnixEpochSecondsToLocalStrings(epoch: number):
  | {
      date: string;
      time: string;
    }
  | undefined {
  if (!Number.isFinite(epoch) || epoch <= 0) return undefined;

  const d = new Date(epoch * 1000);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

export default function EditRadioConfigScreen() {
  const navigation = useNavigation<any>();
  const { deviceRadioConfig, draftRadioConfig, setDraftRadioConfig } =
    useRadioConfig();

  const seedCfg = draftRadioConfig ?? deviceRadioConfig;

  /* ---------------- LoRaWAN ---------------- */
  const [lorawanRegion, setLorawanRegion] =
    useState<RadioRegion>('REGION_US915');
  const [lorawanAuth, setLorawanAuth] = useState<RadioAuth>('AUTH_OTAA');

  const [devEui, setDevEui] = useState('');
  const [joinEui, setJoinEui] = useState('');
  const [appKey, setAppKey] = useState('');
  const [nwkKey, setNwkKey] = useState('');

  const [devAddr, setDevAddr] = useState('');
  const [nwkSKey, setNwkSKey] = useState('');
  const [appSKey, setAppSKey] = useState('');
  const [fNwkSIntKey, setFNwkSIntKey] = useState('');
  const [sNwkSIntKey, setSNwkSIntKey] = useState('');

  const [txOnlyOnNewGps, setTxOnlyOnNewGps] = useState(false);
  const [lorawanEnabled, setLorawanEnabled] = useState(true);

  /* ---------------- LoRa ---------------- */
  const [loraSF, setLoraSF] = useState<
    'SF7' | 'SF8' | 'SF9' | 'SF10' | 'SF11' | 'SF12'
  >('SF7');
  const [loraBW, setLoraBW] = useState<'125' | '250' | '500'>('125');
  const [loraCR, setLoraCR] = useState<'4/5' | '4/6' | '4/7' | '4/8'>('4/5');
  const [syncWordHex, setSyncWordHex] = useState('');

  const [loraFrequencyMHz, setLoraFrequencyMHz] = useState('');

  const [loraEnabled, setLoraEnabled] = useState(true);

  /* ---------------- Lost Mode ---------------- */
  const [lostModeEnabled, setLostModeEnabled] = useState(false);
  const [activationDate, setActivationDate] = useState('');
  const [activationTime, setActivationTime] = useState('');
  const [lostModeTransmitInterval, setLostModeTransmitInterval] = useState('');

  /* ---------------- Picker Options ---------------- */
  const regionOptions = [
    { label: 'US915', value: 'REGION_US915' },
    { label: 'AU915', value: 'REGION_AU915' },
    { label: 'EU868', value: 'REGION_EU868' },
  ];

  const authOptions = [
    { label: 'OTAA', value: 'AUTH_OTAA' },
    { label: 'ABP', value: 'AUTH_ABP' },
  ];

  const sfOptions = ['SF7', 'SF8', 'SF9', 'SF10', 'SF11', 'SF12'].map(sf => ({
    label: sf,
    value: sf,
  }));

  const bandwidthOptions = [
    { label: '125 kHz', value: '125' },
    { label: '250 kHz', value: '250' },
    { label: '500 kHz', value: '500' },
  ];

  const codingRateOptions = [
    { label: 'CR 4/5', value: '4/5' },
    { label: 'CR 4/6', value: '4/6' },
    { label: 'CR 4/7', value: '4/7' },
    { label: 'CR 4/8', value: '4/8' },
  ];

  // Seed state from existing draft/device config
  useEffect(() => {
    if (!seedCfg) return;

    const lorawan = (seedCfg as any).loRaWANConfig;
    const lora = (seedCfg as any).loRaConfig;
    const lostEnabled = Boolean((seedCfg as any).lostModeEnabled);
    const lostCfg = (seedCfg as any).lostModeConfig;

    setLorawanEnabled(lorawan != null);
    if (!lorawan) {
      setDevEui('');
      setJoinEui('');
      setAppKey('');
      setNwkKey('');
      setDevAddr('');
      setNwkSKey('');
      setAppSKey('');
      setFNwkSIntKey('');
      setSNwkSIntKey('');
      setTxOnlyOnNewGps(false);
    }
    setLoraEnabled(lora != null);
    if (!lora) {
      setSyncWordHex('');
      setLoraFrequencyMHz('');
      setLoraSF('SF7');
      setLoraBW('125');
      setLoraCR('4/5');
    }

    if (lorawan) {
      setLorawanRegion(
        lorawan.region === 1
          ? 'REGION_AU915'
          : lorawan.region === 2
          ? 'REGION_EU868'
          : 'REGION_US915',
      );
      setLorawanAuth(lorawan.auth === 1 ? 'AUTH_ABP' : 'AUTH_OTAA');
      setTxOnlyOnNewGps(Boolean(lorawan.txOnlyOnNewGpsFix));

      // Seed credential TextInputs from bytes -> hex
      const otaa = lorawan.otaa;
      const abp = lorawan.abp;

      if ((lorawan.auth ?? 0) === 0 && otaa) {
        setDevEui(bytesToHex(otaa.devEui));
        setJoinEui(bytesToHex(otaa.joinEui));
        setAppKey(bytesToHex(otaa.appKey));
        setNwkKey(bytesToHex(otaa.nwkKey));

        // Clear ABP fields to avoid stale UI
        setDevAddr('');
        setNwkSKey('');
        setAppSKey('');
        setFNwkSIntKey('');
        setSNwkSIntKey('');
      } else if ((lorawan.auth ?? 0) === 1 && abp) {
        setDevAddr(bytesToHex(abp.devAddr));
        setNwkSKey(bytesToHex(abp.nwkSKey));
        setAppSKey(bytesToHex(abp.appSKey));
        setFNwkSIntKey(bytesToHex(abp.fNwkSIntKey));
        setSNwkSIntKey(bytesToHex(abp.sNwkSIntKey));

        // Clear OTAA fields
        setDevEui('');
        setJoinEui('');
        setAppKey('');
        setNwkKey('');
      } else {
        // No credentials present
        setDevEui('');
        setJoinEui('');
        setAppKey('');
        setNwkKey('');
        setDevAddr('');
        setNwkSKey('');
        setAppSKey('');
        setFNwkSIntKey('');
        setSNwkSIntKey('');
      }
    }

    if (lora) {
      setLoraSF(
        ['SF7', 'SF8', 'SF9', 'SF10', 'SF11', 'SF12'][
          lora.radioSpreadingFactor ?? 0
        ] as any,
      );
      setLoraBW(
        lora.radioBandwidth === 1
          ? '250'
          : lora.radioBandwidth === 2
          ? '500'
          : '125',
      );
      setLoraCR(['4/5', '4/6', '4/7', '4/8'][lora.radioCodingRate ?? 0] as any);
      const sw = Number(lora.syncWord ?? 0);
      setSyncWordHex(sw.toString(16).padStart(2, '0').toUpperCase());
      setLoraFrequencyMHz(String(lora.frequency ?? ''));
    }

    setLostModeEnabled(lostEnabled);
    if (lostEnabled && lostCfg) {
      const activation = fromUnixEpochSecondsToLocalStrings(
        Number(lostCfg.activationEpoch ?? 0),
      );

      setActivationDate(activation?.date ?? '');
      setActivationTime(activation?.time ?? '');

      setLostModeTransmitInterval(String(lostCfg.transmitIntervalMin ?? ''));
    } else {
      setActivationDate('');
      setActivationTime('');
    }
  }, [seedCfg]);

  const activationEpochPreview = useMemo(() => {
    return toUnixEpochSecondsFromLocal(activationDate, activationTime);
  }, [activationDate, activationTime]);

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

  const requireHexLen = (label: string, value: string, hexLen: number) => {
    if (value.length !== hexLen || !isHex(value)) {
      Alert.alert(
        'Invalid field',
        `${label} must be exactly ${hexLen} hex characters.`,
      );
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

  const buildPbRadioConfigPacketFromUI = (): PB.RadioConfigPacket => {
    let loRaWANConfig: PB.LoRaWANConfig | undefined;
    let loRaConfig: PB.LoRaConfig | undefined;

    /* ---------------- LoRaWAN ---------------- */
    if (lorawanEnabled) {
      // Validate credentials
      if (lorawanAuth === 'AUTH_OTAA') {
        if (
          !requireHexLen('devEui', devEui, 16) ||
          !requireHexLen('joinEui', joinEui, 16) ||
          !requireHexLen('appKey', appKey, 32) ||
          !requireHexLen('nwkKey', nwkKey, 32)
        ) {
          throw new Error('Invalid OTAA fields');
        }
      } else {
        if (
          !requireHexLen('devAddr', devAddr, 8) ||
          !requireHexLen('nwkSKey', nwkSKey, 32) ||
          !requireHexLen('appSKey', appSKey, 32) ||
          !requireHexLen('fNwkSIntKey', fNwkSIntKey, 32) ||
          !requireHexLen('sNwkSIntKey', sNwkSIntKey, 32)
        ) {
          throw new Error('Invalid ABP fields');
        }
      }

      // Map strings to enum numbers (proto enum order)
      const regionNum =
        lorawanRegion === 'REGION_AU915'
          ? 1
          : lorawanRegion === 'REGION_EU868'
          ? 2
          : 0;
      const authNum = lorawanAuth === 'AUTH_ABP' ? 1 : 0;

      loRaWANConfig = PB.LoRaWANConfig.create({
        region: regionNum,
        auth: authNum,
        txOnlyOnNewGpsFix: Boolean(txOnlyOnNewGps),
        txPowerDbm: 22,
      });

      // oneof credentials
      if (authNum === 0) {
        loRaWANConfig.otaa = PB.RadioOTAA.create({
          devEui: hexToBytes(devEui, 8),
          joinEui: hexToBytes(joinEui, 8),
          appKey: hexToBytes(appKey, 16),
          nwkKey: hexToBytes(nwkKey, 16),
        });
        (loRaWANConfig as any).abp = undefined;
      } else {
        loRaWANConfig.abp = PB.RadioABP.create({
          devAddr: hexToBytes(devAddr, 4),
          nwkSKey: hexToBytes(nwkSKey, 16),
          appSKey: hexToBytes(appSKey, 16),
          fNwkSIntKey: hexToBytes(fNwkSIntKey, 16),
          sNwkSIntKey: hexToBytes(sNwkSIntKey, 16),
        });
        (loRaWANConfig as any).otaa = undefined;
      }
    }

    /* ---------------- LoRa ---------------- */
    if (loraEnabled) {
      // syncWord
      if (syncWordHex.trim()) {
        const v = syncWordHex.trim();
        if (v.length !== 2 || !isHex(v)) {
          Alert.alert(
            'Invalid value',
            'syncWord must be exactly 2 hex characters (00–FF).',
          );
          throw new Error('Invalid syncWord');
        }
      }

      // frequency 400..999 MHz
      const freq = Number(loraFrequencyMHz);
      if (
        !loraFrequencyMHz.trim() ||
        !Number.isFinite(freq) ||
        !Number.isInteger(freq) ||
        freq < 400 ||
        freq > 999
      ) {
        Alert.alert(
          'Invalid value',
          'LoRa frequency must be an integer from 400 to 999 (MHz).',
        );
        throw new Error('Invalid frequency');
      }

      const sfNum = (
        { SF7: 0, SF8: 1, SF9: 2, SF10: 3, SF11: 4, SF12: 5 } as const
      )[loraSF];
      const bwNum = loraBW === '250' ? 1 : loraBW === '500' ? 2 : 0;
      const crNum = ({ '4/5': 0, '4/6': 1, '4/7': 2, '4/8': 3 } as const)[
        loraCR
      ];

      loRaConfig = PB.LoRaConfig.create({
        radioSpreadingFactor: sfNum,
        radioBandwidth: bwNum,
        radioCodingRate: crNum,
        txPowerDbm: 22,
        syncWord: hexByteToInt(syncWordHex.trim() || '00'),
        frequency: Math.trunc(freq),
      });
    }

    /* ---------------- Lost Mode (unchanged) ---------------- */
    let activationEpoch = 0;
    if (lostModeEnabled) {
      const epoch = toUnixEpochSecondsFromLocal(activationDate, activationTime);
      if (epoch === undefined) {
        Alert.alert(
          'Invalid value',
          'Activation date/time must be valid (YYYY-MM-DD and HH:MM).',
        );
        throw new Error('Invalid lost mode activation time');
      }
      activationEpoch = epoch;
      if (
        !requirePositiveNumber(
          'Lost Mode transmit interval (min)',
          lostModeTransmitInterval,
        )
      ) {
        throw new Error('Invalid lost mode interval');
      }
    }

    const lostModeConfig = PB.LostMode_config.create({
      activationEpoch: Math.trunc(activationEpoch),
      transmitIntervalMin: lostModeEnabled
        ? Math.max(1, Math.trunc(Number(lostModeTransmitInterval)))
        : 1,
      txPowerDbm: 22,
    });

    const obj: any = {
      lostModeEnabled: Boolean(lostModeEnabled),
      lostModeConfig,
    };

    if (lorawanEnabled && loRaWANConfig) obj.loRaWANConfig = loRaWANConfig;
    if (loraEnabled && loRaConfig) obj.loRaConfig = loRaConfig;

    return PB.RadioConfigPacket.create(obj);
  };

  const handleSave = () => {
    try {
      const pb = buildPbRadioConfigPacketFromUI();
      setDraftRadioConfig(pb);
      navigation.goBack();
    } catch (e) {
      // alerts already shown
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Radio Config</Text>

      {renderCard(
        '📡 LoRaWAN',
        <>
          {lorawanEnabled && (
            <>
              <Text style={styles.label}>Region</Text>
              <StyledPicker
                selectedValue={lorawanRegion}
                onValueChange={value => setLorawanRegion(value as RadioRegion)}
                items={regionOptions}
                placeholder="Select region"
                enabled={lorawanEnabled}
              />

              <Text style={styles.label}>Auth</Text>
              <StyledPicker
                selectedValue={lorawanAuth}
                onValueChange={value => setLorawanAuth(value as RadioAuth)}
                items={authOptions}
                placeholder="Select auth mode"
                enabled={lorawanEnabled}
              />

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

              <View style={styles.row}>
                <Text style={{ color: '#333', fontWeight: '500' }}>
                  Tx Only On New GPS Fix
                </Text>
                <Switch
                  value={txOnlyOnNewGps}
                  onValueChange={setTxOnlyOnNewGps}
                />
              </View>
            </>
          )}
        </>,
        lorawanEnabled,
        setLorawanEnabled,
      )}

      {renderCard(
        '📻 LoRa',
        <>
          {loraEnabled && (
            <>
              <Text style={styles.label}>Radio Spreading Factor</Text>
              <StyledPicker
                selectedValue={loraSF}
                onValueChange={value =>
                  setLoraSF(
                    value as 'SF7' | 'SF8' | 'SF9' | 'SF10' | 'SF11' | 'SF12',
                  )
                }
                items={sfOptions}
                placeholder="Select spreading factor"
                enabled={loraEnabled}
              />

              <Text style={styles.label}>Radio Bandwidth (kHz)</Text>
              <StyledPicker
                selectedValue={loraBW}
                onValueChange={value =>
                  setLoraBW(value as '125' | '250' | '500')
                }
                items={bandwidthOptions}
                placeholder="Select bandwidth"
                enabled={loraEnabled}
              />

              <Text style={styles.label}>Radio Coding Rate</Text>
              <StyledPicker
                selectedValue={loraCR}
                onValueChange={value =>
                  setLoraCR(value as '4/5' | '4/6' | '4/7' | '4/8')
                }
                items={codingRateOptions}
                placeholder="Select coding rate"
                enabled={loraEnabled}
              />

              <Text style={styles.label}>syncWord (2 hex chars)</Text>
              <TextInput
                style={styles.input}
                value={syncWordHex}
                onChangeText={t => setSyncWordHex(cleanHex(t).slice(0, 2))}
                placeholder="e.g. 12 (00–FF)"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Frequency (MHz) [400–999]</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={loraFrequencyMHz}
                onChangeText={t =>
                  setLoraFrequencyMHz(t.replace(/[^0-9]/g, '').slice(0, 3))
                }
                placeholder="e.g. 915"
                placeholderTextColor="#999"
              />
            </>
          )}
        </>,
        loraEnabled,
        setLoraEnabled,
      )}

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
                {activationEpochPreview !== undefined
                  ? activationEpochPreview
                  : '—'}
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
            </>
          )}
        </>,
        lostModeEnabled,
        setLostModeEnabled,
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  inputDisabled: { backgroundColor: '#F2F2F2' },

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

  scrollContent: {
    paddingBottom: 50,
  },
});
