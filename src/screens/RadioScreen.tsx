import React, { useEffect, useMemo, useState } from 'react';
import type { Device } from 'react-native-ble-plx';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as PB from '../proto/collar_pb.js';
import {
  connectToCollar,
  sendRadioConfig,
  buildBlePacketFromRadioConfig,
} from '../ble/bleManager';

import { useRadioConfig } from '../context/RadioConfigContext';
import { useDevice } from '../context/DeviceContext';
import { bytesToHex } from '../utils/protoUtils';

export default function RadioScreen() {
  const navigation = useNavigation<any>();
  const { device } = useDevice();

  const {
    deviceRadioConfig,
    draftRadioConfig,
    loadRadioFromDevice,
    subscribeToRadioStateUpdates,
  } = useRadioConfig();

  useEffect(() => {
    if (!device) return;

    (async () => {
      try {
        if (!(await device.isConnected())) {
          const d = await connectToCollar(device);
          if (!d) return;
        }

        await loadRadioFromDevice(device);

        console.log('🔔 Subscribing to live radio updates…');
        subscribeToRadioStateUpdates(device);
      } catch (e) {
        console.error('❌ RadioScreen init failed:', e);
      }
    })();

    return () => {
      console.log('🔕 Unsubscribing from radio updates');
      subscribeToRadioStateUpdates(null);
    };
  }, [device]);

  const handleEdit = () => {
    navigation.navigate('EditRadioConfig');
  };

  const handleSend = async () => {
    try {
      if (!device) {
        Alert.alert('No Device', 'You must connect to a collar first.');
        return;
      }

      if (!(await device.isConnected())) {
        Alert.alert(
          'Not connected',
          'Your collar connection was lost. Reconnect from Home.',
        );
        return;
      }

      if (!draftRadioConfig) {
        Alert.alert(
          'Nothing to send',
          'Tap EDIT, then SAVE to create a draft first.',
        );
        return;
      }

      const packet = buildBlePacketFromRadioConfig(draftRadioConfig);
      const ack = await sendRadioConfig(device, packet);

      if (ack) Alert.alert('✅ Success', 'Radio config sent and acknowledged!');
      else Alert.alert('⚠️ Sent', 'Sent to device but no ACK received.');

      if (ack) Alert.alert('✅ Success', 'Radio config sent and acknowledged!');
      else Alert.alert('⚠️ Sent', 'Sent to device but no ACK received.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Send failed', e?.message ?? 'Failed to send radio config.');
    }
  };

  const deviceSections = useMemo(
    () => formatRadioSections(deviceRadioConfig),
    [deviceRadioConfig],
  );
  const draftSections = useMemo(
    () => formatRadioSections(draftRadioConfig),
    [draftRadioConfig],
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>RADIO</Text>
      <Text style={styles.sub}>
        Configure radio settings for {device?.name ?? 'Collar'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>On Device</Text>

        {deviceRadioConfig ? (
          <>
            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>LoRaWAN</Text>
              <Text style={styles.mono}>{deviceSections.lorawan}</Text>
            </View>

            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>LoRa</Text>
              <Text style={styles.mono}>{deviceSections.lora}</Text>
            </View>

            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>Lost Mode</Text>
              <Text style={styles.mono}>{deviceSections.lost}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>No radio config loaded from device.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Draft (Saved Locally)</Text>

        {draftRadioConfig ? (
          <>
            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>LoRaWAN</Text>
              <Text style={styles.mono}>{draftSections.lorawan}</Text>
            </View>

            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>LoRa</Text>
              <Text style={styles.mono}>{draftSections.lora}</Text>
            </View>

            <View style={styles.subCard}>
              <Text style={styles.subCardTitle}>Lost Mode</Text>
              <Text style={styles.mono}>{draftSections.lost}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.muted}>
            No draft saved yet. Tap EDIT to create one.
          </Text>
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

function formatRadioSections(cfg: PB.RadioConfigPacket | null): {
  lorawan: string;
  lora: string;
  lost: string;
} {
  if (!cfg) return { lorawan: '', lora: '', lost: '' };

  const lorawan = (cfg as any).loRaWANConfig;
  const lora = (cfg as any).loRaConfig;
  const lostEnabled = Boolean((cfg as any).lostModeEnabled);
  const lostCfg = (cfg as any).lostModeConfig;

  const regionLabel = (n: number) =>
    (({ 0: 'US915', 1: 'AU915', 2: 'EU868' } as any)[n] ?? `Unknown(${n})`);

  const authLabel = (n: number) =>
    (({ 0: 'OTAA', 1: 'ABP' } as any)[n] ?? `Unknown(${n})`);

  const sfLabel = (n: number) =>
    (({ 0: 'SF7', 1: 'SF8', 2: 'SF9', 3: 'SF10', 4: 'SF11', 5: 'SF12' } as any)[
      n
    ] ?? `Unknown(${n})`);

  const bwLabel = (n: number) =>
    (({ 0: '125 kHz', 1: '250 kHz', 2: '500 kHz' } as any)[n] ??
    `Unknown(${n})`);

  const crLabel = (n: number) =>
    (({ 0: '4/5', 1: '4/6', 2: '4/7', 3: '4/8' } as any)[n] ?? `Unknown(${n})`);

  const pad2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

  // ---------------- LoRaWAN section ----------------
  const lorawanLines: string[] = [];
  lorawanLines.push(`Region: ${regionLabel(lorawan?.region ?? 0)}`);
  lorawanLines.push(`Auth: ${authLabel(lorawan?.auth ?? 0)}`);
  lorawanLines.push(
    `Tx only on new GPS fix: ${lorawan?.txOnlyOnNewGpsFix ? 'ON' : 'OFF'}`,
  );
  lorawanLines.push(
    `Transmit interval (min): ${lorawan?.transmitIntervalMin ?? 0}`,
  );
  lorawanLines.push(`TX power (dBm): ${lorawan?.txPowerDbm ?? 0}`);

  const otaa = lorawan?.otaa;
  const abp = lorawan?.abp;

  if (lorawan?.auth === 0 && otaa) {
    lorawanLines.push('');
    lorawanLines.push('OTAA credentials');
    lorawanLines.push(`devEui:  ${bytesToHex(otaa.devEui)}`);
    lorawanLines.push(`joinEui: ${bytesToHex(otaa.joinEui)}`);
    lorawanLines.push(`appKey:  ${bytesToHex(otaa.appKey)}`);
    lorawanLines.push(`nwkKey:  ${bytesToHex(otaa.nwkKey)}`);
  } else if (lorawan?.auth === 1 && abp) {
    lorawanLines.push('');
    lorawanLines.push('ABP credentials');
    lorawanLines.push(`devAddr:     ${bytesToHex(abp.devAddr)}`);
    lorawanLines.push(`nwkSKey:     ${bytesToHex(abp.nwkSKey)}`);
    lorawanLines.push(`appSKey:     ${bytesToHex(abp.appSKey)}`);
    lorawanLines.push(`fNwkSIntKey: ${bytesToHex(abp.fNwkSIntKey)}`);
    lorawanLines.push(`sNwkSIntKey: ${bytesToHex(abp.sNwkSIntKey)}`);
  } else {
    lorawanLines.push('');
    lorawanLines.push('Credentials: (not set)');
  }

  // ---------------- LoRa section ----------------
  const loraLines: string[] = [];
  loraLines.push(
    `Spreading factor: ${sfLabel(lora?.radioSpreadingFactor ?? 0)}`,
  );
  loraLines.push(`Bandwidth: ${bwLabel(lora?.radioBandwidth ?? 0)}`);
  loraLines.push(`Coding rate: ${crLabel(lora?.radioCodingRate ?? 0)}`);
  loraLines.push(`TX power (dBm): ${lora?.txPowerDbm ?? 0}`);
  loraLines.push(`Sync word: 0x${pad2(Number(lora?.syncWord ?? 0))}`);
  loraLines.push(`Frequency (MHz): ${lora?.frequency ?? 0}`);

  // ---------------- Lost section ----------------
  const lostLines: string[] = [];
  lostLines.push(`Enabled: ${lostEnabled ? 'ON' : 'OFF'}`);
  if (lostEnabled && lostCfg) {
    lostLines.push(`Activation epoch: ${lostCfg.activationEpoch}`);
    lostLines.push(`Transmit interval (min): ${lostCfg.transmitIntervalMin}`);
    lostLines.push(`TX power (dBm): ${lostCfg.txPowerDbm}`);
  }

  return {
    lorawan: lorawanLines.join('\n'),
    lora: loraLines.join('\n'),
    lost: lostLines.join('\n'),
  };
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  muted: { color: '#777' },
  mono: { color: '#333' },

  editButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    alignItems: 'center',
    paddingVertical: 14,
  },
  editText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

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
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },

  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
});
