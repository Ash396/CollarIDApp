// Magnetometer calibration over the BLE config tunnel (fw 398+,
// MAG_CAL_MIN_FW_BUILD in utils/fw.ts).
//
// The operator turns the collar through every orientation while the collar
// samples its magnetometer; once enough of the sphere is covered it fits
// hard and soft iron and appends the result to MAGCAL.CSV on its card.
// Recorded data stay raw counts; the SD Card viewer applies the fit. BLE
// tunnel only, like the factory reset: a radio-delivered copy is ignored.
//
// The collar pushes no progress of its own (a push could overwrite a frame
// the client has just written — the settings blob is a single mailbox), so
// the client polls a status query about every 2 s and reads progress, then
// the outcome, from CfgEchoPacket.mag_cal. This file is the flow and the
// words; the transport (one paced frame at a time on the update
// characteristic) is magCalIo() in ble/bleManager.ts.
//
// Port of runMagCal() / magCalOutcome() in the website's
// js/ble-cfg-tunnel.js — same states, same pacing, same outcome rules, so a
// run started from either client ends the same way. Numbers mirror
// ble.proto's MagCal* enums (the test pins them to the generated module).

/* The two tunnel commands (downlink.proto CommandType). 19 is held for the
   planned lost-mode beacon key. */
export const MAG_CMD = { CALIBRATE: 20, ABORT: 21 } as const;

export const MAG_CAL = {
  STATE: { IDLE: 0, COLLECTING: 1, FITTING: 2, DONE: 3, FAILED: 4, ABORTED: 5 },
  VERDICT: { NONE: 0, GOOD: 1, FAIR: 2, RETRY: 3 },
  REASON: {
    NONE: 0,
    TIMEOUT: 1,
    NOT_ENOUGH_ROTATION: 2,
    SENSOR_FAULT: 3,
    FIELD_OUT_OF_RANGE: 4,
    RESIDUAL_HIGH: 5,
    STORAGE: 6,
  },
  /** Sphere sectors the collar bins directions into. */
  SECTORS: 26,
  /** One status query about every 2 s (ble.proto). */
  POLL_MS: 2000,
  /** Echoes after the start with no run of ours = firmware without it. */
  START_POLLS: 3,
  /** The backstop: the collar's 120 s capture, the fit, and up to 30 s for
   *  the save (mag_cal_thread.cpp MAG_CAL_SAVE_WAIT_S), with margin. */
  MAX_MS: 180000,
} as const;

/** CfgEchoPacket.mag_cal, as the generated module names its fields. */
export type MagCalReport = {
  state: number;
  run: number;
  progressPct: number;
  sectorsHit: number;
  verdict: number;
  reason: number;
  /** Total field |B| in 0.1 uT; 0 until a fit exists. */
  fieldUtX10: number;
  /** RMS distance of the corrected samples from the fitted sphere, per
   *  mille of |B|, saturating at 1000. */
  residualPermille: number;
};

/** The part of a CfgEchoPacket the flow reads. A PB.CfgEchoPacket
 *  satisfies it as is. */
export type MagCalEcho = {
  echoSeq: number;
  magCal?: MagCalReport | null;
};

/** The transport: every call writes one frame and resolves with the echo
 *  that consumed it, so the flow never has two frames in the mailbox. */
export type MagCalIo = {
  status: () => Promise<MagCalEcho | null>;
  command: (cmd: number) => Promise<MagCalEcho | null>;
};

export type MagCalTone = 'good' | 'fair' | 'retry' | 'fault' | 'aborted';

export type MagCalOutcome = {
  inForce: boolean;
  tone: MagCalTone;
  title: string;
  detail: string;
};

/** The rule both clients key on: in force exactly when DONE and GOOD or
 *  FAIR. Every other outcome leaves the previous calibration in force. */
export function magCalInForce(r: MagCalReport | null | undefined): boolean {
  return (
    !!r &&
    r.state === MAG_CAL.STATE.DONE &&
    (r.verdict === MAG_CAL.VERDICT.GOOD || r.verdict === MAG_CAL.VERDICT.FAIR)
  );
}

export function magCalEnded(r: MagCalReport | null | undefined): boolean {
  const S = MAG_CAL.STATE;
  return !!r && (r.state === S.DONE || r.state === S.FAILED || r.state === S.ABORTED);
}

/* What the operator reads when a run ends. Every outcome that is not in
   force says the previous calibration stays, because that is what the
   collar does. Same words as the website's magCalOutcome, so a researcher
   who calibrates from either sees one vocabulary. */
const KEEP = 'The previous calibration, if any, stays in force.';
const FAIR_WHY: Record<number, string> = {
  1: 'time ran out before every direction was covered',
  2: 'some directions were covered only thinly',
  4: 'the field it measured is at the edge of the Earth’s range',
  5: 'the readings scattered more than a good fit allows',
};

export function magCalOutcome(r: MagCalReport | null | undefined): MagCalOutcome {
  const S = MAG_CAL.STATE;
  const V = MAG_CAL.VERDICT;
  const R = MAG_CAL.REASON;
  if (!r) {
    return {
      inForce: false,
      tone: 'fault',
      title: 'No result',
      detail: `The collar did not report a result. ${KEEP}`,
    };
  }
  const ut = (r.fieldUtX10 / 10).toFixed(1);
  const fit = r.fieldUtX10
    ? `Field ${ut} µT, fit error ${(r.residualPermille / 10).toFixed(1)} %.`
    : '';
  if (r.state === S.ABORTED) {
    return {
      inForce: false,
      tone: 'aborted',
      title: 'Calibration stopped',
      detail: `Stopped before a fit was made (Abort, or the collar’s Bluetooth session closed first). ${KEEP}`,
    };
  }
  if (magCalInForce(r)) {
    if (r.verdict === V.GOOD) {
      return {
        inForce: true,
        tone: 'good',
        title: 'Calibrated — good',
        detail: `${fit} Saved on the collar’s SD card (MAGCAL.CSV); the SD Card viewer applies it to the magnetometer data.`,
      };
    }
    return {
      inForce: true,
      tone: 'fair',
      title: 'Calibrated — fair, you can repeat',
      detail:
        `In force, but ${FAIR_WHY[r.reason] || 'the fit is not as tight as it could be'}. ${fit} ` +
        'Repeating it away from metal and electronics may give a better fit.',
    };
  }
  switch (r.reason) {
    case R.NOT_ENOUGH_ROTATION:
      return {
        inForce: false,
        tone: 'retry',
        title: 'Not enough rotation — try again',
        detail:
          'The collar was not turned through enough directions for a fit. Turn it slowly through ' +
          `every orientation: a few figure-8s, then a full roll about each axis. ${KEEP}`,
      };
    case R.TIMEOUT:
      return {
        inForce: false,
        tone: 'retry',
        title: 'Not enough rotation in time — try again',
        detail:
          'Two minutes ran out before enough directions were covered. Keep the collar turning ' +
          `the whole time, through every orientation. ${KEEP}`,
      };
    case R.FIELD_OUT_OF_RANGE:
      return {
        inForce: false,
        tone: 'retry',
        title: 'Magnetic disturbance — try again elsewhere',
        detail:
          `The field measured ${ut} µT, outside the Earth’s 20–70 µT: metal, a magnet or electronics ` +
          `nearby. Move away from them (not on a steel bench, not next to a laptop) and try again. ${KEEP}`,
      };
    case R.RESIDUAL_HIGH:
      return {
        inForce: false,
        tone: 'retry',
        title: 'Readings too scattered — try again',
        detail:
          `${fit} Something disturbed the capture: metal or electronics passing close, or a knock. ` +
          `Try again away from them. ${KEEP}`,
      };
    case R.SENSOR_FAULT:
      return {
        inForce: false,
        tone: 'fault',
        title: 'Magnetometer fault — contact the team',
        detail:
          'The magnetometer did not answer, or its readings were stuck, so it cannot be calibrated. ' +
          `Contact the CollarID team. ${KEEP}`,
      };
    case R.STORAGE:
      return {
        inForce: false,
        tone: 'fault',
        title: 'Not saved — SD card problem',
        detail:
          'The fit was made but could not be written to the card (MAGCAL.CSV), so it is not in ' +
          `force. Check the SD card and try again. ${KEEP}`,
      };
    default:
      return { inForce: false, tone: 'retry', title: 'Not calibrated — try again', detail: KEEP };
  }
}

/** The card's line about the collar's last run since it booted, from any
 *  status echo (the collar reports it on every echo once a run has
 *  started). A dropped link does not stop a run: the collar finishes it and
 *  holds its Bluetooth window 3 min, so a status query on reconnect is
 *  where a client learns how a run it lost ended. '' = nothing to say. */
export function magCalLastLine(r: MagCalReport | null | undefined): string {
  if (!r || !r.run) return '';
  const S = MAG_CAL.STATE;
  if (r.state === S.COLLECTING || r.state === S.FITTING) {
    return 'A calibration is running on the collar: open Calibrate magnetometer and press Start to follow it.';
  }
  return `Last run: ${magCalOutcome(r).title}`;
}

export type RunMagCalOptions = {
  /** Every report of this run, progress first. */
  onUpdate?: (r: MagCalReport) => void;
  /** Polled before each write; true sends the abort once. */
  abortRequested?: () => boolean;
  pollMs?: number;
  maxMs?: number;
  /** Injectable clock, for tests. */
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export type RunMagCalResult = {
  report: MagCalReport;
  outcome: MagCalOutcome;
  /** True when a run already going was followed rather than started. */
  adopted: boolean;
};

/** Unsupported firmware: the collar echoed START_POLLS times after the
 *  start with no run of ours. */
export const MAG_CAL_UNSUPPORTED_MSG =
  'The collar did not start a calibration: its firmware does not support it yet. ' +
  'Update the collar’s firmware and try again.';
export const MAG_CAL_STALLED_MSG =
  'The collar stopped reporting the calibration. Reconnect and start again.';

/** One calibration run, from the start command to the outcome.
 *
 *  Resolves once the run ends; throws when the collar never reports a run
 *  of ours (firmware without calibration) or stops reporting. A run already
 *  going when we ask (the website, another phone) is followed rather than
 *  restarted: the collar would ignore the start anyway. Reports of older
 *  runs are ignored by their run number. */
export async function runMagCal(
  io: MagCalIo,
  opts: RunMagCalOptions = {},
): Promise<RunMagCalResult> {
  const S = MAG_CAL.STATE;
  const pollMs = opts.pollMs ?? MAG_CAL.POLL_MS;
  const maxMs = opts.maxMs ?? MAG_CAL.MAX_MS;
  const clock = opts.now || Date.now;
  const sleep =
    opts.sleep || ((ms: number) => new Promise<void>(res => setTimeout(res, ms)));
  const wantAbort = opts.abortRequested || (() => false);
  const onUpdate = opts.onUpdate || (() => {});
  const t0 = clock();

  let tWrite = clock();
  let echo = await io.status();
  const before = echo && echo.magCal;
  let run = 0;
  let baseRun = 0;
  let started = false;
  if (before && (before.state === S.COLLECTING || before.state === S.FITTING)) {
    run = before.run;
  } else {
    baseRun = before ? before.run : 0;
    tWrite = clock();
    echo = await io.command(MAG_CMD.CALIBRATE);
    started = true;
  }

  let abortSent = false;
  let strangers = 0;
  for (;;) {
    const r = echo && echo.magCal;
    const ours = !!r && (run ? r.run === run : r.run > baseRun);
    if (ours && r) {
      run = r.run;
      onUpdate(r);
      if (magCalEnded(r)) {
        return { report: r, outcome: magCalOutcome(r), adopted: !started };
      }
    } else if (!run && ++strangers > MAG_CAL.START_POLLS) {
      throw new Error(MAG_CAL_UNSUPPORTED_MSG);
    }
    if (clock() - t0 > maxMs) throw new Error(MAG_CAL_STALLED_MSG);
    if (!abortSent && wantAbort()) {
      abortSent = true;
      tWrite = clock();
      echo = await io.command(MAG_CMD.ABORT);
      continue;
    }
    const wait = pollMs - (clock() - tWrite);
    if (wait > 0) await sleep(wait);
    tWrite = clock();
    echo = await io.status();
  }
}
