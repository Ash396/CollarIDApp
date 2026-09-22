import { estimateMicBytesPerDay, micCodecRatio, MIC_CODEC_RATIO, micCodecPowerScale, estimatePower } from '../src/utils/powerEstimator';

// Compression on the card estimate (fw 380+). Mirrors the website's
// js/power-model.js pins: 3:1 planning for lossless FLAC, 6:1 with two low
// bits dropped, and no credit where the collar records WAV anyway.
const mic = (over: Record<string, unknown> = {}) =>
  ({ microphone: { enabled: true, continuousMode: true, sampleRate: 0, ...over } } as any);

describe('power estimate with compression', () => {
  // Measured 2026-09-22 (build 382, 16 kHz continuous, other sensors off):
  // 6.8 mW total as WAV, 6.3 mW as FLAC; the ratio of the increments is 0.917.
  it('FLAC prices the mic increment at 0.917 of WAV, only where honoured', () => {
    expect(micCodecPowerScale({ codec: 1 } as any)).toBe(0.917);
    expect(micCodecPowerScale({ codec: 0 } as any)).toBe(1);
    expect(micCodecPowerScale({ codec: 1, sampleRate: 2 } as any)).toBe(1);
    const wav = estimatePower([mic({ codec: 0 })]).components.microphone;
    const flac = estimatePower([mic({ codec: 1 })]).components.microphone;
    expect(flac).toBeCloseTo(0.917 * wav, 9);
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
