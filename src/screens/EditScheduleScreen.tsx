import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSchedules } from '../context/SchedulesContext';
import { useDevice } from '../context/DeviceContext';
import {
  ENV_INTERVAL_FIXED_MIN,
  MIC_CODEC_MIN_FW_BUILD,
  editorFeatureGates,
  fwGateNote,
  fwOptionsLine,
  micFieldsForGates,
} from '../utils/fw';
import type { Schedule } from '../navigation/ScheduleNavigator';
import StyledPicker from '../components/StyledPicker';
import { estimateScheduleSolarHours } from '../utils/powerEstimator';
import {
  SCHEDULE_PRESETS,
  applySchedulePreset,
  matchingSchedulePreset,
  slotMicCodec,
  slotMicLsbDrop,
} from '../utils/schedulePresets';
import type { ScheduleSlot } from '../utils/schedulePresets';
import { scheduleConsequences } from '../utils/scheduleSummary';
import {
  defaultAdvancedPrefs,
  loadAdvancedPrefs,
  saveAdvancedPrefs,
} from '../utils/editorPrefs';
import type { AdvancedPrefs, AdvancedSection } from '../utils/editorPrefs';

// "Active HH:00–HH:00 · N hours" readout for a time window. end_hour is
// inclusive, so the window covers [start, end+1) and its length is
// end-start+1 (wrapping past midnight when end < start).
function timeWindowSummary(start: number, end: number): string {
  let dur = end - start + 1;
  const wraps = dur <= 0;
  if (wraps) dur += 24;
  const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const note = dur === 24 ? ' (full day)' : wraps ? ' (overnight)' : '';
  return `Active ${fmt(start)}–${fmt(end + 1)} · ${dur} hour${
    dur === 1 ? '' : 's'
  }${note}`;
}

function clamp(v: any, lo: number, hi: number): number {
  const n = Number(v);
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

// 24-bit hour bitmap (bit h set iff hour h is inside the window) — same
// encoding as the website configurator and the firmware's
// Get_Schedule_Index_For_Hour. end hour is inclusive; end < start wraps.
function hoursBitmap(startHour: number, endHour: number): number {
  const start = clamp(startHour, 0, 23);
  const end = clamp(endHour, 0, 23);
  let bits = 0;
  if (end >= start) {
    for (let h = start; h <= end; h++) bits |= 1 << h;
  } else {
    for (let h = start; h < 24; h++) bits |= 1 << h;
    for (let h = 0; h <= end; h++) bits |= 1 << h;
  }
  return bits;
}

// VeDBA behaviour reference shown under the dynamic-sampling thresholds —
// same table as the website configurator.
const VEDBA_ROWS: [string, string, string][] = [
  ['Resting / standing', '< 0.05 g', '< 5'],
  ['Slow walk / foraging', '0.05 – 0.20 g', '5 – 20'],
  ['Brisk walk / trot', '0.20 – 0.50 g', '20 – 50'],
  ['Run / active flight', '> 0.50 g', '> 50'],
];

export default function EditScheduleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { schedule, index } = route.params;

  const { draftSchedules, updateSchedule, deleteSchedule } = useSchedules();

  /* ---------------- STATE ---------------- */
  const [startHour, setStartHour] = useState(schedule.window?.startHour ?? 0);
  const [endHour, setEndHour] = useState(schedule.window?.endHour ?? 23);

  // 24/7 is derived UI sugar — the device has no all-day flag; a full day
  // is just start 0 / end 23. "On" locks the hour pickers to 0–23.
  const [is247, setIs247] = useState(
    (schedule.window?.startHour ?? 0) === 0 &&
      (schedule.window?.endHour ?? 23) === 23,
  );

  const toggle247 = (val: boolean) => {
    setIs247(val);
    if (val) {
      setStartHour(0);
      setEndHour(23);
    }
  };

  /* GPS */
  const [gpsEnabled, setGpsEnabled] = useState(schedule.gps?.enabled ?? false);
  const [gpsInterval, setGpsInterval] = useState(
    String(schedule.gps?.sampleIntervalMin ?? 20),
  );
  const [gpsAccuracy, setGpsAccuracy] = useState(schedule.gps?.accuracy ?? 5);

  /* Dynamic (activity-based) GPS sampling */
  const [gpsDynamic, setGpsDynamic] = useState(
    schedule.gps?.dynamicSamplingMode ?? false,
  );
  const [gpsMedVedba, setGpsMedVedba] = useState(
    String(schedule.gps?.mediumMotionVedbaThresholdX100 ?? 20),
  );
  const [gpsMedInt, setGpsMedInt] = useState(
    String(schedule.gps?.mediumMotionGpsIntervalMin ?? 10),
  );
  const [gpsHighVedba, setGpsHighVedba] = useState(
    String(schedule.gps?.highMotionVedbaThresholdX100 ?? 100),
  );
  const [gpsHighInt, setGpsHighInt] = useState(
    String(schedule.gps?.highMotionGpsIntervalMin ?? 5),
  );

  const handleGpsToggle = (val: boolean) => {
    setGpsEnabled(val);
    if (!val) {
      // Dynamic mode and TX-on-fix are meaningless without GPS.
      setGpsDynamic(false);
      setLorawanTxOnFix(false);
      setLoraTxOnFix(false);
    }
  };

  /* Light */
  const [lightEnabled, setLightEnabled] = useState(
    schedule.light?.enabled ?? false,
  );
  const [lightInterval, setLightInterval] = useState(
    String(schedule.light?.sampleIntervalMin ?? 10),
  );

  /* Environmental */
  const [envEnabled, setEnvEnabled] = useState(
    schedule.environmental?.enabled ?? false,
  );
  /* Pinned, and pinned on LOAD: a collar or preset already holding an illegal
     interval heals here rather than round-tripping through Save. */
  const [envInterval] = useState(String(ENV_INTERVAL_FIXED_MIN));

  /* Particulate — sensor not installed on this hardware; always off */
  const [partEnabled] = useState(false);
  const [partInterval, setPartInterval] = useState(
    String(schedule.particulate?.sampleIntervalMin ?? 15),
  );

  /* Microphone */
  const [micEnabled, setMicEnabled] = useState(
    schedule.microphone?.enabled ?? false,
  );
  const [micContinuous, setMicContinuous] = useState(
    schedule.microphone?.continuousMode ?? false,
  );
  const [micLength, setMicLength] = useState(
    String(schedule.microphone?.sampleLengthMin ?? 1),
  );
  const [micWindow, setMicWindow] = useState(
    String(schedule.microphone?.sampleWindowMin ?? 10),
  );
  const [micRate, setMicRate] = useState(schedule.microphone?.sampleRate ?? 0);
  const [micSens, setMicSens] = useState(schedule.microphone?.sensitivity ?? 0);
  // fw 380: recording format and low-bit drop (slotMicCodec). A mic that is
  // on keeps its codec, and absent = WAV, which is what a collar or preset
  // predating the fields records. A mic that is off starts at the new-slot
  // default (compressed): its codec never reached the collar (a read-back
  // has no block for it), so switching it on here starts as FLAC, like a
  // new slot. The save path still holds it to WAV below build 380.
  // <any>: typed like its sibling pickers' state (the route's schedule is
  // untyped), so the setter still takes StyledPicker's value as-is.
  const [micCodec, setMicCodec] = useState<any>(slotMicCodec(schedule.microphone));
  // old: const [micCodec, setMicCodec] = useState(schedule.microphone?.codec ?? 0);
  const [micLsbDrop, setMicLsbDrop] = useState<any>(slotMicLsbDrop(schedule.microphone));
  // old: const [micLsbDrop, setMicLsbDrop] = useState(schedule.microphone?.lsbDrop ?? 0);

  /* Firmware gates. A connected collar's build decides what it can honour;
     with no collar every option is offered and the line at the top says so.
     Bit depth is deliberately not offered — recordings are always 16-bit. */
  // `device`: a connected collar that has not reported its build keeps the
  // gates closed (editorFeatureGates) — "no build" is not "no collar".
  const { device, fwBuild, caps } = useDevice();
  const gates = editorFeatureGates(fwBuild, caps, !!device);
  // old: const { fwBuild, caps } = useDevice();
  // old: const gates = editorFeatureGates(fwBuild, caps);
  const micFormatCapable = gates.micFormat;
  const micRateExtCapable = gates.micRateExt;
  const micSensCapable = gates.micSens;
  const micCodecCapable = gates.micCodec;

  /* Accelerometer */
  const [accelEnabled, setAccelEnabled] = useState(
    schedule.accelerometer?.enabled ?? false,
  );
  const [accelRate, setAccelRate] = useState(
    schedule.accelerometer?.sampleRate ?? 0,
  );
  const [accelSensitivity, setAccelSensitivity] = useState(
    schedule.accelerometer?.sensitivity ?? 0,
  );

  /* LoRaWAN */
  const [lorawanEnabled, setLorawanEnabled] = useState(
    schedule.lorawan?.enabled ?? false,
  );
  const [lorawanInterval, setLorawanInterval] = useState(
    String(schedule.lorawan?.sendIntervalMin ?? 60),
  );
  const [lorawanTxOnFix, setLorawanTxOnFix] = useState(
    schedule.gps?.lorawanTxOnGpsFix ?? false,
  );

  /* LoRa */
  const [loraEnabled, setLoraEnabled] = useState(
    schedule.lora?.enabled ?? false,
  );
  const [loraInterval, setLoraInterval] = useState(
    String(schedule.lora?.sendIntervalMin ?? 60),
  );
  const [loraTxOnFix, setLoraTxOnFix] = useState(
    schedule.gps?.loraTxOnGpsFix ?? false,
  );

  // LoRa and LoRaWAN share one radio — a schedule may use at most one.
  // Enabling either turns the other off; disabling one drops its TX-on-fix.
  const handleLorawanToggle = (val: boolean) => {
    setLorawanEnabled(val);
    if (val) {
      setLoraEnabled(false);
      setLoraTxOnFix(false);
    } else {
      setLorawanTxOnFix(false);
    }
  };
  const handleLoraToggle = (val: boolean) => {
    setLoraEnabled(val);
    if (val) {
      setLorawanEnabled(false);
      setLorawanTxOnFix(false);
    } else {
      setLoraTxOnFix(false);
    }
  };

  /* Magnetometer — UI in minutes, stored on the wire in seconds. */
  const [magEnabled, setMagEnabled] = useState(
    schedule.magnetometer?.enabled ?? false,
  );
  const [magIntervalMin, setMagIntervalMin] = useState(
    String(Math.max(1, Math.round((schedule.magnetometer?.sampleIntervalS ?? 60) / 60))),
  );

  /* Advanced groups — collapsed by default, remembered across sessions. */
  const [advanced, setAdvanced] = useState<AdvancedPrefs>(defaultAdvancedPrefs);
  useEffect(() => {
    let alive = true;
    loadAdvancedPrefs().then(p => {
      if (alive) setAdvanced(p);
    });
    return () => {
      alive = false;
    };
  }, []);
  const toggleAdvanced = (k: AdvancedSection) =>
    setAdvanced(prev => {
      const next = { ...prev, [k]: !prev[k] };
      saveAdvancedPrefs(next);
      return next;
    });

  /* ---------------- PRESETS ---------------- */
  // Fill every control from a complete slot; the hours are the operator's.
  const applySlot = (s: ScheduleSlot) => {
    setGpsEnabled(!!s.gps?.enabled);
    setGpsInterval(String(s.gps?.sampleIntervalMin ?? 20));
    setGpsAccuracy(s.gps?.accuracy ?? 5);
    setGpsDynamic(!!s.gps?.dynamicSamplingMode);
    setGpsMedVedba(String(s.gps?.mediumMotionVedbaThresholdX100 ?? 20));
    setGpsMedInt(String(s.gps?.mediumMotionGpsIntervalMin ?? 10));
    setGpsHighVedba(String(s.gps?.highMotionVedbaThresholdX100 ?? 100));
    setGpsHighInt(String(s.gps?.highMotionGpsIntervalMin ?? 5));
    setLightEnabled(!!s.light?.enabled);
    setLightInterval(String(s.light?.sampleIntervalMin ?? 10));
    setEnvEnabled(!!s.environmental?.enabled);
    setPartInterval(String(s.particulate?.sampleIntervalMin ?? 15));
    setMicEnabled(!!s.microphone?.enabled);
    setMicContinuous(!!s.microphone?.continuousMode);
    setMicLength(String(s.microphone?.sampleLengthMin ?? 1));
    setMicWindow(String(s.microphone?.sampleWindowMin ?? 10));
    setMicRate(s.microphone?.sampleRate ?? 0);
    setMicSens(s.microphone?.sensitivity ?? 0);
    setMicCodec(slotMicCodec(s.microphone));
    // old: setMicCodec(s.microphone?.codec ?? 0);
    setMicLsbDrop(slotMicLsbDrop(s.microphone));
    // old: setMicLsbDrop(s.microphone?.lsbDrop ?? 0);
    setAccelEnabled(!!s.accelerometer?.enabled);
    setAccelRate(s.accelerometer?.sampleRate ?? 0);
    setAccelSensitivity(s.accelerometer?.sensitivity ?? 0);
    setLorawanEnabled(!!s.lorawan?.enabled);
    setLorawanInterval(String(s.lorawan?.sendIntervalMin ?? 60));
    setLorawanTxOnFix(!!s.gps?.lorawanTxOnGpsFix);
    setLoraEnabled(!!s.lora?.enabled);
    setLoraInterval(String(s.lora?.sendIntervalMin ?? 60));
    setLoraTxOnFix(!!s.gps?.loraTxOnGpsFix);
    setMagEnabled(!!s.magnetometer?.enabled);
    setMagIntervalMin(
      String(Math.max(1, Math.round((s.magnetometer?.sampleIntervalS ?? 60) / 60))),
    );
  };

  /* ---------------- PICKER OPTIONS ---------------- */

  const hourOptions = [...Array(24).keys()].map(h => ({
    label: `${h}:00`,
    value: h,
  }));

  // Wire values + labels from the shared field vocabulary
  // (js/collar-vocab.js on the website).
  const gpsAccuracyOptions = [
    { label: 'Low (fastest fix, least power)', value: 1 },
    { label: 'Medium', value: 5 },
    { label: 'High (slowest fix, most power)', value: 10 },
  ];

  const accelRateOptions = [
    { label: '25 Hz', value: 0 },
    { label: '50 Hz', value: 1 },
  ];

  // Mirrors VOCAB.micSensitivity on the website, labelled as what it is: a
  // gain step over the calibrated baseline. Filtered below 349 like the
  // extended rates (StyledPicker has no per-item disable); save clamps.
  const micSensOptions = [
    { label: 'Default', value: 0 },
    ...(micSensCapable
      ? [
          { label: '+6 dB', value: 1 },
          { label: '+12 dB', value: 2 },
        ]
      : []),
  ];

  // Wording mirrors VOCAB.micSampleRate on the website. StyledPicker has no
  // per-item disable, so on fw 338-342 the extended rates are filtered out of
  // the list rather than greyed; the collar cannot honour them and the save
  // path clamps them anyway. Ascending Hz for display; the values are wire
  // values and not in display order (0 = 16 kHz is the historical default).
  const micRateOptions = [
    { label: '8 kHz', value: 1 },
    { label: '16 kHz', value: 0 },
    ...(micRateExtCapable
      ? [
          { label: '48 kHz', value: 2 },
          { label: '96 kHz (ultrasonic)', value: 3 },
          { label: '192 kHz (ultrasonic)', value: 4 },
        ]
      : []),
  ];

  // Mirrors VOCAB.micCodec / micLsbDrop on the website (fw 380), in the
  // operator's words: what the file IS, not the codec name. Both options are
  // always listed — below 380 the picker is greyed, not emptied. The drop
  // picker only shows under compressed storage — it does nothing on a WAV
  // take. No compression ratios in the drop labels: dB is what the bits
  // cost; the card estimate says what they save.
  const micCodecOptions = [
    { label: 'Standard (WAV)', value: 0 },
    { label: 'Compressed (lossless, about 3× smaller)', value: 1 },
  ];
  const micLsbDropOptions = [
    { label: '0 (none)', value: 0 },
    { label: '1 bit (about 6 dB)', value: 1 },
    { label: '2 bits (about 12 dB)', value: 2 },
    { label: '3 bits (about 18 dB)', value: 3 },
    { label: '4 bits (about 24 dB)', value: 4 },
  ];
  // Compressed storage is honoured at 8 and 16 kHz (wire 1 / 0) only; the
  // collar records WAV at 48 kHz and above and says so in its log. Same rule
  // as the website's micCodecRateOk.
  const micCodecRateOk = micRate === 0 || micRate === 1;
  // What the collar will actually store, given its build: the values the save
  // path writes and the ones the pickers are held to.
  const micEffective = micFieldsForGates(
    { enabled: micEnabled, sampleRate: micRate, sensitivity: micSens, codec: micCodec, lsbDrop: micLsbDrop },
    gates,
  );
  const micCodecEffective = micEffective.codec;
  const micLsbDropEffective = micEffective.lsbDrop;

  const accelSensitivityOptions = [
    { label: '±2 g (most sensitive)', value: 0 },
    { label: '±4 g', value: 1 },
    { label: '±8 g', value: 2 },
  ];

  /* ---------------- DERIVED ---------------- */

  // Live draft of this schedule from the current inputs — feeds the
  // estimates in the header and the save handler.
  const buildDraft = (): Schedule => ({
    ...schedule,
    window: {
      startHour: clamp(startHour, 0, 23),
      endHour: clamp(endHour, 0, 23),
    },
    gps: {
      enabled: gpsEnabled,
      sampleIntervalMin: clamp(gpsInterval, 1, 720),
      accuracy: gpsAccuracy,
      dynamicSamplingMode: gpsEnabled && gpsDynamic,
      mediumMotionVedbaThresholdX100: clamp(gpsMedVedba, 1, 10000),
      mediumMotionGpsIntervalMin: clamp(gpsMedInt, 1, 720),
      highMotionVedbaThresholdX100: clamp(gpsHighVedba, 1, 10000),
      highMotionGpsIntervalMin: clamp(gpsHighInt, 1, 720),
      lorawanTxOnGpsFix: gpsEnabled && lorawanEnabled && lorawanTxOnFix,
      loraTxOnGpsFix: gpsEnabled && loraEnabled && loraTxOnFix,
    },
    light: {
      enabled: lightEnabled,
      sampleIntervalMin: clamp(lightInterval, 1, 720),
    },
    environmental: {
      enabled: envEnabled,
      sampleIntervalMin: ENV_INTERVAL_FIXED_MIN,
    },
    particulate: {
      enabled: partEnabled,
      sampleIntervalMin: clamp(partInterval, 1, 720),
    },
    microphone: {
      enabled: micEnabled,
      continuousMode: micContinuous,
      // Continuous mode records on 60-minute file boundaries; the
      // length/window pair is fixed at 60/60 (matches the website).
      sampleLengthMin: micContinuous ? 60 : clamp(micLength, 1, 60),
      sampleWindowMin: micContinuous ? 60 : clamp(micWindow, 1, 60),
      // Held to what this collar honours (micFieldsForGates), so the saved
      // draft matches what the collar will actually record and the
      // verify-after-write comparison holds.
      sampleRate: micEffective.sampleRate,
      bitDepth: 0, // always 16-bit; not user-selectable
      sensitivity: micEffective.sensitivity,
      codec: micCodecEffective,
      lsbDrop: micLsbDropEffective,
    },
    accelerometer: {
      enabled: accelEnabled,
      sampleRate: accelRate,
      sensitivity: accelSensitivity,
    },
    lorawan: {
      enabled: lorawanEnabled,
      sendIntervalMin: clamp(lorawanInterval, 1, 1440),
    },
    lora: {
      enabled: loraEnabled,
      sendIntervalMin: clamp(loraInterval, 1, 1440),
    },
    magnetometer: {
      enabled: magEnabled,
      sampleIntervalS: clamp(magIntervalMin, 1, 60) * 60,
    },
  });

  const draft = useMemo(
    () => buildDraft(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      startHour, endHour, gpsEnabled, gpsInterval, gpsAccuracy, gpsDynamic,
      gpsMedVedba, gpsMedInt, gpsHighVedba, gpsHighInt, lightEnabled,
      lightInterval, envEnabled, envInterval, micEnabled, micContinuous,
      micLength, micWindow, micEffective.sampleRate, micEffective.sensitivity,
      micCodecEffective, micLsbDropEffective,
      accelEnabled, accelRate, accelSensitivity,
      lorawanEnabled, lorawanInterval, lorawanTxOnFix, loraEnabled,
      loraInterval, loraTxOnFix, magEnabled, magIntervalMin,
    ],
  );

  const solarEstimate = useMemo(() => estimateScheduleSolarHours(draft), [draft]);
  // Consequences, not parameters: what this schedule does to the battery
  // and the card, live as the knobs move.
  const consequences = useMemo(() => scheduleConsequences(draft), [draft]);
  // Which quick setup the draft currently is (hours aside), if any. Four
  // normalized compares — cheap enough to run every render.
  const presetMatch = matchingSchedulePreset(draft, gates);

  // 1-based labels of other draft schedules whose hours overlap the window
  // currently being edited. The firmware resolves overlap by first-match,
  // silently starving the later schedule — so, like the website, block save.
  const conflictLabels = useMemo(() => {
    const mine = hoursBitmap(startHour, endHour);
    const out: number[] = [];
    draftSchedules.forEach((s: Schedule, i: number) => {
      if (s.id === schedule.id) return;
      if (mine & hoursBitmap(s.window.startHour, s.window.endHour)) {
        out.push(i + 1);
      }
    });
    return out;
  }, [draftSchedules, schedule.id, startHour, endHour]);

  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (conflictLabels.length) {
      Alert.alert(
        'Overlapping time window',
        `This time window overlaps with Schedule${
          conflictLabels.length === 1 ? '' : 's'
        } ${conflictLabels.join(', ')}. Adjust Start / End so each hour belongs to at most one schedule before saving.`,
      );
      return;
    }
    updateSchedule(schedule.id, buildDraft());
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete ${
        typeof index === 'number' ? `Schedule ${index + 1}` : 'this schedule'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSchedule(schedule.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  /* ---------------- CARD HELPERS ---------------- */
  // `locked` greys the card out and disables its toggle — used for sensors
  // that aren't present on this hardware.
  const renderCard = (
    title: string,
    children: React.ReactNode,
    enabled?: boolean,
    onToggle?: (val: boolean) => void,
    locked?: boolean,
  ) => {
    const dim = enabled === false || locked === true;
    return (
      <View style={[styles.card, dim && styles.cardDisabled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {typeof enabled === 'boolean' && (
            <Switch
              value={locked ? false : enabled}
              onValueChange={onToggle}
              disabled={locked === true}
            />
          )}
        </View>
        <View style={dim ? styles.cardBodyDim : undefined}>{children}</View>
      </View>
    );
  };

  // The collapsible "Advanced" group at the foot of a card. Collapsed by
  // default; the choice is remembered per section.
  const renderAdvanced = (section: AdvancedSection, children: React.ReactNode) => {
    const open = advanced[section];
    return (
      <View style={styles.advancedWrap}>
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => toggleAdvanced(section)}
          activeOpacity={0.7}
        >
          <Text style={styles.advancedToggleText}>Advanced</Text>
          <Text style={styles.advancedChevron}>{open ? '▾' : '▸'}</Text>
        </TouchableOpacity>
        {open && <View>{children}</View>}
      </View>
    );
  };

  // One switch row inside a card (the "other sensors" list).
  const renderSwitchRow = (
    label: string,
    value: boolean,
    onChange?: (v: boolean) => void,
    disabled?: boolean,
    sub?: string,
  ) => (
    <View style={styles.row}>
      <View style={styles.rowLabelWrap}>
        <Text style={disabled ? styles.rowLabelDim : styles.rowLabel}>{label}</Text>
        {!!sub && <Text style={styles.helperSmall}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} />
    </View>
  );

  /* ---------------- RENDER ---------------- */
  const fwLine = fwOptionsLine(fwBuild, gates, !!device);
  // old: const fwLine = fwOptionsLine(fwBuild, gates);
  const fwAllOk =
    fwBuild > 0 && micFormatCapable && micRateExtCapable && micSensCapable && micCodecCapable;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          {typeof index === 'number'
            ? `Edit Schedule ${index + 1}`
            : 'Edit Schedule'}
        </Text>
        <Text style={styles.solarEstimate}>{solarEstimate.toFixed(2)} sh</Text>
      </View>

      {/* QUICK SETUPS — pick one, then set the hours. Everything below is
          filled in; every knob stays reachable under Advanced. */}
      {renderCard(
        '✨ Quick setups',
        <>
          <View style={styles.presetList}>
            {SCHEDULE_PRESETS.map(p => {
              const on = presetMatch === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.presetBtn, on && styles.presetBtnOn]}
                  onPress={() => applySlot(applySchedulePreset(draft, p))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetLabel, on && styles.presetLabelOn]}>
                    {on ? '● ' : ''}
                    {p.label}
                  </Text>
                  <Text style={styles.presetDescription}>{p.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperSmall}>
            Pick a setup, then set the hours below. Every setting stays
            reachable under Advanced.
          </Text>

          <View style={styles.consequences}>
            <Text style={styles.consequenceLine}>{consequences.batteryText}</Text>
            <Text style={styles.consequenceLine}>{consequences.cardText}</Text>
            <Text style={styles.helperSmall}>
              From a full charge with 1 hour of sun a day, running only this
              schedule. The card figure is audio only.
            </Text>
          </View>

          <Text
            style={[
              styles.fwLine,
              fwBuild === 0
                ? styles.fwLineNone
                : fwAllOk
                ? styles.fwLineOk
                : styles.fwLineWarn,
            ]}
          >
            {fwLine}
          </Text>
        </>,
      )}

      {/* TIME WINDOW */}
      {renderCard(
        '🕓 Time Window',
        <>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Run 24/7 (all day)</Text>
            <Switch value={is247} onValueChange={toggle247} />
          </View>

          <Text style={styles.label}>Start Hour</Text>
          <StyledPicker
            selectedValue={startHour}
            onValueChange={setStartHour}
            items={hourOptions}
            placeholder="Select start hour"
            enabled={!is247}
          />

          <Text style={styles.label}>End Hour</Text>
          <StyledPicker
            selectedValue={endHour}
            onValueChange={setEndHour}
            items={hourOptions}
            placeholder="Select end hour"
            enabled={!is247}
          />

          <Text style={styles.helper}>
            Both hours are inclusive — the end hour is fully counted.
          </Text>
          <Text style={styles.windowSummary}>
            {timeWindowSummary(startHour, endHour)}
          </Text>

          {conflictLabels.length > 0 && (
            <View style={styles.conflictBox}>
              <Text style={styles.conflictTitle}>Overlapping time window</Text>
              <Text style={styles.conflictText}>
                This time window overlaps with Schedule
                {conflictLabels.length === 1 ? '' : 's'}{' '}
                {conflictLabels.join(', ')}. Adjust Start / End so each hour
                belongs to at most one schedule before saving.
              </Text>
            </View>
          )}
        </>,
      )}

      {/* GPS */}
      {renderCard(
        '📍 GPS',
        <>
          <Text style={styles.label}>Position every (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={gpsInterval}
            onChangeText={setGpsInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Faster when the animal moves</Text>
            <Switch
              value={gpsDynamic}
              onValueChange={setGpsDynamic}
              disabled={!gpsEnabled}
            />
          </View>
          {gpsDynamic && (
            <Text style={styles.helper}>
              Every {gpsInterval || '?'} min when still, {gpsMedInt || '?'} min
              when walking, {gpsHighInt || '?'} min when running. The
              thresholds are under Advanced.
            </Text>
          )}

          {renderAdvanced(
            'gps',
            <>
              <Text style={styles.label}>Accuracy</Text>
              <StyledPicker
                selectedValue={gpsAccuracy}
                onValueChange={setGpsAccuracy}
                items={gpsAccuracyOptions}
                placeholder="Select accuracy"
                enabled={gpsEnabled}
              />

              {gpsDynamic && (
                <View style={styles.dynamicWrap}>
                  <Text style={styles.helper}>
                    Movement thresholds in{' '}
                    <Text style={styles.bold}>0.01 g units</Text> of VeDBA
                    (e.g. 20 = 0.20 g).
                  </Text>

                  <View style={styles.vedbaTable}>
                    <View style={[styles.vedbaRow, styles.vedbaHeadRow]}>
                      <Text style={[styles.vedbaCell, styles.vedbaHead, styles.vedbaWide]}>
                        Behaviour
                      </Text>
                      <Text style={[styles.vedbaCell, styles.vedbaHead]}>
                        Typical VeDBA (g)
                      </Text>
                      <Text style={[styles.vedbaCell, styles.vedbaHead]}>
                        Threshold value
                      </Text>
                    </View>
                    {VEDBA_ROWS.map(([b, g, t]) => (
                      <View key={b} style={styles.vedbaRow}>
                        <Text style={[styles.vedbaCell, styles.vedbaWide]}>{b}</Text>
                        <Text style={styles.vedbaCell}>{g}</Text>
                        <Text style={styles.vedbaCell}>{t}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.helperSmall}>
                    Values vary by species and collar placement — calibrate
                    against a short accelerometer recording of known
                    behaviours.
                  </Text>

                  <View style={styles.dynGrid}>
                    <View style={styles.dynGridItem}>
                      <Text style={styles.label}>Walking threshold</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={gpsMedVedba}
                        onChangeText={setGpsMedVedba}
                        placeholder="20"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.dynGridItem}>
                      <Text style={styles.label}>Walking: every (min)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={gpsMedInt}
                        onChangeText={setGpsMedInt}
                        placeholder="10"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.dynGridItem}>
                      <Text style={styles.label}>Running threshold</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={gpsHighVedba}
                        onChangeText={setGpsHighVedba}
                        placeholder="100"
                        placeholderTextColor="#999"
                      />
                    </View>
                    <View style={styles.dynGridItem}>
                      <Text style={styles.label}>Running: every (min)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={gpsHighInt}
                        onChangeText={setGpsHighInt}
                        placeholder="5"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </View>
              )}
            </>,
          )}
        </>,
        gpsEnabled,
        handleGpsToggle,
      )}

      {/* ACCELEROMETER */}
      {renderCard(
        '🏃 Movement (accelerometer)',
        <>
          <Text style={styles.helper}>
            Continuous movement sensing — activity tracking and mortality
            detection. Small, steady battery cost.
          </Text>
          {renderAdvanced(
            'accelerometer',
            <>
              <Text style={styles.label}>Sample rate</Text>
              <StyledPicker
                selectedValue={accelRate}
                onValueChange={setAccelRate}
                items={accelRateOptions}
                placeholder="Select sample rate"
                enabled={accelEnabled}
              />

              <Text style={styles.label}>Range</Text>
              <StyledPicker
                selectedValue={accelSensitivity}
                onValueChange={setAccelSensitivity}
                items={accelSensitivityOptions}
                placeholder="Select range"
                enabled={accelEnabled}
              />
            </>,
          )}
        </>,
        accelEnabled,
        setAccelEnabled,
      )}

      {/* MICROPHONE */}
      {renderCard(
        '🎙️ Microphone',
        <>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Record continuously</Text>
            <Switch value={micContinuous} onValueChange={setMicContinuous} />
          </View>

          {micContinuous ? (
            <Text style={styles.helper}>
              Recordings are split into separate files on 60-minute
              boundaries.
            </Text>
          ) : (
            <>
              <View style={styles.inlinePair}>
                <Text style={styles.inlineWord}>Record</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  keyboardType="numeric"
                  value={micLength}
                  onChangeText={setMicLength}
                  placeholder={`1–${micWindow || '60'}`}
                  placeholderTextColor="#999"
                />
                <Text style={styles.inlineWord}>min every</Text>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  keyboardType="numeric"
                  value={micWindow}
                  onChangeText={setMicWindow}
                  placeholder="1–60"
                  placeholderTextColor="#999"
                />
                <Text style={styles.inlineWord}>min</Text>
              </View>
            </>
          )}

          {/* Storage lives in the simple view while the collar can use it
              (or no collar is connected); a collar that cannot moves it
              under Advanced, greyed, with the firmware note. */}
          {micCodecCapable && (
            <>
              <Text style={styles.label}>Storage</Text>
              <StyledPicker
                selectedValue={micCodecEffective}
                onValueChange={setMicCodec}
                items={micCodecOptions}
                placeholder="Select storage"
                enabled={micEnabled}
              />
              {micCodecEffective === 1 && !micCodecRateOk && (
                <Text style={styles.noteAmber}>
                  Compressed storage works at 8 and 16 kHz only — at this
                  sample rate the collar records standard WAV.
                </Text>
              )}
            </>
          )}

          {renderAdvanced(
            'microphone',
            <>
              <Text style={styles.label}>Sample rate</Text>
              <StyledPicker
                selectedValue={micEffective.sampleRate}
                onValueChange={setMicRate}
                items={micRateOptions}
                placeholder="Select sample rate"
                enabled={micEnabled && micFormatCapable}
              />
              {!micFormatCapable ? (
                <Text style={styles.noteAmber}>
                  {fwGateNote(fwBuild, 338)} It records at 16 kHz.
                </Text>
              ) : !micRateExtCapable ? (
                <Text style={styles.helper}>
                  Rates above 16 kHz: {fwGateNote(fwBuild, 343).toLowerCase()}
                </Text>
              ) : null}

              <Text style={styles.label}>Microphone gain</Text>
              <StyledPicker
                selectedValue={micEffective.sensitivity}
                onValueChange={setMicSens}
                items={micSensOptions}
                placeholder="Select gain"
                enabled={micEnabled && micSensCapable}
              />
              {!micSensCapable && (
                <Text style={styles.noteAmber}>{fwGateNote(fwBuild, 349)}</Text>
              )}

              {!micCodecCapable && (
                <>
                  <Text style={styles.label}>Storage</Text>
                  <StyledPicker
                    selectedValue={micCodecEffective}
                    onValueChange={setMicCodec}
                    items={micCodecOptions}
                    placeholder="Select storage"
                    enabled={false}
                  />
                  <Text style={styles.noteAmber}>
                    {fwGateNote(fwBuild, MIC_CODEC_MIN_FW_BUILD)} It records
                    standard WAV.
                  </Text>
                </>
              )}

              {micCodecEffective === 1 && (
                <>
                  <Text style={styles.label}>Low bits dropped</Text>
                  <StyledPicker
                    selectedValue={micLsbDropEffective}
                    onValueChange={setMicLsbDrop}
                    items={micLsbDropOptions}
                    placeholder="Select bits to drop"
                    enabled={micEnabled}
                  />
                  <Text style={styles.helper}>
                    Lossy. Removes the lowest bits of every sample before it is
                    stored, and it cannot be undone. Each bit raises the file's own
                    noise floor about 6 dB, but the microphone's hiss sits above
                    it, so at Default one bit costs up to about 1 dB of the
                    quietest detail and two up to about 3 dB (less at Medium or
                    High); three or more start to bury quiet sounds. Leave at 0
                    to keep everything. Only affects compressed recordings.
                  </Text>
                </>
              )}
            </>,
          )}
        </>,
        micEnabled,
        setMicEnabled,
      )}

      {/* OTHER SENSORS — one card, four switches; intervals under Advanced */}
      {renderCard(
        '🌡️ Other sensors',
        <>
          {renderSwitchRow('Light', lightEnabled, setLightEnabled)}
          {renderSwitchRow(
            'Weather (temperature, humidity, pressure)',
            envEnabled,
            setEnvEnabled,
            false,
            'Sampled every 5 minutes.',
          )}
          {renderSwitchRow('Heading (magnetometer)', magEnabled, setMagEnabled)}
          {renderSwitchRow(
            'Particulates',
            false,
            undefined,
            true,
            'Sensor not installed on this collar.',
          )}

          {renderAdvanced(
            'sensors',
            <>
              <Text style={styles.label}>Light every (minutes)</Text>
              <TextInput
                style={[styles.input, !lightEnabled && styles.inputDisabled]}
                keyboardType="numeric"
                value={lightInterval}
                onChangeText={setLightInterval}
                placeholder="1–720 min"
                placeholderTextColor="#999"
                editable={lightEnabled}
              />

              <Text style={styles.label}>Weather every (minutes)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                keyboardType="numeric"
                value={envInterval}
                placeholderTextColor="#999"
                editable={false}
              />
              <Text style={styles.helper}>
                Fixed at 5 minutes — the sensor's BSEC library supports only
                that cadence.
              </Text>

              <Text style={styles.label}>Heading every (minutes)</Text>
              <TextInput
                style={[styles.input, !magEnabled && styles.inputDisabled]}
                keyboardType="numeric"
                value={magIntervalMin}
                onChangeText={setMagIntervalMin}
                placeholder="1–60 min"
                placeholderTextColor="#999"
                editable={magEnabled}
              />

              <Text style={styles.label}>Particulates every (minutes)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                keyboardType="numeric"
                value={partInterval}
                onChangeText={setPartInterval}
                placeholder="1–720 min"
                placeholderTextColor="#999"
                editable={false}
              />
            </>,
          )}
        </>,
      )}

      {/* LORAWAN — mutually exclusive with LoRa (shared radio) */}
      {renderCard(
        '📡 LoRaWAN',
        <>
          <Text style={styles.label}>Uplink every (minutes)</Text>
          <TextInput
            style={[
              styles.input,
              lorawanEnabled && lorawanTxOnFix && styles.inputDisabled,
            ]}
            keyboardType="numeric"
            value={lorawanInterval}
            onChangeText={setLorawanInterval}
            placeholder="1–1440 min"
            placeholderTextColor="#999"
            editable={lorawanEnabled && !lorawanTxOnFix}
          />
          {lorawanEnabled && lorawanTxOnFix && (
            <Text style={styles.helper}>
              Uplinks on every new GPS position instead (Advanced).
            </Text>
          )}

          {renderAdvanced(
            'lorawan',
            <>
              <View style={styles.row}>
                <Text style={gpsEnabled ? styles.rowLabel : styles.rowLabelDim}>
                  Uplink on every new GPS position
                </Text>
                <Switch
                  value={lorawanTxOnFix}
                  onValueChange={setLorawanTxOnFix}
                  disabled={!lorawanEnabled || !gpsEnabled}
                />
              </View>
              <Text style={styles.helperSmall}>
                When off, GPS fixes are batched and sent together on each
                scheduled uplink to save power.
                {!gpsEnabled ? ' Requires GPS to be enabled.' : ''}
              </Text>
              <Text style={styles.helperSmall}>
                LoRaWAN and direct LoRa share one radio — only one can be
                active per schedule.
              </Text>
            </>,
          )}
        </>,
        lorawanEnabled,
        handleLorawanToggle,
      )}

      {/* LORA — mutually exclusive with LoRaWAN (shared radio) */}
      {renderCard(
        '📻 Direct LoRa',
        <>
          <Text style={styles.label}>Transmit every (minutes)</Text>
          <TextInput
            style={[
              styles.input,
              loraEnabled && loraTxOnFix && styles.inputDisabled,
            ]}
            keyboardType="numeric"
            value={loraInterval}
            onChangeText={setLoraInterval}
            placeholder="1–1440 min"
            placeholderTextColor="#999"
            editable={loraEnabled && !loraTxOnFix}
          />
          {loraEnabled && loraTxOnFix && (
            <Text style={styles.helper}>
              Transmits on every new GPS position instead (Advanced).
            </Text>
          )}

          {renderAdvanced(
            'lora',
            <>
              <View style={styles.row}>
                <Text style={gpsEnabled ? styles.rowLabel : styles.rowLabelDim}>
                  Transmit on every new GPS position
                </Text>
                <Switch
                  value={loraTxOnFix}
                  onValueChange={setLoraTxOnFix}
                  disabled={!loraEnabled || !gpsEnabled}
                />
              </View>
              <Text style={styles.helperSmall}>
                When off, GPS fixes are batched and sent together on each
                scheduled transmit to save power.
                {!gpsEnabled ? ' Requires GPS to be enabled.' : ''}
              </Text>
              <Text style={styles.helperSmall}>
                LoRaWAN and direct LoRa share one radio — only one can be
                active per schedule.
              </Text>
            </>,
          )}
        </>,
        loraEnabled,
        handleLoraToggle,
      )}

      {/* BUTTONS */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>DELETE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', padding: 20 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#111' },
  solarEstimate: { fontSize: 16, fontWeight: '700', color: '#4A90D9' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDisabled: { backgroundColor: '#EEE' },
  cardBodyDim: { opacity: 0.5 },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111',
    marginBottom: 6,
  },
  inputDisabled: { backgroundColor: '#F2F2F2', color: '#999' },

  // "Record [N] min every [M] min" on one line.
  inlinePair: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  inlineInput: { width: 64, textAlign: 'center', marginBottom: 0 },
  inlineWord: { fontSize: 15, color: '#333' },

  helper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  helperSmall: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bold: { fontWeight: '700' },

  noteAmber: {
    fontSize: 12,
    color: '#B45309',
    backgroundColor: '#FFF7ED',
    borderColor: '#FDE3C2',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },

  // Quick setups
  presetList: { marginTop: 4 },
  presetBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  presetBtnOn: { borderColor: '#FDC996', backgroundColor: '#FFF7ED' },
  presetLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
  presetLabelOn: { color: '#B45309' },
  presetDescription: { fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 16 },

  consequences: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  consequenceLine: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },

  // The one firmware line.
  fwLine: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  fwLineOk: { color: '#166534', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  fwLineWarn: { color: '#B45309', backgroundColor: '#FFF7ED', borderColor: '#FDE3C2' },
  fwLineNone: { color: '#4B5563', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },

  // Advanced group
  advancedWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  advancedToggleText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  advancedChevron: { fontSize: 14, color: '#9CA3AF' },

  windowSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90D9',
    marginTop: 6,
  },

  conflictBox: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 2,
  },
  conflictText: { fontSize: 12, color: '#991B1B' },

  dynamicWrap: {
    marginTop: 8,
    backgroundColor: '#F5F7FA',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  vedbaTable: {
    marginTop: 8,
    marginBottom: 2,
  },
  vedbaRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  vedbaHeadRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vedbaCell: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
  },
  vedbaWide: { flex: 1.4 },
  vedbaHead: {
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dynGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dynGridItem: {
    width: '48%',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  rowLabelWrap: { flex: 1, paddingRight: 10 },
  rowLabel: { color: '#333', flexShrink: 1 },
  rowLabelDim: { color: '#999', flexShrink: 1 },

  saveButton: {
    backgroundColor: '#FDC996',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 17 },

  deleteButton: {
    backgroundColor: '#F87171',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  deleteText: { color: '#FFF', fontWeight: '700', fontSize: 17 },
  scrollContent: {
    paddingBottom: 50,
  },
});
