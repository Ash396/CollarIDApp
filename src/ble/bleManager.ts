import { BleManager, Device, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import * as PB from '../proto/collar_pb.js';
import { hexToBytes, hexByteToInt, clampInt, unixNow } from './protoUtils.ts';

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = '1a17b2cd-7314-493d-a4b5-32a2d53e6fd7';
export const UPDATE_CHAR_UUID = 'c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2';
export const STATUS_CHAR_UUID = '9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb';
export const RADIO_CHAR_UUID = '68a6a356-49c1-4bed-b152-a02c0cb2c024';

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
export async function readInitialState(device: Device): Promise<DecodedPacket> {
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
    );

    if (!ch?.value) return null;

    const bytes = Buffer.from(ch.value, 'base64');
    return safeDecode(bytes);
  } catch (err) {
    console.warn('⚠️ readInitialState failed:', err);
    return null;
  }
}

// Radio state read
export async function readRadioState(device: Device): Promise<DecodedPacket> {
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

/* --------- UPDATE notifications (Schedules live updates) --------- */
export function subscribeToUpdates(
  device: Device,
  callback: (data: DecodedPacket) => void,
) {
  const subscription = device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        // Ignore expected disconnect errors
        if (error.message?.includes('disconnected')) return;
        if (error.message?.includes('cancelled')) return;

        console.error('UPDATE notify error:', error);
        return;
      }

      if (!characteristic?.value) return;

      const bytes = Buffer.from(characteristic.value, 'base64');
      const decoded = safeDecode(bytes);

      if (decoded) callback(decoded);
    },
  );

  return subscription;
}

/* -------------------------------------------------------------------------- */
/*                   Build Schedule Packet to Send to Device                  */
/* -------------------------------------------------------------------------- */

export function buildSchedulePacketFromAppState(
  appSchedules: any[],
): PB.BlePacket {
  const schedules = appSchedules.map(s =>
    PB.ScheduleConfig.create({
      window: PB.TimeWindow.create({
        startHour: Math.max(0, Math.min(23, Number(s.window?.startHour ?? 0))),
        endHour: Math.max(0, Math.min(23, Number(s.window?.endHour ?? 0))),
      }),
      light: PB.SamplingConfig.create({
        enabled: Boolean(s.light?.enabled ?? true),
        sampleIntervalMin: Number(s.light?.sampleIntervalMin ?? 10),
      }),
      environmental: PB.SamplingConfig.create({
        enabled: Boolean(s.environmental?.enabled ?? true),
        sampleIntervalMin: Number(s.environmental?.sampleIntervalMin ?? 5),
      }),
      particulate: PB.SamplingConfig.create({
        enabled: Boolean(s.particulate?.enabled ?? true),
        sampleIntervalMin: Number(s.particulate?.sampleIntervalMin ?? 15),
      }),
      gps: PB.GPSConfig.create({
        enabled: Boolean(s.gps?.enabled ?? true),
        sampleIntervalMin: Number(s.gps?.sampleIntervalMin ?? 20),
        accuracy: Math.min(Math.max(1, Number(s.gps?.accuracy ?? 5)), 10),
      }),
      microphone: PB.MicrophoneConfig.create({
        enabled: Boolean(s.microphone?.enabled ?? false),
        continuousMode: Boolean(s.microphone?.continuousMode ?? false),
        sampleLengthMin: Number(s.microphone?.sampleLengthMin ?? 1),
        sampleWindowMin: Number(s.microphone?.sampleWindowMin ?? 1),
      }),
      accelerometer: PB.AccelerometerConfig.create({
        enabled: Boolean(s.accelerometer?.enabled ?? false),
        sampleRate: Number(s.accelerometer?.sampleRate ?? 0),
        sensitivity: Number(s.accelerometer?.sensitivity ?? 0),
      }),
      lorawanEnabled: Boolean(s.lorawan?.enabled ?? false),
      lorawanSendIntervalMin: Number(s.lorawan?.sendIntervalMin ?? 0),
      loraEnabled: Boolean(s.lora?.enabled ?? false),
      loraSendIntervalMin: Number(s.lora?.sendIntervalMin ?? 0),
      magnetometer: PB.MagnetometerConfig.create({
        enabled: Boolean(s.magnetometer?.enabled ?? false),
        sampleIntervalS: Number(s.magnetometer?.sampleIntervalS ?? 0),
      }),
    }),
  );

  return PB.BlePacket.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: Math.floor(Date.now() / 1000),
      packetIndex: 0,
    }),
    scheduleConfigPacket: PB.ScheduleConfigPacket.create({ schedules }),
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
  };

  lostMode: {
    enabled: boolean;
    activationEpoch: number; // unix seconds
    transmitIntervalMin: number; // >0
    txPowerDbm: number; // [0..26]
  };
};

export function buildRadioPacketFromAppState(
  radio: RadioConfigAppState,
): PB.BlePacket {
  const auth = Number(radio.lorawan.auth ?? 0); // 0=OTAA, 1=ABP per proto

  const loRaWAN_config = PB.LoRaWANConfig.create({
    region: Number(radio.lorawan.region ?? 0),
    auth,

    txOnlyOnNewGpsFix: Boolean(radio.lorawan.txOnlyOnNewGpsFix ?? false),
    transmitIntervalMin: Boolean(radio.lorawan.txOnlyOnNewGpsFix)
      ? Math.max(1, Math.trunc(Number(radio.lorawan.transmitIntervalMin ?? 0)))
      : 0,

    txPowerDbm: clampInt(Number(radio.lorawan.txPowerDbm ?? 0), 0, 23),
    // oneof credentials set below
  });

  // oneof: otaa vs abp
  if (auth === 0) {
    const otaa = radio.lorawan.otaa;
    if (!otaa) throw new Error('Missing OTAA credentials');

    loRaWAN_config.otaa = PB.RadioOTAA.create({
      devEui: hexToBytes(otaa.devEuiHex, 8),
      joinEui: hexToBytes(otaa.joinEuiHex, 8),
      appKey: hexToBytes(otaa.appKeyHex, 16),
      nwkKey: hexToBytes(otaa.nwkKeyHex, 16),
    });

    // ensure the other side of oneof isn't set
    (loRaWAN_config as any).abp = undefined;
  } else {
    const abp = radio.lorawan.abp;
    if (!abp) throw new Error('Missing ABP credentials');

    loRaWAN_config.abp = PB.RadioABP.create({
      devAddr: hexToBytes(abp.devAddrHex, 4),
      nwkSKey: hexToBytes(abp.nwkSKeyHex, 16),
      appSKey: hexToBytes(abp.appSKeyHex, 16),
      fNwkSIntKey: hexToBytes(abp.fNwkSIntKeyHex, 16),
      sNwkSIntKey: hexToBytes(abp.sNwkSIntKeyHex, 16),
    });

    (loRaWAN_config as any).otaa = undefined;
  }

  const loRa_config = PB.LoRaConfig.create({
    radioSpreadingFactor: Number(radio.lora.radioSpreadingFactor ?? 0),
    radioBandwidth: Number(radio.lora.radioBandwidth ?? 0),
    radioCodingRate: Number(radio.lora.radioCodingRate ?? 0),
    txPowerDbm: clampInt(Number(radio.lora.txPowerDbm ?? 0), 0, 26),
    syncWord: hexByteToInt(radio.lora.syncWordHex ?? '00'), // uint32, but should be 0..255
  });

  const lostEnabled = Boolean(radio.lostMode.enabled ?? false);

  const lostMode_config = PB.LostMode_config.create({
    activationEpoch: Math.trunc(Number(radio.lostMode.activationEpoch ?? 0)),
    transmitIntervalMin: Math.max(
      1,
      Math.trunc(Number(radio.lostMode.transmitIntervalMin ?? 1)),
    ),
    txPowerDbm: clampInt(Number(radio.lostMode.txPowerDbm ?? 0), 0, 26),
  });

  return PB.BlePacket.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: unixNow(), // or Math.floor(Date.now()/1000)
      packetIndex: 0,
    }),
    radioConfigPacket: PB.RadioConfigPacket.create({
      loRaWANConfig: loRaWAN_config,
      loRaConfig: loRa_config,
      lostModeEnabled: lostEnabled,
      lostModeConfig: lostMode_config,
    }),
  });
}

/* -------------------------------------------------------------------------- */
/*                              Send Config                                    */
/* -------------------------------------------------------------------------- */

export async function sendConfig(device: Device, packet: PB.BlePacket) {
  try {
    console.log('📤 Sending schedule packet…');

    const encoded = PB.BlePacket.encode(packet).finish();
    const base64 = Buffer.from(encoded).toString('base64');

    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
      base64,
    );

    console.log('✅ Write complete:', written);

    // Wait for ACK (STATUS characteristic)
    console.log('⏳ Waiting for ACK from STATUS…');
    return new Promise<boolean>(resolve => {
      let gotAck = false;

      const sub = subscribeToStatus(device, pkt => {
        if (pkt?.systemStatePacket) {
          console.log('📩 ACK received:', pkt.systemStatePacket);
          gotAck = true;
          sub.remove();
          resolve(true);
        }
      });

      setTimeout(() => {
        if (!gotAck) {
          console.warn('⚠️ ACK timeout');
          sub.remove();
          resolve(false);
        }
      }, 6000);
    });
  } catch (err) {
    console.error('❌ sendConfig failed:', err);
    throw err;
  }
}

export async function sendRadioConfig(device: Device, packet: PB.BlePacket) {
  try {
    console.log('📤 Sending radio packet…');

    const encoded = PB.BlePacket.encode(packet).finish();
    const base64 = Buffer.from(encoded).toString('base64');

    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      RADIO_CHAR_UUID,
      base64,
    );

    console.log('✅ Radio write complete:', written);

    // Wait for ACK (STATUS characteristic)
    console.log('⏳ Waiting for ACK from STATUS…');
    return new Promise<boolean>(resolve => {
      let gotAck = false;

      const sub = subscribeToStatus(device, pkt => {
        if (pkt?.systemStatePacket) {
          console.log('📩 ACK received:', pkt.systemStatePacket);
          gotAck = true;
          sub.remove();
          resolve(true);
        }
      });

      setTimeout(() => {
        if (!gotAck) {
          console.warn('⚠️ ACK timeout (radio)');
          sub.remove();
          resolve(false);
        }
      }, 6000);
    });
  } catch (err) {
    console.error('❌ sendRadioConfig failed:', err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                           Disconnect                                       */
/* -------------------------------------------------------------------------- */

export async function disconnectFromCollar(device: Device) {
  try {
    await device.cancelConnection();
    console.log('🔌 Disconnected');
  } catch (err) {
    console.error('❌ Failed to disconnect:', err);
  }
}
