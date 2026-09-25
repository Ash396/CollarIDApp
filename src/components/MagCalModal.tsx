// Magnetometer calibration (fw 398+, MAG_CAL_MIN_FW_BUILD): how to turn
// the collar, a coverage ring driven by the collar's echo, then the verdict.
// The app's version of the website configurator's magcal modal.
//
// The run is runMagCal (utils/magCal.ts): one start frame, then a status
// query about every 2 s, each written only after the previous frame's echo
// (the pacing every tunnel frame keeps), over magCalIo (ble/bleManager.ts).
// The modal covers the screen for the whole run and the tunnel runs one
// operation at a time, so no other frame lands in the mailbox between a
// poll and its echo. Closing the modal, or Abort, sends
// CMD_MAG_CALIBRATE_ABORT. A dropped link does NOT stop a run: the collar
// holds its Bluetooth window 3 min, finishes the run and keeps a good or
// fair fit. A run that ends in anything but DONE + GOOD/FAIR leaves the
// previous calibration in force, and the result says so.
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Device } from 'react-native-ble-plx';

import { isMockDevice, magCalIo } from '../ble/bleManager';
import { MAG_CAL, MAG_CMD, runMagCal } from '../utils/magCal';
import type { MagCalOutcome, MagCalReport, MagCalTone } from '../utils/magCal';

type Step = 'intro' | 'run' | 'result';

type Props = {
  visible: boolean;
  device: Device | null;
  onClose: () => void;
  /** Every outcome a run ends in — the card's "Last run" line. */
  onResult?: (o: MagCalOutcome) => void;
};

/** The words on the collar's LED, shown before and during a run. */
export const MAG_CAL_LED_LINE =
  'On the collar: the LED pulses cyan while it collects, faster as the ring fills; ' +
  'two green flashes, then blue, when it is done; two red flashes if it failed or was stopped.';

/** How to turn the collar. Nothing here about putting the collar together
 *  — that is the field manual's job; this is the calibration's. */
export const MAG_CAL_STEPS = [
  'Away from metal and electronics: not on a steel bench, not next to a laptop or phone.',
  'Press Start, then turn the collar slowly through every orientation: a few slow figure-8s, then a full roll about each axis.',
  'Keep turning until the ring is full, usually 30–60 s. The collar gives up after 2 minutes. If the Bluetooth link drops, keep turning: the collar carries on by itself.',
];

const TONE_COLOR: Record<MagCalTone, string> = {
  good: '#16A34A',
  fair: '#CA8A04',
  retry: '#F97316',
  fault: '#DC2626',
  aborted: '#6B7280',
};

/* A coverage ring without an SVG dependency: two half-circle clips, each
   holding a full ring whose far two borders are transparent (a 180° arc),
   rotated into view as the percentage grows. */
const RING_SIZE = 132;
const RING_STROKE = 11;
function ProgressRing({ pct, fitting }: { pct: number; fitting: boolean }) {
  const p = Math.max(0, Math.min(100, pct));
  const deg = (360 * p) / 100;
  const right = Math.min(180, deg); // the right half fills first, top to bottom
  const left = Math.max(0, deg - 180); // then the left, bottom to top
  const color = fitting ? '#CA8A04' : '#22b8cf';
  const arc = (rotate: number) => (
    <View
      style={[
        styles.ringArc,
        { borderTopColor: color, borderRightColor: color },
        { transform: [{ rotate: `${rotate}deg` }] },
      ]}
    />
  );
  return (
    <View style={styles.ring} testID="magcal-ring">
      <View style={styles.ringTrack} />
      <View style={[styles.ringClip, styles.ringClipRight]}>
        <View style={styles.ringInnerRight}>{arc(right - 135)}</View>
      </View>
      <View style={[styles.ringClip, styles.ringClipLeft]}>
        <View style={styles.ringInnerLeft}>{arc(left + 45)}</View>
      </View>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPct} testID="magcal-pct">
          {p}%
        </Text>
      </View>
    </View>
  );
}

export default function MagCalModal({ visible, device, onClose, onResult }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [report, setReport] = useState<MagCalReport | null>(null);
  const [outcome, setOutcome] = useState<MagCalOutcome | null>(null);
  const [stopping, setStopping] = useState(false);
  const [stoppingNote, setStoppingNote] = useState<string | null>(null);
  const runningRef = useRef(false);
  const abortRef = useRef(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // A fresh open starts at the instructions.
  useEffect(() => {
    if (visible && !runningRef.current) {
      setStep('intro');
      setReport(null);
      setOutcome(null);
      setStopping(false);
      setStoppingNote(null);
    }
  }, [visible]);

  const linkUp = async (): Promise<boolean> => {
    if (!device) return false;
    if (isMockDevice(device)) return true;
    try {
      return await device.isConnected();
    } catch (_) {
      return false;
    }
  };

  const showResult = (o: MagCalOutcome, onCard = true) => {
    if (!aliveRef.current) return;
    setOutcome(o);
    setStep('result');
    if (onCard) onResult?.(o);
  };

  const start = async () => {
    if (runningRef.current || !device) return;
    runningRef.current = true;
    abortRef.current = false;
    setStopping(false);
    setStoppingNote(null);
    setReport(null);
    setStep('run');
    const io = magCalIo(device);
    try {
      const res = await runMagCal(io, {
        onUpdate: r => {
          if (aliveRef.current) setReport(r);
        },
        abortRequested: () => abortRef.current,
      });
      showResult(res.outcome);
    } catch (e: any) {
      const lost = !(await linkUp());
      /* Best effort: if the link is still up the collar may still be
         collecting (an echo timed out, or it stopped reporting). Stop it, and
         wait for that frame's echo so a "Calibrate again" cannot write over
         it. */
      if (!lost) {
        if (aliveRef.current) setStoppingNote('Stopping the run on the collar…');
        await io.command(MAG_CMD.ABORT).catch(() => {});
      }
      showResult(
        {
          inForce: false,
          tone: lost ? 'retry' : 'fault',
          title: lost ? 'Connection lost — the collar carries on' : 'Calibration did not finish',
          detail: lost
            ? 'The Bluetooth link dropped, but the collar finishes the calibration by itself and keeps a good or fair result. ' +
              'Its LED shows how it ended: two green flashes if saved, two red if not. Reconnect within 3 minutes and open Calibrate magnetometer to see the result.'
            : String(e?.message ?? e),
        },
        !lost,
      );
    } finally {
      runningRef.current = false;
    }
  };

  const requestAbort = () => {
    if (!runningRef.current) return;
    abortRef.current = true;
    setStopping(true);
  };

  // Close stops a running calibration first; the result step then closes.
  const close = () => {
    if (runningRef.current) {
      requestAbort();
      return;
    }
    onClose();
  };

  const S = MAG_CAL.STATE;
  const fitting = !!report && report.state === S.FITTING;
  const pct = report ? report.progressPct || 0 : 0;
  const statusText = stoppingNote
    ? stoppingNote
    : stopping
    ? 'Stopping…'
    : !report
    ? 'Starting…'
    : fitting
    ? 'Enough directions covered. Fitting…'
    : 'Keep turning the collar through every orientation';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}} testID="magcal-modal">
          <View style={styles.headerRow}>
            <Text style={styles.title}>Calibrate the magnetometer</Text>
            <TouchableOpacity
              onPress={close}
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {step === 'intro' && (
              <View testID="magcal-instructions">
                {MAG_CAL_STEPS.map((s, i) => (
                  <View style={styles.stepRow} key={i}>
                    <Text style={styles.stepNum}>{i + 1}.</Text>
                    <Text style={styles.stepText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {step === 'run' && (
              <View style={styles.runWrap}>
                <ProgressRing pct={pct} fitting={fitting} />
                <Text style={styles.statusText} testID="magcal-status">
                  {statusText}
                </Text>
                <Text style={styles.sectorsText}>
                  {report
                    ? `${report.sectorsHit || 0} of ${MAG_CAL.SECTORS} directions covered`
                    : ''}
                </Text>
              </View>
            )}

            {step === 'result' && outcome && (
              <View style={styles.resultRow}>
                <View
                  style={[styles.resultDot, { backgroundColor: TONE_COLOR[outcome.tone] }]}
                />
                <View style={styles.resultTextWrap}>
                  <Text style={styles.resultTitle} testID="magcal-result-title">
                    {outcome.title}
                  </Text>
                  <Text style={styles.resultDetail} testID="magcal-result-detail">
                    {outcome.detail}
                  </Text>
                </View>
              </View>
            )}

            {step !== 'result' && <Text style={styles.ledText}>{MAG_CAL_LED_LINE}</Text>}
          </ScrollView>

          <View style={styles.buttonRow}>
            {step === 'intro' && (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.ghostBtn]}
                  onPress={close}
                  testID="magcal-cancel"
                >
                  <Text style={styles.ghostBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.primaryBtn]}
                  onPress={start}
                  testID="magcal-start"
                >
                  <Text style={styles.primaryBtnText}>Start</Text>
                </TouchableOpacity>
              </>
            )}
            {step === 'run' && (
              <TouchableOpacity
                style={[styles.btn, styles.dangerBtn, stopping && styles.btnDisabled]}
                onPress={requestAbort}
                disabled={stopping}
                testID="magcal-abort"
              >
                <Text style={styles.dangerBtnText}>Abort</Text>
              </TouchableOpacity>
            )}
            {step === 'result' && (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.ghostBtn]}
                  onPress={() => setStep('intro')}
                  testID="magcal-again"
                >
                  <Text style={styles.ghostBtnText}>Calibrate again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.primaryBtn]}
                  onPress={close}
                  testID="magcal-done"
                >
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    maxHeight: '85%',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111', flexShrink: 1 },
  closeX: { fontSize: 18, color: '#6B7280', paddingHorizontal: 4 },
  body: { flexGrow: 0 },
  bodyContent: { paddingBottom: 4 },

  stepRow: { flexDirection: 'row', marginBottom: 10 },
  stepNum: { width: 22, fontSize: 14, color: '#555', fontWeight: '700' },
  stepText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },

  runWrap: { alignItems: 'center', paddingVertical: 8 },
  statusText: { marginTop: 14, fontSize: 15, color: '#333', textAlign: 'center' },
  sectorsText: { marginTop: 4, fontSize: 12, color: '#6B7280', textAlign: 'center' },

  ring: { width: RING_SIZE, height: RING_SIZE },
  ringTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: '#E5E7EB',
  },
  ringClip: {
    position: 'absolute',
    top: 0,
    width: RING_SIZE / 2,
    height: RING_SIZE,
    overflow: 'hidden',
  },
  ringClipRight: { left: RING_SIZE / 2 },
  ringClipLeft: { left: 0 },
  ringInnerRight: { position: 'absolute', left: -RING_SIZE / 2, top: 0 },
  ringInnerLeft: { position: 'absolute', left: 0, top: 0 },
  ringArc: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: { fontSize: 24, fontWeight: '700', color: '#111' },

  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  resultDot: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
  resultTextWrap: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  resultDetail: { fontSize: 14, color: '#444', lineHeight: 20 },

  ledText: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginTop: 14 },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: { backgroundColor: '#FDC996' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  ghostBtn: { backgroundColor: '#EFEFEF' },
  ghostBtnText: { color: '#111', fontWeight: '600', fontSize: 15 },
  dangerBtn: { backgroundColor: '#FEE2E2' },
  dangerBtnText: { color: '#B91C1C', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
});
