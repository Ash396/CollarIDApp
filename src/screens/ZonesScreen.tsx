// Geofence zones on the connected collar — the website configurator's
// GEOFENCE ZONES card (configure.html loadBleFences / sendBleFence).
//
// Firmware BLE_ZONES_MIN_FW_BUILD (305)+ manages zones RIGHT HERE over the
// Bluetooth link: the config tunnel (ble/bleManager.ts tunnelRunTxn /
// tunnelQueryAllFences) — no LoRaWAN, no account, no server. The collar
// applies the same rails as a radio push and answers with a verdict
// (utils/geofence.ts verdictText). Below 305 the tunnel vocabulary does not
// exist on the collar, so the screen says so and points at the website's
// Remote Schedule page, where zones travel over the radio at the next
// check-in (the app has no server push path).
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useDevice } from '../context/DeviceContext';
import { tunnelQueryAllFences, tunnelRunTxn } from '../ble/bleManager';
import { bleFeatureGates } from '../utils/fw';
import {
  CFG_ACK,
  FENCE_IDS,
  deleteFenceFragments,
  fenceRow,
  fenceToForm,
  verdictText,
} from '../utils/geofence';
import type { Fence } from '../utils/geofence';

export default function ZonesScreen() {
  const navigation = useNavigation<any>();
  const { device, fwBuild, caps } = useDevice();
  const gates = bleFeatureGates(fwBuild, caps);

  const [fences, setFences] = useState<Fence[] | null>(null);
  const [activeMask, setActiveMask] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const load = useCallback(async () => {
    if (!device || !gates.cfgTunnel) {
      setFences(null);
      return;
    }
    setLoading(true);
    try {
      const { fences: got, echo } = await tunnelQueryAllFences(device);
      setFences(got);
      setActiveMask(echo ? echo.fenceActiveMask || 0 : 0);
      // A read error clears on a good read; a delete verdict (set just
      // before the re-read) stays on screen.
      setError(prev => (prev && prev.startsWith('Couldn’t read zones') ? null : prev));
    } catch (e: any) {
      setFences(null);
      setError(`Couldn’t read zones from the collar. ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, [device, gates.cfgTunnel]);

  // Read on connect / build arrival, and again when the editor comes back.
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const unsub = navigation.addListener?.('focus', load);
    return typeof unsub === 'function' ? unsub : undefined;
  }, [navigation, load]);

  const deleteZone = (id: number) => {
    if (!device) return;
    Alert.alert('Delete zone', `Delete zone ${id} from the collar now (over Bluetooth)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          try {
            const fin = await tunnelRunTxn(device, deleteFenceFragments(id), (d, t) =>
              setProgress(`deleting… ${d}/${t}`),
            );
            setProgress('');
            if (fin.ackStatus === CFG_ACK.APPLIED) {
              Alert.alert('Zone deleted', `Zone ${id} deleted.`);
            } else {
              setError(`The collar ${verdictText(fin)}.`);
            }
          } catch (e: any) {
            setProgress('');
            setError(`Couldn’t delete the zone. ${e?.message ?? e}`);
          }
          load();
        },
      },
    ]);
  };

  const nextFreeId = () => {
    const used = new Set((fences ?? []).map(f => f.fenceId));
    return FENCE_IDS.find(id => !used.has(id)) ?? FENCE_IDS[0];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} testID="zones-back">
          <Text style={styles.backLink}>‹ Schedules</Text>
        </TouchableOpacity>
        {device && gates.cfgTunnel ? (
          <TouchableOpacity onPress={load} testID="zones-refresh" disabled={loading}>
            <Text style={styles.backLink}>Refresh</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.header}>GEOFENCE ZONES</Text>

      {!device ? (
        <Text style={styles.note} testID="zones-no-collar">
          Connect a collar on the Home tab to read and manage its zones.
        </Text>
      ) : !gates.cfgTunnel ? (
        <View style={styles.gateBox} testID="zones-gate">
          <Text style={styles.gateText}>
            {fwBuild
              ? 'This collar’s software is too old to manage zones over Bluetooth. Update the collar to manage zones right here. Until then, zones are sent over the network at the collar’s next check-in: manage them on the website’s Remote Schedule page.'
              : 'This collar has not reported its software version yet. The zone list appears once it does.'}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.note}>
            Zones are sent to the collar over Bluetooth and checked in seconds. (They also show on
            the website’s dashboard after the collar’s next network check-in, if it has one.)
          </Text>

          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="small" color="#f8b26a" />
              <Text style={styles.subtext}>Reading zones from the collar…</Text>
            </View>
          )}
          {error && (
            <Text style={styles.errorText} testID="zones-error">
              {error}
            </Text>
          )}
          {!!progress && (
            <Text style={styles.subtext} testID="zones-progress">
              {progress}
            </Text>
          )}

          {fences && fences.length === 0 && !loading && (
            <Text style={styles.subtext} testID="zones-empty">
              No zones on this collar. Add one below.
            </Text>
          )}

          {(fences ?? []).map(f => {
            const row = fenceRow(f, activeMask);
            return (
              <View style={styles.card} key={f.fenceId} testID={`zone-row-${f.fenceId}`}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{row.title}</Text>
                  <Text style={[styles.cardAction, row.detach && styles.cardActionDetach]}>{row.action}</Text>
                </View>
                <Text style={styles.cardDetail}>{row.detail}</Text>
                <View style={styles.badgeRow}>
                  {row.fired && (
                    <Text style={[styles.badge, styles.badgeFired]} testID={`zone-fired-${f.fenceId}`}>
                      TRIGGERED
                    </Text>
                  )}
                  {row.inside && (
                    <Text style={[styles.badge, styles.badgeInside]} testID={`zone-inside-${f.fenceId}`}>
                      ● INSIDE NOW
                    </Text>
                  )}
                </View>
                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.ghostBtn]}
                    onPress={() => navigation.navigate('EditZone', { form: fenceToForm(f) })}
                    testID={`zone-edit-${f.fenceId}`}
                  >
                    <Text style={styles.ghostBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.dangerBtn]}
                    onPress={() => deleteZone(f.fenceId)}
                    testID={`zone-delete-${f.fenceId}`}
                  >
                    <Text style={styles.dangerBtnText}>✕ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('EditZone', { form: undefined, suggestedId: nextFreeId() })}
            testID="zones-add"
          >
            <Text style={styles.addText}>+ Add zone</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            A detach zone makes the release unit check in more often (using more battery) until it
            triggers, expires, or you delete it.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  backLink: { fontSize: 15, color: '#4A90D9', fontWeight: '600' },
  header: { fontSize: 24, fontWeight: '700', color: '#111', letterSpacing: 0.5, marginBottom: 8 },
  note: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 14 },
  footnote: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 18 },
  gateBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  gateText: { fontSize: 13, color: '#9A3412', lineHeight: 19 },
  center: { alignItems: 'center', marginVertical: 12 },
  subtext: { marginTop: 6, fontSize: 13, color: '#666' },
  errorText: { fontSize: 13, color: '#B91C1C', marginVertical: 6, lineHeight: 18 },
  card: {
    backgroundColor: '#FAFAFA',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardAction: { fontSize: 14, color: '#444' },
  cardActionDetach: { color: '#B91C1C', fontWeight: '700' },
  cardDetail: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  badge: { fontSize: 12, fontWeight: '700' },
  badgeFired: { color: '#CA8A04' },
  badgeInside: { color: '#16A34A' },
  rowButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  smallBtn: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  ghostBtn: { backgroundColor: '#EFEFEF' },
  ghostBtnText: { color: '#111', fontWeight: '600', fontSize: 13 },
  dangerBtn: { backgroundColor: '#FEE2E2' },
  dangerBtnText: { color: '#B91C1C', fontWeight: '700', fontSize: 13 },
  addButton: { marginTop: 6, alignItems: 'center', paddingVertical: 10 },
  addText: { color: '#4A90D9', fontWeight: '600', fontSize: 15 },
});
