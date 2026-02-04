import { BleManager, Device, State } from "react-native-ble-plx";
import { Buffer } from "buffer";
import * as PB from "../proto/message_pb.js";

export const manager = new BleManager();

export const COLLAR_SERVICE_UUID = "1a17b2cd-7314-493d-a4b5-32a2d53e6fd7";
export const UPDATE_CHAR_UUID = "c4dd1054-f3f3-456b-8ad5-44aaa7ba4fd2";
export const STATUS_CHAR_UUID = "9eaf9ebe-c3e9-4bd6-956e-5ca63d222fbb";
export const RADIO_CHAR_UUID = "68a6a356-49c1-4bed-b152-a02c0cb2c024";

/* -------------------------------------------------------------------------- */
/*                          Type Definitions                                  */
/* -------------------------------------------------------------------------- */

export type DecodedPacket = Partial<{
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
    const pkt = PB.Packet.decode(bytes);
    return {
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
    console.warn("⚠️ [safeDecode] Fallback decode failed:", err);
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
  await new Promise<void>((resolve) => {
    const sub = manager.onStateChange((newState) => {
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
    console.error("❌ connectToCollar failed:", err);
    return null;
  }
}

/* --------- Initial state read (Schedules) --------- */
export async function readInitialState(device: Device): Promise<DecodedPacket> {
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID
    );

    if (!ch?.value) return null;

    const bytes = Buffer.from(ch.value, "base64");
    return safeDecode(bytes);
  } catch (err) {
    console.warn("⚠️ readInitialState failed:", err);
    return null;
  }
}

// Radio state read
export async function readRadioState(device: Device): Promise<DecodedPacket> {
  try {
    const ch = await device.readCharacteristicForService(
      COLLAR_SERVICE_UUID,
      RADIO_CHAR_UUID
    );

    if (!ch?.value) return null;

    const bytes = Buffer.from(ch.value, "base64");
    return safeDecode(bytes);
  } catch (err) {
    console.warn("⚠️ readRadioState failed:", err);
    return null;
  }
}

/* --------- STATUS notifications --------- */
export function subscribeToStatus(
  device: Device,
  callback: (data: DecodedPacket) => void
) {
  return device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    STATUS_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        console.error("STATUS notify error:", error);
        return;
      }
      if (!characteristic?.value) return;

      const bytes = Buffer.from(characteristic.value, "base64");
      const decoded = safeDecode(bytes);
      if (decoded) callback(decoded);
    }
  );
}

/* --------- UPDATE notifications (Schedules live updates) --------- */
export function subscribeToUpdates(
  device: Device,
  callback: (data: DecodedPacket) => void
) {
  const subscription = device.monitorCharacteristicForService(
    COLLAR_SERVICE_UUID,
    UPDATE_CHAR_UUID,
    (error, characteristic) => {
      if (error) {
        // Ignore expected disconnect errors
        if (error.message?.includes("disconnected")) return;
        if (error.message?.includes("cancelled")) return;

        console.error("UPDATE notify error:", error);
        return;
      }

      if (!characteristic?.value) return;

      const bytes = Buffer.from(characteristic.value, "base64");
      const decoded = safeDecode(bytes);

      if (decoded) callback(decoded);
    }
  );

  return subscription;
}


/* -------------------------------------------------------------------------- */
/*                   Build Schedule Packet to Send to Device                  */
/* -------------------------------------------------------------------------- */

export function buildSchedulePacketFromAppState(appSchedules: any[]): PB.Packet {
  const schedules = appSchedules.map((s) =>
    PB.ScheduledConfig.create({
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
      magnetometer: PB.MagnetometerConfig.create({
        enabled: Boolean(s.magnetometer?.enabled ?? false),
        sampleIntervalS: Number(s.magnetometer?.sampleIntervalS ?? 0),
      }),
    })
  );

  return PB.Packet.create({
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

export function buildDefaultRadioPacket(): PB.Packet {
  return PB.Packet.create({
    header: PB.PacketHeader.create({
      systemUid: 1,
      msFromStart: 0,
      epoch: Math.floor(Date.now() / 1000),
      packetIndex: 0,
    }),
    radioConfigPacket: PB.RadioConfigPacket.fromObject({
      enabled: true,
      region: "REGION_US915",
      auth: "AUTH_OTAA",
      otaa: {
        devEui: [1, 2, 3, 4, 5, 6, 7, 8],
        joinEui: [16, 17, 18, 19, 20, 21, 22, 23],
        appKey: [
          160, 161, 162, 163, 164, 165, 166, 167,
          168, 169, 170, 171, 172, 173, 174, 175
        ],
      },
      transmitIntervalMin: 10,
      txOnlyOnNewGpsFix: false,
      txPowerDbm: 14,
    }),
  });
}

/* -------------------------------------------------------------------------- */
/*                              Send Config                                    */
/* -------------------------------------------------------------------------- */

export async function sendConfig(device: Device, packet: PB.Packet) {
  try {
    console.log("📤 Sending schedule packet…");

    const encoded = PB.Packet.encode(packet).finish();
    const base64 = Buffer.from(encoded).toString("base64");

    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      UPDATE_CHAR_UUID,
      base64
    );

    console.log("✅ Write complete:", written);

    // Wait for ACK (STATUS characteristic)
    console.log("⏳ Waiting for ACK from STATUS…");
    return new Promise<boolean>((resolve) => {
      let gotAck = false;

      const sub = subscribeToStatus(device, (pkt) => {
        if (pkt?.systemStatePacket) {
          console.log("📩 ACK received:", pkt.systemStatePacket);
          gotAck = true;
          sub.remove();
          resolve(true);
        }
      });

      setTimeout(() => {
        if (!gotAck) {
          console.warn("⚠️ ACK timeout");
          sub.remove();
          resolve(false);
        }
      }, 6000);
    });
  } catch (err) {
    console.error("❌ sendConfig failed:", err);
    throw err;
  }
}

export async function sendRadioConfig(device: Device, packet: PB.Packet) {
  try {
    console.log("📤 Sending radio packet…");

    const encoded = PB.Packet.encode(packet).finish();
    const base64 = Buffer.from(encoded).toString("base64");

    const written = await device.writeCharacteristicWithResponseForService(
      COLLAR_SERVICE_UUID,
      RADIO_CHAR_UUID,
      base64
    );

    console.log("✅ Radio write complete:", written);

    // Wait for ACK (STATUS characteristic)
    console.log("⏳ Waiting for ACK from STATUS…");
    return new Promise<boolean>((resolve) => {
      let gotAck = false;

      const sub = subscribeToStatus(device, (pkt) => {
        if (pkt?.systemStatePacket) {
          console.log("📩 ACK received:", pkt.systemStatePacket);
          gotAck = true;
          sub.remove();
          resolve(true);
        }
      });

      setTimeout(() => {
        if (!gotAck) {
          console.warn("⚠️ ACK timeout (radio)");
          sub.remove();
          resolve(false);
        }
      }, 6000);
    });
  } catch (err) {
    console.error("❌ sendRadioConfig failed:", err);
    throw err;
  }
}


/* -------------------------------------------------------------------------- */
/*                           Disconnect                                       */
/* -------------------------------------------------------------------------- */

export async function disconnectFromCollar(device: Device) {
  try {
    await device.cancelConnection();
    console.log("🔌 Disconnected");
  } catch (err) {
    console.error("❌ Failed to disconnect:", err);
  }
}
