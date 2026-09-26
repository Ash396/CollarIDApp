// Firmware-build parsing + feature gates.
//
// The collar reports firmware_version as "b<build> <git-hash>[ dirty]"
// (e.g. "b306 6ca907b"). The build number is `git rev-parse --count HEAD`
// of collarID_thread — ordered, so features gate with simple >= checks.
// Mirrors renderFwVersion()/applyBleFeatureGates() in configure.html.
import type { Schedule } from '../navigation/ScheduleNavigator';

/** First build with the FLAC recorder (MicrophoneConfig.codec) and the
 *  low-bit drop (lsb_drop). A collar below it accepts and echoes both fields
 *  but records WAV, so the pickers are gated and the save path forces WAV / 0.
 *  Mirrors MIC_CODEC_MIN_FW_BUILD in the website's js/collar-vocab.js and
 *  the server's api/main.py — one number, three repos. */
export const MIC_CODEC_MIN_FW_BUILD = 380;

/** First build with the BLE config tunnel (ScheduleConfigPacket
 *  .cfg_downlink / ble_query / cfg_echo): geofence zones read, delivered,
 *  safety-checked and verified over the Bluetooth link, no LoRaWAN needed.
 *  Below it a tunnel frame would decode as an empty schedule write, so the
 *  zones screen hard-gates on the reported build, like the website's
 *  loadBleFences() (configure.html: `(state.fwBuild || 0) >= 305`). */
export const BLE_ZONES_MIN_FW_BUILD = 305;

/** First build with magnetometer calibration over the BLE config tunnel
 *  (CMD_MAG_CALIBRATE / CMD_MAG_CALIBRATE_ABORT and CfgEchoPacket.mag_cal).
 *  Firmware main build 398 (merge 74efac9, 2026-09-25) is the first main
 *  build carrying it; that merge took main from 389 to 398, so no main build
 *  390-397 exists without it. A collar below it logs the command as unknown
 *  and never echoes mag_cal, which the flow reports as "not supported" after
 *  a few polls (runMagCal) — the gate keeps the button honest before that.
 *  Mirrors MAG_CAL_MIN_FW_BUILD in the website's js/collar-vocab.js. */
export const MAG_CAL_MIN_FW_BUILD = 398;

/** First build with the magnetometer rate mode (MagnetometerConfig
 *  .sample_rate_hz: 1, 2, 4, 8 or 16 Hz, paced by LPTIM1 on the RTC crystal
 *  and stored as a WAV beside the accelerometer's; collarID_thread
 *  docs/DESIGN_magnetometer_rate.md). A collar below it ignores the field
 *  and samples on the minute interval, so the picker is gated and the save
 *  and Send paths hold the rate to 0 (interval mode). Provisional: set at
 *  the firmware merge. Mirrors MAG_RATE_MIN_FW_BUILD in the website's
 *  js/collar-vocab.js and the server's api/main.py. */
export const MAG_RATE_MIN_FW_BUILD = 425;

/** First build that holds a lost-mode beacon key (CMD_BEACON_KEY_SET /
 *  _CLEAR over the BLE config tunnel, CfgEchoPacket.beacon_key; collarID_thread
 *  docs/DESIGN_radio_security.md E6). PLACEHOLDER: set at the firmware
 *  merge, the first firmware main build that emits the encrypted 0x4D beacon
 *  when keyed. Until then no collar reports a build this high, so the card
 *  stays hidden everywhere. Mirrors RADIO_KEYS_MIN_FW_BUILD in the website's
 *  js/collar-vocab.js. The card also needs the collar's status echo to carry
 *  the report at all (absent = firmware without the key store). */
export const RADIO_KEYS_MIN_FW_BUILD = 9999;

/** The rates the collar can run in rate mode, Hz (powers of two: exact
 *  LPTIM1 reloads on the 32.768 kHz crystal). 0 is interval mode. */
export const MAG_RATE_HZ: readonly number[] = [1, 2, 4, 8, 16];

/** Extract the numeric build from a reported firmware_version string.
 *  Returns 0 when the shape is unfamiliar (legacy firmware, or a collar
 *  that just rebooted and hasn't sent a parsable status yet). */
export function parseFwBuild(raw?: string | null): number {
  if (!raw) return 0;
  const m = String(raw).match(/^b(\d+)\s+(\S+)/);
  return m ? Number(m[1]) : 0;
}

/** Which BLE-only features this collar supports. A build of 0 means
 *  "unknown" and gates everything off — same policy as the website. */
export function bleFeatureGates(fwBuild: number, caps: number) {
  return {
    /** BLE config tunnel (zones, config transactions) — fw 305+
     *  (BLE_ZONES_MIN_FW_BUILD). */
    cfgTunnel: fwBuild >= BLE_ZONES_MIN_FW_BUILD,
    // old: cfgTunnel: fwBuild >= 305,
    /** BLE-only factory reset — fw 306+. */
    factoryReset: fwBuild >= 306,
    /** Microphone sample rate / bit depth — fw 338+. Older collars have no
     *  field for it and record 16 kHz / 16-bit unconditionally. */
    micFormat: fwBuild >= 338,
    /** The extended rates (48/96/192 kHz) — fw 343+, which clocks the ADF
     *  from a PLL3 kernel at RM0456-legal ratios. 338-342 decode the values
     *  but record 16 kHz (b341's illegal-divider attempt watchdog-crashed;
     *  b342 clamped). Mirror the website's VOCAB.micSampleRate minBuild. */
    micRateExt: fwBuild >= 343,
    /** Microphone sensitivity ladder (+6/+12 dB) — fw 349+. */
    micSens: fwBuild >= 349,
    /** FLAC recording + low-bit drop — fw 380+ (MIC_CODEC_MIN_FW_BUILD). */
    micCodec: fwBuild >= MIC_CODEC_MIN_FW_BUILD,
    /** Magnetometer calibration over the BLE tunnel — fw 398+
     *  (MAG_CAL_MIN_FW_BUILD). */
    magCal: fwBuild >= MAG_CAL_MIN_FW_BUILD,
    /** Magnetometer at 1-16 Hz (MagnetometerConfig.sample_rate_hz) — fw
     *  MAG_RATE_MIN_FW_BUILD+. Below it the field is ignored and the collar
     *  samples on the minute interval. */
    magRate: fwBuild >= MAG_RATE_MIN_FW_BUILD,
    /** Lost-mode beacon encryption keys over the BLE tunnel — fw
     *  RADIO_KEYS_MIN_FW_BUILD+ (a placeholder until the firmware merge). */
    beaconKey: fwBuild >= RADIO_KEYS_MIN_FW_BUILD,
    /** Thread add-on relay (local device list + DT forward commands).
     *  Gated on the capability characteristic, not the build: WB5M-era
     *  firmware exposes the caps char with bit 0 set; frozen WB15 builds
     *  don't have the characteristic at all. */
    threadAddons: (caps & 0x01) !== 0,
  };
}

export type FeatureGates = ReturnType<typeof bleFeatureGates>;

/** The microphone gates and the build that opens each, in the order the
 *  firmware line names them (what a researcher is most likely to want
 *  first). One table drives the line, the per-control note and the tests. */
export const MIC_GATE_MIN_BUILD: {
  gate: 'micCodec' | 'micSens' | 'micRateExt' | 'micFormat';
  minBuild: number;
  /** Plain name of the option, as the editor labels it. */
  option: string;
}[] = [
  { gate: 'micCodec', minBuild: MIC_CODEC_MIN_FW_BUILD, option: 'compressed audio' },
  { gate: 'micSens', minBuild: 349, option: 'microphone gain' },
  { gate: 'micRateExt', minBuild: 343, option: 'sample rates above 16 kHz' },
  { gate: 'micFormat', minBuild: 338, option: 'the sample rate' },
];

/** Every schedule-editor option the firmware line names, newest gate first:
 *  the magnetometer rate mode, then the microphone ladder. The website's
 *  FIRMWARE_GATES (js/collar-vocab.js) is the same list. */
export const OPTION_GATE_MIN_BUILD: {
  gate: 'magRate' | 'micCodec' | 'micSens' | 'micRateExt' | 'micFormat';
  minBuild: number;
  option: string;
}[] = [
  { gate: 'magRate', minBuild: MAG_RATE_MIN_FW_BUILD, option: 'heading at 1 to 16 Hz' },
  ...MIC_GATE_MIN_BUILD,
];

/** The gates the schedule EDITOR works against. A connected collar's build
 *  decides; with no collar there is nothing to clamp to, so every option is
 *  offered (and the top-of-editor line says so).
 *
 *  The editor is NOT what keeps an unsupported option off an old collar. A
 *  draft edited with no collar connected is persisted and restored when a
 *  collar connects (SchedulesContext keeps the last collar's key), and a
 *  saved schedule set loads straight into the draft without passing through
 *  the editor at all. The Send path is: it holds every schedule to the
 *  connected collar's own gates (micFormatForCollar) before writing.
 *
 *  `connected`: a collar IS connected but has not reported a parsable build
 *  (legacy firmware, or a just-rebooted collar). That is not "no collar":
 *  its gates stay closed until the build arrives, like the website's
 *  "firmware not reported yet", so the editor does not offer — or save —
 *  compressed audio to a collar that may predate the codec field. The
 *  editor holds only the derived draft, not its pickers, so a choice made
 *  before the build arrives takes effect once it does. */
export function editorFeatureGates(
  fwBuild: number,
  caps: number,
  connected = false,
): FeatureGates {
  const g = bleFeatureGates(fwBuild, caps);
  if (fwBuild > 0 || connected) return g;
  // beaconKey is not opened here: it is a Home card on a connected collar,
  // never a schedule-editor option.
  return { ...g, micFormat: true, micRateExt: true, micSens: true, micCodec: true, magRate: true };
  // old: return { ...g, micFormat: true, micRateExt: true, micSens: true, micCodec: true };
}
// old:
// export function editorFeatureGates(fwBuild: number, caps: number): FeatureGates {
//   const g = bleFeatureGates(fwBuild, caps);
//   if (fwBuild > 0) return g;
//   return { ...g, micFormat: true, micRateExt: true, micSens: true, micCodec: true };
// }

/** What the collar will actually record, given its gates: the values the
 *  save path writes and the ones the pickers are held to. No format field
 *  below 338, the extended rates (>= 2) need 343, the gain ladder 349, and
 *  codec / lsb_drop 380 — below which the collar records WAV, so the draft
 *  must say WAV too or the verify-after-write comparison would still pass
 *  while the card fills with WAV. The drop is 0 unless the codec resolves
 *  to FLAC (it only applies to FLAC takes). */
export function micFieldsForGates(
  m: Schedule['microphone'] | undefined,
  g: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec'>,
): { sampleRate: number; sensitivity: number; codec: number; lsbDrop: number } {
  const rate = m?.sampleRate ?? 0;
  const sampleRate = !g.micFormat ? 0 : rate >= 2 && !g.micRateExt ? 0 : rate;
  const sensitivity = g.micSens ? m?.sensitivity ?? 0 : 0;
  const codec = g.micCodec ? m?.codec ?? 0 : 0;
  const lsbDrop = codec === 1 ? m?.lsbDrop ?? 0 : 0;
  return { sampleRate, sensitivity, codec, lsbDrop };
}

/** The Send path's hold on the recording format: the last line of the codec
 *  gate, for schedules that never went through the editor's Save against
 *  this collar — a saved schedule set, or a draft edited with no collar (or
 *  another one) and restored on reconnect. New slots store compressed audio
 *  by default (defaultScheduleSlot), so such a schedule often names FLAC.
 *  A collar below MIC_CODEC_MIN_FW_BUILD, or one that has not reported its
 *  build, records WAV whatever it is told, so it is told WAV: codec 0 and
 *  nothing dropped, exactly what the editor's save path (micFieldsForGates)
 *  would have written. That keeps the verify-after-write comparison true
 *  against a collar that predates the field (its echo has no codec, which
 *  reads as WAV), and keeps the draft and its summary honest on one that
 *  echoes the field but records WAV.
 *
 *  Codec only, like the website's micFormatForCollar (configure.html): the
 *  other microphone gates are the editor's. Returns `s` itself when nothing
 *  changes, so the caller can tell whether the draft moved. */
export function micFormatForCollar(
  s: Schedule,
  g: Pick<FeatureGates, 'micCodec'>,
): Schedule {
  const m = s.microphone;
  if (!m || g.micCodec) return s;
  if ((m.codec ?? 0) === 0 && (m.lsbDrop ?? 0) === 0) return s;
  return { ...s, microphone: { ...m, codec: 0, lsbDrop: 0 } };
}

/** The magnetometer rate the collar will actually run, given its gates: the
 *  value the editor's save path writes and the picker is held to. Below
 *  MAG_RATE_MIN_FW_BUILD the collar ignores the field and samples on the
 *  minute interval, so the draft must say interval mode (0) too or the
 *  verify-after-write comparison would still pass while the collar samples
 *  once a minute. A rate the collar cannot run (anything off MAG_RATE_HZ)
 *  is interval mode as well — the firmware parses it that way. */
export function magRateForGates(
  m: Schedule['magnetometer'] | undefined,
  g: Pick<FeatureGates, 'magRate'>,
): number {
  const rate = m?.sampleRateHz ?? 0;
  if (!g.magRate || !MAG_RATE_HZ.includes(rate)) return 0;
  return rate;
}

/** The Send path's hold on the magnetometer rate, beside micFormatForCollar:
 *  for schedules that never went through the editor's Save against this
 *  collar (a saved set, or a draft edited with no collar and restored on
 *  reconnect). A collar below MAG_RATE_MIN_FW_BUILD, or one that has not
 *  reported its build, samples on the interval whatever it is told, so it is
 *  told interval mode: rate 0, the interval kept. That keeps the read-back
 *  comparison true against a collar that predates the field (its echo has
 *  no rate, which reads as 0) and the summary honest. Returns `s` itself
 *  when nothing changes, so the caller can tell whether the draft moved. */
export function magRateForCollar(
  s: Schedule,
  g: Pick<FeatureGates, 'magRate'>,
): Schedule {
  const m = s.magnetometer;
  if (!m || g.magRate) return s;
  if ((m.sampleRateHz ?? 0) === 0) return s;
  return { ...s, magnetometer: { ...m, sampleRateHz: 0 } };
}

/** The one firmware line at the top of the schedule editor — instead of a
 *  note under every gated knob. "Connected collar: firmware 380, all
 *  options available", or "Connected collar: firmware 375: compressed audio
 *  needs a firmware update"; with no collar, that everything is shown; with
 *  a collar that has not reported its build (`connected`, see
 *  editorFeatureGates), that the newer options wait for it. */
export function fwOptionsLine(
  fwBuild: number,
  g: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec' | 'magRate'>,
  connected = false,
): string {
  if (!fwBuild && connected) {
    return 'Connected collar: firmware not reported yet. Options that need a newer firmware stay off until it is.';
  }
  if (!fwBuild) {
    return 'No collar connected: every option is shown. Connect a collar to see what its firmware supports.';
  }
  // Below 338 there is no sample-rate field at all, so "rates above 16 kHz"
  // would be a second way of saying the same thing.
  const missing = OPTION_GATE_MIN_BUILD.filter(
    r => !g[r.gate] && !(r.gate === 'micRateExt' && !g.micFormat),
  ).map(r => r.option);
  // old: const missing = MIC_GATE_MIN_BUILD.filter(
  if (missing.length === 0) {
    return `Connected collar: firmware ${fwBuild}, all options available`;
  }
  const list =
    missing.length === 1
      ? missing[0]
      : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
  return `Connected collar: firmware ${fwBuild}: ${list} need${
    missing.length === 1 ? 's' : ''
  } a firmware update`;
}

/** The note under a control the connected collar cannot use (greyed under
 *  Advanced). Same words wherever it appears. */
export function fwGateNote(fwBuild: number, minBuild: number): string {
  // A connected collar with no parsable build greys these too (see
  // editorFeatureGates); "reports 0" would read as a real build.
  if (!fwBuild) return `Needs firmware ${minBuild}+ — this collar has not reported its firmware.`;
  return `Needs firmware ${minBuild}+ — this collar reports ${fwBuild}.`;
}

/** The one environmental sampling interval the collar can actually run.
 *
 * BSEC does not take a sample period — it takes one of five discrete sample
 * RATES (DISABLED, ULP 300 s, SCAN 18 s, LP 3 s, CONT 1 s) and rejects
 * anything else outright. A rejected subscription installs nothing, the
 * BME688 then produces no rows at all, and nothing reports an error on any
 * surface: not the status log, not DIAG, not the uplink. Of the 1..720 this
 * screen used to offer, only 5 (= ULP) was ever legal, and it reached the
 * field only because 5 was the default. Collar 0x00240028 lost nine days of
 * environmental data that way in Sept 2026.
 *
 * This is NOT a range to widen: the other four rates are sub-minute, so the
 * minutes field can never name them, and moving off 300 s means swapping the
 * compiled-in BSEC config blob (bme688_sel_18v_300s_4d) and recalibrating.
 *
 * Mirrors ENV_INTERVAL_FIXED_MIN in the website's js/collar-vocab.js and
 * BSEC_ENV_INTERVAL_MIN in collarID_thread's Core/Inc/bsec_rate.h. Firmware
 * b352+ snaps whatever it is handed and logs an ENV: line, so this is the
 * guard the operator sees rather than the only guard.
 */
export const ENV_INTERVAL_FIXED_MIN = 5;
