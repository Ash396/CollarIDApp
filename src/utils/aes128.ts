// AES-128, one block, encrypt only — enough for a key check value:
// kcv = AES-128(key, sixteen zero bytes)[0..2] (CollarID_protobufs/beacon/
// README.md). The app never encrypts or decrypts a beacon; it checks that
// the key the server hands it matches the KCV the server names before the
// key is written to a collar, and that the collar's echoed KCV is that key.
// Pure JS (React Native has no WebCrypto); pinned to FIPS-197 and to the
// beacon vectors in __tests__/beaconKey.test.ts.

const SBOX = new Uint8Array(256);
(() => {
  // Generate the S-box: multiplicative inverse in GF(2^8), then the affine map.
  let p = 1;
  let q = 1;
  do {
    p = p ^ ((p << 1) & 0xff) ^ (p & 0x80 ? 0x1b : 0);
    q ^= q << 1;
    q ^= q << 2;
    q ^= q << 4;
    q &= 0xff;
    if (q & 0x80) q ^= 0x09;
    const x = q ^ ((q << 1) | (q >> 7)) ^ ((q << 2) | (q >> 6)) ^ ((q << 3) | (q >> 5)) ^ ((q << 4) | (q >> 4));
    SBOX[p] = (x ^ 0x63) & 0xff;
  } while (p !== 1);
  SBOX[0] = 0x63;
})();

const xtime = (b: number) => ((b << 1) ^ (b & 0x80 ? 0x1b : 0)) & 0xff;

function expandKey(key: Uint8Array): Uint8Array {
  const w = new Uint8Array(176);
  w.set(key, 0);
  let rcon = 1;
  for (let i = 16; i < 176; i += 4) {
    let t0 = w[i - 4];
    let t1 = w[i - 3];
    let t2 = w[i - 2];
    let t3 = w[i - 1];
    if (i % 16 === 0) {
      const r0 = SBOX[t1] ^ rcon;
      const r1 = SBOX[t2];
      const r2 = SBOX[t3];
      const r3 = SBOX[t0];
      t0 = r0;
      t1 = r1;
      t2 = r2;
      t3 = r3;
      rcon = xtime(rcon);
    }
    w[i] = w[i - 16] ^ t0;
    w[i + 1] = w[i - 15] ^ t1;
    w[i + 2] = w[i - 14] ^ t2;
    w[i + 3] = w[i - 13] ^ t3;
  }
  return w;
}

/** AES-128 encryption of one 16-byte block. */
export function aes128EncryptBlock(key: Uint8Array, block: Uint8Array): Uint8Array {
  if (key.length !== 16) throw new Error('AES-128 needs a 16-byte key');
  if (block.length !== 16) throw new Error('AES-128 encrypts 16-byte blocks');
  const w = expandKey(key);
  const s = new Uint8Array(block);
  const addRoundKey = (round: number) => {
    for (let i = 0; i < 16; i++) s[i] ^= w[round * 16 + i];
  };
  const subShift = () => {
    // SubBytes + ShiftRows (column-major state: s[r + 4c]).
    const t = new Uint8Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) t[r + 4 * c] = SBOX[s[r + 4 * ((c + r) % 4)]];
    }
    s.set(t);
  };
  const mixColumns = () => {
    for (let c = 0; c < 4; c++) {
      const a0 = s[4 * c];
      const a1 = s[4 * c + 1];
      const a2 = s[4 * c + 2];
      const a3 = s[4 * c + 3];
      s[4 * c] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
      s[4 * c + 1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
      s[4 * c + 2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
      s[4 * c + 3] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
    }
  };
  addRoundKey(0);
  for (let round = 1; round < 10; round++) {
    subShift();
    mixColumns();
    addRoundKey(round);
  }
  subShift();
  addRoundKey(10);
  return s;
}

/** The key check value of an AES-128 key, lower-case hex (6 characters). */
export function kcvHex(key: Uint8Array): string {
  const out = aes128EncryptBlock(key, new Uint8Array(16));
  return Array.from(out.subarray(0, 3), b => b.toString(16).padStart(2, '0')).join('');
}
