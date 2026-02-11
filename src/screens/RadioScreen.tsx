import React, { useEffect, useMemo, useState } from 'react';
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

import * as PB from '../proto/collar_pb.js';
import {
  connectToCollar,
  sendRadioConfig,
  buildBlePacketFromRadioConfig,
} from '../ble/bleManager';

import { useRadioConfig } from '../context/RadioConfigContext';

export default function RadioScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { device: initialDevice } = route.params || {};
  const [device, setDevice] = useState<Device | null>(initialDevice ?? null);

  const {
    deviceRadioConfig,
    draftRadioConfig,
    loadRadioFromDevice,
    subscribeToRadioStateUpdates,
  } = useRadioConfig();

  useEffect(() => {
    if (!initialDevice) return;

    (async () => {
      try {
        let d: any = initialDevice;

        if (!(await d.isConnected())) {
          d = await connectToCollar(d);
        }
        if (!d) return;

        setDevice(d);

        // Load once
        await loadRadioFromDevice(d);

        // Live updates from RADIO characteristic
        console.log('🔔 Subscribing to live radio updates…');
        subscribeToRadioStateUpdates(d);
      } catch (e) {
        console.error('❌ RadioScreen init failed:', e);
      }
    })();

    return () => {
      console.log('🔕 Unsubscribing from radio updates');
      subscribeToRadioStateUpdates(null);
    };
  }, [initialDevice]);

  const handleEdit = () => {
    navigation.navigate('EditRadioConfig');
  };

  const handleSend = async () => {
    try {
      let d: any = device ?? initialDevice;
      if (!d) {
        Alert.alert('No Device', 'You must connect to a collar first.');
        return;
      }

      if (!(await d.isConnected())) {
        d = await connectToCollar(d);
        if (!d) {
          Alert.alert('Connection Failed', 'Could not connect to the collar.');
          return;
        }
        setDevice(d);
      }

      if (!draftRadioConfig) {
        Alert.alert(
          'Nothing to send',
          'Tap EDIT, then SAVE to create a draft first.',
        );
        return;
      }

      const packet = buildBlePacketFromRadioConfig(draftRadioConfig);
      const ack = await sendRadioConfig(d, packet);

      if (ack) Alert.alert('✅ Success', 'Radio config sent and acknowledged!');
      else Alert.alert('⚠️ Sent', 'Sent to device but no ACK received.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Send failed', e?.message ?? 'Failed to send radio config.');
    }
  };

  const deviceSummary = useMemo(
    () => summarizeRadio(deviceRadioConfig),
    [deviceRadioConfig],
  );
  const draftSummary = useMemo(
    () => summarizeRadio(draftRadioConfig),
    [draftRadioConfig],
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>RADIO</Text>
      <Text style={styles.sub}>
        Configure radio settings for {device?.name ?? initialDevice?.name ?? 'Collar'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>On Device</Text>
        {deviceRadioConfig ? (
          <Text style={styles.mono}>{deviceSummary}</Text>
        ) : (
          <Text style={styles.muted}>No radio config loaded from device.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Draft (Saved Locally)</Text>
        {draftRadioConfig ? (
          <Text style={styles.mono}>{draftSummary}</Text>
        ) : (
          <Text style={styles.muted}>No draft saved yet. Tap EDIT to create one.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editText}>EDIT</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendText}>SEND TO DEVICE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function summarizeRadio(cfg: PB.RadioConfigPacket | null): string {
  if (!cfg) return '';

  const lorawan = (cfg as any).loRaWANConfig;
  const lora = (cfg as any).loRaConfig;
  const lostEnabled = Boolean((cfg as any).lostModeEnabled);
  const lostCfg = (cfg as any).lostModeConfig;

  const lines: string[] = [];

  if (lorawan) {
    lines.push(`LoRaWAN region: ${lorawan.region}`);
    lines.push(`LoRaWAN auth: ${lorawan.auth}`);
    lines.push(`LoRaWAN txOnlyOnNewGpsFix: ${String(lorawan.txOnlyOnNewGpsFix)}`);
    lines.push(`LoRaWAN transmitIntervalMin: ${lorawan.transmitIntervalMin}`);
    lines.push(`LoRaWAN txPowerDbm: ${lorawan.txPowerDbm}`);
  }

  if (lora) {
    lines.push(
      `LoRa SF/BW/CR: ${lora.radioSpreadingFactor}/${lora.radioBandwidth}/${lora.radioCodingRate}`,
    );
    lines.push(`LoRa txPowerDbm: ${lora.txPowerDbm}`);
    lines.push(`LoRa syncWord: ${lora.syncWord}`);
    lines.push(`LoRa frequencyMHz: ${lora.frequency}`);
  }

  lines.push(`Lost Mode enabled: ${String(lostEnabled)}`);
  if (lostEnabled && lostCfg) {
    lines.push(`Lost activationEpoch: ${lostCfg.activationEpoch}`);
    lines.push(`Lost transmitIntervalMin: ${lostCfg.transmitIntervalMin}`);
    lines.push(`Lost txPowerDbm: ${lostCfg.txPowerDbm}`);
  }

  return lines.join('\n');
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  muted: { color: '#777' },
  mono: { color: '#333' },

  editButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 14,
  },
  editText: { color: '#111', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  sendButton: {
    backgroundColor: '#FDC996',
    borderRadius: 12,
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
