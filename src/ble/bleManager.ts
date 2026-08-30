import { BleManager, Device, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import * as PB from '../proto/collar_pb.js';
import {
  hexToBytes,
  hexByteToInt,
  clampInt,
  unixNow,
} from '../utils/protoUtils.ts';
import {
  AddonEntry,
  DT_CMD,
  DtInfo,
  buildDtDirectCmd,
  buildDtFwdCmd,
  parseDtInfo,
  parseLocalDevices,
} from '../utils/dt';

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = '1a17b2cd-7314-493d-a4b5-32a2d53e6fd7';
export const UPDATE_CHAR_UUID = 'c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2';
export const STATUS_CHAR_UUID = '9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb';
export const RADIO_CHAR_UUID = '68a6a356-49c1-4bed-b152-a02c0cb2c024';
/* Capability probe: WB5M-era collar firmware exposes ...6fd8 ('C','P',ver,caps);
 * frozen WB15 builds throw on the characteristic lookup — no add-on relay. */
export const CAPS_CHAR_UUID = '1a17b2cd-7314-493d-a4b5-32a2d53e6fd8';
/* Local add-on list ('D','L' blob) — devices heard at Thread check-ins. */
export const LOCAL_DEVICES_CHAR_UUID = '1a17b2cd-7314-493d-a4b5-32a2d53e6fd9';

/* -------------------------------------------------------------------------- */
/*          DEV MOCK COLLAR — simulator testing without Bluetooth             */
/* -------------------------------------------------------------------------- */
// The iOS Simulator has no Bluetooth. To exercise the connected-device flows
// (loading schedules, Send to Device, the engaged/overlap checks) the app can
// "connect" to this fake collar via the __DEV__-only button on HomeScreen.
// readSchedulesFromDevice / sendConfig / readRadioState short-circuit to
// in-memory canned data when the device is this mock.
export const MOCK_COLLAR_ID = 'MOCK-COLLAR';
export const MOCK_COLLAR = {
  id: MOCK_COLLAR_ID,
  name: 'Mock Collar',
} as unknown as Device;

export function isMockDevice(device: Device | null | undefined): boolean {
  return device?.id === MOCK_COLLAR_ID;
}

// In-memory stand-in for the collar's stored schedule packet. Seeded with two
// non-overlapping schedules and engaged=false, so a first "Send to Device"
// exercises the disengaged-device warning. sendConfig() updates it so a send
// round-trips and the read-back verifies.
let mockScheduleStore: { schedules: any[]; engaged: boolean } = {
  engaged: false,
  schedules: [
    {
      window: { startHour: 0, endHour: 11 },
      gps: {
        enabled: true,
        sampleIntervalMin: 20,
        accuracy: 5,
        dynamicSamplingMode: true,
        mediumMotionVedbaThresholdX100: 20,
        mediumMotionGpsIntervalMin: 10,
        highMotionVedbaThresholdX100: 100,
        highMotionGpsIntervalMin: 5,
        lorawanTxOnGpsFix: false,
        loraTxOnGpsFix: false,
      },
      light: { enabled: true, sampleIntervalMin: 10 },
      environmental: { enabled: false, sampleIntervalMin: 5 },
      particulate: { enabled: false, sampleIntervalMin: 15 },
      microphone: {
        enabled: true,
        continuousMode: false,
        sampleLengthMin: 1,
        sampleWindowMin: 10,
      },
      accelerometer: { enabled: true, sampleRate: 0, sensitivity: 0 },
      magnetometer: { enabled: false, sampleIntervalS: 60 },
      lorawanEnabled: true,
      lorawanSendIntervalMin: 60,
      loraEnabled: false,
      loraSendIntervalMin: 0,
    },
    {
      window: { startHour: 12, endHour: 23 },
      gps: { enabled: false, sampleIntervalMin: 20, accuracy: 5 },
      light: { enabled: true, sampleIntervalMin: 10 },
      environmental: { enabled: true, sampleIntervalMin: 5 },
      particulate: { enabled: false, sampleIntervalMin: 15 },
      microphone: {
        enabled: false,
        continuousMode: false,
        sampleLengthMin: 1,
        sampleWindowMin: 10,
      },
      accelerometer: { enabled: false, sampleRate: 0, sensitivity: 0 },
      magnetometer: { enabled: true, sampleIntervalS: 60 },
      lorawanEnabled: false,
      lorawanSendIntervalMin: 0,
      loraEnabled: false,
      loraSendIntervalMin: 0,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                          Type Definitions                                  */
/* -------------------------------------------------------------------------- */

export type DecodedPacket = Partial<{
  blePacket: PB.BlePacket;
  systemStatePacket: PB.SystemStatePacket;
  scheduleConfigPacket: PB.ScheduleConfigPacket;
  radioConfigPacket: PB.RadioConfigPacket;
  peripheralPacket: PB.PeripheralPacket;
  peripheralInfo: PB.PeripheralInfo;
}> | null;

/* -------------------------------------------------------------------------- */
/*                           Decode Utilities                                 */
/* -------------------------------------------------------------------------- */

function safeDecode(bytes: Uint8Array): DecodedPacket {
  try {
    const pkt = PB.BlePacket.decode(bytes);
    return {
      blePacket: pkt,
      systemStatePacket: pkt.systemStatePacket ?? undefined,
      scheduleConfigPacket: pkt.scheduleConfigPacket ?? undefined,
      radioConfigPacket: pkt.radioConfigPacket ?? undefined,
      peripheralPacket: pkt.peripheralPacket ?? undefined,
      peripheralInfo: pkt.peripheralInfo ?? undefined,
    };
  } catch (_) {}

  try {
    const sched = PB.ScheduleConfigPacket.decode(bytes);
    return { scheduleConfigPacket: sched };
  } catch (_) {}

  try {
    const radio = PB.RadioConfigPacket.decode(bytes);
    return { radioConfigPacket: radio };
  } catch (_) {}

  try {
    const sys = PB.SystemStatePacket.decode(bytes);
    return { systemStatePacket: sys };
  } catch (err) {
    console.warn('⚠️ [safeDecode] Fallback decode failed:', err);
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                               Bluetooth                                    */
/* -------------------------------------------------------------------------- */

export async function ensureBluetoothOn(): Promise<void> {
  const state = await manager.state();
  if (state === State.PoweredOn) return;

  console.log(`Bluetooth = ${state}, waiting...`);
  await new Promise<void>(resolve => {
    const sub = manager.onStateChange(newState => {
      if (newState === State.PoweredOn) {
        sub.remove();
        resolve();
      }
    }, true);
  });
}

/* -------------------------------------------------------------------------- */
/*                        Connect / Read / Notify                             */
/* -------------------------------------------------------------------------- */

export async function connectToCollar(device: Device): Promise<Device | null> {
  if (!device) return null;

  await ensureBluetoothOn();

  try {
    console.log(`🔗 Connecting to ${device.name ?? device.id}...`);
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();
    console.log(`✅ Connected to ${connected.name ?? connected.id}`);
    return connected;
  } catch (err) {
    console.error('❌ connectToCollar failed:', err);
    return null;
  }
}

/* --------- Initial state read (Schedules) --------- */
// export async function readInitialState(device: Device): Promise<DecodedPacket> {
//   try {
//     const ch = await device.readCharacteristicForService(
//       COLLAR_SERVICE_UUID,
//       UPDATE_CHAR_UUID,
//     );

//     if (!ch?.value) return null;

//     const bytes = Buffer.from(ch.value, 'base64');
//     return safeDecode(bytes);
//   } catch (err) {
//     console.warn('⚠️ readInitialState failed:', err);
//     return null;
//   }
// }
export async function readInitialState(device: Device): Promise<DecodedPacket> {
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
    );

    if (!ch?.value) return null;

    const bytes = Buffer.from(ch.value, 'base64');
    console.log('[Schedules] bytes hex:', bytes.toString('hex'));

    // Try wrapped BlePacket first only if it actually contains scheduleConfigPacket
    try {
      const pkt = PB.BlePacket.decode(bytes);
      if (pkt?.scheduleConfigPacket && Array.isArray(pkt.scheduleConfigPacket.schedules)) {
        console.log('[Schedules] using BlePacket decode');
        return {
          blePacket: pkt,
          scheduleConfigPacket: pkt.scheduleConfigPacket,
        };
      }
    } catch {}

    // Then try raw ScheduleConfigPacket
    try {
      const sched = PB.ScheduleConfigPacket.decode(bytes);
      if (Array.isArray(sched?.schedules)) {
        console.log('[Schedules] using raw ScheduleConfigPacket decode');
        return { scheduleConfigPacket: sched };
      }
    } catch {}

    console.warn('[Schedules] no valid schedule decode');
    return null;
  } catch (err) {
    console.warn('⚠️ readInitialState failed:', err);
    return null;
  }
}

// Radio state read
export async function readRadioState(device: Device): Promise<DecodedPacket> {
  if (isMockDevice(device)) return null; // mock collar has no radio config
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      RADIO_CHAR_UUID,
    );

    if (!ch?.value) return null;

    const bytes = Buffer.from(ch.value, 'base64');
    return safeDecode(bytes);
  } catch (err) {
    console.warn('⚠️ readRadioState failed:', err);
    return null;
  }
}

// export async function readSchedulesFromDevice(device: Device) {
//   const decoded = await readInitialState(device);
//   const pkt = decoded?.scheduleConfigPacket ?? null;
//   return pkt ? { schedules: pkt.schedules ?? [], engaged: Boolean(pkt.engaged) } : null;
// }
export async function readSchedulesFromDevice(device: Device) {
  if (isMockDevice(device)) {
    return {
      schedules: mockScheduleStore.schedules,
      engaged: mockScheduleStore.engaged,
    };
  }
  const decoded = await readInitialState(device);
  console.log('[Schedules] decoded object:', JSON.stringify(decoded, null, 2));

  const pkt = decoded?.scheduleConfigPacket ?? null;
  console.log('[Schedules] schedule packet:', JSON.stringify(pkt, null, 2));

  return pkt ? { schedules: pkt.schedules ?? [], engaged: Boolean(pkt.engaged) } : null;
}

export async function readRadioConfigFromDevice(device: Device) {
  const decoded = await readRadioState(device);
  return decoded?.radioConfigPacket ?? null; // PB.RadioConfigPacket | null
}

/* --------- STATUS notifications --------- */
export function subscribeToStatus(
  device: Device,
  callback: (data: DecodedPacket) => void,
) {
  return device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    STATUS_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        // ignore expected disconnect/cancel cases
        if (error.message?.includes('disconnected')) return;
        if (error.message?.includes('cancelled')) return;

        console.error('STATUS notify error:', error);
        return;
      }
      if (!characteristic?.value) return;

      const bytes = Buffer.from(characteristic.value, 'base64');
      const decoded = safeDecode(bytes);
      if (decoded) callback(decoded);
    },
  );
}

/* --------- UPDATE notifications (Schedules + radio live updates) --------- */
// export function subscribeToUpdates(
//   device: Device,
//   callback: (data: DecodedPacket) => void,
// ) {
//   const subscription = device.monitorCharacteristicForService(
//     COLLAR_SERVICE_UUID,
//     UPDATE_CHAR_UUID,
//     (error, characteristic) => {
//       if (error) {
//         // Ignore expected disconnect errors
//         if (error.message?.includes('disconnected')) return;
//         if (error.message?.includes('cancelled')) return;

//         console.error('UPDATE notify error:', error);
//         return;
//       }

//       if (!characteristic?.value) return;

//       const bytes = Buffer.from(characteristic.value, 'base64');
//       const decoded = safeDecode(bytes);

//       if (decoded) callback(decoded);
//     },
//   );

//   return subscription;
// }

// export function subscribeToRadioUpdates(
//   device: Device,
//   callback: (data: DecodedPacket) => void,
// ) {
//   const subscription = device.monitorCharacteristicForService(
//     COLLAR_SERVICE_UUID,
//     RADIO_CHAR_UUID,
//     (error, characteristic) => {
//       if (error) {
//         if (error.message?.includes('disconnected')) return;
//         if (error.message?.includes('cancelled')) return;
//         console.error('RADIO notify error:', error);
//         return;
//       }

//       if (!characteristic?.value) return;

//       const bytes = Buffer.from(characteristic.value, 'base64');
//       const decoded = safeDecode(bytes);
//       if (decoded) callback(decoded);
//     },
//   );

//   return subscription;
// }

/* -------------------------------------------------------------------------- */
/*                   Build Schedule Packet to Send to Device                  */
/* -------------------------------------------------------------------------- */

// Strip disabled sensors so protobuf doesn't encode their default-value
// fields — mirrors minimizeSchedule() in the website configurator. Keeps a
// fully-loaded 4-schedule config under the deployed WB15's ~300-byte ATT
// value cap (a single clean write, no fragile long/prepared writes).
export function buildSchedulePacketFromAppState(
  appSchedules: any[],
  appEngaged: boolean,
  specialMode = 0,
): PB.BlePacket {
  const schedules = appSchedules.map(s => {
    // Plain-object ScheduleConfig fields (the generated .d.ts drops the
    // I-interfaces after the first enum — longstanding pbts/jsdoc quirk).
    const fields: { [k: string]: any } = {
      window: PB.TimeWindow.create({
        startHour: Math.max(0, Math.min(23, Number(s.window?.startHour ?? 0))),
        endHour: Math.max(0, Math.min(23, Number(s.window?.endHour ?? 0))),
      }),
      lorawanEnabled: Boolean(s.lorawan?.enabled ?? false),
      loraEnabled: Boolean(s.lora?.enabled ?? false),
    };
    if (s.lorawan?.enabled) {
      fields.lorawanSendIntervalMin = Number(s.lorawan?.sendIntervalMin ?? 0);
    }
    if (s.lora?.enabled) {
      fields.loraSendIntervalMin = Number(s.lora?.sendIntervalMin ?? 0);
    }
    if (s.gps?.enabled) {
      fields.gps = PB.GPSConfig.create({
        enabled: true,
        sampleIntervalMin: Number(s.gps?.sampleIntervalMin ?? 20),
        accuracy: Math.min(Math.max(1, Number(s.gps?.accuracy ?? 5)), 10),
        dynamicSamplingMode: Boolean(s.gps?.dynamicSamplingMode ?? false),
        mediumMotionVedbaThresholdX100: Number(
          s.gps?.mediumMotionVedbaThresholdX100 ?? 20,
        ),
        mediumMotionGpsIntervalMin: Number(
          s.gps?.mediumMotionGpsIntervalMin ?? 10,
        ),
        highMotionVedbaThresholdX100: Number(
          s.gps?.highMotionVedbaThresholdX100 ?? 100,
        ),
        highMotionGpsIntervalMin: Number(s.gps?.highMotionGpsIntervalMin ?? 5),
        // TX-on-fix flags live on GPSConfig; only meaningful while the
        // matching radio is enabled (the editor forces them off otherwise).
        lorawanTxOnGpsFix: Boolean(
          s.lorawan?.enabled && s.gps?.lorawanTxOnGpsFix,
        ),
        loraTxOnGpsFix: Boolean(s.lora?.enabled && s.gps?.loraTxOnGpsFix),
      });
    }
    if (s.light?.enabled) {
      fields.light = PB.SamplingConfig.create({
        enabled: true,
        sampleIntervalMin: Number(s.light?.sampleIntervalMin ?? 10),
      });
    }
    if (s.environmental?.enabled) {
      fields.environmental = PB.SamplingConfig.create({
        enabled: true,
        sampleIntervalMin: Number(s.environmental?.sampleIntervalMin ?? 5),
      });
    }
    if (s.particulate?.enabled) {
      fields.particulate = PB.SamplingConfig.create({
        enabled: true,
        sampleIntervalMin: Number(s.particulate?.sampleIntervalMin ?? 15),
      });
    }
    if (s.microphone?.enabled) {
      fields.microphone = PB.MicrophoneConfig.create({
        enabled: true,
        continuousMode: Boolean(s.microphone?.continuousMode ?? false),
        sampleLengthMin: Number(s.microphone?.sampleLengthMin ?? 1),
        sampleWindowMin: Number(s.microphone?.sampleWindowMin ?? 10),
        // 0 (16 kHz / 16-bit) is both the historical behaviour and the
        // proto3 default, so it costs nothing on the wire and a collar that
        // predates the fields ignores it.
        sampleRate: Number(s.microphone?.sampleRate ?? 0),
        bitDepth: Number(s.microphone?.bitDepth ?? 0),
        sensitivity: Number(s.microphone?.sensitivity ?? 0),
      });
    }
    if (s.accelerometer?.enabled) {
      fields.accelerometer = PB.AccelerometerConfig.create({
        enabled: true,
        sampleRate: Number(s.accelerometer?.sampleRate ?? 0),
        sensitivity: Number(s.accelerometer?.sensitivity ?? 0),
      });
    }
    if (s.magnetometer?.enabled) {
      fields.magnetometer = PB.MagnetometerConfig.create({
        enabled: true,
        sampleIntervalS: Number(s.magnetometer?.sampleIntervalS ?? 0),
      });
    }
    return PB.ScheduleConfig.create(fields);
  });

  return PB.BlePacket.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: Math.floor(Date.now() / 1000),
      packetIndex: 0,
    }),
    scheduleConfigPacket: PB.ScheduleConfigPacket.create({
      engaged: Boolean(appEngaged),
      schedules,
      specialMode,
    }),
  });
}

/* -------------------------------------------------------------------------- */
/*                   Build Radio Packet to Send to Device                     */
/* -------------------------------------------------------------------------- */

export type RadioConfigAppState = {
  lorawan: {
    region: number; // RadioRegion enum: 0/1/2
    auth: number; // RadioAuth enum: 0/1
    otaa?: {
      devEuiHex: string; // 16 hex -> 8 bytes
      joinEuiHex: string; // 16 hex -> 8 bytes
      appKeyHex: string; // 32 hex -> 16 bytes
      nwkKeyHex: string; // 32 hex -> 16 bytes
    };
    abp?: {
      devAddrHex: string; // 8 hex -> 4 bytes
      nwkSKeyHex: string; // 32 hex -> 16 bytes
      appSKeyHex: string; // 32 hex -> 16 bytes
      fNwkSIntKeyHex: string; // 32 hex -> 16 bytes
      sNwkSIntKeyHex: string; // 32 hex -> 16 bytes
    };
    txOnlyOnNewGpsFix: boolean;
    transmitIntervalMin: number; // used only if txOnlyOnNewGpsFix=true else 0
    txPowerDbm: number; // [0..23]
  };

  lora: {
    radioSpreadingFactor: number; // 0..5
    radioBandwidth: number; // 0..2
    radioCodingRate: number; // 0..3
    txPowerDbm: number; // [0..26]
    syncWordHex: string; // 2 hex -> uint32 byte
    frequencyMHz: number; // 400...999
  };

  lostMode: {
    enabled: boolean;
    activationEpoch: number; // unix seconds
    transmitIntervalMin: number; // >0
    txPowerDbm: number; // [0..26]
  };
};

export function buildBlePacketFromRadioConfig(
  radioCfg: PB.RadioConfigPacket,
): PB.BlePacket {
  return PB.BlePacket.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: unixNow(),
      packetIndex: 0,
    }),
    radioConfigPacket: radioCfg,
  });
}

/* -------------------------------------------------------------------------- */
/*                              Send Config                                    */
/* -------------------------------------------------------------------------- */

// export async function sendConfig(device: Device, packet: PB.BlePacket) {
//   console.log('📤 Sending schedule packet…');

//   const encoded = PB.BlePacket.encode(packet).finish();
//   const base64 = Buffer.from(encoded).toString('base64');

//   await device.writeCharacteristicWithResponseForService(
//     COLLAR_SERVICE_UUID,
//     UPDATE_CHAR_UUID,
//     base64,
//   );

//   console.log('✅ Write complete');
//   return true;
// }
export async function sendConfig(device: Device, packet: PB.BlePacket) {
  if (isMockDevice(device)) {
    const scp = packet.scheduleConfigPacket;
    if (scp) {
      mockScheduleStore = {
        schedules: (scp.schedules ?? []) as any[],
        engaged: Boolean(scp.engaged),
      };
    }
    console.log(
      '🧪 [mock] sendConfig stored',
      mockScheduleStore.schedules.length,
      'schedules, engaged =',
      mockScheduleStore.engaged,
    );
    return true;
  }
  try {
    console.log('📤 Sending schedule packet…');

    const encoded = PB.BlePacket.encode(packet).finish();
    const base64 = Buffer.from(encoded).toString('base64');

    console.log('[sendConfig] encoded length:', encoded.length);
    console.log('[sendConfig] base64 length:', base64.length);
    console.log('[sendConfig] hex:', Buffer.from(encoded).toString('hex'));

    await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
      base64,
    );

    console.log('✅ Write complete');
    return true;
  } catch (err) {
    console.error('❌ sendConfig failed:', err);
    throw err;
  }
}

export async function sendRadioConfig(device: Device, packet: PB.BlePacket) {
  console.log('📤 Sending radio packet…');

  const encoded = PB.BlePacket.encode(packet).finish();
  const base64 = Buffer.from(encoded).toString('base64');

  await device.writeCharacteristicWithResponseForService(
    COLLAR_SERVICE_UUID,
    RADIO_CHAR_UUID,
    base64,
  );

  console.log('✅ Radio write complete');
  return true;
}

/* -------------------------------------------------------------------------- */
/*                    Thread add-ons (relayed through the collar)             */
/* -------------------------------------------------------------------------- */

// Mock add-ons for simulator testing (see MOCK_COLLAR above). Commands sent
// via sendDtFwdCommand mutate these so the panel round-trips without radios.
const mockAddonStore: AddonEntry[] = [
  {
    uid: 0xa1b2c3d4,
    type: 1,
    battMv: 2987,
    motorState: 0,
    detachEpoch: 0,
    heardAgoS: 42,
    paired: false,
    fired: false,
    name: 'CollarDT-A1B2C3D4',
  },
  {
    uid: 0x00c0ffee,
    type: 1,
    battMv: 3104,
    motorState: 0,
    detachEpoch: Math.floor(Date.now() / 1000) + 2 * 86400,
    heardAgoS: 8,
    paired: true,
    fired: false,
    name: 'CollarDT-00C0FFEE',
  },
];

/** Read the collar's capability byte (0 when the characteristic is absent —
 *  legacy WB15 firmware). Bit 0 = Thread add-on relay available. */
export async function readCollarCaps(device: Device): Promise<number> {
  if (isMockDevice(device)) return 0x01;
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      CAPS_CHAR_UUID,
    );
    if (!ch?.value) return 0;
    const b = Buffer.from(ch.value, 'base64');
    if (b.length >= 4 && b[0] === 0x43 && b[1] === 0x50) return b[3];
    return 0;
  } catch (_) {
    return 0; // legacy collar: no caps characteristic
  }
}

/** Read the add-ons the collar has heard at its Thread check-ins. */
export async function readLocalDevices(
  device: Device,
): Promise<AddonEntry[] | null> {
  if (isMockDevice(device)) {
    return mockAddonStore.map(a => ({ ...a }));
  }
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      LOCAL_DEVICES_CHAR_UUID,
    );
    if (!ch?.value) return null;
    return parseLocalDevices(new Uint8Array(Buffer.from(ch.value, 'base64')));
  } catch (err) {
    console.warn('⚠️ readLocalDevices failed:', err);
    return null;
  }
}

/** Forward a DT command through the collar (delivered at the add-on's next
 *  check-in). 16-byte DtBleFwdV1_t on the collar's update characteristic. */
export async function sendDtFwdCommand(
  device: Device,
  targetUid: number,
  cmd: number,
  param = 0,
): Promise<void> {
  if (isMockDevice(device)) {
    const a = mockAddonStore.find(x => x.uid === targetUid);
    if (a) {
      if (cmd === DT_CMD.PAIR) a.paired = true;
      if (cmd === DT_CMD.UNPAIR) a.paired = false;
      if (cmd === DT_CMD.ARM) a.detachEpoch = param;
      if (cmd === DT_CMD.DISARM) {
        a.detachEpoch = 0;
        a.fired = false;
      }
      if (cmd === DT_CMD.DETACH) a.fired = true;
      if (cmd === DT_CMD.ATTACH) a.fired = false;
      a.heardAgoS = 1;
    }
    return;
  }
  const frame = buildDtFwdCmd(targetUid, cmd, param, unixNow());
  await device.writeCharacteristicWithResponseForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    Buffer.from(frame).toString('base64'),
  );
}

/* -------------------------------------------------------------------------- */
/*                    CollarDT direct connection (detach node)                */
/* -------------------------------------------------------------------------- */

export const MOCK_DT_ID = 'MOCK-DT';
export const MOCK_DT = {
  id: MOCK_DT_ID,
  name: 'CollarDT-MOCK0001',
} as unknown as Device;

export function isMockDt(device: Device | null | undefined): boolean {
  return device?.id === MOCK_DT_ID;
}

// Simulated detach node — v5 status blob, mutated by direct commands.
const mockDtState = {
  fwMajor: 1,
  fwMinor: 4,
  git: 'deadbeef',
  bootedAt: Date.now(),
  detachEpoch: 0,
  battMv: 3012,
  motorUntil: 0, // Date.now() ms deadline while "running"
  motorKind: 0, // 1 detaching, 2 attaching
  rtcEpoch: 0,
  mode: 1, // add-on (linked)
  fired: 0,
  pairedUid: 0x1234abcd,
  loadedMv: 0,
  dieTempC: 21,
  autoDetach: 1,
  checkinS: 86400,
};

function mockDtBlob(): Uint8Array {
  const s = mockDtState;
  const buf = new Uint8Array(42);
  const dv = new DataView(buf.buffer);
  buf[0] = 0x44;
  buf[1] = 0x54;
  buf[2] = 5; // payload version
  buf[3] = s.fwMajor;
  buf[4] = s.fwMinor;
  for (let i = 0; i < 8; i++) buf[5 + i] = s.git.charCodeAt(i);
  dv.setUint32(13, Math.floor((Date.now() - s.bootedAt) / 1000), true);
  dv.setUint32(17, s.detachEpoch, true);
  dv.setUint16(21, s.battMv, true);
  buf[23] = Date.now() < s.motorUntil ? s.motorKind : 0;
  dv.setUint32(24, s.rtcEpoch, true);
  buf[28] = s.mode;
  buf[29] = s.fired;
  dv.setUint32(30, s.pairedUid, true);
  dv.setUint16(34, s.loadedMv, true);
  dv.setInt8(36, s.dieTempC);
  buf[37] = s.autoDetach;
  dv.setUint32(38, s.checkinS, true);
  return buf;
}

/** Read + parse a directly-connected CollarDT's status blob. */
export async function readDtInfo(device: Device): Promise<DtInfo | null> {
  if (isMockDt(device)) return parseDtInfo(mockDtBlob());
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      STATUS_CHAR_UUID,
    );
    if (!ch?.value) return null;
    return parseDtInfo(new Uint8Array(Buffer.from(ch.value, 'base64')));
  } catch (err) {
    console.warn('⚠️ readDtInfo failed:', err);
    return null;
  }
}

/** Send a direct DT command (12-byte DtBleCmdV1_t). Every frame carries our
 *  UTC epoch, so a NOP is a pure clock sync. */
export async function sendDtDirectCommand(
  device: Device,
  cmd: number,
  param = 0,
): Promise<void> {
  if (isMockDt(device)) {
    const s = mockDtState;
    s.rtcEpoch = unixNow(); // every frame disciplines the RTC
    if (cmd === DT_CMD.ARM) s.detachEpoch = param;
    if (cmd === DT_CMD.DISARM) {
      s.detachEpoch = 0;
      s.fired = 0;
    }
    if (cmd === DT_CMD.DETACH) {
      s.motorKind = 1;
      s.motorUntil = Date.now() + 5000;
      s.fired = 1;
    }
    if (cmd === DT_CMD.ATTACH) {
      s.motorKind = 2;
      s.motorUntil = Date.now() + 5000;
      s.fired = 0;
    }
    if (cmd === DT_CMD.STOP) s.motorUntil = 0;
    if (cmd === DT_CMD.UNPAIR) {
      s.pairedUid = 0;
      s.mode = 0;
    }
    if (cmd === DT_CMD.FACTORY_RESET) {
      s.pairedUid = 0;
      s.mode = 0;
      s.detachEpoch = 0;
      s.fired = 0;
    }
    if (cmd === DT_CMD.LOAD_TEST) s.loadedMv = s.battMv - 142;
    if (cmd === DT_CMD.SET_AUTODETACH) s.autoDetach = param ? 1 : 0;
    return;
  }
  const frame = buildDtDirectCmd(cmd, param, unixNow());
  await device.writeCharacteristicWithResponseForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    Buffer.from(frame).toString('base64'),
  );
}

/* -------------------------------------------------------------------------- */
/*                           Disconnect                                       */
/* -------------------------------------------------------------------------- */

export async function disconnectFromCollar(device: Device) {
  try {
    await device.cancelConnection();
    console.log('🔌 Disconnected');
    return true;
  } catch (err) {
    console.error('❌ Failed to disconnect:', err);
    return false;
  }
}
