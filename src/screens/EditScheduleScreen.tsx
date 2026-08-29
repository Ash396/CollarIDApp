import React, { useMemo, useState } from 'react';
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
import { bleFeatureGates } from '../utils/fw';
import type { Schedule } from '../navigation/ScheduleNavigator';
import StyledPicker from '../components/StyledPicker';
import { estimateScheduleSolarHours } from '../utils/powerEstimator';

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

// VeDBA behaviour reference shown under the dynamic-sampling toggle —
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
  const [envInterval, setEnvInterval] = useState(
    String(schedule.environmental?.sampleIntervalMin ?? 5),
  );

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

  /* A selectable sample rate exists only on fw 338+. Older collars record at
     16 kHz unconditionally, so the picker stays visible but disabled (a
     control that vanishes reads as a missing feature rather than an
     out-of-date collar) and the value is forced to 0 on save.
     Bit depth is deliberately not offered — recordings are always 16-bit. */
  const { fwBuild, caps } = useDevice();
  const micFormatCapable = bleFeatureGates(fwBuild, caps).micFormat;

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

  /* ---------------- PICKER OPTIONS ---------------- */

  const hourOptions = [...Array(24).keys()].map(h => ({
    label: `${h}:00`,
    value: h,
  }));

  // Wire values + labels from the shared field vocabulary
  // (js/collar-vocab.js on the website).
  const gpsAccuracyOptions = [
    { label: 'Low (fastest, least power)', value: 1 },
    { label: 'Medium', value: 5 },
    { label: 'High (slowest, most power)', value: 10 },
  ];

  const accelRateOptions = [
    { label: '25 Hz', value: 0 },
    { label: '50 Hz', value: 1 },
  ];

  // Wording mirrors VOCAB.micSampleRate / micBitDepth in the website's
  // js/collar-vocab.js — the two editors describe the same firmware fields.
  const micRateOptions = [
    { label: '16 kHz', value: 0 },
    { label: '8 kHz', value: 1 },
  ];


  const accelSensitivityOptions = [
    { label: '±2g (most sensitive)', value: 0 },
    { label: '±4g', value: 1 },
    { label: '±8g', value: 2 },
  ];

  /* ---------------- DERIVED ---------------- */

  // Live draft of this schedule from the current inputs — feeds the solar
  // estimate in the header and the save handler.
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
      sampleIntervalMin: clamp(envInterval, 1, 720),
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
      // Forced to the reference format on a collar that cannot honour
      // anything else, so the saved draft matches what the collar will
      // actually record and the verify-after-write comparison holds.
      sampleRate: micFormatCapable ? micRate : 0,
      bitDepth: 0,   // always 16-bit; not user-selectable
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

  const solarEstimate = useMemo(
    () => estimateScheduleSolarHours(buildDraft()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      startHour, endHour, gpsEnabled, gpsInterval, gpsAccuracy, gpsDynamic,
      gpsMedVedba, gpsMedInt, gpsHighVedba, gpsHighInt, lightEnabled,
      lightInterval, envEnabled, envInterval, micEnabled, micContinuous,
      micLength, micWindow, micRate, micFormatCapable,
      accelEnabled, accelRate, accelSensitivity,
      lorawanEnabled, lorawanInterval, lorawanTxOnFix, loraEnabled,
      loraInterval, loraTxOnFix, magEnabled, magIntervalMin,
    ],
  );

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

  /* ---------------- CARD HELPER ---------------- */
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
        <View style={{ opacity: dim ? 0.5 : 1 }}>{children}</View>
      </View>
    );
  };

  /* ---------------- RENDER ---------------- */
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

      {/* TIME WINDOW */}
      {renderCard(
        '🕓 Time Window',
        <>
          <View style={styles.row}>
            <Text style={{ color: '#333' }}>Run 24/7 (all day)</Text>
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
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={gpsInterval}
            onChangeText={setGpsInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Accuracy</Text>
          <StyledPicker
            selectedValue={gpsAccuracy}
            onValueChange={setGpsAccuracy}
            items={gpsAccuracyOptions}
            placeholder="Select accuracy"
            enabled={gpsEnabled}
          />

          <View style={styles.row}>
            <Text style={{ color: '#333', flexShrink: 1 }}>
              Dynamic sampling (activity-based)
            </Text>
            <Switch
              value={gpsDynamic}
              onValueChange={setGpsDynamic}
              disabled={!gpsEnabled}
            />
          </View>

          {gpsDynamic && (
            <View style={styles.dynamicWrap}>
              <Text style={styles.helper}>
                Adjusts fix rate by movement intensity. The interval above is
                used when the animal is still. Enter thresholds in{' '}
                <Text style={{ fontWeight: '700' }}>0.01 g units</Text> (e.g.
                20 = 0.20 g).
              </Text>

              <View style={styles.vedbaTable}>
                <View style={[styles.vedbaRow, styles.vedbaHeadRow]}>
                  <Text style={[styles.vedbaCell, styles.vedbaHead, { flex: 1.4 }]}>
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
                    <Text style={[styles.vedbaCell, { flex: 1.4 }]}>{b}</Text>
                    <Text style={styles.vedbaCell}>{g}</Text>
                    <Text style={styles.vedbaCell}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.helperSmall}>
                Values vary by species and collar placement — calibrate against
                a short accelerometer recording of known behaviours.
              </Text>

              <View style={styles.dynGrid}>
                <View style={styles.dynGridItem}>
                  <Text style={styles.label}>Medium VeDBA threshold</Text>
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
                  <Text style={styles.label}>Medium interval (min)</Text>
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
                  <Text style={styles.label}>High VeDBA threshold</Text>
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
                  <Text style={styles.label}>High motion interval (min)</Text>
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
        gpsEnabled,
        handleGpsToggle,
      )}

      {/* LIGHT */}
      {renderCard(
        '💡 Light',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={lightInterval}
            onChangeText={setLightInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />
        </>,
        lightEnabled,
        setLightEnabled,
      )}

      {/* ENVIRONMENTAL */}
      {renderCard(
        '🌡️ Environmental',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={envInterval}
            onChangeText={setEnvInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
          />
        </>,
        envEnabled,
        setEnvEnabled,
      )}

      {/* PARTICULATE — sensor not installed on this hardware */}
      {renderCard(
        '💨 Particulate',
        <>
          <Text style={styles.helper}>
            Particulate sensor is not installed on this device.
          </Text>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={partInterval}
            onChangeText={setPartInterval}
            placeholder="1–720 min"
            placeholderTextColor="#999"
            editable={false}
          />
        </>,
        false,
        undefined,
        true,
      )}

      {/* MICROPHONE */}
      {renderCard(
        '🎙️ Microphone',
        <>
          <View style={styles.row}>
            <Text style={{ color: '#333' }}>Continuous Mode</Text>
            <Switch value={micContinuous} onValueChange={setMicContinuous} />
          </View>

          {micContinuous ? (
            <Text style={styles.noteAmber}>
              In continuous mode, recordings are split into separate files on
              60-minute boundaries.
            </Text>
          ) : (
            <>
              <Text style={styles.label}>Sample Window (minutes)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={micWindow}
                onChangeText={setMicWindow}
                placeholder="1–60 min"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Sample Length (minutes)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={micLength}
                onChangeText={setMicLength}
                placeholder={`1–${micWindow || '60'} min`}
                placeholderTextColor="#999"
              />
            </>
          )}

          <Text style={styles.label}>Sample Rate</Text>
          <StyledPicker
            selectedValue={micRate}
            onValueChange={setMicRate}
            items={micRateOptions}
            placeholder="Select sample rate"
            enabled={micEnabled && micFormatCapable}
          />

          {/* Only the firmware-gating message — no explainer when usable. */}
          {!micFormatCapable && (
            <Text style={styles.noteAmber}>
              {fwBuild
                ? `This collar’s firmware (build ${fwBuild}) records at 16 kHz only — a selectable sample rate needs build 338+.`
                : 'Selecting the sample rate needs firmware build 338+. Connect to a collar to check.'}
            </Text>
          )}
        </>,
        micEnabled,
        setMicEnabled,
      )}

      {/* ACCEL */}
      {renderCard(
        '🏃 Accelerometer',
        <>
          <Text style={styles.label}>Sample Rate</Text>
          <StyledPicker
            selectedValue={accelRate}
            onValueChange={setAccelRate}
            items={accelRateOptions}
            placeholder="Select sample rate"
            enabled={accelEnabled}
          />

          <Text style={styles.label}>Sensitivity</Text>
          <StyledPicker
            selectedValue={accelSensitivity}
            onValueChange={setAccelSensitivity}
            items={accelSensitivityOptions}
            placeholder="Select sensitivity"
            enabled={accelEnabled}
          />
        </>,
        accelEnabled,
        setAccelEnabled,
      )}

      {/* MAGNETOMETER */}
      {renderCard(
        '🧲 Magnetometer',
        <>
          <Text style={styles.label}>Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={magIntervalMin}
            onChangeText={setMagIntervalMin}
            placeholder="1–60 min"
            placeholderTextColor="#999"
            editable={magEnabled}
          />
        </>,
        magEnabled,
        setMagEnabled,
      )}

      {/* LORAWAN — mutually exclusive with LoRa (shared radio) */}
      {renderCard(
        '📡 LoRaWAN',
        <>
          <Text style={styles.helper}>
            LoRa and LoRaWAN share one radio — only one can be active per
            schedule.
          </Text>
          <Text style={styles.label}>Send Interval (minutes)</Text>
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
          <View style={styles.row}>
            <Text
              style={{
                color: gpsEnabled ? '#333' : '#999',
                flexShrink: 1,
              }}
            >
              Transmit on Every New GPS Position
            </Text>
            <Switch
              value={lorawanTxOnFix}
              onValueChange={setLorawanTxOnFix}
              disabled={!lorawanEnabled || !gpsEnabled}
            />
          </View>
          <Text style={styles.helperSmall}>
            When off, GPS fixes are batched and sent together on each scheduled
            transmit to save power.
            {!gpsEnabled ? ' Requires GPS to be enabled.' : ''}
          </Text>
        </>,
        lorawanEnabled,
        handleLorawanToggle,
      )}

      {/* LORA — mutually exclusive with LoRaWAN (shared radio) */}
      {renderCard(
        '📻 LoRa',
        <>
          <Text style={styles.helper}>
            LoRa and LoRaWAN share one radio — only one can be active per
            schedule.
          </Text>
          <Text style={styles.label}>Send Interval (minutes)</Text>
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
          <View style={styles.row}>
            <Text
              style={{
                color: gpsEnabled ? '#333' : '#999',
                flexShrink: 1,
              }}
            >
              Transmit on Every New GPS Position
            </Text>
            <Switch
              value={loraTxOnFix}
              onValueChange={setLoraTxOnFix}
              disabled={!loraEnabled || !gpsEnabled}
            />
          </View>
          <Text style={styles.helperSmall}>
            When off, GPS fixes are batched and sent together on each scheduled
            transmit to save power.
            {!gpsEnabled ? ' Requires GPS to be enabled.' : ''}
          </Text>
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
