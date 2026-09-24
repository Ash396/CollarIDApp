// Which collar is this, in the CollarID server's words?
//
// The server keys every collar by "0x" + 8 upper-case hex digits of the U5's
// HAL_GetUIDw0() (api/decoder.py: f'0x{uid:08X}', the header.system_uid of
// its LoRaWAN uplinks). GET /devices returns that form and
// GET /devices/{uid}/config expects it.
//
// Sources, best first:
//  1. header.system_uid of the collar's own BLE status packet — the same
//     field, from the same chip, as the uplinks (ble_management.cpp
//     BLE_Send_System_State). Authoritative.
//  2. The advertised name "CollarID-XXXXXXXX" (what configure.html uses).
//     Usually the same number, but the BLE chip builds it from the U5's UID
//     only once the U5 has pushed it; before that it advertises the BLE
//     chip's own UID (CollarID_BLE_wb5 app_ble.c BuildCustomName), which the
//     server has never seen. Fallback only.

export type CollarUid = {
  uid: string;
  source: 'status' | 'name';
};

/** 0x0006001B -> "0x0006001B"; null for 0 / not a uint32. */
export function formatServerUid(n: unknown): string | null {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isInteger(v) || v <= 0 || v > 0xffffffff) return null;
  return '0x' + v.toString(16).toUpperCase().padStart(8, '0');
}

/** "CollarID-00060018" -> "0x00060018". Add-on nodes (CollarDT-…) and
 *  anything not exactly 8 hex digits are not collars the server knows. */
export function uidFromAdvertisedName(name?: string | null): string | null {
  const m = /^CollarID-([0-9A-Fa-f]{8})$/.exec((name ?? '').trim());
  return m ? '0x' + m[1].toUpperCase() : null;
}

export function deriveCollarUid(opts: {
  systemUid?: number | null;
  name?: string | null;
  localName?: string | null;
}): CollarUid | null {
  const fromStatus = formatServerUid(opts.systemUid);
  if (fromStatus) return { uid: fromStatus, source: 'status' };
  const fromName =
    uidFromAdvertisedName(opts.name) ?? uidFromAdvertisedName(opts.localName);
  if (fromName) return { uid: fromName, source: 'name' };
  return null;
}
