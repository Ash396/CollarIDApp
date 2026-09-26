import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Device } from 'react-native-ble-plx';

import { useDevice } from '../context/DeviceContext';
import {
  manager,
  ensureBluetoothOn,
  readLocalDevices,
  sendDtFwdCommand,
  readDtInfo,
  sendDtDirectCommand,
  MOCK_DT,
  isMockDt,
} from '../ble/bleManager';
import {
  AddonEntry,
  ADDON_TYPE_LABELS,
  CHECKIN_LADDER,
  DT_CMD,
  DtInfo,
  MOTOR_STATE_LABELS,
  THREAD_CHECKIN_DEFAULT_S,
  checkinLabel,
  formatAge,
} from '../utils/dt';
import { bleFeatureGates } from '../utils/fw';
import { toUnixEpochSecondsFromLocal } from '../utils/datetime';
import StyledPicker from '../components/StyledPicker';

const checkinOptions = CHECKIN_LADDER.map(r => ({
  label: r.label,
  value: r.s,
}));

/* ═══════════════════ Section 1: add-ons via the collar ═══════════════════ */

function AddonCard({
  addon,
  onCommand,
}: {
  addon: AddonEntry;
  onCommand: (uid: number, cmd: number, param: number, okMsg: string) => void;
}) {
  const [armDate, setArmDate] = useState('');
  const [armTime, setArmTime] = useState('');
  const [checkin, setCheckin] = useState<number>(THREAD_CHECKIN_DEFAULT_S);

  const arm = () => {
    const epoch = toUnixEpochSecondsFromLocal(armDate, armTime);
    if (epoch === undefined) {
      Alert.alert(
        'Check the detach time',
        'Enter the detach time as a date (YYYY-MM-DD) and a time (HH:MM).',
      );
      return;
    }
    if (epoch * 1000 < Date.now()) {
      Alert.alert('Check the detach time', 'The detach time is in the past. Pick a time in the future.');
      return;
    }
    onCommand(addon.uid, DT_CMD.ARM, epoch, 'Detach time set.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{addon.name}</Text>
        <Text style={styles.badgeMuted}>
          {ADDON_TYPE_LABELS[addon.type] ?? 'Unknown'}
        </Text>
      </View>
      <Text style={styles.meta}>
        {addon.paired ? '🔗 paired' : '⚪ unpaired'}
        {addon.fired ? '  ·  🔴 detached' : ''}
        {'  ·  '}
        {addon.battMv ? `${(addon.battMv / 1000).toFixed(2)} V` : 'battery unknown'}
        {'  ·  '}
        {MOTOR_STATE_LABELS[addon.motorState] ?? '?'}
      </Text>
      <Text style={styles.meta}>
        {addon.detachEpoch
          ? `detach ${new Date(addon.detachEpoch * 1000).toLocaleString()}`
          : 'not armed'}
        {'  ·  heard '}
        {formatAge(addon.heardAgoS)} ago
      </Text>

      {!addon.paired ? (
        <View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              onCommand(addon.uid, DT_CMD.PAIR, 0, 'Pairing request sent.')
            }
          >
            <Text style={styles.primaryBtnText}>🔗 Pair with this collar</Text>
          </TouchableOpacity>
          <Text style={styles.helper}>
            Pair it to set it up and control the detach.
          </Text>
        </View>
      ) : addon.type === 1 ? (
        <>
          <Text style={styles.label}>Scheduled detach</Text>
          <View style={styles.rowGap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={armDate}
              onChangeText={setArmDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, { width: 84 }]}
              value={armTime}
              onChangeText={setArmTime}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.rowGap}>
            <TouchableOpacity style={styles.smallBtn} onPress={arm}>
              <Text style={styles.smallBtnText}>Arm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() =>
                onCommand(addon.uid, DT_CMD.DISARM, 0, 'Detach time cleared.')
              }
            >
              <Text style={styles.smallBtnText}>Disarm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() =>
                onCommand(
                  addon.uid,
                  DT_CMD.ATTACH,
                  0,
                  'Attach request sent (motor at half power).',
                )
              }
            >
              <Text style={styles.smallBtnText}>Attach</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallBtn, styles.dangerBtn]}
              onPress={() =>
                Alert.alert(
                  'Detach now?',
                  `Run the detach motor NOW on ${addon.name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Detach',
                      style: 'destructive',
                      onPress: () =>
                        onCommand(
                          addon.uid,
                          DT_CMD.DETACH,
                          0,
                          'Detach request sent.',
                        ),
                    },
                  ],
                )
              }
            >
              <Text style={styles.dangerBtnText}>Detach now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() =>
                onCommand(addon.uid, DT_CMD.STOP, 0, 'Stop request sent.')
              }
            >
              <Text style={styles.smallBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Check-in every</Text>
          <View style={styles.rowGap}>
            <View style={{ flex: 1 }}>
              <StyledPicker
                selectedValue={checkin}
                onValueChange={v => setCheckin(Number(v))}
                items={checkinOptions}
                placeholder="Check-in interval"
              />
            </View>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() =>
                onCommand(
                  addon.uid,
                  DT_CMD.SET_CHECKIN,
                  checkin,
                  `Check-in set to every ${checkinLabel(checkin)}.`,
                )
              }
            >
              <Text style={styles.smallBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helper}>
            The collar follows its fastest-checking add-on and sets this
            add-on to match.
          </Text>

          <TouchableOpacity
            style={[styles.smallBtn, styles.warnBtn, { marginTop: 10 }]}
            onPress={() =>
              Alert.alert(
                'Unpair?',
                `Unpair ${addon.name} from this collar? It stops checking in until re-paired.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Unpair',
                    style: 'destructive',
                    onPress: () =>
                      onCommand(addon.uid, DT_CMD.UNPAIR, 0, 'Unpair request sent.'),
                  },
                ],
              )
            }
          >
            <Text style={styles.warnBtnText}>Unpair</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

/* ═══════════════════ Section 2: direct CollarDT connection ═══════════════ */

function DtStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function DtDirectPanel({
  device,
  onDisconnect,
}: {
  device: Device;
  onDisconnect: () => void;
}) {
  const [info, setInfo] = useState<DtInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [armDate, setArmDate] = useState('');
  const [armTime, setArmTime] = useState('');

  const refresh = useCallback(async () => {
    setError(null);
    const inf = await readDtInfo(device);
    if (!inf) {
      setError('This device did not answer like a release unit. Is it a CollarDT?');
      return;
    }
    setInfo(inf);
  }, [device]);

  // First load: NOP frame syncs the node's RTC, then read state.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await sendDtDirectCommand(device, DT_CMD.NOP, 0);
        } catch (_) {}
        await refresh();
      })();
    }, [device, refresh]),
  );

  const cmd = async (c: number, param = 0, okMsg = 'Command sent.') => {
    setError(null);
    try {
      await sendDtDirectCommand(device, c, param);
      setNote(okMsg);
      // firmware republishes state after handling; give it a beat
      setTimeout(refresh, isMockDt(device) ? 50 : 600);
    } catch (e: any) {
      setError(`The release unit did not get the command. ${e?.message ?? e}`);
    }
  };

  const arm = () => {
    const epoch = toUnixEpochSecondsFromLocal(armDate, armTime);
    if (epoch === undefined) {
      Alert.alert(
        'Check the detach time',
        'Enter the detach time as a date (YYYY-MM-DD) and a time (HH:MM).',
      );
      return;
    }
    if (epoch * 1000 < Date.now()) {
      Alert.alert('Check the detach time', 'The detach time is in the past. Pick a time in the future.');
      return;
    }
    cmd(DT_CMD.ARM, epoch, 'Detach time set.');
  };

  const fmtIv = (s: number) =>
    s === 86400
      ? 'daily'
      : s % 86400 === 0
      ? `${s / 86400} d`
      : s % 3600 === 0
      ? `${s / 3600} h`
      : s % 60 === 0
      ? `${s / 60} min`
      : `${s} s`;

  const nowS = Math.floor(Date.now() / 1000);
  const inVigil =
    !!info &&
    !!info.detachEpoch &&
    !info.fired &&
    nowS >= info.detachEpoch - 3600 &&
    nowS <= info.detachEpoch + 3600;

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{device.name ?? 'CollarDT'}</Text>
        <View style={styles.rowGap}>
          <TouchableOpacity style={styles.smallBtn} onPress={refresh}>
            <Text style={styles.smallBtnText}>↻ Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={onDisconnect}>
            <Text style={styles.smallBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {note && <Text style={styles.noteText}>{note}</Text>}

      {info && (
        <>
          <View style={styles.statGrid}>
            <DtStat label="Software version" value={`v${info.fw}`} />
            <DtStat label="Software ID" value={info.gitHash} />
            <DtStat label="On for" value={formatAge(info.uptimeS)} />
            <DtStat
              label="Detach time"
              value={
                info.fired
                  ? 'released'
                  : info.detachEpoch
                  ? new Date(info.detachEpoch * 1000).toLocaleString()
                  : 'not armed'
              }
            />
            <DtStat
              label="Battery"
              value={info.battMv ? `${(info.battMv / 1000).toFixed(2)} V` : 'n/a'}
            />
            <DtStat
              label="Motor"
              value={MOTOR_STATE_LABELS[info.motorState] ?? `? (${info.motorState})`}
            />
            <DtStat
              label="Clock (UTC)"
              value={
                info.rtcEpoch === null
                  ? 'n/a (older software)'
                  : info.rtcEpoch
                  ? new Date(info.rtcEpoch * 1000)
                      .toISOString()
                      .replace('T', ' ')
                      .slice(0, 19)
                  : 'never set'
              }
            />
            <DtStat
              label="Check-in"
              value={
                info.mode === 0
                  ? 'standalone (no collar)'
                  : info.checkinIntervalS === null
                  ? 'n/a (older software)'
                  : inVigil
                  ? 'every 5 min (detach time is near)'
                  : fmtIv(info.checkinIntervalS)
              }
            />
            <DtStat
              label="Paired to"
              value={
                info.pairedUid === null
                  ? 'n/a (older software)'
                  : info.pairedUid
                  ? '0x' +
                    info.pairedUid.toString(16).toUpperCase().padStart(8, '0')
                  : 'unpaired'
              }
            />
            <DtStat
              label="Battery under load"
              value={
                info.loadedMv === null
                  ? 'n/a (older software)'
                  : info.loadedMv
                  ? `${(info.loadedMv / 1000).toFixed(3)} V`
                  : 'not measured yet'
              }
            />
            <DtStat
              label="Battery drop under load"
              value={
                info.loadedMv && info.battMv
                  ? `${info.battMv - info.loadedMv} mV`
                  : '—'
              }
            />
            <DtStat
              label="Chip temperature"
              value={info.dieTempC === null ? 'n/a' : `${info.dieTempC} °C`}
            />
          </View>

          <Text style={styles.label}>Motor control</Text>
          <Text style={styles.helper}>
            Runs until you press Stop, or for 30 seconds at most. The motor
            cannot tell when it reaches the end, so it keeps pushing until the
            30 seconds are up.
          </Text>
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={[styles.smallBtn, styles.dangerBtn]}
              onPress={() =>
                Alert.alert('Run detach?', 'Run the detach motor now?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Run Detach',
                    style: 'destructive',
                    onPress: () =>
                      cmd(DT_CMD.DETACH, 0, 'Detach motor running (30 seconds at most).'),
                  },
                ])
              }
            >
              <Text style={styles.dangerBtnText}>▸ Run Detach</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() =>
                cmd(DT_CMD.ATTACH, 0, 'Attach motor running (30 seconds at most).')
              }
            >
              <Text style={styles.smallBtnText}>◂ Run Attach</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => cmd(DT_CMD.STOP, 0, 'Stop sent.')}
            >
              <Text style={styles.smallBtnText}>■ Stop</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Scheduled detach</Text>
          <Text style={styles.helper}>
            Enter your local time. The release unit keeps its own clock and
            releases on time without the phone.
          </Text>
          <View style={styles.rowGap}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={armDate}
              onChangeText={setArmDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, { width: 84 }]}
              value={armTime}
              onChangeText={setArmTime}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.smallBtn} onPress={arm}>
              <Text style={styles.smallBtnText}>Arm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => cmd(DT_CMD.DISARM, 0, 'Detach time cleared.')}
            >
              <Text style={styles.smallBtnText}>Disarm</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.rowBetween, { marginTop: 14 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.label}>Low-battery auto-detach</Text>
              <Text style={styles.helper}>
                If the battery is nearly worn out, the release unit drops the
                collar on its own. It only does this above 0 °C, after several
                hours of thaw, never in freezing conditions.
              </Text>
            </View>
            <Switch
              value={!!info.autoDetachOn}
              disabled={info.autoDetachOn === null}
              onValueChange={v =>
                cmd(
                  DT_CMD.SET_AUTODETACH,
                  v ? 1 : 0,
                  v ? 'Auto-detach enabled.' : 'Auto-detach disabled.',
                )
              }
            />
          </View>

          <View style={[styles.rowBetween, { marginTop: 12 }]}>
            <Text style={styles.helper}>
              Battery test: runs the motor briefly against its stop to measure
              the battery under load.
            </Text>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => cmd(DT_CMD.LOAD_TEST, 0, 'Battery measured under load.')}
            >
              <Text style={styles.smallBtnText}>◎ Battery test</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ownership</Text>
          <View style={styles.rowGap}>
            <TouchableOpacity
              style={[
                styles.smallBtn,
                styles.warnBtn,
                !info.pairedUid && styles.btnDisabled,
              ]}
              disabled={!info.pairedUid}
              onPress={() =>
                Alert.alert('Unpair?', 'Unpair this device from its collar?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Unpair',
                    style: 'destructive',
                    onPress: () => cmd(DT_CMD.UNPAIR, 0, 'Unpaired.'),
                  },
                ])
              }
            >
              <Text style={styles.warnBtnText}>Unpair</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallBtn, styles.dangerBtn]}
              onPress={() =>
                Alert.alert(
                  'Factory reset?',
                  'Clears pairing and any detach time, then the release unit restarts.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Factory reset',
                      style: 'destructive',
                      onPress: () =>
                        cmd(
                          DT_CMD.FACTORY_RESET,
                          0,
                          'Factory reset: the release unit is restarting. Swipe the magnet over it to reconnect.',
                        ),
                    },
                  ],
                )
              }
            >
              <Text style={styles.dangerBtnText}>Factory reset</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/* ═══════════════════════════ The screen ══════════════════════════════════ */

export default function AddOnsScreen() {
  const { device, caps, fwBuild } = useDevice();
  const gates = bleFeatureGates(fwBuild, caps);

  /* — via collar — */
  const [addons, setAddons] = useState<AddonEntry[] | null>(null);
  const [relayNote, setRelayNote] = useState<string | null>(null);
  const pollRef = useRef<any>(null);

  const refreshAddons = useCallback(async () => {
    if (!device || !gates.threadAddons) return;
    const list = await readLocalDevices(device);
    if (list) setAddons(list);
  }, [device, gates.threadAddons]);

  // Poll while the tab is focused — a collapsed panel shouldn't keep reading.
  useFocusEffect(
    useCallback(() => {
      refreshAddons();
      pollRef.current = setInterval(refreshAddons, 10000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
      };
    }, [refreshAddons]),
  );

  const fwdCommand = async (
    uid: number,
    c: number,
    param: number,
    okMsg: string,
  ) => {
    if (!device) return;
    try {
      await sendDtFwdCommand(device, uid, c, param);
      setRelayNote(
        `${okMsg} The add-on gets it at its next check-in. Refreshing…`,
      );
      setTimeout(refreshAddons, 2500);
    } catch (e: any) {
      Alert.alert(
        'Command failed',
        `The collar could not pass the command on.\nDetails: ${e?.message ?? String(e)}`,
      );
    }
  };

  /* — direct DT — */
  const [dtDevice, setDtDevice] = useState<Device | null>(null);
  const [found, setFound] = useState<{ id: string; name: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const scanTimerRef = useRef<any>(null);

  const stopDtScan = useCallback(() => {
    manager.stopDeviceScan();
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    setScanning(false);
  }, []);

  const startDtScan = async () => {
    setFound([]);
    setScanning(true);
    await ensureBluetoothOn();
    manager.startDeviceScan(null, { allowDuplicates: false }, (err, d) => {
      if (err) {
        console.warn('DT scan error:', err);
        stopDtScan();
        return;
      }
      if (!d?.name?.startsWith('CollarDT')) return;
      setFound(prev =>
        prev.some(x => x.id === d.id)
          ? prev
          : [...prev, { id: d.id, name: d.name ?? 'CollarDT' }],
      );
    });
    scanTimerRef.current = setTimeout(stopDtScan, 12000);
  };

  // Leaving the tab stops any DT scan (the Home tab's collar scan self-heals
  // via its watchdog).
  useFocusEffect(useCallback(() => stopDtScan, [stopDtScan]));

  const connectDt = async (id: string) => {
    stopDtScan();
    try {
      const connected = await manager.connectToDevice(id, {
        autoConnect: false,
      });
      await connected.discoverAllServicesAndCharacteristics();
      setDtDevice(connected);
    } catch (e: any) {
      Alert.alert(
        'Connect failed',
        `Could not connect to the release unit. Swipe the magnet over it and try again.\nDetails: ${
          e?.message ?? String(e)
        }`,
      );
    }
  };

  const disconnectDt = async () => {
    const d = dtDevice;
    setDtDevice(null);
    if (d && !isMockDt(d)) {
      try {
        await d.cancelConnection();
      } catch (_) {}
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>ADD-ONS</Text>
      <Text style={styles.sub}>
        Release units and other add-ons, through the connected collar or
        directly over Bluetooth.
      </Text>

      {/* ── Via the collar ── */}
      <Text style={styles.sectionHead}>Through the connected collar</Text>
      {!device ? (
        <Text style={styles.hint}>
          Connect to a collar on the Home tab to see the add-ons it has heard.
        </Text>
      ) : !gates.threadAddons ? (
        <Text style={styles.hint}>
          This collar's software can't pass add-on commands over Bluetooth.
          You can still manage add-ons with a direct connection below.
        </Text>
      ) : (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.hint}>
              Add-ons show up when they check in with the collar. Swipe the
              magnet over an unpaired one nearby to wake it, then tap Refresh.
            </Text>
            <TouchableOpacity style={styles.smallBtn} onPress={refreshAddons}>
              <Text style={styles.smallBtnText}>↻ Refresh</Text>
            </TouchableOpacity>
          </View>
          {relayNote && <Text style={styles.noteText}>{relayNote}</Text>}
          {addons === null ? (
            <Text style={styles.hint}>Reading the collar’s add-on list…</Text>
          ) : addons.length === 0 ? (
            <Text style={styles.hint}>No add-ons heard yet.</Text>
          ) : (
            addons.map(a => (
              <AddonCard key={a.uid} addon={a} onCommand={fwdCommand} />
            ))
          )}
        </>
      )}

      {/* ── Direct connection ── */}
      <Text style={styles.sectionHead}>Direct connection (CollarDT)</Text>
      {dtDevice ? (
        <DtDirectPanel device={dtDevice} onDisconnect={disconnectDt} />
      ) : (
        <>
          <Text style={styles.hint}>
            Swipe the magnet over the release unit to wake it. It can be found
            for 2 minutes, named CollarDT-…
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={scanning ? stopDtScan : startDtScan}
          >
            <Text style={styles.primaryBtnText}>
              {scanning ? 'Stop looking' : 'Look for CollarDT'}
            </Text>
          </TouchableOpacity>
          {found.map(f => (
            <TouchableOpacity
              key={f.id}
              style={styles.card}
              onPress={() => connectDt(f.id)}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{f.name}</Text>
                <Text style={styles.linkText}>Connect ›</Text>
              </View>
            </TouchableOpacity>
          ))}
          {scanning && (
            <Text style={styles.hint}>Looking… ({found.length} found)</Text>
          )}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.mockBtn}
              onPress={() => setDtDevice(MOCK_DT)}
            >
              <Text style={styles.primaryBtnText}>
                🧪 Connect Mock CollarDT
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 50 },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sub: { fontSize: 15, color: '#555', marginBottom: 18 },

  sectionHead: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: '#777', marginBottom: 10, flexShrink: 1 },
  linkText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },

  card: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  badgeMuted: { fontSize: 12, color: '#6B7280' },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  helper: { fontSize: 12, color: '#6B7280', marginBottom: 6, flexShrink: 1 },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#FFF',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginTop: 6,
  },

  primaryBtn: {
    backgroundColor: '#FDC996',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  mockBtn: {
    backgroundColor: '#6D4AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  smallBtn: {
    backgroundColor: '#EFEFEF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallBtnText: { color: '#111', fontWeight: '600', fontSize: 13 },
  btnDisabled: { opacity: 0.4 },

  dangerBtn: { backgroundColor: '#FEE2E2' },
  dangerBtnText: { color: '#B91C1C', fontWeight: '700', fontSize: 13 },
  warnBtn: { backgroundColor: '#FEF3C7' },
  warnBtnText: { color: '#92400E', fontWeight: '700', fontSize: 13 },

  errorText: { color: '#B91C1C', fontSize: 13, marginTop: 8 },
  noteText: { color: '#166534', fontSize: 12, marginTop: 6, marginBottom: 2 },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  statCell: {
    width: '47%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: { fontSize: 14, color: '#111', fontWeight: '600', marginTop: 2 },
});
