// Main-processor firmware update over Bluetooth — the website's Update
// Device page, "Main processor over BLE" section (update-device.html), in a
// modal on the connected collar: the image comes from the CollarID server
// (signed in; the website also takes a local .bin, which the app has no
// file picker for), the radio is probed for what it can do
// (ble/otaLink.ts probeRadioCaps -> ble/ota.ts updatePolicy), the collar's
// own build is checked against the safe-update bar (v1.14.0, build 266),
// and the transfer runs through sendU5Image with a progress bar and a
// Cancel.
//
// 100 % is NOT the end: the collar then CRC-checks the whole image, flushes
// its log and swaps flash banks — several seconds where it looks idle — and
// its reboot cuts the radio's power, which is how the Bluetooth link ends.
// So after the send the modal says "leave it alone" and treats the link
// dropping as the positive confirmation (the website's u5bAwaitReboot /
// u5bOnRebooted): the device prop going null, or isConnected() false.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';

import StyledPicker from './StyledPicker';
import { isMockDevice } from '../ble/bleManager';
import { otaLinkForDevice, probeRadioCaps } from '../ble/otaLink';
import {
  OtaAborted,
  U5_BLE_GATE_REASON,
  isU5BleSafe,
  sendU5Image,
  traceText,
  updatePolicy,
} from '../ble/ota';
import type { RadioCaps, UpdatePolicy } from '../ble/ota';
import { downloadFirmware, listFirmware } from '../utils/api';
import type { FirmwareRelease } from '../utils/api';
import { useSession } from '../utils/useSession';
import { fwDisplayLabel, getFwReleases } from '../utils/fwReleases';
import type { FwRelease } from '../utils/fwReleases';

type Step = 'pick' | 'sending' | 'checking' | 'done' | 'failed';

type Props = {
  visible: boolean;
  device: Device | null;
  /** The collar's reported build (0 = unknown / bare hash). */
  fwBuild: number;
  /** The raw firmware_version string, for the "installed" line. */
  firmwareVersion?: string;
  onClose: () => void;
};

/** The website's words for the wait after 100 %. */
export const CHECKING_WORDS =
  'The collar is checking the update — it restarts itself when it’s done, usually within a minute. ' +
  'Leave it alone: don’t reset it or disconnect the battery.';
export const DONE_WORDS =
  'Update installed. The collar has restarted. Swipe the magnet over it to wake it up, then connect ' +
  'again on the Home tab to check the version.';

/* Past SOFT_MS stop implying the restart is imminent; past GIVE_UP_MS stop
 * watching (update-device.html u5bAwaitReboot). */
const SOFT_MS = 120000;
const GIVE_UP_MS = 300000;
const WATCH_MS = 2000;

const kb = (n: number) => (n / 1024).toFixed(0);

export default function FirmwareUpdateModal({ visible, device, fwBuild, firmwareVersion, onClose }: Props) {
  const session = useSession();
  const [step, setStep] = useState<Step>('pick');
  const [caps, setCaps] = useState<RadioCaps | null>(null);
  const [policy, setPolicy] = useState<UpdatePolicy | null>(null);
  const [releases, setReleases] = useState<FirmwareRelease[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | ''>('');
  const [status, setStatus] = useState('');
  const [pct, setPct] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [fwIndex, setFwIndex] = useState<FwRelease[]>([]);
  const abortRef = useRef(false);
  const aliveRef = useRef(true);
  const stepRef = useRef<Step>('pick');
  const rebootHandledRef = useRef(false);
  const setStepBoth = (s: Step) => {
    stepRef.current = s;
    setStep(s);
  };

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // A fresh open starts at the picker, probes the radio, lists the server's
  // images (when signed in) and fetches the release index for the labels.
  useEffect(() => {
    if (!visible) return;
    if (stepRef.current === 'sending' || stepRef.current === 'checking') return;
    setStepBoth('pick');
    setFailure(null);
    setStatus('');
    setPct(0);
    setShowTrace(false);
    rebootHandledRef.current = false;
    abortRef.current = false;
    setCaps(null);
    setPolicy(null);
    let alive = true;
    if (device) {
      probeRadioCaps(device)
        .then(c => {
          if (!alive) return;
          setCaps(c);
          setPolicy(updatePolicy(c));
        })
        .catch(() => {});
    }
    getFwReleases().then(r => {
      if (alive) setFwIndex(r);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, device?.id]);

  useEffect(() => {
    if (!visible) return;
    if (!session.signedIn) {
      setReleases(null);
      setListError(null);
      return;
    }
    let alive = true;
    setListError(null);
    listFirmware('u5')
      .then(list => {
        if (!alive) return;
        setReleases(list);
        setPicked(list.length ? list[0].id : '');
      })
      .catch(e => {
        if (!alive) return;
        setReleases([]);
        setListError(`Could not load the list of collar software versions. ${e?.message ?? e}`);
      });
    return () => {
      alive = false;
    };
  }, [visible, session.signedIn, session.generation]);

  /* The reboot is confirmed by the link ending: the device prop going null
     (Home's disconnect handler) or isConnected() false while we watch. */
  const onRebooted = useCallback(() => {
    if (rebootHandledRef.current || !aliveRef.current) return;
    rebootHandledRef.current = true;
    setStepBoth('done');
    setStatus(DONE_WORDS);
    setPct(100);
  }, []);

  useEffect(() => {
    if (!device && (stepRef.current === 'checking' || stepRef.current === 'sending')) onRebooted();
  }, [device, onRebooted]);

  const awaitReboot = async (dev: Device, secs: string) => {
    const t0 = Date.now();
    const note = (extra: string) => {
      if (aliveRef.current) setStatus(`Sent in ${secs} s. ${extra}`);
    };
    note(CHECKING_WORDS);
    while (aliveRef.current && stepRef.current === 'checking') {
      await new Promise<void>(r => setTimeout(r, WATCH_MS));
      if (stepRef.current !== 'checking') return;
      let up = true;
      try {
        up = isMockDevice(dev) ? (await (await otaLinkForDevice(dev)).isConnected()) : await dev.isConnected();
      } catch (_) {
        up = false;
      }
      if (!up) {
        onRebooted();
        return;
      }
      const waited = Math.round((Date.now() - t0) / 1000);
      if (Date.now() - t0 < SOFT_MS) {
        note(`Still checking (${waited} s) — it restarts itself when it’s done. Leave it alone: don’t reset it or disconnect the battery.`);
      } else {
        note(
          `Still connected after ${waited} s without restarting. It may still be working, so keep leaving it alone. ` +
            'If it never restarts, the update was not installed: reconnect later and check the software version.',
        );
      }
      if (Date.now() - t0 > GIVE_UP_MS) {
        setStepBoth('failed');
        setFailure('The collar never restarted. The update may not be installed: check the software version after reconnecting.');
        return;
      }
    }
  };

  const start = async () => {
    if (!device || step !== 'pick') return;
    const fw = releases?.find(r => r.id === picked);
    if (!fw) {
      setFailure('Pick a software version first.');
      return;
    }
    setFailure(null);
    abortRef.current = false;
    rebootHandledRef.current = false;
    setStepBoth('sending');
    setPct(0);
    setStatus('Downloading the update…');
    const t0 = Date.now();
    try {
      const bytes = await downloadFirmware(fw.id);
      if (!aliveRef.current) return;
      setStatus('Sending to the collar…');
      const link = await otaLinkForDevice(device);
      await sendU5Image(link, bytes, fw.version, {
        caps,
        abortRequested: () => abortRef.current,
        onProgress: (sent, total) => {
          if (!aliveRef.current) return;
          setPct((sent / total) * 100);
          setStatus(`Sending to the collar… ${kb(sent)}/${kb(total)} KB`);
        },
      });
      if (!aliveRef.current) return;
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      setPct(100);
      /* The collar may ALREADY have restarted — its reboot kills the link
         within a second or two of the last byte, often before send()
         resolves. If the link is gone, that restart is the confirmation. */
      let up = true;
      try {
        up = await link.isConnected();
      } catch (_) {
        up = false;
      }
      if (!up) {
        setStepBoth('checking');
        onRebooted();
        return;
      }
      setStepBoth('checking');
      awaitReboot(device, secs);
    } catch (e: any) {
      if (!aliveRef.current) return;
      if (stepRef.current === 'done') return; // the link dropped as the collar rebooted
      setStepBoth('failed');
      setFailure(
        e instanceof OtaAborted || e?.isAbort
          ? 'Update cancelled. The collar keeps its current software. Wait about 30 seconds before trying again.'
          : `The update did not finish. ${e?.message ?? e}`,
      );
    }
  };

  const cancelTransfer = () => {
    abortRef.current = true;
    setStatus('Cancelling…');
  };

  // Close is refused mid-transfer (Cancel first); during the check it
  // keeps watching in the background.
  const close = () => {
    if (step === 'sending') return;
    onClose();
  };

  const safe = isU5BleSafe(fwBuild);
  const canStart =
    step === 'pick' && !!device && safe && (!policy || policy.u5.allow) && !!releases?.length && picked !== '';
  const pickerItems = (releases ?? []).map(r => ({
    value: r.id,
    label: `${r.version} — ${r.filename}${r.file_size ? ` (${kb(r.file_size)} KB)` : ''}`,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}} testID="fwupdate-modal">
          <View style={styles.headerRow}>
            <Text style={styles.title}>Update the collar’s software</Text>
            <TouchableOpacity onPress={close} accessibilityLabel="Close" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.meta} testID="fwupdate-installed">
              Installed version: {firmwareVersion ? fwDisplayLabel(firmwareVersion, fwIndex) : 'not reported yet'}
            </Text>

            {policy && (
              <Text style={styles.meta} testID="fwupdate-radio">
                {policy.headline}
                {policy.u5.reason ? ` — ${policy.u5.reason}` : ''}
              </Text>
            )}

            {!safe && (
              <View style={styles.gateBox} testID="fwupdate-gate">
                <Text style={styles.gateText}>{U5_BLE_GATE_REASON}</Text>
              </View>
            )}

            {step === 'pick' && (
              <>
                <Text style={styles.label}>Software version (from the CollarID server)</Text>
                {!session.signedIn ? (
                  <Text style={styles.note} testID="fwupdate-signin">
                    Sign in on the Home tab’s Account card to see the available software versions.
                  </Text>
                ) : releases === null ? (
                  <ActivityIndicator size="small" color="#f8b26a" />
                ) : listError ? (
                  <Text style={styles.errorText}>{listError}</Text>
                ) : releases.length === 0 ? (
                  <Text style={styles.note}>No collar software is available on the server yet.</Text>
                ) : (
                  <StyledPicker
                    selectedValue={picked}
                    onValueChange={v => setPicked(Number(v))}
                    items={pickerItems}
                    placeholder="Software version"
                  />
                )}
                <Text style={styles.steps}>
                  1. Keep the phone next to the collar for the whole transfer (a few minutes).{'\n'}
                  2. Tap Send update and wait for the bar to reach 100 %.{'\n'}
                  3. Wait — the collar checks the update and restarts itself. It will disconnect; that’s
                  normal and usually takes under a minute.
                </Text>
              </>
            )}

            {(step === 'sending' || step === 'checking' || step === 'done') && (
              <View style={styles.progressWrap} testID="fwupdate-progress">
                <View style={styles.progressHead}>
                  <Text style={styles.progressText} testID="fwupdate-status">
                    {status}
                  </Text>
                  <Text style={styles.progressPct} testID="fwupdate-pct">
                    {Math.round(pct)}%
                  </Text>
                </View>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, pct))}%` }]} />
                </View>
              </View>
            )}

            {step === 'failed' && failure && (
              <Text style={styles.errorText} testID="fwupdate-failure">
                {failure}
              </Text>
            )}
            {failure && step === 'pick' && (
              <Text style={styles.errorText} testID="fwupdate-failure">
                {failure}
              </Text>
            )}
            {step === 'failed' && (
              <TouchableOpacity onPress={() => setShowTrace(s => !s)} testID="fwupdate-trace-toggle">
                <Text style={styles.link}>{showTrace ? 'Hide technical details' : 'Show technical details'}</Text>
              </TouchableOpacity>
            )}
            {step === 'failed' && showTrace && (
              <Text style={styles.trace} selectable testID="fwupdate-trace">
                {traceText().split('\n').slice(-40).join('\n') || 'No details recorded.'}
              </Text>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            {step === 'pick' && (
              <>
                <TouchableOpacity style={[styles.btn, styles.ghostBtn]} onPress={close} testID="fwupdate-cancel">
                  <Text style={styles.ghostBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.primaryBtn, !canStart && styles.btnDisabled]}
                  onPress={start}
                  disabled={!canStart}
                  testID="fwupdate-start"
                >
                  <Text style={styles.primaryBtnText}>Send update</Text>
                </TouchableOpacity>
              </>
            )}
            {step === 'sending' && (
              <TouchableOpacity
                style={[styles.btn, styles.dangerBtn, abortRef.current && styles.btnDisabled]}
                onPress={cancelTransfer}
                testID="fwupdate-abort"
              >
                <Text style={styles.dangerBtnText}>Cancel update</Text>
              </TouchableOpacity>
            )}
            {step === 'checking' && (
              <TouchableOpacity style={[styles.btn, styles.ghostBtn]} onPress={close} testID="fwupdate-hide">
                <Text style={styles.ghostBtnText}>Hide</Text>
              </TouchableOpacity>
            )}
            {(step === 'done' || step === 'failed') && (
              <>
                {step === 'failed' && (
                  <TouchableOpacity
                    style={[styles.btn, styles.ghostBtn]}
                    onPress={() => {
                      setFailure(null);
                      setStepBoth('pick');
                    }}
                    testID="fwupdate-again"
                  >
                    <Text style={styles.ghostBtnText}>Try again</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={close} testID="fwupdate-done">
                  <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, maxHeight: '88%', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#111', flexShrink: 1 },
  closeX: { fontSize: 18, color: '#6B7280', paddingHorizontal: 4 },
  body: { flexGrow: 0 },
  bodyContent: { paddingBottom: 4 },
  meta: { fontSize: 13, color: '#444', marginBottom: 6, lineHeight: 18 },
  label: { fontSize: 13, color: '#374151', fontWeight: '600', marginTop: 8, marginBottom: 6 },
  note: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  steps: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginTop: 10 },
  link: { fontSize: 13, color: '#4A90D9', fontWeight: '600', marginTop: 8 },
  gateBox: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  gateText: { fontSize: 13, color: '#9A3412', lineHeight: 19 },
  errorText: { fontSize: 13, color: '#B91C1C', marginTop: 8, lineHeight: 18 },
  trace: { fontSize: 10, color: '#374151', fontFamily: 'Menlo', marginTop: 6 },
  progressWrap: { marginTop: 10 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 6 },
  progressText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  progressPct: { fontSize: 13, color: '#111', fontWeight: '700' },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: '#22b8cf' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 14 },
  btn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: '#FDC996' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  ghostBtn: { backgroundColor: '#EFEFEF' },
  ghostBtnText: { color: '#111', fontWeight: '600', fontSize: 15 },
  dangerBtn: { backgroundColor: '#FEE2E2' },
  dangerBtnText: { color: '#B91C1C', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
});
