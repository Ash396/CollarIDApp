import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import * as PB from '../proto/collar_pb.js';
import { useDevice } from '../context/DeviceContext';

import CollarCard from '../components/CollarCard';
import {
  manager,
  COLLAR_SERVICE_UUID,
  STATUS_CHAR_UUID,
  disconnectFromCollar,
} from '../ble/bleManager';

interface Collar {
  id: string;
  name: string;
  battery?: number;
  sdRemaining?: number;
  sdTotal?: number;
  connected: boolean;
  device?: any;
  lastUpdate?: string;
}

export default function HomeScreen() {
  const [collars, setCollars] = useState<Collar[]>([]);
  const [scanning, setScanning] = useState(false);
  const { setDevice } = useDevice();
  const [connectedDevice, setConnectedDevice] = useState<Collar | null>(null);

  const navigation = useNavigation<any>();
  const lastSeenRef = useRef<Record<string, number>>({});

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

    const startScan = async () => {
      await ensureBluetoothReady();
      setScanning(true);

      manager.startDeviceScan(
        null,
        { allowDuplicates: true },
        (error, device) => {
          if (isCancelled) return;
          if (error) {
            console.error('Scan error:', error);
            setScanning(false);
            return;
          }

          if (!device?.name?.startsWith('CollarID')) return;

          const now = Date.now();
          lastSeen[device.id] = now;

          setCollars(prev => {
            const existing = prev.find(c => c.id === device.id);
            if (existing) return prev;
            return [
              ...prev,
              {
                id: device.id,
                name: device.name ?? 'Unknown',
                connected: false,
              },
            ];
          });
        },
      );

      const interval = setInterval(() => {
        const now = Date.now();
        setCollars(prev =>
          prev.filter(c => c.connected || now - (lastSeen[c.id] ?? 0) < 5000),
        );
      }, 2000);

      return () => {
        isCancelled = true;
        clearInterval(interval);
        manager.stopDeviceScan();
        setScanning(false);
      };
    };

    startScan();

    return () => {
      isCancelled = true;
      manager.stopDeviceScan();
      setScanning(false);
    };
  }, [connectedDevice]);

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

      setDevice(connected);
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
      /* ---------- Read STATUS metadata ---------- */
      try {
        const ch = await connected.readCharacteristicForService(
          COLLAR_SERVICE_UUID,
          STATUS_CHAR_UUID,
        );

        if (ch?.value) {
          const bytes = Buffer.from(ch.value, 'base64');
          const decoded = PB.BlePacket.decode(bytes);

          const sys = decoded.systemStatePacket;

          const updated = {
            ...collar,
            connected: true,
            device: connected,
            battery: sys?.battery?.percentage ?? null,
            sdRemaining: Number(sys?.sdcard?.spaceRemaining ?? 0),
            sdTotal: Number(sys?.sdcard?.totalSpace ?? 0),
            lastUpdate: new Date().toLocaleTimeString(),
          };

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
      await disconnectFromCollar(collar.device);
      setDevice(null);
      setConnectedDevice(null);
      setCollars([]);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const displayList = connectedDevice
    ? [connectedDevice]
    : collars.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {connectedDevice ? 'CONNECTED COLLAR' : 'NEARBY COLLARS'}
        </Text>
      </View>

      {scanning && !connectedDevice && (
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
          onConnect={() => handleConnect(collar)}
          onDisconnect={() => handleDisconnect(collar)}
        />
      ))}

      {!scanning && !connectedDevice && displayList.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.subtext}>No CollarID devices detected.</Text>
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
  center: { alignItems: 'center', marginVertical: 24 },
  subtext: { marginTop: 10, fontSize: 16, color: '#444', fontWeight: '400' },
});
