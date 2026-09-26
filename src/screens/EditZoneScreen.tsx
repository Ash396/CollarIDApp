// Add a zone (or re-send one the collar holds) over the Bluetooth tunnel —
// the website's BLE add-zone form (configure.html #ble-fence-form +
// sendBleFence), field for field: slot, action, schedule slot (switch
// zones), confirm fixes, accuracy gate, optional start, expiry, and the
// corners as `lat, lon` lines that the map picker can also write. The
// validation is the website's buildFenceFragments (utils/geofence.ts), so a
// zone refused here is refused with the same words there; the collar then
// applies its own rails and the verdict is shown as it comes back.
//
// The form is a per-collar draft in AsyncStorage while it is being edited
// (the map picker and a dropped link both come back to it) and forgotten
// once the collar applies it.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import StyledPicker from '../components/StyledPicker';
import ZoneMapPicker from '../components/ZoneMapPicker';
import { useDevice } from '../context/DeviceContext';
import { tunnelRunTxn } from '../ble/bleManager';
import { BLE_ZONES_MIN_FW_BUILD, bleFeatureGates } from '../utils/fw';
import {
  CFG_ACK,
  DEFAULT_CONFIRM_FIXES,
  DEFAULT_MAX_HACC_M,
  FENCE_IDS,
  GF_ACTION,
  GF_ACTION_OPTIONS,
  ZONE_SCHEDULE_SLOTS,
  buildFenceFragments,
  verdictText,
} from '../utils/geofence';
import type { FenceForm } from '../utils/geofence';
import { fromUnixEpochSecondsToLocalStrings, toUnixEpochSecondsFromLocal } from '../utils/datetime';
import { unixNow } from '../utils/protoUtils';

/** The editable form: numbers and dates as the text fields hold them. */
type Draft = {
  id: number;
  action: number;
  zoneSlot: number;
  confirm: string;
  hacc: string;
  startDate: string;
  startTime: string;
  expiryDate: string;
  expiryTime: string;
  vertsText: string;
};

export const ZONE_DRAFT_KEY_PREFIX = 'draft.zone.';
const draftKey = (device: any) => `${ZONE_DRAFT_KEY_PREFIX}${device?.name ?? device?.id ?? 'unknown'}`;

function freshDraft(id: number): Draft {
  return {
    id,
    action: GF_ACTION.REPORT_ONLY,
    zoneSlot: 0,
    confirm: String(DEFAULT_CONFIRM_FIXES),
    hacc: String(DEFAULT_MAX_HACC_M),
    startDate: '',
    startTime: '',
    expiryDate: '',
    expiryTime: '',
    vertsText: '',
  };
}

function draftFromForm(f: FenceForm): Draft {
  const start = f.start ? fromUnixEpochSecondsToLocalStrings(f.start) : undefined;
  const expiry = f.expiry ? fromUnixEpochSecondsToLocalStrings(f.expiry) : undefined;
  return {
    id: f.id,
    action: f.action,
    zoneSlot: f.zoneSlot ?? 0,
    confirm: String(f.confirm ?? DEFAULT_CONFIRM_FIXES),
    hacc: String(f.hacc ?? 0),
    startDate: start?.date ?? '',
    startTime: start?.time ?? '',
    expiryDate: expiry?.date ?? '',
    expiryTime: expiry?.time ?? '',
    vertsText: f.vertsText,
  };
}

/** A date + time pair to unix seconds: 0 when both are empty, undefined
 *  (invalid) when only one is filled or either is malformed. */
function epochFromFields(date: string, time: string): number | undefined {
  if (!date.trim() && !time.trim()) return 0;
  return toUnixEpochSecondsFromLocal(date.trim(), time.trim());
}

/** The form the website's builder validates, from the draft. Throws the
 *  field's own message for a half-filled or malformed date. */
export function formFromDraft(d: Draft): FenceForm {
  const start = epochFromFields(d.startDate, d.startTime);
  if (start === undefined) throw new Error('start needs a date (YYYY-MM-DD) and a time (HH:MM), or both empty');
  const expiry = epochFromFields(d.expiryDate, d.expiryTime);
  if (expiry === undefined) throw new Error('expiry needs a date (YYYY-MM-DD) and a time (HH:MM), or both empty');
  return {
    id: d.id,
    action: d.action,
    zoneSlot: d.zoneSlot,
    confirm: Number(d.confirm),
    hacc: Number(d.hacc),
    start,
    expiry,
    vertsText: d.vertsText,
  };
}

export default function EditZoneScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { device, fwBuild, caps } = useDevice();
  const gates = bleFeatureGates(fwBuild, caps);
  const editing: FenceForm | undefined = route.params?.form;
  const suggestedId: number = route.params?.suggestedId ?? FENCE_IDS[0];

  const [draft, setDraft] = useState<Draft>(() => (editing ? draftFromForm(editing) : freshDraft(suggestedId)));
  const [restored, setRestored] = useState(!!editing);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [sending, setSending] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const key = useMemo(() => draftKey(device), [device]);
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // A new zone picks up the unsent draft for this collar, if there is one.
  useEffect(() => {
    if (editing) return;
    let alive = true;
    AsyncStorage.getItem(key)
      .then(raw => {
        if (!alive || !raw) return;
        try {
          const d = JSON.parse(raw);
          if (d && typeof d === 'object' && typeof d.vertsText === 'string') {
            setDraft({ ...freshDraft(suggestedId), ...d });
          }
        } catch (_) {
          /* unreadable draft */
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setRestored(true);
      });
    return () => {
      alive = false;
    };
  }, [editing, key, suggestedId]);

  // Every edit persists (once the stored draft, if any, has been read).
  useEffect(() => {
    if (!restored || editing) return;
    AsyncStorage.setItem(key, JSON.stringify(draft)).catch(() => {});
  }, [draft, key, restored, editing]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft(d => ({ ...d, [k]: v }));

  const onAction = (v: number) => {
    setDraft(d => {
      const next = { ...d, action: v };
      // A detach zone must expire (R10); the design's default is a week
      // after the start, so an empty expiry is prefilled with that.
      if (v === GF_ACTION.DETACH && !d.expiryDate && !d.expiryTime) {
        const base = epochFromFields(d.startDate, d.startTime) || unixNow();
        const e = fromUnixEpochSecondsToLocalStrings(base + 7 * 86400);
        if (e) {
          next.expiryDate = e.date;
          next.expiryTime = e.time;
        }
      }
      return next;
    });
  };

  const send = async () => {
    setError(null);
    if (!device || !gates.cfgTunnel) {
      Alert.alert('Zones over Bluetooth', `Bluetooth zone delivery needs firmware v1.15+ (build ${BLE_ZONES_MIN_FW_BUILD}).`);
      return;
    }
    let frags;
    try {
      frags = buildFenceFragments(formFromDraft(draft));
    } catch (e: any) {
      setError(e?.message ?? String(e));
      return;
    }
    setSending(true);
    try {
      const fin = await tunnelRunTxn(device, frags, (d, t) => {
        if (aliveRef.current) setProgress(`sending… ${d}/${t}`);
      });
      if (!aliveRef.current) return;
      setProgress('');
      if (fin.ackStatus === CFG_ACK.APPLIED) {
        AsyncStorage.removeItem(key).catch(() => {});
        Alert.alert('Zone delivered', 'Zone delivered and applied.');
        navigation.goBack();
      } else {
        setError(`The collar ${verdictText(fin)}.`);
      }
    } catch (e: any) {
      if (!aliveRef.current) return;
      setProgress('');
      setError(`Delivery failed: ${e?.message ?? e}`);
    } finally {
      if (aliveRef.current) setSending(false);
    }
  };

  const isSwitch = draft.action === GF_ACTION.SCHEDULE_OVERRIDE;
  const isDetach = draft.action === GF_ACTION.DETACH;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <TouchableOpacity onPress={() => navigation.goBack()} testID="editzone-back">
        <Text style={styles.backLink}>‹ Zones</Text>
      </TouchableOpacity>
      <Text style={styles.header}>{editing ? `EDIT ZONE ${editing.id}` : 'ADD ZONE'}</Text>
      <Text style={styles.note}>
        Delivered and verified over this Bluetooth connection in a few seconds — no LoRaWAN needed.
        The collar applies the same safety rules as a radio push.
      </Text>

      <Text style={styles.label}>Zone slot #</Text>
      <StyledPicker
        selectedValue={draft.id}
        onValueChange={v => set('id', Number(v))}
        items={FENCE_IDS.map(id => ({ label: `Zone ${id}`, value: id }))}
        placeholder="Zone slot"
      />

      <Text style={styles.label}>Action</Text>
      <StyledPicker
        selectedValue={draft.action}
        onValueChange={v => onAction(Number(v))}
        items={GF_ACTION_OPTIONS}
        placeholder="Action"
      />

      {isSwitch && (
        <>
          <Text style={styles.label}>Schedule slot</Text>
          <StyledPicker
            selectedValue={draft.zoneSlot}
            onValueChange={v => set('zoneSlot', Number(v))}
            items={ZONE_SCHEDULE_SLOTS.map(s => ({ label: `Slot ${s} (Schedule ${s + 1})`, value: s }))}
            placeholder="Schedule slot"
          />
        </>
      )}

      <View style={styles.pairRow}>
        <View style={styles.pairCol}>
          <Text style={styles.label}>Confirm fixes (1–10)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={draft.confirm}
            onChangeText={v => set('confirm', v)}
            testID="editzone-confirm"
          />
        </View>
        <View style={styles.pairCol}>
          <Text style={styles.label}>Accuracy gate (m, 0 = none)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={draft.hacc}
            onChangeText={v => set('hacc', v)}
            testID="editzone-hacc"
          />
        </View>
      </View>

      <Text style={styles.label}>Start (optional — armed on delivery when empty)</Text>
      <View style={styles.pairRow}>
        <TextInput
          style={[styles.input, styles.pairCol]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          value={draft.startDate}
          onChangeText={v => set('startDate', v)}
          autoCapitalize="none"
          testID="editzone-start-date"
        />
        <TextInput
          style={[styles.input, styles.pairCol]}
          placeholder="HH:MM"
          placeholderTextColor="#9CA3AF"
          value={draft.startTime}
          onChangeText={v => set('startTime', v)}
          autoCapitalize="none"
          testID="editzone-start-time"
        />
      </View>

      <Text style={styles.label}>{isDetach ? 'Expires (required for a detach zone, within 30 days)' : 'Expires (optional)'}</Text>
      <View style={styles.pairRow}>
        <TextInput
          style={[styles.input, styles.pairCol]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          value={draft.expiryDate}
          onChangeText={v => set('expiryDate', v)}
          autoCapitalize="none"
          testID="editzone-expiry-date"
        />
        <TextInput
          style={[styles.input, styles.pairCol]}
          placeholder="HH:MM"
          placeholderTextColor="#9CA3AF"
          value={draft.expiryTime}
          onChangeText={v => set('expiryTime', v)}
          autoCapitalize="none"
          testID="editzone-expiry-time"
        />
      </View>

      <View style={styles.cornersHead}>
        <Text style={styles.label}>Corners — one lat, lon per line (3–8 points)</Text>
        <TouchableOpacity onPress={() => setMapOpen(true)} testID="editzone-map">
          <Text style={styles.link}>🗺 Pick on map</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, styles.corners]}
        multiline
        numberOfLines={5}
        placeholder={'44.26450, -72.57550\n44.26450, -72.57100\n44.26900, -72.57100\n44.26900, -72.57550'}
        placeholderTextColor="#9CA3AF"
        value={draft.vertsText}
        onChangeText={v => set('vertsText', v)}
        autoCapitalize="none"
        autoCorrect={false}
        testID="editzone-verts"
      />

      {error && (
        <Text style={styles.errorText} testID="editzone-error">
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
        onPress={send}
        disabled={sending}
        testID="editzone-send"
      >
        <Text style={styles.sendText}>SEND ZONE OVER BLUETOOTH</Text>
      </TouchableOpacity>
      {!!progress && (
        <Text style={styles.progress} testID="editzone-progress">
          {progress}
        </Text>
      )}

      <Text style={styles.footnote}>
        A detach zone puts the release unit into a faster check-in mode (higher battery use) until it
        fires, expires, or you delete it. Test-only zones report entries and exits and act on nothing —
        the way to validate a placement for a few days before trusting it with a detach.
      </Text>

      <ZoneMapPicker
        visible={mapOpen}
        vertsText={draft.vertsText}
        onCancel={() => setMapOpen(false)}
        onUse={text => {
          set('vertsText', text);
          setMapOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 60 },
  backLink: { fontSize: 15, color: '#4A90D9', fontWeight: '600', marginBottom: 6 },
  header: { fontSize: 24, fontWeight: '700', color: '#111', letterSpacing: 0.5, marginBottom: 8 },
  note: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 14 },
  label: { fontSize: 13, color: '#374151', fontWeight: '600', marginTop: 10, marginBottom: 6 },
  link: { fontSize: 14, color: '#4A90D9', fontWeight: '600', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },
  corners: { minHeight: 120, textAlignVertical: 'top', fontFamily: 'Menlo' },
  pairRow: { flexDirection: 'row', gap: 10 },
  pairCol: { flex: 1 },
  cornersHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, color: '#B91C1C', marginTop: 10, lineHeight: 18 },
  progress: { marginTop: 8, fontSize: 13, color: '#666', textAlign: 'center' },
  footnote: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 18 },
  sendButton: {
    backgroundColor: '#FDC996',
    borderRadius: 12,
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 14,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
