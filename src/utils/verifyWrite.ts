export type VerifyResult<TRead> =
  | { ok: true; readback: TRead }
  | { ok: false; readback: TRead; reason: 'mismatch' }
  | { ok: false; readback: null; reason: 'readback-null' };

export async function verifyWrite<TDraft, TRead>(
  opts: {
    write: () => Promise<void>;
    read: () => Promise<TRead | null>;
    equal: (draft: TDraft, readback: TRead) => boolean;
    draft: TDraft;
  },
): Promise<VerifyResult<TRead>> {
  await opts.write();

  const readback = await opts.read();
  if (!readback) return { ok: false, readback: null, reason: 'readback-null' };

  const matches = opts.equal(opts.draft, readback);
  if (!matches) return { ok: false, readback, reason: 'mismatch' };

  return { ok: true, readback };
}
