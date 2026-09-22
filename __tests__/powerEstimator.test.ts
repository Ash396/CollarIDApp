import { estimateMicBytesPerDay, micCodecRatio, MIC_CODEC_RATIO, micFlacSavingMw, estimatePower } from '../src/utils/powerEstimator';

// Compression on the card estimate (fw 380+). Mirrors the website's
// js/power-model.js pins: 3:1 planning for lossless FLAC, 6:1 with two low
// bits dropped, and no credit where the collar records WAV anyway.
const mic = (over: Record<string, unknown> = {}) =>
  ({ microphone: { enabled: true, continuousMode: true, sampleRate: 0, ...over } } as any);

describe('power estimate with compression', () => {
  // Measured 2026-09-22 (build 382, continuous, other sensors off), WAV then
  // FLAC: 6.8 -> 6.3 mW at 16 kHz, 6.1 -> 5.85 mW at 8 kHz. The saving scales
  // with the sample rate (0.50 / 0.25 mW), so it is subtracted, not a ratio.
  it('FLAC takes the measured saving off the mic increment: 0.50 mW at 16 kHz, 0.25 mW at 8 kHz', () => {
    expect(micFlacSavingMw({ codec: 1 } as any)).toBe(0.5);
    expect(micFlacSavingMw({ codec: 1, sampleRate: 1 } as any)).toBe(0.25);
    expect(micFlacSavingMw({ codec: 0 } as any)).toBe(0);
    expect(micFlacSavingMw({ codec: 1, sampleRate: 2 } as any)).toBe(0);
    expect(micFlacSavingMw({ codec: 1, bitDepth: 1 } as any)).toBe(0);
    // Components come back in solar hours, not mW: WAV at 16 kHz continuous
    // is the 7.60 mW increment, so that reading is the unit for one mW.
    const at = (over: Record<string, unknown>) => estimatePower([mic(over)]).components.microphone;
    const perMw = at({ codec: 0 }) / 7.6;
    expect(at({ codec: 1 })).toBeCloseTo(at({ codec: 0 }) - 0.5 * perMw, 9);
    expect(at({ codec: 1, sampleRate: 1 })).toBeCloseTo(at({ codec: 0, sampleRate: 1 }) - 0.25 * perMw, 9);
    expect(at({ codec: 1, sampleRate: 2 })).toBeCloseTo(at({ codec: 0, sampleRate: 2 }), 9);
    // A take that runs 1 minute in 10 saves a tenth of a continuous one.
    const duty = (over: Record<string, unknown>) =>
      estimatePower([mic({ continuousMode: false, sampleLengthMin: 1, sampleWindowMin: 10, ...over })]).components.microphone;
    expect(duty({ codec: 1 })).toBeCloseTo(duty({ codec: 0 }) - 0.05 * perMw, 9);
  });
  it('8 kHz WAV is 0.884 of 16 kHz, from the same bench pair', () => {
    const at = (over: Record<string, unknown>) => estimatePower([mic(over)]).components.microphone;
    expect(at({ sampleRate: 1 })).toBeCloseTo(0.884 * at({}), 9);
  });
});

describe('card estimate with compression', () => {
  it('WAV is the byte rate, FLAC divides by the planning ratio', () => {
    expect(estimateMicBytesPerDay(mic())).toBeCloseTo(86400 * 32000, 0);
    expect(estimateMicBytesPerDay(mic({ codec: 1 }))).toBeCloseTo((86400 * 32000) / 3, 0);
  });
  it('the low-bit drop uses the measured ratios, clamped to 0-4', () => {
    expect(MIC_CODEC_RATIO).toEqual([3, 4.5, 6, 7.5, 9]);
    expect(micCodecRatio({ codec: 1, lsbDrop: 2 } as any)).toBe(6);
    expect(micCodecRatio({ codec: 1, lsbDrop: 9 } as any)).toBe(9);
  });
  it('is not credited where the collar records WAV anyway', () => {
    expect(micCodecRatio({ codec: 1, sampleRate: 2 } as any)).toBe(1);
    expect(micCodecRatio({ codec: 1, bitDepth: 1 } as any)).toBe(1);
    expect(micCodecRatio({ codec: 0 } as any)).toBe(1);
  });
});
