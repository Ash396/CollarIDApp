// "Load from CollarID server" for the radio editor: GET /devices/{uid}/config
// (collarid-prod api/main.py device_config + _chirpstack_device_config) mapped
// onto the editor's LoRaWAN fields EXACTLY the way the website fills its radio
// form from the same response (configure.html prepopulateFromServer):
//
//   region         "US915" / "AU915" / "EU868" -> that region; anything else
//                  (another ChirpStack region, "unknown(n)") leaves it alone
//   supports_otaa  present -> auth OTAA (true) / ABP (false); absent leaves
//                  the auth picker alone
//   supports_otaa truthy -> OTAA fields: dev_eui, join_eui, app_key, nwk_key
//   otherwise           -> ABP fields:  dev_addr, nwk_s_enc_key (-> nwkSKey),
//                          app_s_key, f_nwk_s_int_key, s_nwk_s_int_key
//   a field the server has no value for (null / "") is left as it was.
//
// The only difference is presentation: values are shown the way the app's
// inputs show typed hex (upper case, no spaces). Length/hex validity is still
// checked by the editor's SAVE, same as for typed values.
//
// Nothing here logs, stores or sends anything: the patch only fills the form.
// The person reviews it, taps SAVE (the existing per-collar draft), and sends
// it to the collar from the Radio tab like any other edit.
import { ApiError, getDeviceConfig, getToken, getUsername } from './api';

export type RadioRegionName = 'REGION_US915' | 'REGION_AU915' | 'REGION_EU868';
export type RadioAuthName = 'AUTH_OTAA' | 'AUTH_ABP';

export type RadioFormPatch = {
  region?: RadioRegionName;
  auth?: RadioAuthName;
  devEui?: string;
  joinEui?: string;
  appKey?: string;
  nwkKey?: string;
  devAddr?: string;
  nwkSKey?: string;
  appSKey?: string;
  fNwkSIntKey?: string;
  sNwkSIntKey?: string;
};

/** The parts of the server's reply the form uses. */
export type ServerDeviceConfig = {
  configured?: boolean;
  detail?: string;
  region?: string;
  supports_otaa?: boolean;
  dev_eui?: string | null;
  join_eui?: string | null;
  app_key?: string | null;
  nwk_key?: string | null;
  dev_addr?: string | null;
  nwk_s_enc_key?: string | null;
  app_s_key?: string | null;
  f_nwk_s_int_key?: string | null;
  s_nwk_s_int_key?: string | null;
};

// configure.html: const regionMap = { 'US915': '0', 'AU915': '1', 'EU868': '2' }
// (the RadioRegion proto enum). The server's names come from ChirpStack's
// common.Region enum, so other regions are possible and are ignored.
const REGION_MAP: Record<string, RadioRegionName> = {
  US915: 'REGION_US915',
  AU915: 'REGION_AU915',
  EU868: 'REGION_EU868',
};

const showHex = (v: string) => String(v).replace(/\s/g, '').toUpperCase();

// [server field, form field] in the order configure.html fills them.
const OTAA_FIELDS: [keyof ServerDeviceConfig, keyof RadioFormPatch][] = [
  ['dev_eui', 'devEui'],
  ['join_eui', 'joinEui'],
  ['app_key', 'appKey'],
  ['nwk_key', 'nwkKey'],
];
const ABP_FIELDS: [keyof ServerDeviceConfig, keyof RadioFormPatch][] = [
  ['dev_addr', 'devAddr'],
  ['nwk_s_enc_key', 'nwkSKey'],
  ['app_s_key', 'appSKey'],
  ['f_nwk_s_int_key', 'fNwkSIntKey'],
  ['s_nwk_s_int_key', 'sNwkSIntKey'],
];

export function serverConfigToRadioForm(cfg: ServerDeviceConfig): {
  patch: RadioFormPatch;
  /** Form fields of the chosen set the server had no value for. */
  missing: (keyof RadioFormPatch)[];
  /** The server's region when the collar cannot use it (left unchanged). */
  unsupportedRegion?: string;
} {
  const patch: RadioFormPatch = {};
  const missing: (keyof RadioFormPatch)[] = [];
  let unsupportedRegion: string | undefined;

  if (cfg.region) {
    if (Object.prototype.hasOwnProperty.call(REGION_MAP, cfg.region)) {
      patch.region = REGION_MAP[cfg.region];
    } else {
      unsupportedRegion = String(cfg.region);
    }
  }

  if (cfg.supports_otaa !== undefined) {
    patch.auth = cfg.supports_otaa ? 'AUTH_OTAA' : 'AUTH_ABP';
  }

  // Same branch rule as the website: truthy supports_otaa -> OTAA, else ABP
  // (so a reply without supports_otaa fills the ABP fields).
  const fields = cfg.supports_otaa ? OTAA_FIELDS : ABP_FIELDS;
  for (const [from, to] of fields) {
    const v = cfg[from];
    if (v) (patch as any)[to] = showHex(v as string);
    else missing.push(to);
  }

  return { patch, missing, unsupportedRegion };
}

export type ServerRadioResult =
  | { kind: 'ok'; patch: RadioFormPatch; message: string }
  | {
      kind:
        | 'signed-out'
        | 'expired'
        | 'forbidden'
        | 'not-on-network'
        | 'unreachable'
        | 'error';
      message: string;
    };

const OWN_NETWORK =
  'A collar on its own LoRaWAN network (for example The Things Network or ' +
  'your own ChirpStack) gets its keys from that network: enter them by hand.';

/** Fetch one collar's LoRaWAN credentials and turn the reply into a form
 *  patch or a plain-language reason. Never throws. */
export async function loadServerRadioCredentials(
  uid: string,
): Promise<ServerRadioResult> {
  if (!getToken()) {
    return {
      kind: 'signed-out',
      message:
        'Sign in with your CollarID account on the Home tab to load this ' +
        "collar's LoRaWAN keys from the server.",
    };
  }
  let cfg: ServerDeviceConfig;
  try {
    cfg = (await getDeviceConfig(uid)) ?? {};
  } catch (e: any) {
    const status = e instanceof ApiError ? e.status : -1;
    if (status === 401) {
      return {
        kind: 'expired',
        message:
          'Your CollarID sign-in has expired. Sign in again on the Home tab, ' +
          'then try again.',
      };
    }
    if (status === 403) {
      const who = getUsername();
      return {
        kind: 'forbidden',
        message:
          `Collar ${uid} is not on your CollarID account` +
          (who ? ` (${who})` : '') +
          ', so the server will not share its keys. Sign in with the account ' +
          'that owns it, or ask a CollarID admin to add it to yours.',
      };
    }
    if (status === 503) {
      return {
        kind: 'not-on-network',
        message:
          `The CollarID server has no LoRaWAN keys to give for ${uid} ` +
          '(its LoRaWAN network link is not available). ' +
          OWN_NETWORK,
      };
    }
    if (status === 0) {
      return {
        kind: 'unreachable',
        message:
          'Cannot reach the CollarID server. Check your connection and try ' +
          'again. Nothing was changed.',
      };
    }
    return {
      kind: 'error',
      message:
        'The CollarID server could not answer. Try again later. Nothing was changed.',
      // old: 'The CollarID server could not answer' + (status > 0 ? ` (HTTP ${status})` : '') + '. Nothing was changed.',
    };
  }

  if (!cfg.configured) {
    return {
      kind: 'not-on-network',
      message:
        `${uid} is not on the CollarID LoRaWAN network, or has not been ` +
        'heard on it yet' +
        (cfg.detail ? ` (details: "${cfg.detail}")` : '') +
        '. ' +
        OWN_NETWORK,
    };
  }

  const { patch, missing, unsupportedRegion } = serverConfigToRadioForm(cfg);
  const filled = Object.keys(patch).length;
  if (!filled) {
    return {
      kind: 'error',
      message:
        `The server knows ${uid} but sent no LoRaWAN keys for it. ` +
        'Nothing was changed.',
    };
  }

  // e.g. "OTAA, US915" — the field labels match the editor's.
  const what = [
    patch.auth ? (patch.auth === 'AUTH_OTAA' ? 'OTAA' : 'ABP') : '',
    patch.region ? patch.region.replace('REGION_', '') : '',
  ]
    .filter(Boolean)
    .join(', ');
  const parts: string[] = [
    `Filled from the CollarID server for ${uid}${what ? ` (${what})` : ''}.`,
  ];
  if (missing.length) {
    parts.push(
      `The server had no value for ${missing.join(', ')}; ` +
        'those fields were left as they were.',
    );
  }
  if (unsupportedRegion) {
    parts.push(
      `The server lists region ${unsupportedRegion}, which the collar does ` +
        'not support; the region was left as it was.',
    );
  }
  parts.push(
    'Nothing has been sent. Review, tap SAVE, then SEND on the Radio tab.',
  );
  return { kind: 'ok', patch, message: parts.join(' ') };
}
