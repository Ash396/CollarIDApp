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
    /** BLE config tunnel (zones, config transactions) — fw 305+. */
    cfgTunnel: fwBuild >= 305,
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

/** The gates the schedule EDITOR works against. A connected collar's build
 *  decides; with no collar there is nothing to clamp to, so every option is
 *  offered (and the top-of-editor line says so). Safe because the draft is
 *  replaced by the collar's own config the moment one connects — an
 *  unconnected draft never reaches a radio. */
export function editorFeatureGates(fwBuild: number, caps: number): FeatureGates {
  const g = bleFeatureGates(fwBuild, caps);
  if (fwBuild > 0) return g;
  return { ...g, micFormat: true, micRateExt: true, micSens: true, micCodec: true };
}

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

/** The one firmware line at the top of the schedule editor — instead of a
 *  note under every gated knob. "Connected collar: firmware 380, all
 *  options available", or "Connected collar: firmware 375: compressed audio
 *  needs a firmware update"; with no collar, that everything is shown. */
export function fwOptionsLine(
  fwBuild: number,
  g: Pick<FeatureGates, 'micFormat' | 'micRateExt' | 'micSens' | 'micCodec'>,
): string {
  if (!fwBuild) {
    return 'No collar connected: every option is shown. Connect a collar to see what its firmware supports.';
  }
  // Below 338 there is no sample-rate field at all, so "rates above 16 kHz"
  // would be a second way of saying the same thing.
  const missing = MIC_GATE_MIN_BUILD.filter(
    r => !g[r.gate] && !(r.gate === 'micRateExt' && !g.micFormat),
  ).map(r => r.option);
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
