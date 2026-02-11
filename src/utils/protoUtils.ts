export function cleanHex(s: string): string {
  return (s ?? '').replace(/[^0-9a-fA-F]/g, '').toUpperCase();
}

export function hexToBytes(hex: string, expectedLenBytes?: number): Uint8Array {
  const clean = cleanHex(hex);
  if (clean.length % 2 !== 0) {
    throw new Error("Hex string must have even length");
  }

  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }

  if (expectedLenBytes !== undefined && bytes.length !== expectedLenBytes) {
    throw new Error(`Expected ${expectedLenBytes} bytes, got ${bytes.length}`);
  }

  return bytes;
}

export function hexByteToInt(hex2: string): number {
  const clean = cleanHex(hex2);
  if (clean.length !== 2) {
    throw new Error("Expected exactly 2 hex characters (00–FF)");
  }
  const n = parseInt(clean, 16);
  if (!Number.isFinite(n)) {
    throw new Error("Invalid hex byte");
  }
  return n;
}

export function bytesToHex(bytes?: Uint8Array | number[]): string {
  if (!bytes) return "";
  const arr = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}

export function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}
