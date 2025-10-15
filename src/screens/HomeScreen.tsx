import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CollarCard from '../components/CollarCard';
import { connectToCollar, subscribeToStatus } from '../ble/bleManager';
import { generateMockSystemStatePacket } from '../utils/mockPackets';

interface Collar {
  id: string;
  name: string;
  connected: boolean;
  engaged: boolean;
  battery?: number;
  lastSync?: string;
  device?: any;
}

export default function HomeScreen() {
  const [collars, setCollars] = useState<Collar[]>([
    { id: '1', name: 'COLLAR 1', connected: false, engaged: false, lastSync: '—' },
    { id: '2', name: 'COLLAR 2', connected: false, engaged: false, lastSync: '—' },
  ]);

  const [simulationMode, setSimulationMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ---------------- SIMULATION MODE ---------------- */
  const simulateUpdate = (id: string) => {
    const mockPacket = generateMockSystemStatePacket();
    setCollars(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              connected: true,
              engaged: mockPacket.system_state_packet.engage_state,
              battery: mockPacket.system_state_packet.battery_state?.percentage ?? 0,
              lastSync: new Date(mockPacket.header.epoch).toLocaleTimeString(),
            }
          : { ...c, connected: false, engaged: false }
      )
    );
    console.log('🔧 Simulated packet:', mockPacket);
  };

  const simulateDisconnect = (id: string) => {
    setCollars(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, connected: false, engaged: false, lastSync: '1 month ago' }
          : c
      )
    );
    console.log(`🔌 Collar ${id} disconnected`);
  };

  /* ---------------- REAL BLE MODE ---------------- */
  const handleBLEConnect = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Disconnect existing collars
      for (const c of collars) {
        if (c.connected && c.device) {
          console.log('Disconnecting', c.name);
          await c.device.cancelConnection();
        }
      }

      console.log('🔍 Scanning for CollarID_xxxxxx devices...');
      const device = await connectToCollar();
      if (!device) {
        setErrorMsg('No CollarID device found');
        return;
      }

      console.log('✅ Connected to:', device.name);
      setConnectedDeviceName(device.name ?? 'Unknown Device');

      // Subscribe for live system state packets
      subscribeToStatus(device, data => {
        const packet = data.system_state_packet;
        setCollars(prev =>
          prev.map(c =>
            c.id === '1' // currently assuming single device for BLE mode
              ? {
                  ...c,
                  connected: true,
                  engaged: packet.engage_state,
                  battery: packet.battery_state?.percentage ?? 0,
                  lastSync: new Date().toLocaleTimeString(),
                  device,
                }
              : c
          )
        );
      });
    } catch (err: any) {
      console.error('❌ BLE connection failed:', err);
      setErrorMsg(err.message ?? 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MAIN RENDER ---------------- */
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>HOME</Text>
        <View style={styles.simRow}>
          <Text style={styles.simText}>Simulate</Text>
          <Switch value={simulationMode} onValueChange={setSimulationMode} />
        </View>
      </View>

      {/* BLE Connect Section */}
      {!simulationMode && (
        <View style={styles.center}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#f8b26a" />
              <Text style={styles.statusText}>Scanning for CollarID...</Text>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleBLEConnect}>
              <Text style={styles.buttonText}>CONNECT TO COLLAR</Text>
            </TouchableOpacity>
          )}

          {connectedDeviceName && (
            <Text style={styles.successText}>✅ Connected to {connectedDeviceName}</Text>
          )}

          {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}
        </View>
      )}

      {/* Collars List */}
      {collars.map(c => (
        <CollarCard
          key={c.id}
          name={c.name}
          engaged={c.engaged}
          connected={c.connected}
          battery={c.battery}
          lastSync={c.lastSync}
          onPress={() =>
            simulationMode
              ? c.connected
                ? simulateDisconnect(c.id)
                : simulateUpdate(c.id)
              : undefined
          }
        />
      ))}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fffaf6' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '800' },
  simRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  simText: { fontSize: 16, fontWeight: '500' },
  center: { alignItems: 'center', marginVertical: 30 },
  button: {
    backgroundColor: '#f8b26a',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  statusText: { marginTop: 10, fontSize: 16, color: '#444' },
  successText: { marginTop: 10, fontSize: 16, color: '#1a7d33' },
  errorText: { marginTop: 10, fontSize: 16, color: '#b22222' },
});

