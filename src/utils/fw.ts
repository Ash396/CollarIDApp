// Firmware-build parsing + feature gates.
//
// The collar reports firmware_version as "b<build> <git-hash>[ dirty]"
// (e.g. "b306 6ca907b"). The build number is `git rev-parse --count HEAD`
// of collarID_thread — ordered, so features gate with simple >= checks.
// Mirrors renderFwVersion()/applyBleFeatureGates() in configure.html.

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
