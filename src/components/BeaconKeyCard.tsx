// Lost-mode beacon encryption — the website configurator's LOST-MODE
// BEACON ENCRYPTION card (configure.html renderBeaconKeyCard /
// bleProvisionBeaconKey / bleClearBeaconKey), on the connected collar.
//
// Keys travel over the config tunnel only, like the factory reset: no
// CONFIG.CSV row, no radio path, and nothing here ever shows or logs the
// key itself, only its generation and key check value (KCV). Shown only
// when the connected collar's firmware can hold a key
// (RADIO_KEYS_MIN_FW_BUILD, a placeholder until the firmware merge) AND its
// status echo carries the report (absent = firmware without the key store,
// whatever its build says). The flow is utils/beaconKey.ts; the server is
// utils/api.ts. Rotation is the server's, admin-only on the website; the
// app does not offer it.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Device } from 'react-native-ble-plx';

import { beaconKeyIo } from '../ble/bleManager';
import {
  BEACON_KEY,
  beaconKeyBadge,
  beaconKeyReport,
  beaconKeyStatusLine,
  clearBeaconKey,
  provisionBeaconKey,
  serverKeyLine,
} from '../utils/beaconKey';
import type { BeaconKeyApi, BeaconKeyReport } from '../utils/beaconKey';
import {
  clearRadioKey,
  getRadioKeyStatus,
  issueRadioKey,
  markRadioKeyProvisioned,
} from '../utils/api';
import type { RadioKeyStatus } from '../utils/api';
import { useSession } from '../utils/useSession';

type Props = {
  device: Device | null;
  /** The collar's uid as the server names it ("0x0025001C"), or null. */
  uid: string | null;
};

const serverApi: BeaconKeyApi = {
  status: getRadioKeyStatus,
  issue: issueRadioKey,
  provisioned: markRadioKeyProvisioned,
  clear: clearRadioKey,
};

/** The words above the buttons (the website's card). */
export const BEACON_KEY_INTRO =
  'Optional. With a key, the collar’s lost-mode beacon carries its position encrypted: anyone can still hear ' +
  'which collar it is and home in on its signal, but only a receiver holding the key (the website’s Handheld Relay ' +
  'page with your sign-in, or your own receiver with the exported key) reads where it is. Without a key the beacon is ' +
  'plaintext, as it has always been. Regular LoRaWAN uplinks are encrypted either way.';
export const BEACON_KEY_FOOT =
  'Provisioning asks the server for this collar’s key (a new generation, derived from your organisation’s master), ' +
  'writes it over this Bluetooth connection and checks the collar’s echo against the server’s record. Rotating the ' +
  'master is done on the website by an administrator: every collar in the organisation must then be re-provisioned ' +
  'over Bluetooth, and each keeps its old key until it is.';

export default function BeaconKeyCard({ device, uid }: Props) {
  const session = useSession();
  const [report, setReport] = useState<BeaconKeyReport | null>(null);
  const [server, setServer] = useState<RadioKeyStatus | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // The collar's report rides every status echo: one query on connect.
  const readCollar = useCallback(async () => {
    if (!device) {
      setReport(null);
      return;
    }
    try {
      const echo = await beaconKeyIo(device).status();
      if (aliveRef.current) setReport(beaconKeyReport(echo));
    } catch (_) {
      if (aliveRef.current) setReport(null);
    }
  }, [device]);
  useEffect(() => {
    setReport(null);
    setMessage(null);
    setProgress('');
    readCollar();
  }, [readCollar]);

  // The server's record, when signed in and the collar's uid is known.
  const readServer = useCallback(async () => {
    if (!session.signedIn || !uid) {
      setServer(null);
      setServerError(null);
      return;
    }
    try {
      const s = await getRadioKeyStatus(uid);
      if (aliveRef.current) {
        setServer(s);
        setServerError(null);
      }
    } catch (e: any) {
      if (aliveRef.current) {
        setServer(null);
        setServerError(e?.status === 404 ? null : `Could not read the server’s record: ${e?.message ?? e}`);
      }
    }
  }, [session.signedIn, session.generation, uid]);
  useEffect(() => {
    readServer();
  }, [readServer]);

  // Firmware without the key store: the report is absent from its echo, so
  // there is nothing to offer (the website's "Not supported" badge).
  if (!device || (report && !report.supported)) return null;

  const S = BEACON_KEY.STATE;
  const canProvision = !!report?.supported && !busy && session.signedIn && !!uid && server?.kek_configured !== false;
  const canClear = !!report?.supported && !busy && report.state !== S.NONE;

  const provision = () => {
    if (!device || !report?.supported) return;
    if (!session.signedIn) {
      Alert.alert('Sign in first', 'The key comes from the CollarID server: sign in on the Account card.');
      return;
    }
    if (!uid) {
      Alert.alert('Collar UID unknown', 'Cannot determine the collar UID for the server yet. Wait for its status packet.');
      return;
    }
    Alert.alert(
      'Provision beacon encryption keys',
      `Provision beacon encryption keys for ${uid} from the CollarID server?\n\n` +
        'The collar sends its lost-mode beacon encrypted from its next beacon on. Anyone searching for it will ' +
        'need the key (the website’s Handheld Relay page, signed in).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Provision',
          onPress: async () => {
            setBusy(true);
            setMessage(null);
            try {
              const res = await provisionBeaconKey(beaconKeyIo(device), serverApi, uid, {
                onProgress: t => aliveRef.current && setProgress(t),
              });
              if (!aliveRef.current) return;
              setReport(res.report);
              if (res.server) setServer(res.server);
              setProgress(`provisioned ✓ generation ${res.gen}, KCV ${res.kcv}, confirmed by the collar`);
              setMessage({
                tone: 'ok',
                text: 'Beacon encryption provisioned: the lost-mode beacon is encrypted from the next beacon on.',
              });
            } catch (e: any) {
              if (!aliveRef.current) return;
              setProgress('');
              setMessage({ tone: 'error', text: `Provisioning: ${e?.message ?? e}` });
              readCollar();
              readServer();
            } finally {
              if (aliveRef.current) setBusy(false);
            }
          },
        },
      ],
    );
  };

  const remove = () => {
    if (!device || !report?.supported) return;
    Alert.alert(
      'Remove beacon encryption keys',
      `Remove the beacon encryption keys from ${uid || 'this collar'}?\n\n` +
        'Its lost-mode beacon goes back to plaintext from the next beacon on. The counter is kept, so a later key ' +
        'starts at a fresh generation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove keys',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            setMessage(null);
            try {
              const res = await clearBeaconKey(beaconKeyIo(device), session.signedIn ? serverApi : null, uid, {
                onProgress: t => aliveRef.current && setProgress(t),
              });
              if (!aliveRef.current) return;
              setReport(res.report);
              setMessage({
                tone: 'ok',
                text: 'Beacon encryption removed: the lost-mode beacon is plaintext from the next beacon on.',
              });
              readServer();
            } catch (e: any) {
              if (!aliveRef.current) return;
              setProgress('');
              setMessage({ tone: 'error', text: `Remove keys: ${e?.message ?? e}` });
              readCollar();
              readServer();
            } finally {
              if (aliveRef.current) setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card} testID="beaconkey-card">
      <View style={styles.headRow}>
        <Text style={styles.title}>LOST-MODE BEACON ENCRYPTION</Text>
        <Text
          style={[
            styles.badge,
            report?.state === S.KEYED && styles.badgeKeyed,
            report?.state === S.FALLBACK && styles.badgeFallback,
          ]}
          testID="beaconkey-badge"
        >
          {beaconKeyBadge(report)}
        </Text>
      </View>
      <Text style={styles.text}>{BEACON_KEY_INTRO}</Text>
      <Text style={styles.status} testID="beaconkey-status">
        {beaconKeyStatusLine(report)}
      </Text>
      {session.signedIn && uid && (server || serverError) && (
        <Text style={[styles.status, server?.stale && styles.stale]} testID="beaconkey-server">
          {serverError ?? serverKeyLine(server)}
        </Text>
      )}
      {!session.signedIn && (
        <Text style={styles.status} testID="beaconkey-signin">
          Sign in on the Account card to provision keys: they come from the CollarID server.
        </Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.primaryBtn, !canProvision && styles.btnOff]}
          onPress={provision}
          disabled={!canProvision}
          testID="beaconkey-provision"
        >
          <Text style={styles.primaryBtnText}>Provision keys from CollarID server…</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.ghostBtn, !canClear && styles.btnOff]}
          onPress={remove}
          disabled={!canClear}
          testID="beaconkey-clear"
        >
          <Text style={styles.ghostBtnText}>Remove keys (back to plaintext)…</Text>
        </TouchableOpacity>
      </View>
      {!!progress && (
        <Text style={styles.progress} testID="beaconkey-progress">
          {progress}
        </Text>
      )}
      {message && (
        <Text style={[styles.message, message.tone === 'error' && styles.messageError]} testID="beaconkey-message">
          {message.text}
        </Text>
      )}
      <Text style={styles.foot}>{BEACON_KEY_FOOT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F8FF',
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#C7D7F5',
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  title: { fontSize: 12, fontWeight: '700', color: '#1D4ED8', letterSpacing: 0.8 },
  badge: { fontSize: 11, fontWeight: '700', color: '#4B5563', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  badgeKeyed: { color: '#1D4ED8', backgroundColor: '#DBEAFE' },
  badgeFallback: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  text: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 8 },
  status: { fontSize: 12, color: '#374151', lineHeight: 17, marginBottom: 6 },
  stale: { color: '#9A3412' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  btn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  primaryBtn: { backgroundColor: '#3b82f6' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  ghostBtn: { backgroundColor: '#E5E7EB' },
  ghostBtnText: { color: '#111', fontWeight: '600', fontSize: 13 },
  btnOff: { opacity: 0.45 },
  progress: { marginTop: 8, fontSize: 12, color: '#6B7280' },
  message: { marginTop: 8, fontSize: 13, color: '#166534', lineHeight: 18 },
  messageError: { color: '#B91C1C' },
  foot: { marginTop: 10, fontSize: 12, color: '#6B7280', lineHeight: 17 },
});
