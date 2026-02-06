export function cleanHex(s: string): string {
  return (s ?? '').replace(/[^0-9a-fA-F]/g, '').toUpperCase();
}

export function hexToBytes(hex: string, expectedLenBytes?: number): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }

  if (
    expectedLenBytes !== undefined &&
    bytes.length !== expectedLenBytes
  ) {
    throw new Error(
      `Expected ${expectedLenBytes} bytes, got ${bytes.length}`,
    );
  }

  return bytes;
}


export function hexByteToInt(hex2: string): number {
  return parseInt(cleanHex(hex2), 16);
}

export function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}

export function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}
