// Firmware-build parsing + feature gates.
//
// The collar reports firmware_version as "b<build> <git-hash>[ dirty]"
// (e.g. "b306 6ca907b"). The build number is `git rev-parse --count HEAD`
// of collarID_thread — ordered, so features gate with simple >= checks.
// Mirrors renderFwVersion()/applyBleFeatureGates() in configure.html.

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
    /** Thread add-on relay (local device list + DT forward commands).
     *  Gated on the capability characteristic, not the build: WB5M-era
     *  firmware exposes the caps char with bit 0 set; frozen WB15 builds
     *  don't have the characteristic at all. */
    threadAddons: (caps & 0x01) !== 0,
  };
}
