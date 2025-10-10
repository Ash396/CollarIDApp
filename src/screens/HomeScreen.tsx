import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
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
    {
      id: '1',
      name: 'COLLAR 1',
      connected: false,
      engaged: false,
      lastSync: '—',
    },
    {
      id: '2',
      name: 'COLLAR 2',
      connected: false,
      engaged: false,
      lastSync: '—',
    },
  ]);

  // Toggle this to switch between real BLE and simulation
  const [simulationMode, setSimulationMode] = useState(true);

  // --- SIMULATION MODE ---
  const simulateUpdate = (id: string) => {
    const mockPacket = generateMockSystemStatePacket();

    setCollars(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              connected: true,
              engaged: mockPacket.system_state_packet.engage_state,
              battery:
                mockPacket.system_state_packet.battery_state?.percentage ?? 0,
              lastSync: new Date(mockPacket.header.epoch).toLocaleTimeString(),
              packet: mockPacket, // store for debugging
            }
          : { ...c, connected: false, engaged: false },
      ),
    );

    console.log('Simulated packet:', mockPacket);
  };

  const simulateDisconnect = (id: string) => {
    setCollars(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, connected: false, engaged: false, lastSync: '1 month ago' }
          : c,
      ),
    );

    console.log(`Collar ${id} disconnected`);
  };

  // --- REAL BLE MODE ---
  const handleBLEPress = async (id: string) => {
    try {
      // Disconnect any currently connected collars
      for (const c of collars) {
        if (c.connected && c.device) {
          console.log('Disconnecting', c.name);
          await c.device.cancelConnection();
        }
      }

      // Connect to the selected collar
      const device = await connectToCollar();
      if (!device) return;

      console.log('Connected to:', device.name);

      // Subscribe to BLE status updates
      subscribeToStatus(device, data => {
        const packet = data.system_state_packet;
        setCollars(prev =>
          prev.map(c =>
            c.id === id
              ? {
                  ...c,
                  connected: true,
                  engaged: packet.engage_state,
                  battery: packet.battery_state?.percentage ?? 0,
                  lastSync: new Date().toLocaleTimeString(),
                  device,
                }
              : { ...c, connected: false },
          ),
        );
      });
    } catch (error) {
      console.error('BLE connection failed:', error);
    }
  };

  const handlePress = (id: string) => {
    if (simulationMode) {
      simulateUpdate(id);
    } else {
      handleBLEPress(id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>HOME</Text>
        <View style={styles.simRow}>
          <Text style={styles.simText}>Simulate</Text>
          <Switch value={simulationMode} onValueChange={setSimulationMode} />
        </View>
      </View>

      {collars.map(c => (
        <CollarCard
          key={c.id}
          name={c.name}
          engaged={c.engaged}
          connected={c.connected}
          battery={c.battery}
          lastSync={c.lastSync}
          onPress={() =>
            c.connected ? simulateDisconnect(c.id) : simulateUpdate(c.id)
          }
        />
      ))}
    </ScrollView>
  );
}

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
});
