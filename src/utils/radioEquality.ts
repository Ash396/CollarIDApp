import * as PB from '../proto/collar_pb.js';

function normBytes(x: any): string {
  if (!x) return '';
  // Uint8Array -> stable string
  return Array.from(x as Uint8Array)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

export function normalizeRadio(cfg: PB.RadioConfigPacket | null) {
  if (!cfg) return null;
  const c: any = cfg;

  const lw = c.loRaWANConfig;
  const lo = c.loRaConfig;
  const lost = c.lostModeConfig;

  return {
    lorawan: {
      region: lw?.region ?? 0,
      auth: lw?.auth ?? 0,
      txOnlyOnNewGpsFix: !!lw?.txOnlyOnNewGpsFix,
      transmitIntervalMin: lw?.transmitIntervalMin ?? 0,
      txPowerDbm: lw?.txPowerDbm ?? 0,
      otaa: lw?.otaa
        ? {
            devEui: normBytes(lw.otaa.devEui),
            joinEui: normBytes(lw.otaa.joinEui),
            appKey: normBytes(lw.otaa.appKey),
            nwkKey: normBytes(lw.otaa.nwkKey),
          }
        : null,
      abp: lw?.abp
        ? {
            devAddr: normBytes(lw.abp.devAddr),
            nwkSKey: normBytes(lw.abp.nwkSKey),
            appSKey: normBytes(lw.abp.appSKey),
            fNwkSIntKey: normBytes(lw.abp.fNwkSIntKey),
            sNwkSIntKey: normBytes(lw.abp.sNwkSIntKey),
          }
        : null,
    },
    lora: {
      sf: lo?.radioSpreadingFactor ?? 0,
      bw: lo?.radioBandwidth ?? 0,
      cr: lo?.radioCodingRate ?? 0,
      txPowerDbm: lo?.txPowerDbm ?? 0,
      syncWord: lo?.syncWord ?? 0,
      frequency: lo?.frequency ?? 0,
    },
    lost: {
      enabled: !!c.lostModeEnabled,
      activationEpoch: lost?.activationEpoch ?? 0,
      transmitIntervalMin: lost?.transmitIntervalMin ?? 0,
      txPowerDbm: lost?.txPowerDbm ?? 0,
    },
  };
}

export function radioEqual(
  a: PB.RadioConfigPacket,
  b: PB.RadioConfigPacket,
) {
  return JSON.stringify(normalizeRadio(a)) === JSON.stringify(normalizeRadio(b));
}
