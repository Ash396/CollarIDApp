import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import * as PB from '../proto/collar_pb.js';
import { useDevice } from '../context/DeviceContext';

import CollarCard from '../components/CollarCard';
import AccountCard from '../components/AccountCard';
import MagCalModal from '../components/MagCalModal';
import FirmwareUpdateModal from '../components/FirmwareUpdateModal';
import type { MagCalOutcome } from '../utils/magCal';
import { MIN_SAFE_U5_BLE_BUILD, isU5BleSafe } from '../ble/ota';
import {
  manager,
  COLLAR_SERVICE_UUID,
  STATUS_CHAR_UUID,
  disconnectFromCollar,
  buildSchedulePacketFromAppState,
  sendConfig,
  readCollarCaps,
  MOCK_COLLAR,
  isMockDevice,
} from '../ble/bleManager';

import { useSchedules } from '../context/SchedulesContext';
import { useRadioConfig } from '../context/RadioConfigContext';
import {
  MAG_CAL_MIN_FW_BUILD,
  bleFeatureGates,
  fwGateNote,
  parseFwBuild,
} from '../utils/fw';

// uint64 proto fields decode as Long objects when the long lib is bundled,
// plain numbers otherwise — same tolerance as the website's longToNumber().
const toNum = (v: any): number =>
  typeof v?.toNumber === "function" ? v.toNumber() : Number(v ?? 0);

interface Collar {
  id: string;
  name: string;
  battery?: number;
  sdRemaining?: number;
  sdTotal?: number;
  connected: boolean;
  device?: any;
  lastUpdate?: string;
  firmwareVersion?: string;
  /** Boot HW-diagnostic bitmask (SystemStatePacket.hw_diag); undefined on
   *  firmware that predates it. Bit 7 = diagnostics ran; other set bits are
   *  faults. */
  hwDiag?: number;
}

export default function HomeScreen() {
  const [collars, setCollars] = useState<Collar[]>([]);
  const [scanning, setScanning] = useState(false);
  const { device, setDevice, fwBuild, setFwBuild, caps, setCaps, setSystemUid } =
    useDevice();
  const [connectedDevice, setConnectedDevice] = useState<Collar | null>(null);

  /* ---------- Magnetometer calibration (fw 398+, over the BLE tunnel) ---------- */
  // Lives with the collar card, like the website's calibration card in its
  // Bluetooth panel: physical possession is the authority, and the run
  // needs the collar in hand. Gated on the reported build; the modal does
  // the run (components/MagCalModal.tsx).
  const gates = bleFeatureGates(fwBuild, caps);
  const [magCalOpen, setMagCalOpen] = useState(false);
  const [magCalLast, setMagCalLast] = useState('');
  useEffect(() => {
    // Nothing about the collar that just left carries over to the next.
    if (!device) {
      setMagCalOpen(false);
      setMagCalLast('');
    }
  }, [device]);
  const openMagCal = () => {
    if (!gates.magCal) {
      Alert.alert(
        'Magnetometer calibration',
        `Magnetometer calibration needs firmware build ${MAG_CAL_MIN_FW_BUILD}+. ${fwGateNote(
          fwBuild,
          MAG_CAL_MIN_FW_BUILD,
        )}`,
      );
      return;
    }
    setMagCalOpen(true);
  };
  const onMagCalResult = (o: MagCalOutcome) => setMagCalLast(`Last run: ${o.title}`);

  /* ---------- Main-processor firmware update over Bluetooth ---------- */
  // The website's Update Device page, in a modal (components/
  // FirmwareUpdateModal.tsx). Deliberately NOT closed when the collar
  // leaves: the collar rebooting into the new image is what ends the
  // Bluetooth link, and the modal turns that into "update installed".
  const [fwUpdateOpen, setFwUpdateOpen] = useState(false);
  const openFwUpdate = () => {
    if (!isU5BleSafe(fwBuild)) {
      Alert.alert(
        'Firmware update',
        `Updating over Bluetooth needs firmware v1.14.0 (build ${MIN_SAFE_U5_BLE_BUILD})+ on the collar. ${fwGateNote(
          fwBuild,
          MIN_SAFE_U5_BLE_BUILD,
        )} Update it once over USB-C from the website’s Update Device page; after that, every update can be wireless.`,
      );
      return;
    }
    setFwUpdateOpen(true);
  };

  const navigation = useNavigation<any>();
  const lastSeenRef = useRef<Record<string, number>>({});

  const statusSubRef = useRef<{ remove: () => void } | null>(null);
  const disconnectSubRef = useRef<{ remove: () => void } | null>(null);
  const manualDisconnectRef = useRef(false);

  const { draftSchedules, draftEngaged, clearSchedulesState } = useSchedules();
  const { clearRadioState } = useRadioConfig();
  const DFU_SPECIAL_MODE = 27;

  // Surface the Bluetooth adapter state — a denied permission or a switched-
  // off radio used to render as a silent, misleading "no devices detected".
  const [bleState, setBleState] = useState<State | null>(null);
  useEffect(() => {
    const sub = manager.onStateChange(s => setBleState(s), true);
    return () => sub.remove();
  }, []);

  const handleEnterDfu = async (collar: Collar) => {
    if (!collar.device) return;

    try {
      const packet = buildSchedulePacketFromAppState(
        draftSchedules,
        draftEngaged ?? false,
        DFU_SPECIAL_MODE,
      );

      await sendConfig(collar.device, packet);
      console.log('✅ DFU packet sent');
    } catch (err) {
      console.error('Failed to send DFU packet:', err);
    }
  };

  /* ----------------------------------------------------------
   * Ensure Bluetooth ON
   * ---------------------------------------------------------- */
  async function ensureBluetoothReady() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }

    const state = await manager.state();
    if (state !== State.PoweredOn) {
      await new Promise<void>(resolve => {
        const sub = manager.onStateChange(newState => {
          if (newState === State.PoweredOn) {
            sub.remove();
            resolve();
          }
        }, true);
      });
    }
  }

  /* ----------------------------------------------------------
   * Scan (only when NOT connected)
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (connectedDevice) {
      manager.stopDeviceScan();
      setScanning(false);
      return;
    }

    let isCancelled = false;
    const lastSeen = lastSeenRef.current;
    let lastAdvAt = Date.now();

    let interval: any = null;
    let watchdog: any = null;

    const onScanResult = (error: any, device: any) => {
      if (isCancelled) return;

      if (error) {
        console.error('Scan error:', error);
        return;
      }

      if (!device?.name?.startsWith('CollarID')) return;

      const now = Date.now();
      lastAdvAt = now;
      lastSeen[device.id] = now;

      setCollars(prev => {
        const existing = prev.find(c => c.id === device.id);
        if (existing) return prev;
        return [
          ...prev,
          { id: device.id, name: device.name ?? 'Unknown', connected: false },
        ];
      });
    };

    const startScan = async () => {
      await ensureBluetoothReady();
      if (isCancelled) return;

      setScanning(true);
      manager.startDeviceScan(null, { allowDuplicates: true }, onScanResult);

      interval = setInterval(() => {
        const now = Date.now();
        setCollars(prev =>
          prev.filter(c => c.connected || now - (lastSeen[c.id] ?? 0) < 20000),
        );
      }, 2000);

      watchdog = setInterval(() => {
        if (isCancelled) return;

        const now = Date.now();
        if (now - lastAdvAt > 10000) {
          console.log('🛠️ Scan watchdog: restarting scan');
          manager.stopDeviceScan();
          lastAdvAt = now;
          manager.startDeviceScan(
            null,
            { allowDuplicates: true },
            onScanResult,
          );
        }
      }, 3000);
    };

    startScan();

    return () => {
      isCancelled = true;
      if (interval) clearInterval(interval);
      if (watchdog) clearInterval(watchdog);
      manager.stopDeviceScan();
      setScanning(false);
    };
  }, [connectedDevice]);

  useEffect(() => {
    return () => {
      statusSubRef.current?.remove();
      statusSubRef.current = null;
      disconnectSubRef.current?.remove();
      disconnectSubRef.current = null;
    };
  }, []);

  /* ----------------------------------------------------------
   * Connect
   * ---------------------------------------------------------- */
  const handleConnect = async (collar: Collar) => {
    try {
      manager.stopDeviceScan();
      setScanning(false);

      const connected = await manager.connectToDevice(collar.id, {
        autoConnect: false,
      });

      await connected.discoverAllServicesAndCharacteristics();

      if (Platform.OS === 'android') {
        try {
          const updated = await connected.requestMTU(185);
          console.log('✅ MTU updated to', updated.mtu);
        } catch (err) {
          console.warn('⚠️ requestMTU failed:', err);
        }
      }
      // cleanup old listeners if any
      statusSubRef.current?.remove();
      statusSubRef.current = null;
      disconnectSubRef.current?.remove();
      disconnectSubRef.current = null;

      // If collar disconnects unexpectedly, reset app state and go Home tab
      disconnectSubRef.current = manager.onDeviceDisconnected(
        connected.id,
        (error, _device) => {
          console.log('🔌 Disconnected:', error?.message);

          statusSubRef.current = null;
          disconnectSubRef.current = null;

          clearSchedulesState();
          clearRadioState();
          setDevice(null);
          setConnectedDevice(null);
          setCollars([]);

          if (manualDisconnectRef.current) {
            manualDisconnectRef.current = false;
            return;
          }
        },
      );

      clearSchedulesState();
      clearRadioState();
      setDevice(connected);

      console.log('🟣 after discover, about to subscribe to STATUS');

      statusSubRef.current = connected.monitorCharacteristicForService(
        COLLAR_SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, characteristic) => {
          console.log('🟡 STATUS callback fired', {
            hasError: !!error,
            hasValue: !!characteristic?.value,
          });

          if (error) {
            const msg = String((error as any)?.message ?? '');
            if (
              msg.includes('was disconnected') ||
              msg.includes('cancelled') ||
              msg.includes('canceled')
            ) {
              return; // expected on disconnect
            }
            console.error('🔥 STATUS monitor error:', error);
            return;
          }
          if (!characteristic?.value) return;

          // Live status: keep the card fresh (battery, SD, firmware,
          // hardware self-test) — matches the website's status subscription.
          try {
            const bytes = Buffer.from(characteristic.value, 'base64');
            const decoded = PB.BlePacket.decode(bytes);
            const sys = decoded.systemStatePacket;
            if (!sys) return;
            // The collar's own UID (what the CollarID server calls it) —
            // utils/collarUid.ts. 0 = not in this packet; keep what we have.
            if (decoded.header?.systemUid) {
              setSystemUid(decoded.header.systemUid);
            }
            setConnectedDevice(prev =>
              prev
                ? {
                    ...prev,
                    battery: sys.battery?.percentage ?? prev.battery,
                    sdRemaining: sys.sdcard
                      ? toNum(sys.sdcard.spaceRemaining)
                      : prev.sdRemaining,
                    sdTotal: sys.sdcard
                      ? toNum(sys.sdcard.totalSpace)
                      : prev.sdTotal,
                    firmwareVersion:
                      sys.firmwareVersion || prev.firmwareVersion,
                    hwDiag: sys.hwDiag ?? prev.hwDiag,
                    lastUpdate: new Date().toLocaleTimeString(),
                  }
                : prev,
            );
            // BLE feature gates key off the reported build. A just-rebooted
            // collar can send unparsable versions first — only overwrite on
            // a successful parse.
            const build = parseFwBuild(sys.firmwareVersion);
            if (build) setFwBuild(build);
          } catch (_) {
            /* mid-transition blob — ignore */
          }
        },
      );

      console.log('🟢 STATUS monitor created:', !!statusSubRef.current);

      const services = await connected.services();

      for (const service of services) {
        console.log(`🔹 Service ${service.uuid}`);

        const characteristics = await connected.characteristicsForService(
          service.uuid,
        );

        for (const c of characteristics) {
          console.log(`   ▸ Char ${c.uuid}`, {
            isReadable: c.isReadable,
            isWritableWithResponse: c.isWritableWithResponse,
            isWritableWithoutResponse: c.isWritableWithoutResponse,
            isNotifiable: c.isNotifiable,
            isIndicatable: c.isIndicatable,
          });
        }
      }
      /* ---------- Capability probe (add-on relay etc.) ---------- */
      try {
        setCaps(await readCollarCaps(connected));
      } catch (_) {
        setCaps(0);
      }

      /* ---------- Read STATUS metadata ---------- */
      try {
        const ch = await connected.readCharacteristicForService(
          COLLAR_SERVICE_UUID,
          STATUS_CHAR_UUID,
        );

        if (ch?.value) {
          const bytes = Buffer.from(ch.value, 'base64');
          const decoded = PB.BlePacket.decode(bytes);
          console.log('has systemStatePacket?', !!decoded.systemStatePacket);
          console.log('systemStatePacket:', decoded.systemStatePacket);
          const sys = decoded.systemStatePacket;
          if (sys && decoded.header?.systemUid) {
            setSystemUid(decoded.header.systemUid);
          }

          const updated = {
            ...collar,
            connected: true,
            device: connected,
            battery: sys?.battery?.percentage ?? null,
            sdRemaining: toNum(sys?.sdcard?.spaceRemaining),
            sdTotal: toNum(sys?.sdcard?.totalSpace),
            firmwareVersion: sys?.firmwareVersion || undefined,
            hwDiag: sys?.hwDiag ?? undefined,
            lastUpdate: new Date().toLocaleTimeString(),
          };
          const build = parseFwBuild(sys?.firmwareVersion);
          if (build) setFwBuild(build);

          setConnectedDevice(updated);
          setCollars([updated]);
        }
      } catch (err) {
        console.error('Metadata read error:', err);
      }

      navigation.navigate('SchedulesTab');
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  /* ----------------------------------------------------------
   * Disconnect
   * ---------------------------------------------------------- */
  const handleDisconnect = async (collar: Collar) => {
    if (!collar.device) return;

    try {
      manualDisconnectRef.current = true;

      const ok = await disconnectFromCollar(collar.device);
      if (!ok) {
        manualDisconnectRef.current = false;
        return;
      }

      clearSchedulesState();
      clearRadioState();
      setDevice(null);
      setConnectedDevice(null);
      setCollars([]);
    } catch (err) {
      manualDisconnectRef.current = false;
      console.error('Disconnect failed:', err);
    }
  };

  /* ---------------- DEV: mock collar (simulator, no Bluetooth) ---------------- */
  const handleConnectMock = () => {
    setDevice(MOCK_COLLAR);
    // Pretend current firmware so every gated feature shows (the newest gate
    // is the magnetometer calibration's).
    setFwBuild(MAG_CAL_MIN_FW_BUILD);
    // old: setFwBuild(310);
    setCaps(0x01); // add-on relay available
    Alert.alert(
      'Mock collar connected',
      'A simulated collar is connected (no Bluetooth needed). Open the Schedules, Radio, or Power tab to test the configurator.',
    );
  };

  const handleDisconnectMock = () => {
    clearSchedulesState();
    clearRadioState();
    setDevice(null);
  };

  const displayList = connectedDevice
    ? [connectedDevice]
    : collars.sort((a, b) => a.name.localeCompare(b.name));

  return (
    // old: <ScrollView style={styles.container}>
    // Taps must reach the account card's Sign in button while the keyboard
    // is up, and the keyboard must not cover its password field.
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {connectedDevice ? 'CONNECTED COLLAR' : 'NEARBY COLLARS'}
        </Text>
      </View>

      {/* Bluetooth trouble states — say WHY nothing is being found. */}
      {!connectedDevice && bleState !== null && bleState !== State.PoweredOn && (
        <View style={styles.bleWarnBox}>
          <Text style={styles.bleWarnTitle}>
            {bleState === State.Unauthorized
              ? 'Bluetooth permission needed'
              : bleState === State.PoweredOff
              ? 'Bluetooth is off'
              : bleState === State.Unsupported
              ? 'Bluetooth unavailable'
              : 'Starting Bluetooth…'}
          </Text>
          <Text style={styles.bleWarnText}>
            {bleState === State.Unauthorized
              ? 'This app is not allowed to use Bluetooth, so it cannot scan for collars. Allow Bluetooth for CollarIDApp in Settings.'
              : bleState === State.PoweredOff
              ? 'Turn on Bluetooth in Control Center or Settings to scan for collars.'
              : bleState === State.Unsupported
              ? 'This device does not support Bluetooth Low Energy.'
              : 'Waiting for the Bluetooth radio to become ready.'}
          </Text>
          {bleState === State.Unauthorized && (
            <TouchableOpacity
              style={styles.bleWarnButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.bleWarnButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {scanning && !connectedDevice && bleState === State.PoweredOn && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f8b26a" />
          <Text style={styles.subtext}>Scanning for CollarID devices…</Text>
        </View>
      )}

      {displayList.map(collar => (
        <CollarCard
          key={collar.id}
          name={collar.name}
          battery={collar.battery}
          sdRemaining={collar.sdRemaining}
          sdTotal={collar.sdTotal}
          connected={collar.connected}
          lastUpdate={collar.lastUpdate}
          firmwareVersion={collar.firmwareVersion}
          hwDiag={collar.hwDiag}
          onConnect={() => handleConnect(collar)}
          onDisconnect={() => handleDisconnect(collar)}
          onEnterDfu={() => handleEnterDfu(collar)}
        />
      ))}

      {!scanning &&
        !connectedDevice &&
        displayList.length === 0 &&
        bleState === State.PoweredOn && (
          <View style={styles.center}>
            <Text style={styles.subtext}>No CollarID devices detected.</Text>
          </View>
        )}

      {/* Magnetometer calibration — with the connected collar (the mock
          collar included, so the simulator can walk the modal). */}
      {device && (
        <View style={styles.magCalCard} testID="magcal-card">
          <Text style={styles.magCalTitle}>MAGNETOMETER CALIBRATION</Text>
          <Text style={styles.magCalText}>
            Corrects the compass for the collar's own metal and electronics.
            Do it before each deployment and after attaching or removing an
            add-on. Takes about a minute of turning the collar in your hands.
            The recorded data stay raw; the SD Card viewer applies the
            calibration.
          </Text>
          <TouchableOpacity
            style={[styles.magCalButton, !gates.magCal && styles.magCalButtonOff]}
            onPress={openMagCal}
            testID="magcal-open"
          >
            <Text style={styles.magCalButtonText}>Calibrate magnetometer…</Text>
          </TouchableOpacity>
          {!gates.magCal ? (
            <Text style={styles.magCalNote} testID="magcal-gate-note">
              {fwGateNote(fwBuild, MAG_CAL_MIN_FW_BUILD)}
            </Text>
          ) : magCalLast ? (
            <Text style={styles.magCalNote} testID="magcal-last">
              {magCalLast}
            </Text>
          ) : null}
        </View>
      )}
      <MagCalModal
        visible={magCalOpen}
        device={device}
        onClose={() => setMagCalOpen(false)}
        onResult={onMagCalResult}
      />

      {/* Firmware update over Bluetooth — with the connected collar. */}
      {device && (
        <View style={styles.magCalCard} testID="fwupdate-card">
          <Text style={[styles.magCalTitle, styles.fwTitle]}>FIRMWARE UPDATE</Text>
          <Text style={styles.magCalText}>
            Sends a new main-processor firmware to the collar over this
            Bluetooth connection, relayed through its radio module. The
            collar checks the image, swaps to it and restarts itself; the
            transfer takes a few minutes with the phone next to the collar.
          </Text>
          <TouchableOpacity
            style={[styles.magCalButton, styles.fwButton, !isU5BleSafe(fwBuild) && styles.magCalButtonOff]}
            onPress={openFwUpdate}
            testID="fwupdate-open"
          >
            <Text style={styles.fwButtonText}>Update firmware…</Text>
          </TouchableOpacity>
          {!isU5BleSafe(fwBuild) && (
            <Text style={styles.magCalNote} testID="fwupdate-gate-note">
              {fwGateNote(fwBuild, MIN_SAFE_U5_BLE_BUILD)}
            </Text>
          )}
        </View>
      )}
      <FirmwareUpdateModal
        visible={fwUpdateOpen}
        device={device}
        fwBuild={fwBuild}
        firmwareVersion={connectedDevice?.firmwareVersion}
        onClose={() => setFwUpdateOpen(false)}
      />

      {/* CollarID account — below the Bluetooth list so scanning/connecting
          stays exactly where it was. */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <AccountCard />

      {__DEV__ && (
        <View style={styles.center}>
          {isMockDevice(device) ? (
            <TouchableOpacity
              style={[styles.mockButton, styles.mockButtonOff]}
              onPress={handleDisconnectMock}
            >
              <Text style={styles.mockButtonText}>Disconnect Mock Collar</Text>
            </TouchableOpacity>
          ) : !device ? (
            <TouchableOpacity
              style={styles.mockButton}
              onPress={handleConnectMock}
            >
              <Text style={styles.mockButtonText}>🧪 Connect Mock Collar</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.mockHint}>
            Dev only — simulator testing without Bluetooth.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  header: { marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 18,
  },
  center: { alignItems: 'center', marginVertical: 24 },
  subtext: { marginTop: 10, fontSize: 16, color: '#444', fontWeight: '400' },
  mockButton: {
    backgroundColor: '#6D4AFF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  mockButtonOff: { backgroundColor: '#9CA3AF' },
  mockButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  mockHint: { marginTop: 8, fontSize: 12, color: '#999' },

  magCalCard: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  magCalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E7490',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  magCalText: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 12 },
  magCalButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#22b8cf',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  magCalButtonOff: { opacity: 0.5 },
  magCalButtonText: { color: '#0b1d22', fontWeight: '700', fontSize: 14 },
  magCalNote: { marginTop: 8, fontSize: 12, color: '#6B7280', lineHeight: 17 },
  fwTitle: { color: '#9A3412' },
  fwButton: { backgroundColor: '#f8b26a' },
  fwButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  bleWarnBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
  },
  bleWarnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 4,
  },
  bleWarnText: { fontSize: 14, color: '#9A3412', lineHeight: 20 },
  bleWarnButton: {
    marginTop: 10,
    backgroundColor: '#FDC996',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bleWarnButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
